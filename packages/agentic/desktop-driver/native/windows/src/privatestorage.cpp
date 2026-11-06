#include "privatestorage.h"

#include <windows.h>

#include <aclapi.h>
#include <knownfolders.h>
#include <objbase.h>
#include <shlobj.h>

#include <algorithm>
#include <array>
#include <cstddef>
#include <cstdint>
#include <cstdio>
#include <memory>
#include <vector>

#include "common.h"
#include "winsecurity.h"

namespace furn::storage {
namespace {

constexpr wchar_t kExtendedPrefix[] = L"\\\\?\\";
constexpr wchar_t kDefaultRootName[] = L"com.microsoft.fluentui-react-native.desktop-driver";
constexpr std::size_t kMaximumRootChars = 240;
constexpr DWORD kShareAll = FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE;

// Rights that let a principal add a file to a directory, delete or replace one
// of its children, or re-secure it. Adding a subdirectory is not one of them, so
// the default entry that lets users create folders on a volume root still passes.
constexpr DWORD kAncestorForbiddenRights =
    FILE_ADD_FILE | FILE_DELETE_CHILD | DELETE | WRITE_DAC | WRITE_OWNER | GENERIC_ALL | GENERIC_WRITE;

[[noreturn]] void Throw(const char* reason, const char* detail, DWORD win32 = 0) {
  throw StorageError(reason, detail, win32);
}

struct LocalFreeDeleter {
  void operator()(void* memory) const noexcept {
    if (memory != nullptr) {
      LocalFree(memory);
    }
  }
};

struct CoTaskMemDeleter {
  void operator()(void* memory) const noexcept { CoTaskMemFree(memory); }
};

std::wstring Extended(std::wstring_view path) {
  return std::wstring(kExtendedPrefix) + std::wstring(path);
}

bool EqualsIgnoreCase(std::wstring_view left, std::wstring_view right) {
  return left.size() == right.size() &&
         (left.empty() || CompareStringOrdinal(left.data(), static_cast<int>(left.size()), right.data(),
                                                static_cast<int>(right.size()), TRUE) == CSTR_EQUAL);
}

bool IsAsciiAlphanumeric(char character) {
  return (character >= 'A' && character <= 'Z') || (character >= 'a' && character <= 'z') ||
         (character >= '0' && character <= '9');
}

// CON, PRN, AUX, NUL, CONIN$, CONOUT$, COM0-9 and LPT0-9, including the
// superscript digits recent Windows also reserves, with or without an extension.
bool IsDosDeviceBase(std::wstring_view component) {
  std::wstring base(component.substr(0, component.find(L'.')));
  while (!base.empty() && base.back() == L' ') {
    base.pop_back();
  }
  std::transform(base.begin(), base.end(), base.begin(), [](wchar_t character) {
    return character >= L'A' && character <= L'Z' ? static_cast<wchar_t>(character + 32) : character;
  });
  if (base == L"con" || base == L"prn" || base == L"aux" || base == L"nul" || base == L"conin$" || base == L"conout$") {
    return true;
  }
  if (base.size() == 4 && (base.compare(0, 3, L"com") == 0 || base.compare(0, 3, L"lpt") == 0)) {
    const wchar_t last = base[3];
    return (last >= L'0' && last <= L'9') || last == 0x00B9 || last == 0x00B2 || last == 0x00B3;
  }
  return false;
}

bool IsValidComponent(std::wstring_view component) {
  if (component.empty() || component == L"." || component == L".." || component.back() == L' ' ||
      component.back() == L'.') {
    return false;
  }
  for (const wchar_t character : component) {
    if (character < 0x20 || character == 0xFFFD || std::wstring_view(L"<>:\"/\\|?*").find(character) != std::wstring_view::npos) {
      return false;
    }
  }
  return !IsDosDeviceBase(component);
}

// Components of a canonical root, or empty when the path is not one.
std::vector<std::wstring> SplitCanonicalRoot(std::wstring_view path) {
  if (path.size() < 4 || path.size() > kMaximumRootChars) {
    return {};
  }
  const wchar_t letter = path[0];
  if (!((letter >= L'A' && letter <= L'Z') || (letter >= L'a' && letter <= L'z')) || path[1] != L':' ||
      path[2] != L'\\') {
    return {};
  }
  std::vector<std::wstring> components;
  std::wstring_view rest = path.substr(3);
  while (true) {
    const std::size_t separator = rest.find(L'\\');
    const std::wstring_view component = rest.substr(0, separator);
    if (!IsValidComponent(component)) {
      return {};
    }
    components.emplace_back(component);
    if (separator == std::wstring_view::npos) {
      return components;
    }
    rest = rest.substr(separator + 1);
  }
}

// The absolute path of a record. The name has already passed IsSafeRecordName.
std::wstring RecordPath(const std::wstring& root, std::string_view name) {
  return root + L"\\" + std::wstring(name.begin(), name.end());
}

std::string Hex(const unsigned char* bytes, std::size_t count) {
  std::string text(count * 2, '0');
  for (std::size_t index = 0; index < count; index += 1) {
    std::snprintf(text.data() + index * 2, 3, "%02x", static_cast<unsigned>(bytes[index]));
  }
  return text;
}

bool IsLowerHex(const std::string& text, std::size_t length) {
  return text.size() == length && std::all_of(text.begin(), text.end(), [](char character) {
           return (character >= '0' && character <= '9') || (character >= 'a' && character <= 'f');
         });
}

// The one allow entry a record or root carries, in an absolute descriptor that
// can be handed to CreateFile or CreateDirectory so the object is never visible
// with a weaker one. `user` must outlive the descriptor.
class OwnerOnlyDescriptor {
 public:
  OwnerOnlyDescriptor(const Sid& user, bool container) {
    const std::size_t bytes = (sizeof(ACL) + offsetof(ACCESS_ALLOWED_ACE, SidStart) + GetLengthSid(user.Get()) + 3) & ~std::size_t{3};
    acl_.assign(bytes, 0);
    auto* acl = reinterpret_cast<PACL>(acl_.data());
    const BYTE flags = container ? static_cast<BYTE>(OBJECT_INHERIT_ACE | CONTAINER_INHERIT_ACE) : BYTE{0};
    if (!InitializeAcl(acl, static_cast<DWORD>(bytes), ACL_REVISION) ||
        !AddAccessAllowedAceEx(acl, ACL_REVISION, flags, FILE_ALL_ACCESS, user.Get()) ||
        !InitializeSecurityDescriptor(&descriptor_, SECURITY_DESCRIPTOR_REVISION) ||
        !SetSecurityDescriptorOwner(&descriptor_, user.Get(), FALSE) ||
        !SetSecurityDescriptorDacl(&descriptor_, TRUE, acl, FALSE) ||
        !SetSecurityDescriptorControl(&descriptor_, SE_DACL_PROTECTED, SE_DACL_PROTECTED)) {
      Throw(kReasonDacl, "The owner-only security descriptor cannot be built.", GetLastError());
    }
    attributes_.nLength = sizeof(attributes_);
    attributes_.lpSecurityDescriptor = &descriptor_;
    attributes_.bInheritHandle = FALSE;
  }

  OwnerOnlyDescriptor(const OwnerOnlyDescriptor&) = delete;
  OwnerOnlyDescriptor& operator=(const OwnerOnlyDescriptor&) = delete;

  SECURITY_ATTRIBUTES* Attributes() noexcept { return &attributes_; }

 private:
  std::vector<BYTE> acl_;
  SECURITY_DESCRIPTOR descriptor_{};
  SECURITY_ATTRIBUTES attributes_{};
};

// The principals that may own an ancestor or appear in its ACL: the user and the
// accounts that can already do anything to it.
class TrustedPrincipals {
 public:
  explicit TrustedPrincipals(const Sid& user)
      : user_(user),
        system_(Sid::WellKnown(WinLocalSystemSid)),
        administrators_(Sid::WellKnown(WinBuiltinAdministratorsSid)),
        installer_(Sid::Parse(L"S-1-5-80-956008885-3418522649-1831038044-1853292631-2271478464")) {
    if (!user_.Valid() || !system_.Valid() || !administrators_.Valid() || !installer_.Valid()) {
      Throw(kReasonOwner, "The trusted principals cannot be resolved.");
    }
  }

  bool Contains(PSID sid) const noexcept {
    return user_.Equals(sid) || system_.Equals(sid) || administrators_.Equals(sid) || installer_.Equals(sid);
  }

  std::vector<PSID> List() const { return {user_.Get(), system_.Get(), administrators_.Get(), installer_.Get()}; }

 private:
  Sid user_;
  Sid system_;
  Sid administrators_;
  Sid installer_;
};

struct SecurityInfo {
  std::unique_ptr<void, LocalFreeDeleter> descriptor;
  PSID owner{nullptr};
  PACL dacl{nullptr};
  SECURITY_DESCRIPTOR_CONTROL control{0};
};

SecurityInfo ReadSecurity(HANDLE object, const char* reason) {
  SecurityInfo info;
  PSECURITY_DESCRIPTOR descriptor = nullptr;
  const DWORD status = GetSecurityInfo(object, SE_FILE_OBJECT, OWNER_SECURITY_INFORMATION | DACL_SECURITY_INFORMATION,
                                       &info.owner, nullptr, &info.dacl, nullptr, &descriptor);
  info.descriptor.reset(descriptor);
  if (status != ERROR_SUCCESS || descriptor == nullptr) {
    Throw(reason, "The security descriptor cannot be read.", status);
  }
  DWORD revision = 0;
  if (!GetSecurityDescriptorControl(descriptor, &info.control, &revision)) {
    Throw(reason, "The security descriptor control flags cannot be read.", GetLastError());
  }
  return info;
}

BY_HANDLE_FILE_INFORMATION Information(HANDLE object, const char* reason) {
  BY_HANDLE_FILE_INFORMATION information{};
  if (!GetFileInformationByHandle(object, &information)) {
    Throw(reason, "The file information cannot be read.", GetLastError());
  }
  return information;
}

std::wstring FinalPath(HANDLE object, const char* reason) {
  std::wstring buffer(512, L'\0');
  while (true) {
    const DWORD length = GetFinalPathNameByHandleW(object, buffer.data(), static_cast<DWORD>(buffer.size()),
                                                   FILE_NAME_NORMALIZED | VOLUME_NAME_DOS);
    if (length == 0) {
      Throw(reason, "The final path cannot be read.", GetLastError());
    }
    if (length < buffer.size()) {
      buffer.resize(length);
      return buffer;
    }
    buffer.resize(static_cast<std::size_t>(length) + 1);
  }
}

// Persistent ACLs on a local disk. A network or ACL-less volume cannot hold a
// private record.
void ValidateVolume(HANDLE object, const std::wstring& finalPath) {
  DWORD flags = 0;
  if (!GetVolumeInformationByHandleW(object, nullptr, 0, nullptr, nullptr, &flags, nullptr, 0)) {
    Throw(kReasonVolume, "The volume information cannot be read.", GetLastError());
  }
  if ((flags & FILE_PERSISTENT_ACLS) == 0) {
    Throw(kReasonVolume, "The volume does not keep persistent ACLs.");
  }
  const bool drivePath = finalPath.size() >= 7 && finalPath.compare(0, 4, kExtendedPrefix) == 0 &&
                         ((finalPath[4] >= L'A' && finalPath[4] <= L'Z') || (finalPath[4] >= L'a' && finalPath[4] <= L'z')) &&
                         finalPath[5] == L':' && finalPath[6] == L'\\';
  if (!drivePath) {
    Throw(kReasonVolume, "The volume is not a local drive.");
  }
  const wchar_t driveRoot[] = {finalPath[4], L':', L'\\', L'\0'};
  const UINT type = GetDriveTypeW(driveRoot);
  if (type != DRIVE_FIXED && type != DRIVE_REMOVABLE && type != DRIVE_RAMDISK) {
    Throw(kReasonVolume, "The volume is remote or unknown.");
  }
}

RootIdentity IdentityOf(HANDLE directory) {
  FILE_ID_INFO info{};
  if (!GetFileInformationByHandleEx(directory, FileIdInfo, &info, sizeof(info))) {
    Throw(kReasonIdentity, "The directory identity cannot be read.", GetLastError());
  }
  RootIdentity identity;
  char volume[17]{};
  std::snprintf(volume, sizeof(volume), "%016llx", static_cast<unsigned long long>(info.VolumeSerialNumber));
  identity.volume = volume;
  identity.file = Hex(info.FileId.Identifier, sizeof(info.FileId.Identifier));
  return identity;
}

// The object has exactly the descriptor this module creates: owned by the user
// and a protected DACL with one allow entry that grants the user full control.
void ValidateOwnerOnly(HANDLE object, const Sid& user, bool directory) {
  const SecurityInfo security = ReadSecurity(object, kReasonDacl);
  if (security.owner == nullptr || !user.Equals(security.owner)) {
    Throw(kReasonOwner, "The object is not owned by the current user.");
  }
  if ((security.control & SE_DACL_PROTECTED) == 0 || security.dacl == nullptr) {
    Throw(kReasonDacl, "The object does not have a protected DACL.");
  }
  ACL_SIZE_INFORMATION size{};
  if (!GetAclInformation(security.dacl, &size, sizeof(size), AclSizeInformation) || size.AceCount != 1) {
    Throw(kReasonDacl, "The DACL does not have exactly one entry.");
  }
  void* entry = nullptr;
  if (!GetAce(security.dacl, 0, &entry) || entry == nullptr) {
    Throw(kReasonDacl, "The DACL entry cannot be read.");
  }
  const auto* header = static_cast<const ACE_HEADER*>(entry);
  const BYTE expectedFlags = directory ? static_cast<BYTE>(OBJECT_INHERIT_ACE | CONTAINER_INHERIT_ACE) : BYTE{0};
  if (header->AceType != ACCESS_ALLOWED_ACE_TYPE || header->AceFlags != expectedFlags) {
    Throw(kReasonDacl, "The DACL entry is not the expected plain allow entry.");
  }
  const auto* allowed = static_cast<const ACCESS_ALLOWED_ACE*>(entry);
  if (allowed->Mask != FILE_ALL_ACCESS || !user.Equals(const_cast<DWORD*>(&allowed->SidStart))) {
    Throw(kReasonDacl, "The DACL entry does not grant the current user full control.");
  }
}

ScopedHandle OpenDirectoryNoFollow(const std::wstring& path, DWORD& error) {
  ScopedHandle handle(CreateFileW(Extended(path).c_str(), FILE_READ_ATTRIBUTES | READ_CONTROL | SYNCHRONIZE, kShareAll,
                                  nullptr, OPEN_EXISTING, FILE_FLAG_BACKUP_SEMANTICS | FILE_FLAG_OPEN_REPARSE_POINT,
                                  nullptr));
  error = handle ? ERROR_SUCCESS : GetLastError();
  return handle;
}

void ValidateAncestor(const std::wstring& path, const TrustedPrincipals& principals) {
  DWORD error = 0;
  const ScopedHandle handle = OpenDirectoryNoFollow(path, error);
  if (!handle) {
    Throw(kReasonAncestor, "An ancestor of the storage root cannot be opened.", error);
  }
  const BY_HANDLE_FILE_INFORMATION information = Information(handle.Get(), kReasonAncestor);
  if ((information.dwFileAttributes & FILE_ATTRIBUTE_REPARSE_POINT) != 0) {
    Throw(kReasonAncestor, "An ancestor of the storage root is a reparse point.");
  }
  if ((information.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) == 0) {
    Throw(kReasonAncestor, "An ancestor of the storage root is not a directory.");
  }
  if (!EqualsIgnoreCase(FinalPath(handle.Get(), kReasonAncestor), Extended(path))) {
    Throw(kReasonAncestor, "An ancestor of the storage root resolves to another location.");
  }
  const SecurityInfo security = ReadSecurity(handle.Get(), kReasonAncestor);
  if (security.owner == nullptr || !principals.Contains(security.owner)) {
    Throw(kReasonAncestor, "An ancestor of the storage root has an untrusted owner.");
  }
  if (!AncestorAclSafe(security.dacl, principals.List())) {
    Throw(kReasonAncestor, "An ancestor of the storage root lets another principal replace or modify its children.");
  }
}

// Every proper prefix of the root, from the volume root down to its parent.
void ValidateAncestors(const std::wstring& root, const TrustedPrincipals& principals) {
  std::wstring prefix = root.substr(0, 3);
  ValidateAncestor(prefix, principals);
  std::size_t separator = root.find(L'\\', 3);
  while (separator != std::wstring::npos) {
    ValidateAncestor(root.substr(0, separator), principals);
    separator = root.find(L'\\', separator + 1);
  }
}

void ValidateRootDirectory(HANDLE directory, const std::wstring& path, const Sid& user) {
  const BY_HANDLE_FILE_INFORMATION information = Information(directory, kReasonIo);
  if ((information.dwFileAttributes & FILE_ATTRIBUTE_REPARSE_POINT) != 0) {
    Throw(kReasonReparse, "The storage root is a reparse point.");
  }
  if ((information.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) == 0) {
    Throw(kReasonType, "The storage root is not a directory.");
  }
  const std::wstring finalPath = FinalPath(directory, kReasonPath);
  if (!EqualsIgnoreCase(finalPath, Extended(path))) {
    Throw(kReasonPath, "The storage root resolves to another location.");
  }
  ValidateVolume(directory, finalPath);
  ValidateOwnerOnly(directory, user, true);
}

struct RecordState {
  std::uint64_t size{0};
  std::uint64_t modified{0};
};

// A regular, single-link, owner-only file inside the root that the handle
// itself reports at exactly the expected path.
RecordState ValidateRecord(HANDLE file, const std::wstring& path, const Sid& user) {
  if (GetFileType(file) != FILE_TYPE_DISK) {
    Throw(kReasonType, "The record is not a disk file.");
  }
  const BY_HANDLE_FILE_INFORMATION information = Information(file, kReasonIo);
  if ((information.dwFileAttributes & FILE_ATTRIBUTE_REPARSE_POINT) != 0) {
    Throw(kReasonReparse, "The record is a reparse point.");
  }
  if ((information.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) != 0) {
    Throw(kReasonType, "The record is a directory.");
  }
  if (information.nNumberOfLinks != 1) {
    Throw(kReasonLinks, "The record has more than one hard link.");
  }
  const std::uint64_t size = (static_cast<std::uint64_t>(information.nFileSizeHigh) << 32) | information.nFileSizeLow;
  if (size > kMaximumRecordBytes) {
    Throw(kReasonSize, "The record is larger than 16 KiB.");
  }
  const std::wstring finalPath = FinalPath(file, kReasonPath);
  if (!EqualsIgnoreCase(finalPath, Extended(path))) {
    Throw(kReasonPath, "The record resolves to another location.");
  }
  ValidateVolume(file, finalPath);
  ValidateOwnerOnly(file, user, false);
  return {size, (static_cast<std::uint64_t>(information.ftLastWriteTime.dwHighDateTime) << 32) |
                    information.ftLastWriteTime.dwLowDateTime};
}

std::string ReadAll(HANDLE file, std::uint64_t expectedSize) {
  std::string contents(static_cast<std::size_t>(expectedSize), '\0');
  std::size_t total = 0;
  while (total < contents.size()) {
    DWORD read = 0;
    if (!ReadFile(file, contents.data() + total, static_cast<DWORD>(contents.size() - total), &read, nullptr)) {
      Throw(kReasonIo, "The record cannot be read.", GetLastError());
    }
    if (read == 0) {
      break;
    }
    total += read;
  }
  char extra = 0;
  DWORD overflow = 0;
  if (total != contents.size() || !ReadFile(file, &extra, 1, &overflow, nullptr) || overflow != 0) {
    Throw(kReasonIo, "The record changed while it was read.");
  }
  return contents;
}

// Opens the name itself without following a reparse point. Backup semantics
// let a directory or directory junction be opened so ValidateRecord can name
// it instead of the open failing with a bare access error. A publisher holds
// its new record exclusively until it has validated the name it just made
// visible, so a sharing violation is retried briefly rather than reported.
ScopedHandle OpenRecord(const std::wstring& path, DWORD access, DWORD share, DWORD& error) {
  constexpr int kAttempts = 10;
  constexpr DWORD kRetryDelayMilliseconds = 25;
  for (int attempt = 1;; ++attempt) {
    ScopedHandle handle(CreateFileW(Extended(path).c_str(), access, share, nullptr, OPEN_EXISTING,
                                    FILE_ATTRIBUTE_NORMAL | FILE_FLAG_OPEN_REPARSE_POINT | FILE_FLAG_BACKUP_SEMANTICS,
                                    nullptr));
    error = handle ? ERROR_SUCCESS : GetLastError();
    if (handle || error != ERROR_SHARING_VIOLATION || attempt >= kAttempts) {
      return handle;
    }
    Sleep(kRetryDelayMilliseconds);
  }
}

// Deletes the file the handle refers to and leaves no name behind even while
// another handle is open. Falls back to delete-on-close where POSIX semantics
// are unavailable.
bool DeleteThroughHandle(HANDLE file) noexcept {
  FILE_DISPOSITION_INFO_EX extended{FILE_DISPOSITION_FLAG_DELETE | FILE_DISPOSITION_FLAG_POSIX_SEMANTICS};
  if (SetFileInformationByHandle(file, FileDispositionInfoEx, &extended, sizeof(extended))) {
    return true;
  }
  FILE_DISPOSITION_INFO legacy{TRUE};
  return SetFileInformationByHandle(file, FileDispositionInfo, &legacy, sizeof(legacy)) != FALSE;
}

// Moves the file the handle refers to onto a name that must not exist yet.
DWORD RenameWithoutReplacing(HANDLE file, const std::wstring& target) {
  const std::wstring name = Extended(target);
  const std::size_t bytes = sizeof(FILE_RENAME_INFO) + name.size() * sizeof(wchar_t);
  std::vector<BYTE> buffer(bytes, 0);
  auto* info = reinterpret_cast<FILE_RENAME_INFO*>(buffer.data());
  info->ReplaceIfExists = FALSE;
  info->RootDirectory = nullptr;
  info->FileNameLength = static_cast<DWORD>(name.size() * sizeof(wchar_t));
  std::copy(name.begin(), name.end(), info->FileName);
  if (!SetFileInformationByHandle(file, FileRenameInfo, info, static_cast<DWORD>(bytes))) {
    return GetLastError();
  }
  return ERROR_SUCCESS;
}

std::wstring TemporaryName() {
  GUID guid{};
  if (FAILED(CoCreateGuid(&guid))) {
    Throw(kReasonIo, "A temporary record name cannot be generated.");
  }
  const std::string hex = Hex(reinterpret_cast<const unsigned char*>(&guid), sizeof(guid));
  return L".publish-" + std::wstring(hex.begin(), hex.end());
}

// Removes the temporary or half-published file unless publication completed.
class DiscardUnlessPublished {
 public:
  explicit DiscardUnlessPublished(HANDLE file) noexcept : file_(file) {}
  DiscardUnlessPublished(const DiscardUnlessPublished&) = delete;
  DiscardUnlessPublished& operator=(const DiscardUnlessPublished&) = delete;
  ~DiscardUnlessPublished() {
    if (armed_) {
      DeleteThroughHandle(file_);
    }
  }
  void Disarm() noexcept { armed_ = false; }
  void Arm() noexcept { armed_ = true; }

 private:
  HANDLE file_;
  bool armed_{true};
};

void RequireName(std::string_view name) {
  if (!IsSafeRecordName(name)) {
    Throw(kReasonName, "The record name is not a safe single filename.");
  }
}

void RequireContents(std::string_view contents) {
  if (contents.size() > kMaximumRecordBytes) {
    Throw(kReasonSize, "The record is larger than 16 KiB.");
  }
  if (!IsStrictUtf8(contents)) {
    Throw(kReasonEncoding, "The record is not well-formed UTF-8.");
  }
}

json::Value Failure(const StorageError& error) {
  json::Value response = json::Value::Object();
  response.Set("ok", json::Value::Bool(false));
  response.Set("reason", json::Value::String(std::string(error.reason())));
  response.Set("detail", json::Value::String(std::string(error.what())));
  if (error.win32() != 0) {
    response.Set("win32", json::Value::Integer(static_cast<std::int64_t>(error.win32())));
  }
  return response;
}

const std::string& RequiredString(const json::Value& request, std::string_view key) {
  const json::Value* value = request.Find(key);
  if (value == nullptr || !value->IsString()) {
    Throw(kReasonRequest, "A required string field is missing.");
  }
  return value->AsString();
}

RootIdentity RequiredIdentity(const json::Value& request) {
  const json::Value* value = request.Find("identity");
  if (value == nullptr || !value->IsObject()) {
    Throw(kReasonRequest, "The root identity is missing.");
  }
  RootIdentity identity{RequiredString(*value, "volume"), RequiredString(*value, "file")};
  if (!IsLowerHex(identity.volume, 16) || !IsLowerHex(identity.file, 32)) {
    Throw(kReasonRequest, "The root identity is malformed.");
  }
  return identity;
}

std::wstring RequiredRoot(const json::Value& request) {
  const std::string& utf8 = RequiredString(request, "root");
  if (!IsStrictUtf8(utf8)) {
    Throw(kReasonRoot, "The storage root is not well-formed UTF-8.");
  }
  return ToWide(utf8);
}

std::string RequiredBase64(const json::Value& request, std::string_view key) {
  std::string bytes;
  if (!DecodeBase64(RequiredString(request, key), bytes)) {
    Throw(kReasonRequest, "A base64 field is malformed.");
  }
  return bytes;
}

json::Value Succeeded() {
  json::Value response = json::Value::Object();
  response.Set("ok", json::Value::Bool(true));
  return response;
}

json::Value Describe(const PrivateStore& store) {
  json::Value identity = json::Value::Object();
  identity.Set("volume", json::Value::String(store.Identity().volume));
  identity.Set("file", json::Value::String(store.Identity().file));
  json::Value response = Succeeded();
  response.Set("root", json::Value::String(store.Root()));
  response.Set("identity", identity);
  return response;
}

json::Value Dispatch(const json::Value& request) {
  if (!request.IsObject()) {
    Throw(kReasonRequest, "The request is not a JSON object.");
  }
  const std::string& operation = RequiredString(request, "operation");
  if (operation == "open") {
    const bool hasRoot = request.Has("root");
    const std::wstring root = hasRoot ? RequiredRoot(request) : DefaultStorageRoot();
    if (request.Has("identity")) {
      const RootIdentity expected = RequiredIdentity(request);
      return Describe(PrivateStore::Open(root, false, &expected));
    }
    return Describe(PrivateStore::Open(root, true, nullptr));
  }
  if (operation != "read" && operation != "publish" && operation != "remove") {
    Throw(kReasonRequest, "The operation is not supported.");
  }
  const std::wstring root = RequiredRoot(request);
  const RootIdentity identity = RequiredIdentity(request);
  const std::string& name = RequiredString(request, "name");
  const std::string contents = operation == "publish" ? RequiredBase64(request, "contents") : std::string();
  const std::string expected = operation == "remove" ? RequiredBase64(request, "expected") : std::string();
  PrivateStore store = PrivateStore::Open(root, false, &identity);
  json::Value response = Succeeded();
  if (operation == "read") {
    const std::optional<std::string> found = store.Read(name);
    response.Set("found", json::Value::Bool(found.has_value()));
    if (found.has_value()) {
      response.Set("contents", json::Value::String(EncodeBase64(*found)));
    }
  } else if (operation == "publish") {
    store.Publish(name, contents);
  } else {
    response.Set("removed", json::Value::Bool(store.Remove(name, expected)));
  }
  return response;
}

}  // namespace

bool IsSafeRecordName(std::string_view name) {
  if (name.empty() || name.size() > 128 || !IsAsciiAlphanumeric(name.front()) || name.back() == '.') {
    return false;
  }
  for (const char character : name) {
    if (!IsAsciiAlphanumeric(character) && character != '.' && character != '_' && character != '-') {
      return false;
    }
  }
  return !IsDosDeviceBase(std::wstring(name.begin(), name.end()));
}

namespace {
constexpr char kBase64Alphabet[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
}  // namespace

std::string EncodeBase64(std::string_view bytes) {
  std::string text;
  text.reserve((bytes.size() + 2) / 3 * 4);
  for (std::size_t index = 0; index < bytes.size(); index += 3) {
    const std::uint32_t first = static_cast<unsigned char>(bytes[index]);
    const std::uint32_t second = index + 1 < bytes.size() ? static_cast<unsigned char>(bytes[index + 1]) : 0;
    const std::uint32_t third = index + 2 < bytes.size() ? static_cast<unsigned char>(bytes[index + 2]) : 0;
    const std::uint32_t group = (first << 16) | (second << 8) | third;
    text.push_back(kBase64Alphabet[(group >> 18) & 0x3F]);
    text.push_back(kBase64Alphabet[(group >> 12) & 0x3F]);
    text.push_back(index + 1 < bytes.size() ? kBase64Alphabet[(group >> 6) & 0x3F] : '=');
    text.push_back(index + 2 < bytes.size() ? kBase64Alphabet[group & 0x3F] : '=');
  }
  return text;
}

bool DecodeBase64(std::string_view text, std::string& bytes) {
  bytes.clear();
  if (text.size() % 4 != 0) {
    return false;
  }
  const auto value = [](char character) -> int {
    if (character >= 'A' && character <= 'Z') return character - 'A';
    if (character >= 'a' && character <= 'z') return character - 'a' + 26;
    if (character >= '0' && character <= '9') return character - '0' + 52;
    if (character == '+') return 62;
    if (character == '/') return 63;
    return -1;
  };
  for (std::size_t index = 0; index < text.size(); index += 4) {
    const bool last = index + 4 == text.size();
    const int first = value(text[index]);
    const int second = value(text[index + 1]);
    const bool padThird = last && text[index + 2] == '=';
    const bool padFourth = last && text[index + 3] == '=';
    const int third = padThird ? 0 : value(text[index + 2]);
    const int fourth = padFourth ? 0 : value(text[index + 3]);
    if (first < 0 || second < 0 || third < 0 || fourth < 0 || (padThird && !padFourth)) {
      return false;
    }
    // Unused trailing bits must be zero, so one byte string has one encoding.
    if ((padThird && (second & 0x0F) != 0) || (padFourth && !padThird && (third & 0x03) != 0)) {
      return false;
    }
    const std::uint32_t group = (static_cast<std::uint32_t>(first) << 18) | (static_cast<std::uint32_t>(second) << 12) |
                                (static_cast<std::uint32_t>(third) << 6) | static_cast<std::uint32_t>(fourth);
    bytes.push_back(static_cast<char>((group >> 16) & 0xFF));
    if (!padThird) {
      bytes.push_back(static_cast<char>((group >> 8) & 0xFF));
    }
    if (!padFourth) {
      bytes.push_back(static_cast<char>(group & 0xFF));
    }
  }
  return true;
}

bool IsCanonicalRoot(std::wstring_view path) {
  return !SplitCanonicalRoot(path).empty();
}

bool AncestorAclSafe(PACL dacl, const std::vector<PSID>& trusted) {
  if (dacl == nullptr) {
    return false;  // A NULL DACL grants everyone full control.
  }
  ACL_SIZE_INFORMATION size{};
  if (!GetAclInformation(dacl, &size, sizeof(size), AclSizeInformation)) {
    return false;
  }
  const auto isTrusted = [&trusted](PSID sid) {
    return std::any_of(trusted.begin(), trusted.end(),
                       [sid](PSID candidate) { return candidate != nullptr && EqualSid(candidate, sid) != FALSE; });
  };
  for (DWORD index = 0; index < size.AceCount; index += 1) {
    void* entry = nullptr;
    if (!GetAce(dacl, index, &entry) || entry == nullptr) {
      return false;
    }
    const auto* header = static_cast<const ACE_HEADER*>(entry);
    if ((header->AceFlags & INHERIT_ONLY_ACE) != 0) {
      continue;  // Applies to descendants, not to the directory itself.
    }
    switch (header->AceType) {
      case ACCESS_DENIED_ACE_TYPE:
      case ACCESS_DENIED_OBJECT_ACE_TYPE:
      case ACCESS_DENIED_CALLBACK_ACE_TYPE:
      case ACCESS_DENIED_CALLBACK_OBJECT_ACE_TYPE:
        break;  // A deny only narrows other entries.
      case ACCESS_ALLOWED_ACE_TYPE:
      case ACCESS_ALLOWED_CALLBACK_ACE_TYPE: {
        const auto* allowed = static_cast<const ACCESS_ALLOWED_ACE*>(entry);
        if ((allowed->Mask & kAncestorForbiddenRights) != 0 && !isTrusted(const_cast<DWORD*>(&allowed->SidStart))) {
          return false;
        }
        break;
      }
      case ACCESS_ALLOWED_OBJECT_ACE_TYPE:
      case ACCESS_ALLOWED_CALLBACK_OBJECT_ACE_TYPE:
        // File system objects do not use object ACEs; any such grant is refused.
        if ((static_cast<const ACCESS_ALLOWED_OBJECT_ACE*>(entry)->Mask & kAncestorForbiddenRights) != 0) {
          return false;
        }
        break;
      default:
        return false;
    }
  }
  return true;
}

std::wstring DefaultStorageRoot() {
  PWSTR raw = nullptr;
  const HRESULT result = SHGetKnownFolderPath(FOLDERID_LocalAppData, KF_FLAG_DEFAULT, nullptr, &raw);
  const std::unique_ptr<wchar_t, CoTaskMemDeleter> folder(raw);
  if (FAILED(result) || raw == nullptr) {
    Throw(kReasonRoot, "The local application data folder cannot be resolved.");
  }
  std::wstring base(raw);
  while (!base.empty() && base.back() == L'\\') {
    base.pop_back();
  }
  return base + L"\\" + kDefaultRootName;
}

PrivateStore PrivateStore::Open(const std::wstring& root, bool createIfMissing, const RootIdentity* expected) {
  if (!IsCanonicalRoot(root)) {
    Throw(kReasonRoot, "The storage root is not a canonical local drive path.");
  }
  const Sid user = CurrentUserSid();
  if (!user.Valid()) {
    Throw(kReasonOwner, "The current user cannot be identified.");
  }
  const TrustedPrincipals principals(user);
  ValidateAncestors(root, principals);

  DWORD error = 0;
  ScopedHandle directory = OpenDirectoryNoFollow(root, error);
  if (!directory) {
    if (expected != nullptr) {
      Throw(kReasonIdentity, "The storage root is no longer the directory first opened.", error);
    }
    if (!createIfMissing || (error != ERROR_FILE_NOT_FOUND && error != ERROR_PATH_NOT_FOUND)) {
      Throw(kReasonRoot, "The storage root cannot be opened.", error);
    }
    OwnerOnlyDescriptor descriptor(user, true);
    if (!CreateDirectoryW(Extended(root).c_str(), descriptor.Attributes()) && GetLastError() != ERROR_ALREADY_EXISTS) {
      Throw(kReasonRoot, "The storage root cannot be created.", GetLastError());
    }
    directory = OpenDirectoryNoFollow(root, error);
    if (!directory) {
      Throw(kReasonRoot, "The storage root cannot be opened after creation.", error);
    }
  }
  ValidateRootDirectory(directory.Get(), root, user);

  PrivateStore store;
  store.root_ = root;
  store.identity_ = IdentityOf(directory.Get());
  if (expected != nullptr && !(*expected == store.identity_)) {
    Throw(kReasonIdentity, "The storage root is not the directory first opened.");
  }
  return store;
}

void PrivateStore::Revalidate() const {
  Open(root_, false, &identity_);
}

std::optional<std::string> PrivateStore::Read(std::string_view name) {
  RequireName(name);
  Revalidate();
  const Sid user = CurrentUserSid();
  const std::wstring path = RecordPath(root_, name);
  DWORD error = 0;
  const ScopedHandle file =
      OpenRecord(path, FILE_READ_DATA | FILE_READ_ATTRIBUTES | READ_CONTROL | SYNCHRONIZE, FILE_SHARE_READ | FILE_SHARE_DELETE, error);
  if (!file) {
    if (error == ERROR_FILE_NOT_FOUND) {
      return std::nullopt;
    }
    Throw(kReasonIo, "The record cannot be opened.", error);
  }
  const RecordState before = ValidateRecord(file.Get(), path, user);
  std::string contents = ReadAll(file.Get(), before.size);
  const RecordState after = ValidateRecord(file.Get(), path, user);
  if (after.size != before.size || after.modified != before.modified) {
    Throw(kReasonIo, "The record changed while it was read.");
  }
  Revalidate();
  if (!IsStrictUtf8(contents)) {
    Throw(kReasonEncoding, "The record is not well-formed UTF-8.");
  }
  return contents;
}

void PrivateStore::Publish(std::string_view name, std::string_view contents) {
  RequireName(name);
  RequireContents(contents);
  Revalidate();
  const Sid user = CurrentUserSid();
  OwnerOnlyDescriptor descriptor(user, false);
  const std::wstring temporary = root_ + L"\\" + TemporaryName();
  const std::wstring target = RecordPath(root_, name);

  ScopedHandle file(CreateFileW(Extended(temporary).c_str(),
                                FILE_WRITE_DATA | FILE_WRITE_ATTRIBUTES | FILE_READ_ATTRIBUTES | READ_CONTROL | DELETE | SYNCHRONIZE,
                                0, descriptor.Attributes(), CREATE_NEW, FILE_ATTRIBUTE_NORMAL | FILE_FLAG_OPEN_REPARSE_POINT,
                                nullptr));
  if (!file) {
    Throw(kReasonIo, "The temporary record cannot be created.", GetLastError());
  }
  DiscardUnlessPublished discard(file.Get());
  ValidateRecord(file.Get(), temporary, user);

  std::size_t written = 0;
  while (written < contents.size()) {
    DWORD chunk = 0;
    if (!WriteFile(file.Get(), contents.data() + written, static_cast<DWORD>(contents.size() - written), &chunk, nullptr) ||
        chunk == 0) {
      Throw(kReasonIo, "The record cannot be written.", GetLastError());
    }
    written += chunk;
  }
  if (!FlushFileBuffers(file.Get())) {
    Throw(kReasonIo, "The record cannot be flushed.", GetLastError());
  }
  Revalidate();

  const DWORD renamed = RenameWithoutReplacing(file.Get(), target);
  if (renamed != ERROR_SUCCESS) {
    if (renamed == ERROR_ALREADY_EXISTS || renamed == ERROR_FILE_EXISTS) {
      Throw(kReasonExists, "A record with this name already exists.", renamed);
    }
    Throw(kReasonIo, "The record cannot be published.", renamed);
  }
  // The name is visible from here. If the published file is not the one that
  // was validated, remove it rather than leave an unsafe record behind.
  try {
    ValidateRecord(file.Get(), target, user);
    discard.Disarm();
  } catch (...) {
    discard.Arm();
    throw;
  }
}

bool PrivateStore::Remove(std::string_view name, std::string_view expected) {
  RequireName(name);
  RequireContents(expected);
  Revalidate();
  const Sid user = CurrentUserSid();
  const std::wstring path = RecordPath(root_, name);
  DWORD error = 0;
  const ScopedHandle file = OpenRecord(
      path, DELETE | FILE_READ_DATA | FILE_READ_ATTRIBUTES | READ_CONTROL | SYNCHRONIZE, FILE_SHARE_READ | FILE_SHARE_DELETE, error);
  if (!file) {
    if (error == ERROR_FILE_NOT_FOUND) {
      return false;
    }
    Throw(kReasonIo, "The record cannot be opened.", error);
  }
  const RecordState before = ValidateRecord(file.Get(), path, user);
  const std::string contents = ReadAll(file.Get(), before.size);
  if (!IsStrictUtf8(contents)) {
    Throw(kReasonEncoding, "The record is not well-formed UTF-8.");
  }
  if (contents != expected) {
    return false;
  }
  Revalidate();
  ValidateRecord(file.Get(), path, user);
  if (!DeleteThroughHandle(file.Get())) {
    Throw(kReasonIo, "The record cannot be deleted.", GetLastError());
  }
  return true;
}

json::Value HandlePrivateStorageRequest(const json::Value& request) {
  try {
    return Dispatch(request);
  } catch (const StorageError& error) {
    return Failure(error);
  } catch (const std::exception&) {
    return Failure(StorageError(kReasonIo, "The request failed unexpectedly."));
  }
}

}  // namespace furn::storage
