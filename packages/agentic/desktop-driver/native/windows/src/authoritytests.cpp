#include "authoritytests.h"

#include <winsock2.h>

#include <windows.h>

#include <aclapi.h>
#include <winioctl.h>

#include <algorithm>
#include <array>
#include <atomic>
#include <cstddef>
#include <cstdint>
#include <cstdio>
#include <cstring>
#include <exception>
#include <functional>
#include <initializer_list>
#include <iostream>
#include <optional>
#include <string>
#include <string_view>
#include <thread>
#include <utility>
#include <vector>

#include "applicationincarnation.h"
#include "common.h"
#include "json.h"
#include "privatestorage.h"
#include "serviceidentity.h"
#include "winsecurity.h"

namespace furn {
namespace {

using storage::StorageError;

constexpr wchar_t kScratchPrefix[] = L"furn-authority-selftest-";
constexpr char kScratchToken[] = "furn-authority-selftest";
constexpr BYTE kInheritBoth = static_cast<BYTE>(OBJECT_INHERIT_ACE | CONTAINER_INHERIT_ACE);
constexpr BYTE kInheritOnly = static_cast<BYTE>(INHERIT_ONLY_ACE | OBJECT_INHERIT_ACE | CONTAINER_INHERIT_ACE);

// ---------------------------------------------------------------------------
// Reporting and table helpers
// ---------------------------------------------------------------------------

void NoteSkipped(const std::string& message) {
  std::cout << "info - " << message << '\n';
}

// Runs one section and turns an escaped exception into a failed check so one
// broken section cannot hide the others.
void Section(const CheckFunction& check, const char* name, const std::function<void()>& body) {
  try {
    body();
  } catch (const std::exception& error) {
    check(false, std::string(name) + " threw: " + error.what());
  } catch (...) {
    check(false, std::string(name) + " threw an unknown exception");
  }
}

// Builds bytes from numbers so no hexadecimal escape swallows the next digit.
std::string Bytes(std::initializer_list<unsigned> values) {
  std::string bytes;
  for (const unsigned value : values) {
    bytes.push_back(static_cast<char>(value));
  }
  return bytes;
}

// A printable form of a table row; control and non-ASCII bytes are escaped.
std::string Label(std::string_view text) {
  constexpr std::size_t kMaximumLabel = 48;
  std::string label;
  for (const char raw : text) {
    const unsigned char character = static_cast<unsigned char>(raw);
    if (character >= 0x20 && character < 0x7F) {
      label.push_back(raw);
    } else {
      char escaped[8]{};
      std::snprintf(escaped, sizeof(escaped), "\\x%02X", static_cast<unsigned>(character));
      label.append(escaped);
    }
  }
  if (label.size() > kMaximumLabel) {
    label.resize(kMaximumLabel);
    label.append("...");
  }
  return label.empty() ? std::string("(empty)") : label;
}

std::string WideLabel(std::wstring_view text) {
  return Label(ToUtf8(text));
}

// `prefix` + one code point + `suffix`, built at run time so no universal
// character name has to appear in the source.
std::wstring WithCharacter(std::wstring_view prefix, unsigned codePoint, std::wstring_view suffix) {
  std::wstring text(prefix);
  if (codePoint >= 0x10000) {
    const unsigned reduced = codePoint - 0x10000;
    text.push_back(static_cast<wchar_t>(0xD800 + (reduced >> 10)));
    text.push_back(static_cast<wchar_t>(0xDC00 + (reduced & 0x3FF)));
  } else {
    text.push_back(static_cast<wchar_t>(codePoint));
  }
  text.append(suffix);
  return text;
}

std::string Join(const std::vector<std::string>& parts) {
  std::string text;
  for (const std::string& part : parts) {
    if (!text.empty()) {
      text.append("; ");
    }
    text.append(part);
  }
  return text;
}

// One check per table. A failure names every row that did not hold.
void CheckRows(const CheckFunction& check, const std::string& name, const std::vector<std::string>& failed) {
  check(failed.empty(), failed.empty() ? name : name + " [failed: " + Join(failed) + "]");
}

bool EndsWith(std::wstring_view text, std::wstring_view suffix) {
  return text.size() >= suffix.size() && text.substr(text.size() - suffix.size()) == suffix;
}

bool EndsWith(std::string_view text, std::string_view suffix) {
  return text.size() >= suffix.size() && text.substr(text.size() - suffix.size()) == suffix;
}

bool IsLowerHex(const std::string& text, std::size_t length) {
  return text.size() == length && std::all_of(text.begin(), text.end(), [](char character) {
           return (character >= '0' && character <= '9') || (character >= 'a' && character <= 'f');
         });
}

// "none" when the action completes, otherwise the storage failure reason.
std::string Reason(const std::function<void()>& action) {
  try {
    action();
    return "none";
  } catch (const StorageError& error) {
    return error.reason();
  } catch (...) {
    return "exception";
  }
}

// ---------------------------------------------------------------------------
// JSON helpers
// ---------------------------------------------------------------------------

json::Value Text(std::string value) {
  return json::Value::String(std::move(value));
}

json::Value Object(std::initializer_list<std::pair<std::string, json::Value>> members) {
  json::Value object = json::Value::Object();
  for (const auto& member : members) {
    object.Set(member.first, member.second);
  }
  return object;
}

json::Value With(json::Value object, const std::string& key, json::Value value) {
  object.Set(key, std::move(value));
  return object;
}

json::Value Without(const json::Value& object, std::string_view key) {
  json::Value copy = json::Value::Object();
  for (const auto& member : object.Members()) {
    if (member.first != key) {
      copy.Set(member.first, member.second);
    }
  }
  return copy;
}

// "ok" for a successful response, otherwise its failure reason.
std::string Result(const json::Value& response) {
  if (!response.IsObject()) {
    return "malformed";
  }
  return response.BoolField("ok") ? std::string("ok") : response.StringField("reason", "none");
}

// "verified", "refused:<reason>" for a verdict, or "error:<reason>" when the
// request itself was refused.
std::string VerifyOutcome(const json::Value& response) {
  if (!response.IsObject()) {
    return "malformed";
  }
  if (!response.BoolField("ok")) {
    return "error:" + response.StringField("reason", "none");
  }
  if (response.BoolField("verified")) {
    return "verified";
  }
  return "refused:" + response.StringField("reason", "none");
}

// ---------------------------------------------------------------------------
// Security descriptors
// ---------------------------------------------------------------------------

// A small in-memory ACL for the ancestor rules and for tampering with a real
// object. Any entry that cannot be added makes `Ok()` false.
class AclBuilder {
 public:
  AclBuilder() { ok_ = InitializeAcl(Acl(), static_cast<DWORD>(sizeof(storage_)), ACL_REVISION_DS) != FALSE; }

  AclBuilder& Allow(PSID sid, DWORD mask, BYTE flags = 0) {
    ok_ = ok_ && AddAccessAllowedAceEx(Acl(), ACL_REVISION_DS, flags, mask, sid) != FALSE;
    return *this;
  }

  AclBuilder& Deny(PSID sid, DWORD mask, BYTE flags = 0) {
    ok_ = ok_ && AddAccessDeniedAceEx(Acl(), ACL_REVISION_DS, flags, mask, sid) != FALSE;
    return *this;
  }

  AclBuilder& Audit(PSID sid, DWORD mask) {
    ok_ = ok_ && AddAuditAccessAceEx(Acl(), ACL_REVISION_DS, 0, mask, sid, TRUE, TRUE) != FALSE;
    return *this;
  }

  AclBuilder& AllowObject(PSID sid, DWORD mask) {
    GUID objectType{0x12345678, 0x1234, 0x1234, {1, 2, 3, 4, 5, 6, 7, 8}};
    ok_ = ok_ && AddAccessAllowedObjectAce(Acl(), ACL_REVISION_DS, 0, mask, &objectType, nullptr, sid) != FALSE;
    return *this;
  }

  PACL Acl() noexcept { return reinterpret_cast<PACL>(storage_.data()); }
  bool Ok() const noexcept { return ok_; }

 private:
  std::array<DWORD, 256> storage_{};
  bool ok_{false};
};

// Replaces the DACL of a file or directory by path.
bool ApplyDacl(const std::wstring& path, AclBuilder& acl, bool protectedDacl) {
  std::wstring mutablePath = path;
  const SECURITY_INFORMATION information =
      DACL_SECURITY_INFORMATION | (protectedDacl ? PROTECTED_DACL_SECURITY_INFORMATION : UNPROTECTED_DACL_SECURITY_INFORMATION);
  return acl.Ok() && SetNamedSecurityInfoW(mutablePath.data(), SE_FILE_OBJECT, information, nullptr, nullptr, acl.Acl(),
                                           nullptr) == ERROR_SUCCESS;
}

// ---------------------------------------------------------------------------
// File system fixtures
// ---------------------------------------------------------------------------

bool Exists(const std::wstring& path) {
  return GetFileAttributesW(path.c_str()) != INVALID_FILE_ATTRIBUTES;
}

// Deletes a tree without following a junction out of it.
void RemoveTree(const std::wstring& path) {
  const DWORD attributes = GetFileAttributesW(path.c_str());
  if (attributes == INVALID_FILE_ATTRIBUTES) {
    return;
  }
  if ((attributes & FILE_ATTRIBUTE_READONLY) != 0) {
    SetFileAttributesW(path.c_str(), attributes & ~static_cast<DWORD>(FILE_ATTRIBUTE_READONLY));
  }
  const bool directory = (attributes & FILE_ATTRIBUTE_DIRECTORY) != 0;
  if (!directory) {
    DeleteFileW(path.c_str());
    return;
  }
  if ((attributes & FILE_ATTRIBUTE_REPARSE_POINT) == 0) {
    WIN32_FIND_DATAW entry{};
    const HANDLE find = FindFirstFileW((path + L"\\*").c_str(), &entry);
    if (find != INVALID_HANDLE_VALUE) {
      do {
        const std::wstring name = entry.cFileName;
        if (name != L"." && name != L"..") {
          RemoveTree(path + L"\\" + name);
        }
      } while (FindNextFileW(find, &entry));
      FindClose(find);
    }
  }
  RemoveDirectoryW(path.c_str());
}

// The number of entries in `directory` that match `pattern`, excluding `.` and `..`.
std::size_t CountEntries(const std::wstring& directory, const std::wstring& pattern) {
  WIN32_FIND_DATAW entry{};
  const HANDLE find = FindFirstFileW((directory + L"\\" + pattern).c_str(), &entry);
  if (find == INVALID_HANDLE_VALUE) {
    return 0;
  }
  std::size_t count = 0;
  do {
    const std::wstring name = entry.cFileName;
    if (name != L"." && name != L"..") {
      count += 1;
    }
  } while (FindNextFileW(find, &entry));
  FindClose(find);
  return count;
}

// Makes `link` a directory junction to `target`. A junction needs no privilege.
bool CreateJunction(const std::wstring& link, const std::wstring& target) {
  if (!CreateDirectoryW(link.c_str(), nullptr)) {
    return false;
  }
  bool linked = false;
  {
    const ScopedHandle directory(CreateFileW(link.c_str(), GENERIC_WRITE, 0, nullptr, OPEN_EXISTING,
                                             FILE_FLAG_BACKUP_SEMANTICS | FILE_FLAG_OPEN_REPARSE_POINT, nullptr));
    if (directory) {
      const std::wstring substitute = L"\\??\\" + target;
      const std::size_t substituteBytes = substitute.size() * sizeof(wchar_t);
      // Tag, data length, reserved; four name offsets and lengths; the substitute
      // name and an empty print name, each NUL terminated.
      std::vector<BYTE> buffer(8 + 8 + substituteBytes + 2 + 2, 0);
      const auto put16 = [&buffer](std::size_t offset, std::size_t value) {
        buffer[offset] = static_cast<BYTE>(value & 0xFF);
        buffer[offset + 1] = static_cast<BYTE>((value >> 8) & 0xFF);
      };
      const DWORD tag = IO_REPARSE_TAG_MOUNT_POINT;
      std::memcpy(buffer.data(), &tag, sizeof(tag));
      put16(4, buffer.size() - 8);
      put16(8, 0);
      put16(10, substituteBytes);
      put16(12, substituteBytes + 2);
      put16(14, 0);
      std::memcpy(buffer.data() + 16, substitute.data(), substituteBytes);
      DWORD returned = 0;
      linked = DeviceIoControl(directory.Get(), FSCTL_SET_REPARSE_POINT, buffer.data(), static_cast<DWORD>(buffer.size()),
                               nullptr, 0, &returned, nullptr) != FALSE;
    }
  }
  if (!linked) {
    RemoveDirectoryW(link.c_str());
  }
  return linked;
}

// Replaces the bytes of an existing record behind the store's back.
bool OverwriteRecord(const std::wstring& path, std::string_view bytes) {
  const ScopedHandle file(CreateFileW(path.c_str(), GENERIC_WRITE, 0, nullptr, TRUNCATE_EXISTING, FILE_ATTRIBUTE_NORMAL, nullptr));
  if (!file) {
    return false;
  }
  std::size_t written = 0;
  while (written < bytes.size()) {
    DWORD chunk = 0;
    if (!WriteFile(file.Get(), bytes.data() + written, static_cast<DWORD>(bytes.size() - written), &chunk, nullptr) ||
        chunk == 0) {
      return false;
    }
    written += chunk;
  }
  return true;
}

// A directory under the temporary folder that holds every store this run
// creates and removes them all, junctions included, on the way out.
class ScratchDirectory {
 public:
  ScratchDirectory() {
    std::wstring temp(MAX_PATH, L'\0');
    const DWORD length = GetTempPathW(static_cast<DWORD>(temp.size()), temp.data());
    if (length == 0 || length >= temp.size()) {
      return;
    }
    temp.resize(length);
    std::wstring expanded(1024, L'\0');
    const DWORD expandedLength = GetLongPathNameW(temp.c_str(), expanded.data(), static_cast<DWORD>(expanded.size()));
    if (expandedLength > 0 && expandedLength < expanded.size()) {
      expanded.resize(expandedLength);
      temp = expanded;
    }
    while (temp.size() > 3 && temp.back() == L'\\') {
      temp.pop_back();
    }
    root_ = temp + L"\\" + kScratchPrefix + std::to_wstring(GetCurrentProcessId()) + L"-" + std::to_wstring(GetTickCount64());
    created_ = CreateDirectoryW(root_.c_str(), nullptr) != FALSE;
  }

  ScratchDirectory(const ScratchDirectory&) = delete;
  ScratchDirectory& operator=(const ScratchDirectory&) = delete;

  ~ScratchDirectory() {
    if (created_) {
      RemoveTree(root_);
    }
  }

  // True when the directory exists and a child with a generous name is still a
  // canonical root, so a long temporary path cannot fail the storage cases.
  bool Ready() const { return created_ && storage::IsCanonicalRoot(root_ + L"\\" + std::wstring(24, L'x')); }

  std::wstring Path(std::wstring_view name) const { return root_ + L"\\" + std::wstring(name); }

 private:
  std::wstring root_;
  bool created_{false};
};

// ---------------------------------------------------------------------------
// Processes and sockets
// ---------------------------------------------------------------------------

// A loopback TCP listener that no other process can share.
class LoopbackListener {
 public:
  LoopbackListener() {
    WSADATA data{};
    started_ = WSAStartup(MAKEWORD(2, 2), &data) == 0;
    if (!started_) {
      return;
    }
    socket_ = ::socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (socket_ == INVALID_SOCKET) {
      return;
    }
    const BOOL exclusive = TRUE;
    setsockopt(socket_, SOL_SOCKET, SO_EXCLUSIVEADDRUSE, reinterpret_cast<const char*>(&exclusive), sizeof(exclusive));
    sockaddr_in address{};
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
    address.sin_port = 0;
    int length = static_cast<int>(sizeof(address));
    if (::bind(socket_, reinterpret_cast<const sockaddr*>(&address), length) != 0 || ::listen(socket_, 4) != 0 ||
        getsockname(socket_, reinterpret_cast<sockaddr*>(&address), &length) != 0) {
      closesocket(socket_);
      socket_ = INVALID_SOCKET;
      return;
    }
    port_ = ntohs(address.sin_port);
  }

  LoopbackListener(const LoopbackListener&) = delete;
  LoopbackListener& operator=(const LoopbackListener&) = delete;

  ~LoopbackListener() {
    if (socket_ != INVALID_SOCKET) {
      closesocket(socket_);
    }
    if (started_) {
      WSACleanup();
    }
  }

  bool Ready() const noexcept { return port_ != 0; }
  std::uint16_t Port() const noexcept { return port_; }
  std::string Url() const { return "http://127.0.0.1:" + std::to_string(port_); }

 private:
  bool started_{false};
  SOCKET socket_{INVALID_SOCKET};
  std::uint16_t port_{0};
};

// A port that was free a moment ago: the listener is closed before returning.
std::uint16_t UnusedPort() {
  const LoopbackListener probe;
  return probe.Port();
}

// A long-running child of the same user and session. The handle stays open
// after the child is stopped, so its identifier cannot be reused meanwhile.
class ChildProcess {
 public:
  ChildProcess() {
    std::wstring directory(MAX_PATH, L'\0');
    const UINT length = GetSystemDirectoryW(directory.data(), static_cast<UINT>(directory.size()));
    if (length == 0 || length >= directory.size()) {
      return;
    }
    directory.resize(length);
    std::wstring command = L"\"" + directory + L"\\PING.EXE\" -n 60 127.0.0.1";
    STARTUPINFOW startup{};
    startup.cb = sizeof(startup);
    PROCESS_INFORMATION information{};
    if (!CreateProcessW(nullptr, command.data(), nullptr, nullptr, FALSE, CREATE_NO_WINDOW, nullptr, nullptr, &startup,
                        &information)) {
      return;
    }
    CloseHandle(information.hThread);
    process_.Reset(information.hProcess);
    pid_ = information.dwProcessId;
  }

  ChildProcess(const ChildProcess&) = delete;
  ChildProcess& operator=(const ChildProcess&) = delete;

  ~ChildProcess() { Stop(); }

  bool Started() const noexcept { return static_cast<bool>(process_); }
  DWORD Pid() const noexcept { return pid_; }

  void Stop() {
    if (process_ && !stopped_) {
      TerminateProcess(process_.Get(), 1);
      WaitForSingleObject(process_.Get(), 5000);
      stopped_ = true;
    }
  }

 private:
  ScopedHandle process_;
  DWORD pid_{0};
  bool stopped_{false};
};

// ---------------------------------------------------------------------------
// Rule tables: record names, base64, UTF-8, roots, ACLs, URLs, listeners
// ---------------------------------------------------------------------------

void TestRecordNames(const CheckFunction& check) {
  const std::vector<std::pair<std::string, bool>> rows = {
      {"a", true},
      {"Z9", true},
      {"0", true},
      {"record", true},
      {"record.json", true},
      {"a-b_c.d", true},
      {"A.B.C", true},
      {"desktop-driver.json", true},
      {"a" + std::string(127, 'b'), true},
      {"com10", true},
      {"console", true},
      {"a.con", true},
      {"auxiliary", true},
      {"nul0", true},
      {"com1x", true},
      {"con1", true},
      {"", false},
      {"a" + std::string(128, 'b'), false},
      {".hidden", false},
      {"-a", false},
      {"_a", false},
      {"a.", false},
      {"a..", false},
      {".", false},
      {"..", false},
      {"a/b", false},
      {"a\\b", false},
      {"a b", false},
      {"a:b", false},
      {"a*b", false},
      {"a?b", false},
      {"a\"b", false},
      {"a<b", false},
      {"a>b", false},
      {"a|b", false},
      {"a$b", false},
      {"a%b", false},
      {"a~1", false},
      {std::string("a\0b", 3), false},
      {"a\nb", false},
      {"a\tb", false},
      {Bytes({0xC3, 0xA9}), false},
      {"a" + Bytes({0xC3, 0xA9}), false},
      {"CON", false},
      {"con", false},
      {"Prn", false},
      {"AUX", false},
      {"NUL", false},
      {"COM1", false},
      {"com9", false},
      {"LPT1", false},
      {"lpt9", false},
      {"com0", false},
      {"lpt0", false},
      {"con.txt", false},
      {"NUL.json", false},
      {"aux.log", false},
      {"com1.txt", false},
      {"Com1.Tar.Gz", false},
  };
  std::vector<std::string> failed;
  for (const auto& row : rows) {
    if (storage::IsSafeRecordName(row.first) != row.second) {
      failed.push_back(std::string(row.second ? "accept " : "reject ") + Label(row.first));
    }
  }
  CheckRows(check, "record name: one bounded portable filename that is not a DOS device", failed);
}

void TestBase64(const CheckFunction& check) {
  const std::vector<std::pair<std::string, std::string>> vectors = {
      {"", ""}, {"f", "Zg=="}, {"fo", "Zm8="}, {"foo", "Zm9v"}, {"foob", "Zm9vYg=="}, {"fooba", "Zm9vYmE="}, {"foobar", "Zm9vYmFy"},
  };
  std::vector<std::string> failed;
  for (const auto& [plain, encoded] : vectors) {
    std::string decoded = "stale";
    if (storage::EncodeBase64(plain) != encoded) {
      failed.push_back("encode " + Label(plain));
    }
    if (!storage::DecodeBase64(encoded, decoded) || decoded != plain) {
      failed.push_back("decode " + encoded);
    }
  }
  CheckRows(check, "base64: matches the RFC 4648 test vectors", failed);

  std::string everyByte;
  for (unsigned value = 0; value < 256; value += 1) {
    everyByte.push_back(static_cast<char>(value));
  }
  std::string decoded;
  check(storage::DecodeBase64(storage::EncodeBase64(everyByte), decoded) && decoded == everyByte,
        "base64: round-trips all 256 byte values");

  bool lengths = true;
  for (std::size_t length = 0; length <= 64 && lengths; length += 1) {
    std::string bytes;
    for (std::size_t index = 0; index < length; index += 1) {
      bytes.push_back(static_cast<char>((index * 37 + 11) & 0xFF));
    }
    lengths = storage::DecodeBase64(storage::EncodeBase64(bytes), decoded) && decoded == bytes;
  }
  check(lengths, "base64: round-trips every length from 0 to 64 bytes");

  decoded = "stale";
  check(storage::DecodeBase64("", decoded) && decoded.empty(), "base64: decoding clears the output buffer first");

  const std::vector<std::string> malformed = {
      "Zg",       "Zg=",     "Zg===",   "Zg==\n", "Zg==Zg==", "Zh==",  "Zm9=",   "=Zg=",     "Z===", "Zm9 ",
      "Zm-_",     "Zm9v\r\n", "Zg=a",   " Zg==",  "Zg== ",    "Zm9v=", "AAAA====",
  };
  failed.clear();
  for (const std::string& text : malformed) {
    if (storage::DecodeBase64(text, decoded)) {
      failed.push_back(Label(text));
    }
  }
  CheckRows(check, "base64: refuses unpadded, misplaced-padding, non-canonical, and non-alphabet input", failed);
}

void TestStrictUtf8(const CheckFunction& check) {
  const std::vector<std::pair<std::string, std::string>> valid = {
      {"empty", ""},
      {"ASCII", "plain text"},
      {"U+00E9", Bytes({0xC3, 0xA9})},
      {"U+20AC", Bytes({0xE2, 0x82, 0xAC})},
      {"U+1F600", Bytes({0xF0, 0x9F, 0x98, 0x80})},
      {"U+10FFFF", Bytes({0xF4, 0x8F, 0xBF, 0xBF})},
      {"U+FFFD", Bytes({0xEF, 0xBF, 0xBD})},
      {"U+0080", Bytes({0xC2, 0x80})},
      {"U+07FF", Bytes({0xDF, 0xBF})},
      {"U+0800", Bytes({0xE0, 0xA0, 0x80})},
      {"U+D7FF", Bytes({0xED, 0x9F, 0xBF})},
      {"U+E000", Bytes({0xEE, 0x80, 0x80})},
      {"U+10000", Bytes({0xF0, 0x90, 0x80, 0x80})},
      {"embedded NUL", std::string("a\0b", 3)},
  };
  const std::vector<std::pair<std::string, std::string>> invalid = {
      {"overlong NUL", Bytes({0xC0, 0x80})},
      {"overlong two-byte slash", Bytes({0xC1, 0xBF})},
      {"overlong three-byte NUL", Bytes({0xE0, 0x80, 0x80})},
      {"overlong three-byte U+07FF", Bytes({0xE0, 0x9F, 0xBF})},
      {"overlong four-byte NUL", Bytes({0xF0, 0x80, 0x80, 0x80})},
      {"overlong four-byte U+FFFF", Bytes({0xF0, 0x8F, 0xBF, 0xBF})},
      {"surrogate U+D800", Bytes({0xED, 0xA0, 0x80})},
      {"surrogate U+DFFF", Bytes({0xED, 0xBF, 0xBF})},
      {"above U+10FFFF", Bytes({0xF4, 0x90, 0x80, 0x80})},
      {"lead F5", Bytes({0xF5, 0x80, 0x80, 0x80})},
      {"five-byte form", Bytes({0xF8, 0x88, 0x80, 0x80, 0x80})},
      {"truncated two-byte", Bytes({0xC2})},
      {"truncated three-byte", Bytes({0xE2, 0x82})},
      {"truncated four-byte", Bytes({0xF0, 0x9F, 0x98})},
      {"lone continuation 80", Bytes({0x80})},
      {"lone continuation BF", Bytes({0xBF})},
      {"byte FF", Bytes({0xFF})},
      {"byte FE", Bytes({0xFE})},
      {"bad continuation after C3", Bytes({0xC3, 0x28})},
      {"bad second continuation", Bytes({0xE2, 0x28, 0xA1})},
      {"bad fourth byte", Bytes({0xF0, 0x28, 0x8C, 0xBC})},
      {"text then truncated lead", "a" + Bytes({0xC3})},
  };
  std::vector<std::string> failed;
  for (const auto& row : valid) {
    if (!IsStrictUtf8(row.second)) {
      failed.push_back("accept " + row.first);
    }
  }
  CheckRows(check, "UTF-8: accepts every well-formed form including the range edges", failed);
  failed.clear();
  for (const auto& row : invalid) {
    if (IsStrictUtf8(row.second)) {
      failed.push_back("reject " + row.first);
    }
  }
  CheckRows(check, "UTF-8: rejects overlong forms, surrogates, out-of-range points, and malformed sequences", failed);
}

void TestCanonicalRoots(const CheckFunction& check) {
  const std::vector<std::pair<std::wstring, bool>> rows = {
      {L"C:\\x", true},
      {L"c:\\x", true},
      {L"C:\\a\\b\\c", true},
      {L"D:\\Users\\me\\AppData\\Local\\com.microsoft.fluentui-react-native.desktop-driver", true},
      {L"C:\\Program Files\\Fluent", true},
      {L"C:\\a.b\\c", true},
      {L"C:\\console", true},
      {L"C:\\com10", true},
      {L"C:\\auxiliary", true},
      {L"C:\\a.con", true},
      {WithCharacter(L"C:\\a", 0x1F600, L""), true},
      {L"C:\\" + std::wstring(237, L'a'), true},
      {L"", false},
      {L"C:", false},
      {L"C:\\", false},
      {L"C:x", false},
      {L"C:/x", false},
      {L"1:\\x", false},
      {L"\\x", false},
      {L"x", false},
      {L"C:\\" + std::wstring(238, L'a'), false},
      {L"C:\\x\\", false},
      {L"C:\\\\x", false},
      {L"C:\\x\\\\y", false},
      {L"C:\\.", false},
      {L"C:\\..", false},
      {L"C:\\x\\.\\y", false},
      {L"C:\\x\\..\\y", false},
      {L"\\\\?\\C:\\x", false},
      {L"\\\\server\\share\\x", false},
      {L"C:\\x ", false},
      {L"C:\\x.", false},
      {L"C:\\x \\y", false},
      {L"C:\\a<b", false},
      {L"C:\\a>b", false},
      {L"C:\\a:b", false},
      {L"C:\\a\"b", false},
      {L"C:\\a/b", false},
      {L"C:\\a|b", false},
      {L"C:\\a?b", false},
      {L"C:\\a*b", false},
      {WithCharacter(L"C:\\a", 0x01, L"b"), false},
      {WithCharacter(L"C:\\a", 0x1F, L"b"), false},
      {WithCharacter(L"C:\\a", 0xFFFD, L"b"), false},
      {std::wstring(L"C:\\a\0b", 6), false},
      {L"C:\\CON", false},
      {L"C:\\con", false},
      {L"C:\\x\\NUL", false},
      {L"C:\\PRN.txt", false},
      {L"C:\\AUX", false},
      {L"C:\\COM1", false},
      {L"C:\\LPT9", false},
      {L"C:\\x\\com5.log", false},
      {L"C:\\CONIN$", false},
      {L"C:\\CONOUT$", false},
      {L"C:\\COM0", false},
      {WithCharacter(L"C:\\com", 0xB9, L""), false},
  };
  std::vector<std::string> failed;
  for (const auto& row : rows) {
    if (storage::IsCanonicalRoot(row.first) != row.second) {
      failed.push_back(std::string(row.second ? "accept " : "reject ") + WideLabel(row.first));
    }
  }
  CheckRows(check, "root: only a canonical local drive path of at most 240 characters", failed);
}

void TestAncestorAcls(const CheckFunction& check) {
  const Sid userSid = CurrentUserSid();
  const Sid systemSid = Sid::WellKnown(WinLocalSystemSid);
  const Sid administrators = Sid::WellKnown(WinBuiltinAdministratorsSid);
  const Sid everyone = Sid::WellKnown(WinWorldSid);
  const Sid users = Sid::WellKnown(WinBuiltinUsersSid);
  if (!userSid.Valid() || !systemSid.Valid() || !administrators.Valid() || !everyone.Valid() || !users.Valid()) {
    check(false, "ancestor ACL: the test principals resolve");
    return;
  }
  const std::vector<PSID> trusted = {userSid.Get(), systemSid.Get(), administrators.Get()};
  constexpr DWORD kFull = FILE_ALL_ACCESS;

  struct Row {
    std::string name;
    bool safe;
    std::function<void(AclBuilder&)> build;
  };
  const std::vector<Row> rows = {
      {"trusted principals with full control", true,
       [&](AclBuilder& acl) { acl.Allow(userSid.Get(), kFull).Allow(systemSid.Get(), kFull).Allow(administrators.Get(), kFull); }},
      {"empty DACL", true, [](AclBuilder&) {}},
      {"Everyone read and execute", true,
       [&](AclBuilder& acl) { acl.Allow(everyone.Get(), FILE_GENERIC_READ | FILE_GENERIC_EXECUTE); }},
      {"Users may only add subdirectories", true, [&](AclBuilder& acl) { acl.Allow(users.Get(), FILE_ADD_SUBDIRECTORY); }},
      {"inherit-only Everyone full control", true, [&](AclBuilder& acl) { acl.Allow(everyone.Get(), kFull, kInheritOnly); }},
      {"deny-only entry", true, [&](AclBuilder& acl) { acl.Deny(everyone.Get(), kFull); }},
      {"inherit-only write beside an effective read", true,
       [&](AclBuilder& acl) { acl.Allow(users.Get(), kFull, kInheritOnly).Allow(users.Get(), FILE_GENERIC_READ); }},
      {"object entry with a harmless right", true, [&](AclBuilder& acl) { acl.AllowObject(everyone.Get(), FILE_READ_DATA); }},
      {"Users may add files", false, [&](AclBuilder& acl) { acl.Allow(users.Get(), FILE_ADD_FILE); }},
      {"Users may delete children", false, [&](AclBuilder& acl) { acl.Allow(users.Get(), FILE_DELETE_CHILD); }},
      {"Users may delete", false, [&](AclBuilder& acl) { acl.Allow(users.Get(), DELETE); }},
      {"Users may change the DACL", false, [&](AclBuilder& acl) { acl.Allow(users.Get(), WRITE_DAC); }},
      {"Users may take ownership", false, [&](AclBuilder& acl) { acl.Allow(users.Get(), WRITE_OWNER); }},
      {"Users hold generic all", false, [&](AclBuilder& acl) { acl.Allow(users.Get(), GENERIC_ALL); }},
      {"Users hold generic write", false, [&](AclBuilder& acl) { acl.Allow(users.Get(), GENERIC_WRITE); }},
      {"Users hold file generic write", false, [&](AclBuilder& acl) { acl.Allow(users.Get(), FILE_GENERIC_WRITE); }},
      {"Users may modify", false,
       [&](AclBuilder& acl) {
         acl.Allow(users.Get(), FILE_GENERIC_READ | FILE_GENERIC_WRITE | FILE_GENERIC_EXECUTE | DELETE);
       }},
      {"Everyone has full control", false, [&](AclBuilder& acl) { acl.Allow(everyone.Get(), kFull); }},
      {"inherit-only entry beside an effective write", false,
       [&](AclBuilder& acl) { acl.Allow(users.Get(), kFull, kInheritOnly).Allow(users.Get(), FILE_ADD_FILE); }},
      {"a deny does not excuse a later allow", false,
       [&](AclBuilder& acl) { acl.Deny(users.Get(), FILE_ADD_FILE).Allow(users.Get(), kFull); }},
      {"trusted entry then an untrusted write", false,
       [&](AclBuilder& acl) { acl.Allow(userSid.Get(), kFull).Allow(everyone.Get(), FILE_ADD_FILE); }},
      {"audit entry", false, [&](AclBuilder& acl) { acl.Audit(everyone.Get(), kFull); }},
      {"object entry with a forbidden right, even for a trusted principal", false,
       [&](AclBuilder& acl) { acl.AllowObject(userSid.Get(), FILE_ADD_FILE); }},
  };
  std::vector<std::string> failed;
  for (const Row& row : rows) {
    AclBuilder acl;
    row.build(acl);
    if (!acl.Ok()) {
      failed.push_back(row.name + " (the test ACL could not be built)");
    } else if (storage::AncestorAclSafe(acl.Acl(), trusted) != row.safe) {
      failed.push_back(std::string(row.safe ? "safe " : "unsafe ") + row.name);
    }
  }
  CheckRows(check, "ancestor ACL: only trusted principals may hold a right that replaces or re-secures a child", failed);

  check(!storage::AncestorAclSafe(nullptr, trusted), "ancestor ACL: a missing DACL, which grants everyone full control, is unsafe");

  AclBuilder ownerOnly;
  ownerOnly.Allow(userSid.Get(), kFull);
  check(ownerOnly.Ok() && !storage::AncestorAclSafe(ownerOnly.Acl(), {}),
        "ancestor ACL: with no trusted principals even the owner's full control is unsafe");
  AclBuilder readOnly;
  readOnly.Allow(everyone.Get(), FILE_GENERIC_READ);
  check(readOnly.Ok() && storage::AncestorAclSafe(readOnly.Acl(), {}),
        "ancestor ACL: a read-only grant is safe with no trusted principals");
}

void TestLoopbackUrls(const CheckFunction& check) {
  struct Accepted {
    std::string url;
    service::Family family;
    std::uint16_t port;
  };
  const std::vector<Accepted> accepted = {
      {"http://127.0.0.1:1", service::Family::kIpv4, 1},
      {"http://127.0.0.1:8080", service::Family::kIpv4, 8080},
      {"http://127.0.0.1:65535", service::Family::kIpv4, 65535},
      {"http://[::1]:1", service::Family::kIpv6, 1},
      {"http://[::1]:8080", service::Family::kIpv6, 8080},
      {"http://[::1]:65535", service::Family::kIpv6, 65535},
  };
  std::vector<std::string> failed;
  for (const Accepted& row : accepted) {
    service::Endpoint endpoint;
    endpoint.address.fill(0xAA);
    std::array<unsigned char, 16> expected{};
    if (row.family == service::Family::kIpv4) {
      expected = {127, 0, 0, 1};
    } else {
      expected[15] = 1;
    }
    if (!service::ParseLoopbackUrl(row.url, endpoint) || endpoint.family != row.family || endpoint.port != row.port ||
        endpoint.address != expected) {
      failed.push_back(row.url);
    }
  }
  CheckRows(check, "loopback URL: parses 127.0.0.1 and [::1] origins with the exact port", failed);

  const std::vector<std::string> rejected = {
      "",
      "http://127.0.0.1",
      "http://127.0.0.1:",
      "http://127.0.0.1:0",
      "http://127.0.0.1:65536",
      "http://127.0.0.1:99999",
      "http://127.0.0.1:080",
      "http://127.0.0.1:00080",
      "http://127.0.0.1:123456",
      "http://127.0.0.1:8080/",
      "http://127.0.0.1:8080?x",
      "http://127.0.0.1:8080#x",
      "http://127.0.0.1:8080 ",
      " http://127.0.0.1:8080",
      "HTTP://127.0.0.1:8080",
      "https://127.0.0.1:8080",
      "http://localhost:8080",
      "http://127.0.0.2:8080",
      "http://127.1:8080",
      "http://0.0.0.0:8080",
      "http://[::]:8080",
      "http://[::1]",
      "http://[::1]:0",
      "http://[::1]:65536",
      "http://[::1]:08080",
      "http://[0:0:0:0:0:0:0:1]:8080",
      "http://[::ffff:127.0.0.1]:8080",
      "http://user@127.0.0.1:8080",
      "http://127.0.0.1:80a",
      "http://127.0.0.1:-1",
      "http://127.0.0.1:+80",
      "http://127.0.0.1:8080:9",
      "127.0.0.1:8080",
      "//127.0.0.1:8080",
      std::string("http://127.0.0.1:80") + '\0',
      "http://127.0.0.1:" + Bytes({0xEF, 0xBC, 0x98, 0xEF, 0xBC, 0x90}),
  };
  service::Endpoint sentinel;
  sentinel.family = service::Family::kIpv6;
  sentinel.address.fill(0xAA);
  sentinel.port = 0xAAAA;
  failed.clear();
  for (const std::string& url : rejected) {
    service::Endpoint endpoint = sentinel;
    if (service::ParseLoopbackUrl(url, endpoint) || endpoint.family != sentinel.family ||
        endpoint.address != sentinel.address || endpoint.port != sentinel.port) {
      failed.push_back(Label(url));
    }
  }
  CheckRows(check, "loopback URL: refuses every other form and leaves the destination untouched", failed);
}

service::Listener V4Listener(const std::array<unsigned char, 4>& address, std::uint16_t port, std::uint32_t pid) {
  service::Listener listener;
  listener.local.family = service::Family::kIpv4;
  std::copy(address.begin(), address.end(), listener.local.address.begin());
  listener.local.port = port;
  listener.pid = pid;
  return listener;
}

service::Listener V6Listener(const std::array<unsigned char, 16>& address, std::uint16_t port, std::uint32_t pid) {
  service::Listener listener;
  listener.local.family = service::Family::kIpv6;
  listener.local.address = address;
  listener.local.port = port;
  listener.pid = pid;
  return listener;
}

void TestListenerOwnership(const CheckFunction& check) {
  constexpr std::uint32_t kSelf = 100;
  constexpr std::uint32_t kOther = 200;
  constexpr std::uint16_t kPort = 5000;
  constexpr std::uint16_t kOtherPort = 5001;
  const std::array<unsigned char, 4> loopback{127, 0, 0, 1};
  const std::array<unsigned char, 4> wildcard{0, 0, 0, 0};
  const std::array<unsigned char, 4> otherLoopback{127, 0, 0, 2};
  const std::array<unsigned char, 4> lan{192, 168, 1, 5};
  const std::array<unsigned char, 16> v6Any{};
  const std::array<unsigned char, 16> v6Loopback{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1};
  const std::array<unsigned char, 16> v6MappedAny{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xFF, 0xFF, 0, 0, 0, 0};
  const std::array<unsigned char, 16> v6MappedLoopback{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xFF, 0xFF, 127, 0, 0, 1};
  const std::array<unsigned char, 16> v6MappedOther{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xFF, 0xFF, 127, 0, 0, 2};
  const std::array<unsigned char, 16> v6LinkLocal{0xFE, 0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1};

  service::Endpoint ipv4Destination;
  ipv4Destination.family = service::Family::kIpv4;
  ipv4Destination.address = {127, 0, 0, 1};
  ipv4Destination.port = kPort;
  service::Endpoint ipv6Destination;
  ipv6Destination.family = service::Family::kIpv6;
  ipv6Destination.address[15] = 1;
  ipv6Destination.port = kPort;

  struct Row {
    std::string name;
    std::vector<service::Listener> listeners;
    bool owned;
  };
  const std::vector<Row> ipv4Rows = {
      {"own IPv4 loopback listener", {V4Listener(loopback, kPort, kSelf)}, true},
      {"own IPv4 wildcard listener", {V4Listener(wildcard, kPort, kSelf)}, true},
      {"another process owns the loopback listener", {V4Listener(loopback, kPort, kOther)}, false},
      {"own loopback beside another process's wildcard",
       {V4Listener(loopback, kPort, kSelf), V4Listener(wildcard, kPort, kOther)},
       false},
      {"own loopback and own wildcard", {V4Listener(loopback, kPort, kSelf), V4Listener(wildcard, kPort, kSelf)}, true},
      {"no listeners", {}, false},
      {"own listener on another port", {V4Listener(loopback, kOtherPort, kSelf)}, false},
      {"own listener on another loopback address", {V4Listener(otherLoopback, kPort, kSelf)}, false},
      {"own listener on a LAN address", {V4Listener(lan, kPort, kSelf)}, false},
      {"another process on a different interface",
       {V4Listener(loopback, kPort, kSelf), V4Listener(lan, kPort, kOther)},
       true},
      {"another process on a different port",
       {V4Listener(loopback, kPort, kSelf), V4Listener(loopback, kOtherPort, kOther)},
       true},
      {"own IPv6 wildcard", {V6Listener(v6Any, kPort, kSelf)}, true},
      {"another process's IPv6 wildcard", {V6Listener(v6Any, kPort, kOther)}, false},
      {"own IPv4-mapped wildcard", {V6Listener(v6MappedAny, kPort, kSelf)}, true},
      {"own IPv4-mapped loopback", {V6Listener(v6MappedLoopback, kPort, kSelf)}, true},
      {"own IPv6 loopback does not serve IPv4", {V6Listener(v6Loopback, kPort, kSelf)}, false},
      {"own IPv4 beside another process's IPv6 loopback",
       {V4Listener(loopback, kPort, kSelf), V6Listener(v6Loopback, kPort, kOther)},
       true},
      {"own IPv4 beside another process's IPv6 wildcard",
       {V4Listener(loopback, kPort, kSelf), V6Listener(v6Any, kPort, kOther)},
       false},
      {"own IPv4 and own IPv6 wildcard", {V4Listener(loopback, kPort, kSelf), V6Listener(v6Any, kPort, kSelf)}, true},
      {"own IPv4 beside another process's mapped loopback",
       {V4Listener(loopback, kPort, kSelf), V6Listener(v6MappedLoopback, kPort, kOther)},
       false},
      {"own IPv4 beside another process's mapped other address",
       {V4Listener(loopback, kPort, kSelf), V6Listener(v6MappedOther, kPort, kOther)},
       true},
  };
  const std::vector<Row> ipv6Rows = {
      {"own IPv6 loopback listener", {V6Listener(v6Loopback, kPort, kSelf)}, true},
      {"own IPv6 wildcard listener", {V6Listener(v6Any, kPort, kSelf)}, true},
      {"own IPv6 loopback beside another process's wildcard",
       {V6Listener(v6Loopback, kPort, kSelf), V6Listener(v6Any, kPort, kOther)},
       false},
      {"IPv4 listener only", {V4Listener(loopback, kPort, kSelf)}, false},
      {"own IPv6 loopback beside another process's IPv4 wildcard",
       {V6Listener(v6Loopback, kPort, kSelf), V4Listener(wildcard, kPort, kOther)},
       true},
      {"own link-local listener", {V6Listener(v6LinkLocal, kPort, kSelf)}, false},
      {"own IPv4-mapped loopback listener", {V6Listener(v6MappedLoopback, kPort, kSelf)}, false},
      {"own IPv6 loopback on another port", {V6Listener(v6Loopback, kOtherPort, kSelf)}, false},
      {"two owners on the same loopback address",
       {V6Listener(v6Loopback, kPort, kSelf), V6Listener(v6Loopback, kPort, kOther)},
       false},
  };
  std::vector<std::string> failed;
  for (const Row& row : ipv4Rows) {
    if (service::ListenersBelongTo(row.listeners, ipv4Destination, kSelf) != row.owned) {
      failed.push_back(std::string(row.owned ? "owned " : "not owned ") + row.name);
    }
  }
  CheckRows(check, "listener ownership: an IPv4 destination needs every accepting listener to belong to the process", failed);
  failed.clear();
  for (const Row& row : ipv6Rows) {
    if (service::ListenersBelongTo(row.listeners, ipv6Destination, kSelf) != row.owned) {
      failed.push_back(std::string(row.owned ? "owned " : "not owned ") + row.name);
    }
  }
  CheckRows(check, "listener ownership: an IPv6 destination needs every accepting listener to belong to the process", failed);
}

void TestDefaultStorageRoot(const CheckFunction& check) {
  std::wstring root;
  const std::string reason = Reason([&] { root = storage::DefaultStorageRoot(); });
  const bool shaped = reason == "none" && storage::IsCanonicalRoot(root) && !root.empty() && root.back() != L'\\' &&
                      EndsWith(root, L"\\com.microsoft.fluentui-react-native.desktop-driver");
  check(shaped, "default root: a canonical LocalAppData subdirectory without a trailing separator" +
                    (reason == "none" ? std::string() : " [" + reason + "]"));
}

// ---------------------------------------------------------------------------
// Private storage on a real file system
// ---------------------------------------------------------------------------

using storage::PrivateStore;
using storage::RootIdentity;

std::string OpenReason(const std::wstring& root, bool create, const RootIdentity* identity) {
  return Reason([&] { PrivateStore::Open(root, create, identity); });
}

std::string PublishReason(PrivateStore& store, const std::string& name, const std::string& contents) {
  return Reason([&] { store.Publish(name, contents); });
}

// "found:<contents>", "absent", or "error:<reason>".
std::string Fetch(PrivateStore& store, const std::string& name) {
  try {
    const std::optional<std::string> contents = store.Read(name);
    return contents ? "found:" + *contents : std::string("absent");
  } catch (const StorageError& error) {
    return std::string("error:") + error.reason();
  } catch (...) {
    return "error:exception";
  }
}

// "removed", "unchanged", or "error:<reason>".
std::string RemoveOutcome(PrivateStore& store, const std::string& name, const std::string& expected) {
  try {
    return store.Remove(name, expected) ? "removed" : "unchanged";
  } catch (const StorageError& error) {
    return std::string("error:") + error.reason();
  } catch (...) {
    return "error:exception";
  }
}

// A directory rename can lose a race with a scanner that briefly holds a file
// inside it, so it is retried before the case is skipped.
bool MoveDirectory(const std::wstring& from, const std::wstring& to) {
  for (int attempt = 0; attempt < 20; attempt += 1) {
    if (MoveFileW(from.c_str(), to.c_str())) {
      return true;
    }
    Sleep(50);
  }
  return false;
}

struct Principals {
  Sid user;
  Sid everyone;
  bool Ready() const { return user.Valid() && everyone.Valid(); }
};

Principals CurrentPrincipals() {
  return {CurrentUserSid(), Sid::WellKnown(WinWorldSid)};
}

void TestStoreLifecycle(const CheckFunction& check, const ScratchDirectory& scratch) {
  const std::wstring root = scratch.Path(L"lifecycle");
  const RootIdentity unknown{std::string(16, '0'), std::string(32, '0')};

  check(OpenReason(root, false, nullptr) == "root" && !Exists(root),
        "store: a missing root is refused, and not created, unless creation is requested");
  check(OpenReason(root, true, &unknown) == "identity" && OpenReason(root, false, &unknown) == "identity" &&
            !Exists(root),
        "store: opening against an expected identity never creates the root");

  std::optional<PrivateStore> opened;
  const std::string created = Reason([&] { opened = PrivateStore::Open(root, true, nullptr); });
  check(created == "none" && opened.has_value(), "store: creates an owner-only root on request [" + created + "]");
  if (!opened) {
    return;
  }
  PrivateStore& store = *opened;
  const RootIdentity identity = store.Identity();
  check(IsLowerHex(identity.volume, 16) && IsLowerHex(identity.file, 32) && store.Root() == root,
        "store: reports the root path with a lowercase-hexadecimal volume and file identity");
  check(OpenReason(root, false, &identity) == "none", "store: reopens the same root by its identity");
  std::optional<PrivateStore> second;
  const std::string reopened = Reason([&] { second = PrivateStore::Open(root, true, nullptr); });
  check(reopened == "none" && second.has_value() && second->Identity() == identity,
        "store: opening an existing root again keeps its identity");
  const RootIdentity otherFile{identity.volume, std::string(32, '0')};
  const RootIdentity otherVolume{std::string(16, '0'), identity.file};
  check(OpenReason(root, false, &otherFile) == "identity" && OpenReason(root, true, &otherFile) == "identity" &&
            OpenReason(root, false, &otherVolume) == "identity",
        "store: refuses a root whose file or volume identity differs from the expected one");

  check(Fetch(store, "alpha.json") == "absent", "store: a record that was never published reads as absent");
  check(PublishReason(store, "alpha.json", "{\"a\":1}") == "none" && Fetch(store, "alpha.json") == "found:{\"a\":1}",
        "store: publishes a record and reads it back");
  check(PublishReason(store, "alpha.json", "replacement") == "exists" &&
            Fetch(store, "alpha.json") == "found:{\"a\":1}",
        "store: never replaces an existing record");

  const std::vector<std::pair<std::string, std::string>> shapes = {
      {"empty", ""},
      {"unicode", Bytes({0xC3, 0xA9, 0xE2, 0x82, 0xAC, 0xF0, 0x9F, 0x98, 0x80})},
      {"embedded-nul", std::string("a\0b", 3)},
      {"line-breaks", "one\r\ntwo\nthree"},
      {"largest", std::string(16384, 'x')},
  };
  std::vector<std::string> failed;
  for (const auto& shape : shapes) {
    if (PublishReason(store, shape.first, shape.second) != "none" ||
        Fetch(store, shape.first) != "found:" + shape.second) {
      failed.push_back(shape.first);
    }
  }
  CheckRows(check, "store: round-trips empty, Unicode, NUL-containing, CRLF, and exactly 16 KiB records byte for byte",
            failed);
  check(PublishReason(store, "oversize", std::string(16385, 'x')) == "size" && Fetch(store, "oversize") == "absent",
        "store: refuses a record over 16 KiB");
  check(PublishReason(store, "binary", Bytes({0xC3, 0x28})) == "encoding" && Fetch(store, "binary") == "absent",
        "store: refuses contents that are not well-formed UTF-8");

  const std::vector<std::string> badNames = {
      "",    "../escape", "a/b",       "a\\b", "a b", "a:b", ".hidden", "a.", "CON", "con.txt",
      std::string(129, 'a'), std::string("a\0b", 3),
  };
  failed.clear();
  for (const std::string& name : badNames) {
    if (PublishReason(store, name, "x") != "name") {
      failed.push_back("publish " + Label(name));
    }
    if (Fetch(store, name) != "error:name") {
      failed.push_back("read " + Label(name));
    }
    if (RemoveOutcome(store, name, "x") != "error:name") {
      failed.push_back("remove " + Label(name));
    }
  }
  if (Exists(scratch.Path(L"escape"))) {
    failed.push_back("a record escaped the root");
  }
  CheckRows(check, "store: refuses an unsafe record name for publish, read, and remove", failed);

  check(RemoveOutcome(store, "alpha.json", "other") == "unchanged" && Fetch(store, "alpha.json") == "found:{\"a\":1}",
        "store: removal needs the exact expected contents");
  check(RemoveOutcome(store, "empty", Bytes({0xC3, 0x28})) == "error:encoding" && Fetch(store, "empty") == "found:",
        "store: removal refuses expected contents that are not well-formed UTF-8");
  check(RemoveOutcome(store, "alpha.json", "{\"a\":1}") == "removed" && Fetch(store, "alpha.json") == "absent",
        "store: removes a record whose contents match");
  check(RemoveOutcome(store, "alpha.json", "{\"a\":1}") == "unchanged",
        "store: removing a record that is gone changes nothing");
  check(PublishReason(store, "alpha.json", "second") == "none" && Fetch(store, "alpha.json") == "found:second",
        "store: a removed name can be published again at once");
  check(CountEntries(root, L".publish-*") == 0, "store: leaves no temporary file behind");

  check(OpenReason(L"relative\\root", true, nullptr) == "root" && OpenReason(L"\\\\?\\" + root, true, nullptr) == "root" &&
            OpenReason(L"", true, nullptr) == "root",
        "store: refuses relative, extended-length, and empty roots");
}

struct RequestRow {
  std::string name;
  json::Value request;
  std::string reason;
};

void TestStoreRequests(const CheckFunction& check, const ScratchDirectory& scratch) {
  const std::wstring root = scratch.Path(L"requests");
  const std::string rootText = ToUtf8(root);
  const auto call = [](const json::Value& request) { return storage::HandlePrivateStorageRequest(request); };

  // Every open request here names its root. An open request without one would
  // create the real per-user store.
  const json::Value opened = call(Object({{"operation", Text("open")}, {"root", Text(rootText)}}));
  const json::Value* identityValue = opened.Find("identity");
  const bool openedWell = Result(opened) == "ok" && opened.StringField("root") == rootText && identityValue != nullptr &&
                          IsLowerHex(identityValue->StringField("volume"), 16) &&
                          IsLowerHex(identityValue->StringField("file"), 32);
  check(openedWell, "requests: open creates the root and reports its path and identity");
  if (!openedWell) {
    return;
  }
  const json::Value identity = *identityValue;
  check(Result(call(Object({{"operation", Text("open")}, {"root", Text(rootText)}, {"identity", identity}}))) == "ok",
        "requests: open accepts the identity it reported");

  const auto request = [&](const char* operation, const std::string& name) {
    return Object({{"operation", Text(operation)}, {"root", Text(rootText)}, {"identity", identity}, {"name", Text(name)}});
  };
  const auto callPublish = [&](const std::string& name, const std::string& contents) {
    return call(With(request("publish", name), "contents", Text(storage::EncodeBase64(contents))));
  };
  const auto callRead = [&](const std::string& name) { return call(request("read", name)); };
  const auto callRemove = [&](const std::string& name, const std::string& expected) {
    return call(With(request("remove", name), "expected", Text(storage::EncodeBase64(expected))));
  };

  const json::Value absent = callRead("note.txt");
  check(Result(absent) == "ok" && !absent.BoolField("found", true) && !absent.Has("contents"),
        "requests: reading an unknown record reports found false and no contents");
  check(Result(callPublish("note.txt", "hello")) == "ok", "requests: publish stores the decoded contents");
  const json::Value found = callRead("note.txt");
  check(Result(found) == "ok" && found.BoolField("found") && found.StringField("contents") == "aGVsbG8=",
        "requests: read returns the stored contents as base64");
  check(Result(callPublish("note.txt", "again")) == "exists", "requests: publish never replaces a record");
  const json::Value kept = callRemove("note.txt", "other");
  check(Result(kept) == "ok" && kept.Has("removed") && !kept.BoolField("removed", true),
        "requests: remove with other contents reports removed false");
  const json::Value removed = callRemove("note.txt", "hello");
  check(Result(removed) == "ok" && removed.BoolField("removed"),
        "requests: remove with the exact contents reports removed true");
  check(!callRead("note.txt").BoolField("found", true), "requests: the removed record reads as absent");

  const std::string zeroVolume(16, '0');
  const std::string zeroFile(32, '0');
  const auto identityOf = [](const std::string& volume, const std::string& file) {
    return Object({{"volume", Text(volume)}, {"file", Text(file)}});
  };
  const auto readWith = [&](const char* key, json::Value value) {
    return With(request("read", "note.txt"), key, std::move(value));
  };
  const auto publishWith = [&](const char* key, json::Value value) {
    return With(request("publish", "x.txt"), key, std::move(value));
  };
  const auto openWith = [&](const char* key, json::Value value) {
    return With(Object({{"operation", Text("open")}, {"root", Text(rootText)}}), key, std::move(value));
  };
  const std::vector<RequestRow> rows = {
      {"array request", json::Value::Array(), "request"},
      {"string request", Text("read"), "request"},
      {"null request", json::Value::Null(), "request"},
      {"missing operation", Without(request("read", "note.txt"), "operation"), "request"},
      {"numeric operation", readWith("operation", json::Value::Number(1)), "request"},
      {"unknown operation", readWith("operation", Text("delete")), "request"},
      {"missing root", Without(request("read", "note.txt"), "root"), "request"},
      {"numeric root", readWith("root", json::Value::Number(1)), "request"},
      {"relative root", readWith("root", Text("relative\\root")), "root"},
      {"root that is not UTF-8", readWith("root", Text(Bytes({0x43, 0x3A, 0x5C, 0xC3, 0x28}))), "root"},
      {"missing identity", Without(request("read", "note.txt"), "identity"), "request"},
      {"identity that is not an object", readWith("identity", Text("x")), "request"},
      {"uppercase identity", readWith("identity", identityOf("ABCDEF0123456789", zeroFile)), "request"},
      {"short volume", readWith("identity", identityOf(std::string(15, '0'), zeroFile)), "request"},
      {"long file", readWith("identity", identityOf(zeroVolume, std::string(33, '0'))), "request"},
      {"numeric identity member",
       readWith("identity", Object({{"volume", json::Value::Number(1)}, {"file", Text(zeroFile)}})), "request"},
      {"missing identity member", readWith("identity", Object({{"volume", Text(zeroVolume)}})), "request"},
      {"another directory's identity", readWith("identity", identityOf(zeroVolume, zeroFile)), "identity"},
      {"missing name", Without(request("read", "note.txt"), "name"), "request"},
      {"numeric name", readWith("name", json::Value::Number(1)), "request"},
      {"traversing name", request("read", "../x"), "name"},
      {"missing contents", request("publish", "x.txt"), "request"},
      {"unpadded contents", publishWith("contents", Text("Zg")), "request"},
      {"numeric contents", publishWith("contents", json::Value::Number(1)), "request"},
      {"contents that are not UTF-8", publishWith("contents", Text("/w==")), "encoding"},
      {"contents over 16 KiB", publishWith("contents", Text(storage::EncodeBase64(std::string(16385, 'x')))), "size"},
      {"missing expected", request("remove", "x.txt"), "request"},
      {"unpadded expected", With(request("remove", "x.txt"), "expected", Text("Zg")), "request"},
      {"open with a relative root", With(Object({{"operation", Text("open")}}), "root", Text("relative")), "root"},
      {"open with a numeric root", With(Object({{"operation", Text("open")}}), "root", json::Value::Number(1)),
       "request"},
      {"open with another directory's identity", openWith("identity", identityOf(zeroVolume, zeroFile)), "identity"},
      {"open with a malformed identity", openWith("identity", Text("x")), "request"},
  };
  std::vector<std::string> failed;
  std::vector<std::string> leaking;
  for (const RequestRow& row : rows) {
    const json::Value response = call(row.request);
    const std::string actual = Result(response);
    if (actual != row.reason) {
      failed.push_back(row.name + " -> " + actual);
    }
    if (response.Serialize().find(kScratchToken) != std::string::npos) {
      leaking.push_back(row.name);
    }
  }
  CheckRows(check, "requests: every malformed, unsafe, or mismatched request fails with its specific reason", failed);
  CheckRows(check, "requests: a failure never reports a path", leaking);
  PrivateStore after = PrivateStore::Open(root, false, nullptr);
  check(Fetch(after, "x.txt") == "absent", "requests: no refused request left a record behind");
}

void TestRecordTampering(const CheckFunction& check, const ScratchDirectory& scratch) {
  const Principals principals = CurrentPrincipals();
  if (!principals.Ready()) {
    check(false, "record tampering: the test principals resolve");
    return;
  }
  const std::wstring root = scratch.Path(L"records");
  const std::wstring decoy = scratch.Path(L"records-decoy");
  PrivateStore store = PrivateStore::Open(root, true, nullptr);
  const auto pathOf = [&root](const std::string& name) { return root + L"\\" + ToWide(name); };

  if (PublishReason(store, "linked", "content") == "none") {
    const std::wstring outside = scratch.Path(L"records-outside-link");
    if (CreateHardLinkW(outside.c_str(), pathOf("linked").c_str(), nullptr)) {
      const std::string readWhileLinked = Fetch(store, "linked");
      const std::string removeWhileLinked = RemoveOutcome(store, "linked", "content");
      DeleteFileW(outside.c_str());
      check(readWhileLinked == "error:links" && removeWhileLinked == "error:links" &&
                Fetch(store, "linked") == "found:content",
            "record: a second hard link makes it unreadable and unremovable until the link is gone");
    } else {
      NoteSkipped("record tampering: hard links are unavailable here; skipping the hard-link case");
    }
  } else {
    check(false, "record tampering: a record can be published for the hard-link case");
  }

  if (PublishReason(store, "guarded", "content") == "none") {
    AclBuilder widened;
    widened.Allow(principals.user.Get(), FILE_ALL_ACCESS).Allow(principals.everyone.Get(), FILE_GENERIC_READ);
    const bool widenedApplied = ApplyDacl(pathOf("guarded"), widened, true);
    const std::string whileWidened = Fetch(store, "guarded");
    AclBuilder ownerOnly;
    ownerOnly.Allow(principals.user.Get(), FILE_ALL_ACCESS);
    const bool restored = ApplyDacl(pathOf("guarded"), ownerOnly, true);
    check(widenedApplied && whileWidened == "error:dacl" && restored && Fetch(store, "guarded") == "found:content",
          "record: a DACL that admits another principal makes it unreadable until it is owner-only again");

    AclBuilder inheriting;
    inheriting.Allow(principals.user.Get(), FILE_ALL_ACCESS);
    const bool inheritingApplied = ApplyDacl(pathOf("guarded"), inheriting, false);
    check(inheritingApplied && Fetch(store, "guarded") == "error:dacl" &&
              RemoveOutcome(store, "guarded", "content") == "error:dacl",
          "record: an unprotected DACL that inherits from the root is refused for read and remove");
  } else {
    check(false, "record tampering: a record can be published for the DACL cases");
  }

  if (CreateDirectoryW(pathOf("dirslot").c_str(), nullptr)) {
    check(Fetch(store, "dirslot") == "error:type" && PublishReason(store, "dirslot", "x") == "exists",
          "record: a directory in a record's place is refused and never replaced");
  } else {
    check(false, "record tampering: a directory can be created in a record's place");
  }

  if (CreateDirectoryW(decoy.c_str(), nullptr) && CreateJunction(pathOf("junctionslot"), decoy)) {
    check(Fetch(store, "junctionslot") == "error:reparse" && PublishReason(store, "junctionslot", "x") == "exists" &&
              CountEntries(decoy, L"*") == 0,
          "record: a junction in a record's place is refused, never followed, and never replaced");
  } else {
    NoteSkipped("record tampering: a junction cannot be created here; skipping the junction case");
  }

  if (PublishReason(store, "rewritten", "content") == "none") {
    const bool corrupted = OverwriteRecord(pathOf("rewritten"), Bytes({0xC3, 0x28}));
    check(corrupted && Fetch(store, "rewritten") == "error:encoding" &&
              RemoveOutcome(store, "rewritten", "content") == "error:encoding",
          "record: contents rewritten to invalid UTF-8 are refused for read and remove");
    const bool grown = OverwriteRecord(pathOf("rewritten"), std::string(16385, 'x'));
    check(grown && Fetch(store, "rewritten") == "error:size", "record: contents grown past 16 KiB are refused");
  } else {
    check(false, "record tampering: a record can be published for the rewrite cases");
  }
}

void TestRootTampering(const CheckFunction& check, const ScratchDirectory& scratch) {
  const Principals principals = CurrentPrincipals();
  if (!principals.Ready()) {
    check(false, "root tampering: the test principals resolve");
    return;
  }
  const std::wstring root = scratch.Path(L"roots");
  const std::wstring moved = scratch.Path(L"roots-moved");
  const std::wstring decoy = scratch.Path(L"roots-decoy");
  PrivateStore store = PrivateStore::Open(root, true, nullptr);
  const RootIdentity identity = store.Identity();
  store.Publish("keep", "content");

  AclBuilder widened;
  widened.Allow(principals.user.Get(), FILE_ALL_ACCESS, kInheritBoth)
      .Allow(principals.everyone.Get(), FILE_GENERIC_READ, kInheritBoth);
  const bool widenedApplied = ApplyDacl(root, widened, true);
  const std::string openWhileWidened = OpenReason(root, false, &identity);
  const std::string readWhileWidened = Fetch(store, "keep");
  const std::string publishWhileWidened = PublishReason(store, "late", "x");
  AclBuilder ownerOnly;
  ownerOnly.Allow(principals.user.Get(), FILE_ALL_ACCESS, kInheritBoth);
  const bool restored = ApplyDacl(root, ownerOnly, true);
  check(widenedApplied && openWhileWidened == "dacl" && readWhileWidened == "error:dacl" &&
            publishWhileWidened == "dacl" && restored && Fetch(store, "keep") == "found:content" &&
            Fetch(store, "late") == "absent",
        "root: a DACL that admits another principal stops every operation until it is owner-only again");

  if (!MoveDirectory(root, moved)) {
    NoteSkipped("root tampering: the root cannot be renamed here; skipping the swap cases");
  } else {
    check(OpenReason(root, false, &identity) == "identity" && Fetch(store, "keep") == "error:identity",
          "root: a root that was moved away is not the directory first opened");

    if (CreateDirectoryW(decoy.c_str(), nullptr) && CreateJunction(root, decoy)) {
      check(OpenReason(root, false, &identity) == "reparse" && OpenReason(root, true, nullptr) == "reparse" &&
                Fetch(store, "keep") == "error:reparse" && PublishReason(store, "late", "x") == "reparse" &&
                CountEntries(decoy, L"*") == 0,
            "root: a junction at the root path is refused, never followed, and never populated");
      RemoveDirectoryW(root.c_str());
    } else {
      NoteSkipped("root tampering: a junction cannot be created here; skipping the junction case");
    }

    std::optional<PrivateStore> replacement;
    const std::string made = Reason([&] { replacement = PrivateStore::Open(root, true, nullptr); });
    check(made == "none" && replacement.has_value() && !(replacement->Identity() == identity) &&
              OpenReason(root, false, &identity) == "identity" && Fetch(store, "keep") == "error:identity" &&
              PublishReason(store, "late", "x") == "identity",
          "root: a different directory at the same path never satisfies the first one's identity");
    replacement.reset();
    RemoveTree(root);

    check(MoveDirectory(moved, root) && Fetch(store, "keep") == "found:content",
          "root: the original directory works again once it is back at its path");
  }

  const std::wstring realParent = scratch.Path(L"roots-real-parent");
  const std::wstring linkedParent = scratch.Path(L"roots-linked-parent");
  if (CreateDirectoryW(realParent.c_str(), nullptr) && CreateJunction(linkedParent, realParent)) {
    check(OpenReason(linkedParent + L"\\store", true, nullptr) == "ancestor" && CountEntries(realParent, L"*") == 0,
          "root: an ancestor that is a junction is refused and nothing is created behind it");
  } else {
    NoteSkipped("root tampering: a junction cannot be created here; skipping the ancestor case");
  }

  const std::wstring missingParent = scratch.Path(L"roots-missing-parent");
  check(OpenReason(missingParent + L"\\store", true, nullptr) == "ancestor" && !Exists(missingParent),
        "root: a missing parent directory is refused and not created");

  const std::wstring plain = scratch.Path(L"roots-plain");
  if (CreateDirectoryW(plain.c_str(), nullptr)) {
    const std::string reason = OpenReason(plain, true, nullptr);
    check(reason == "dacl" || reason == "owner",
          "root: an existing directory that is not owner-only is refused [" + reason + "]");
  }

  const std::wstring fileRoot = scratch.Path(L"roots-file");
  const ScopedHandle fileHandle(
      CreateFileW(fileRoot.c_str(), GENERIC_WRITE, 0, nullptr, CREATE_NEW, FILE_ATTRIBUTE_NORMAL, nullptr));
  if (fileHandle) {
    check(OpenReason(fileRoot, true, nullptr) == "type", "root: a file in the root's place is refused as not a directory");
  }
}

void TestConcurrentPublication(const CheckFunction& check, const ScratchDirectory& scratch) {
  constexpr std::size_t kWriters = 6;
  const std::wstring root = scratch.Path(L"race");
  PrivateStore seed = PrivateStore::Open(root, true, nullptr);
  const RootIdentity identity = seed.Identity();

  std::atomic<bool> go{false};
  std::vector<std::string> outcomes(kWriters);
  std::vector<std::thread> writers;
  for (std::size_t index = 0; index < kWriters; index += 1) {
    writers.emplace_back([&, index] {
      while (!go.load()) {
        std::this_thread::yield();
      }
      outcomes[index] = Reason([&] {
        PrivateStore writer = PrivateStore::Open(root, false, &identity);
        writer.Publish("contested", "writer-" + std::to_string(index));
      });
    });
  }
  go.store(true);
  for (std::thread& writer : writers) {
    writer.join();
  }
  const auto count = [&outcomes](const char* reason) {
    return static_cast<std::size_t>(std::count(outcomes.begin(), outcomes.end(), std::string(reason)));
  };
  const bool oneWinner = count("none") == 1 && count("exists") == kWriters - 1;
  check(oneWinner, oneWinner ? "concurrent publish: exactly one racing writer wins and the others see the name taken"
                             : "concurrent publish: exactly one racing writer wins and the others see the name taken [" +
                                   Join(outcomes) + "]");
  check(Fetch(seed, "contested").rfind("found:writer-", 0) == 0,
        "concurrent publish: the record holds one writer's complete contents");
  check(CountEntries(root, L".publish-*") == 0, "concurrent publish: no temporary file survives the race");
}

void RunStorageSections(const CheckFunction& check) {
  ScratchDirectory scratch;
  if (!scratch.Ready()) {
    NoteSkipped("private storage: a scratch directory cannot be prepared here; skipping the file-system cases");
    return;
  }
  const std::string probe = OpenReason(scratch.Path(L"probe"), true, nullptr);
  if (probe == "ancestor" || probe == "volume") {
    NoteSkipped("private storage: the temporary folder is not a location a private store accepts (" + probe +
                "); skipping the file-system cases");
    return;
  }
  check(probe == "none", "private storage: a store can be created under the temporary folder [" + probe + "]");
  if (probe != "none") {
    return;
  }
  Section(check, "store lifecycle", [&] { TestStoreLifecycle(check, scratch); });
  Section(check, "store requests", [&] { TestStoreRequests(check, scratch); });
  Section(check, "record tampering", [&] { TestRecordTampering(check, scratch); });
  Section(check, "root tampering", [&] { TestRootTampering(check, scratch); });
  Section(check, "concurrent publication", [&] { TestConcurrentPublication(check, scratch); });
}

// ---------------------------------------------------------------------------
// Live service identity
// ---------------------------------------------------------------------------

constexpr char kIncarnation[] = "inc_0123456789abcdef01234567";

json::Value DescribeRequest(const json::Value& pid) {
  return Object({{"operation", Text("describe")}, {"pid", pid}});
}

json::Value VerifyRequest(const std::string& url, const json::Value& claim) {
  return Object({{"operation", Text("verify")}, {"url", Text(url)}, {"service", claim}});
}

json::Value Describe(DWORD pid) {
  return service::HandleServiceIdentityRequest(DescribeRequest(json::Value::Integer(pid)));
}

std::string Verify(const json::Value& request) {
  return VerifyOutcome(service::HandleServiceIdentityRequest(request));
}

// The facts of this process as the operating system reports them directly.
struct ProcessFacts {
  std::string startedAt;
  std::wstring image;
  DWORD session{0};
  bool complete{false};
};

ProcessFacts SelfFacts() {
  ProcessFacts facts;
  FILETIME created{};
  FILETIME exited{};
  FILETIME kernel{};
  FILETIME user{};
  if (!GetProcessTimes(GetCurrentProcess(), &created, &exited, &kernel, &user)) {
    return facts;
  }
  facts.startedAt = FormatFileTimeIso8601(created);
  std::wstring path(32768, L'\0');
  DWORD length = static_cast<DWORD>(path.size());
  if (!QueryFullProcessImageNameW(GetCurrentProcess(), 0, path.data(), &length)) {
    return facts;
  }
  path.resize(length);
  facts.image = path;
  facts.complete = ProcessIdToSessionId(GetCurrentProcessId(), &facts.session) != FALSE;
  return facts;
}

// A claim for this process, as a launcher would report it after describing it.
bool SelfClaim(json::Value& claim) {
  const json::Value described = Describe(GetCurrentProcessId());
  const json::Value* identity = described.Find("identity");
  if (Result(described) != "ok" || identity == nullptr) {
    return false;
  }
  claim = *identity;
  claim.Set("incarnation", Text(kIncarnation));
  return true;
}

void TestDescribeSelf(const CheckFunction& check) {
  const ProcessFacts facts = SelfFacts();
  const json::Value described = Describe(GetCurrentProcessId());
  const json::Value* identityValue = described.Find("identity");
  if (!facts.complete || Result(described) != "ok" || identityValue == nullptr) {
    check(false, "describe: the helper describes its own process [" + Result(described) + "]");
    return;
  }
  const json::Value& identity = *identityValue;
  const std::string startedAt = identity.StringField("startedAt");
  check(identity.StringField("platform") == "windows" &&
            identity.NumberField("pid", -1) == static_cast<double>(GetCurrentProcessId()),
        "describe: reports platform windows and the exact process identifier");
  check(startedAt == facts.startedAt && startedAt.size() == 28 && startedAt.back() == 'Z',
        "describe: reports the creation time as a 28-character UTC instant with 100 ns resolution");
  check(identity.StringField("executablePath") == ToUtf8(facts.image) && facts.image.size() > 3 &&
            facts.image[1] == L':' && facts.image[2] == L'\\',
        "describe: reports the absolute image path");
  check(identity.StringField("interactiveSession") == "windows-session:" + std::to_string(facts.session),
        "describe: reports the interactive session");
}

struct VerifyRow {
  std::string name;
  json::Value request;
  std::string outcome;
};

void TestVerifyTable(const CheckFunction& check) {
  json::Value claim;
  const ProcessFacts facts = SelfFacts();
  if (!facts.complete || !SelfClaim(claim)) {
    check(false, "verify: the helper can claim its own process");
    return;
  }
  const LoopbackListener listener;
  if (!listener.Ready()) {
    NoteSkipped("service identity: a loopback listener cannot be created here; skipping the verification cases");
    return;
  }
  const std::string url = listener.Url();
  const std::string port = std::to_string(listener.Port());
  const std::string image = claim.StringField("executablePath");
  std::string changedStart = claim.StringField("startedAt");
  char& lastDigit = changedStart[changedStart.size() - 2];
  lastDigit = lastDigit == '9' ? '8' : static_cast<char>(lastDigit + 1);

  const std::vector<VerifyRow> rows = {
      {"genuine claim", VerifyRequest(url, claim), "verified"},
      {"start time one tick later", VerifyRequest(url, With(claim, "startedAt", Text(changedStart))), "refused:start"},
      {"image path with an extra character", VerifyRequest(url, With(claim, "executablePath", Text(image + "x"))),
       "refused:image"},
      {"image path in lower case", VerifyRequest(url, With(claim, "executablePath", Text(ToLowerAscii(image)))),
       "verified"},
      {"another session",
       VerifyRequest(url, With(claim, "interactiveSession", Text("windows-session:" + std::to_string(facts.session + 1)))),
       "refused:session"},
      {"another platform", VerifyRequest(url, With(claim, "platform", Text("macos"))), "refused:claim"},
      {"unparseable start time", VerifyRequest(url, With(claim, "startedAt", Text("not a time"))), "refused:claim"},
      {"image path that is not UTF-8",
       VerifyRequest(url, With(claim, "executablePath", Text(Bytes({0x43, 0x3A, 0x5C, 0xC3, 0x28})))), "refused:claim"},
      {"host name instead of an address", VerifyRequest("http://localhost:" + port, claim), "refused:url"},
      {"https scheme", VerifyRequest("https://127.0.0.1:" + port, claim), "refused:url"},
      {"trailing slash", VerifyRequest(url + "/", claim), "refused:url"},
      {"IPv6 loopback nothing listens on", VerifyRequest("http://[::1]:" + port, claim), "refused:listener"},
      {"IPv4 port nothing listens on", VerifyRequest("http://127.0.0.1:" + std::to_string(UnusedPort()), claim),
       "refused:listener"},
      {"missing incarnation", VerifyRequest(url, Without(claim, "incarnation")), "error:request"},
      {"missing url", Without(VerifyRequest(url, claim), "url"), "error:request"},
      {"missing service", Without(VerifyRequest(url, claim), "service"), "error:request"},
      {"service that is not an object", VerifyRequest(url, Text("x")), "error:request"},
      {"process identifier as text", VerifyRequest(url, With(claim, "pid", Text("7"))), "error:request"},
      {"process identifier zero", VerifyRequest(url, With(claim, "pid", json::Value::Integer(0))), "error:request"},
      {"fractional process identifier", VerifyRequest(url, With(claim, "pid", json::Value::Number(1.5))),
       "error:request"},
  };
  std::vector<std::string> failed;
  for (const VerifyRow& row : rows) {
    const std::string actual = Verify(row.request);
    if (actual != row.outcome) {
      failed.push_back(row.name + " -> " + actual);
    }
  }
  CheckRows(check, "verify: a claim holds only when the process, its start, image, session, and listener all match",
            failed);
}

void TestOtherProcesses(const CheckFunction& check) {
  json::Value claim;
  if (!SelfClaim(claim)) {
    check(false, "other processes: the helper can claim its own process");
    return;
  }
  const LoopbackListener listener;
  if (!listener.Ready()) {
    NoteSkipped("service identity: a loopback listener cannot be created here; skipping the other-process cases");
    return;
  }
  const DWORD self = GetCurrentProcessId();

  std::vector<service::Listener> table;
  bool readable = true;
  try {
    table = service::ReadListeners();
  } catch (...) {
    readable = false;
  }
  const auto foreign = std::find_if(table.begin(), table.end(), [self](const service::Listener& entry) {
    const auto& address = entry.local.address;
    const bool wildcard = address[0] == 0 && address[1] == 0 && address[2] == 0 && address[3] == 0;
    const bool loopback = address[0] == 127 && address[1] == 0 && address[2] == 0 && address[3] == 1;
    return entry.local.family == service::Family::kIpv4 && (wildcard || loopback) && entry.pid != 0 &&
           entry.pid != self;
  });
  if (readable && foreign != table.end()) {
    check(Verify(VerifyRequest("http://127.0.0.1:" + std::to_string(foreign->local.port), claim)) == "refused:listener",
          "listener: a claim for this process is refused when another process holds the port");
  } else {
    NoteSkipped("service identity: no other process listens on IPv4 loopback here; skipping the foreign-listener case");
  }

  ChildProcess child;
  if (!child.Started()) {
    NoteSkipped("service identity: a child process cannot be started here; skipping the child-process cases");
    return;
  }
  const json::Value described = Describe(child.Pid());
  const json::Value* identityValue = described.Find("identity");
  if (Result(described) != "ok" || identityValue == nullptr) {
    check(false, "describe: a child of this user and session can be described [" + Result(described) + "]");
    return;
  }
  json::Value childClaim = *identityValue;
  childClaim.Set("incarnation", Text(kIncarnation));
  check(identityValue->NumberField("pid", -1) == static_cast<double>(child.Pid()) &&
            EndsWith(ToLowerAscii(identityValue->StringField("executablePath")), "\\ping.exe"),
        "describe: reports the child's own identifier and image");
  check(Verify(VerifyRequest(listener.Url(), childClaim)) == "refused:listener",
        "listener: a claim for a live child is refused when this process holds the port");
  child.Stop();
  check(Result(Describe(child.Pid())) == "exited",
        "describe: a process that has exited is reported as exited rather than as an access failure");
  check(Verify(VerifyRequest(listener.Url(), childClaim)) == "refused:exited",
        "verify: a claim for a process that has exited is refused");
}

void TestServiceRequests(const CheckFunction& check) {
  const json::Value validPid = json::Value::Integer(GetCurrentProcessId());
  const std::vector<std::pair<std::string, json::Value>> rows = {
      {"pid zero", DescribeRequest(json::Value::Integer(0))},
      {"negative pid", DescribeRequest(json::Value::Integer(-1))},
      {"fractional pid", DescribeRequest(json::Value::Number(1.5))},
      {"textual pid", DescribeRequest(Text("7"))},
      {"pid above the signed 32-bit range", DescribeRequest(json::Value::Integer(2147483648LL))},
      {"missing pid", Without(DescribeRequest(validPid), "pid")},
      {"array request", json::Value::Array()},
      {"string request", Text("describe")},
      {"null request", json::Value::Null()},
      {"missing operation", Without(DescribeRequest(validPid), "operation")},
      {"numeric operation", With(DescribeRequest(validPid), "operation", json::Value::Number(1))},
      {"unknown operation", With(DescribeRequest(validPid), "operation", Text("inspect"))},
  };
  std::vector<std::string> failed;
  for (const auto& row : rows) {
    const std::string actual = Result(service::HandleServiceIdentityRequest(row.second));
    if (actual != "request") {
      failed.push_back(row.first + " -> " + actual);
    }
  }
  CheckRows(check, "service requests: a malformed request is refused before any process is opened", failed);

  check(Result(Describe(2147483644)) == "exited",
        "describe: a process identifier nothing owns is reported as exited");
  const Sid user = CurrentUserSid();
  const Sid system = Sid::WellKnown(WinLocalSystemSid);
  if (user.Valid() && system.Valid() && !user.Equals(system.Get())) {
    check(Result(Describe(4)) != "ok", "describe: the System process is not described to an ordinary account");
  }
}

void RunServiceSections(const CheckFunction& check) {
  Section(check, "describe", [&] { TestDescribeSelf(check); });
  Section(check, "verify", [&] { TestVerifyTable(check); });
  Section(check, "other processes", [&] { TestOtherProcesses(check); });
  Section(check, "service requests", [&] { TestServiceRequests(check); });
}

// ---------------------------------------------------------------------------
// Application incarnation
// ---------------------------------------------------------------------------

using incarnation::Observation;
using incarnation::State;

std::string StateText(State state) {
  switch (state) {
    case State::kExited:
      return "exited";
    case State::kRunning:
      return "running";
    case State::kUnknown:
      break;
  }
  return "unknown";
}

json::Value IncarnationRequest(const json::Value& pid, const json::Value& startedAt) {
  return Object({{"pid", pid}, {"startedAt", startedAt}});
}

// The answer as `state:<value>`, `error:<reason>`, or `malformed`.
std::string IncarnationOutcome(const json::Value& response) {
  const json::Value* ok = response.Find("ok");
  if (ok == nullptr || !ok->IsBool() || response.Members().size() != 2) {
    return "malformed";
  }
  if (ok->AsBool()) {
    const json::Value* state = response.Find("state");
    return state != nullptr && state->IsString() ? "state:" + state->AsString() : "malformed";
  }
  return "error:" + response.StringField("reason");
}

std::string Incarnation(DWORD pid, const std::string& startedAt) {
  return IncarnationOutcome(incarnation::HandleApplicationIncarnationRequest(
      IncarnationRequest(json::Value::Integer(pid), Text(startedAt))));
}

std::atomic<int> gObservations{0};

Observation CountingObserve(DWORD) {
  gObservations += 1;
  return {Observation::Kind::kStarted, 0};
}

void TestIncarnationClassifier(const CheckFunction& check) {
  constexpr std::uint64_t recorded = 133000000000000000ULL;
  const auto started = [](std::uint64_t ticks) { return Observation{Observation::Kind::kStarted, ticks}; };
  struct Row {
    std::string name;
    Observation observed;
    State expected;
  };
  const std::vector<Row> rows = {
      {"no process", {Observation::Kind::kGone}, State::kExited},
      {"inspection unavailable", {Observation::Kind::kUnavailable}, State::kUnknown},
      {"same start", started(recorded), State::kRunning},
      {"10 ms later", started(recorded + 100000), State::kRunning},
      {"10 ms earlier", started(recorded - 100000), State::kRunning},
      {"just over 10 ms later", started(recorded + 100001), State::kUnknown},
      {"just over 10 ms earlier", started(recorded - 100001), State::kUnknown},
      {"1 s later", started(recorded + 10000000), State::kUnknown},
      {"just over 1 s later", started(recorded + 10000001), State::kExited},
      {"a day earlier", started(recorded - 864000000000ULL), State::kUnknown},
      {"a day later", started(recorded + 864000000000ULL), State::kExited},
  };
  std::vector<std::string> failed;
  for (const Row& row : rows) {
    const State actual = incarnation::Classify(recorded, row.observed);
    if (actual != row.expected) {
      failed.push_back(row.name + " -> " + StateText(actual));
    }
  }
  CheckRows(check, "incarnation: exited needs proof; a near start is running; everything else is unknown", failed);
}

void TestIncarnationStartTimes(const CheckFunction& check) {
  const std::vector<std::string> accepted = {
      "2026-11-04T05:35:46Z",
      "2026-11-04T05:35:46.1Z",
      "2026-11-04T05:35:46.123456789Z",
      "2026-11-04T05:35:46.1234567Z",
      "2026-11-04T05:35:46+05:30",
      "2026-11-04T05:35:46.000-08:00",
  };
  const std::vector<std::string> refused = {
      "",
      "2026-11-04",
      "2026-11-04 05:35:46Z",
      "2026-11-04T05:35:46",
      "2026-11-04T05:35:46.Z",
      "2026-11-04T05:35:46.1234567890Z",
      "2026-11-04T05:35:46Zx",
      "2026-11-04T05:35:46+0530",
      "2026-11-04T05:35:46+05:3",
      " 2026-11-04T05:35:46Z",
      "2026-11-04T05:35:46Z ",
      "2026-13-04T05:35:46Z",
      "2026-11-04T25:35:46Z",
      "2026-11-04t05:35:46z",
      "not a time",
  };
  std::vector<std::string> failed;
  std::uint64_t ticks = 0;
  for (const std::string& text : accepted) {
    if (!incarnation::ParseStartedAt(text, ticks)) {
      failed.push_back("refused " + Label(text));
    }
  }
  for (const std::string& text : refused) {
    if (incarnation::ParseStartedAt(text, ticks)) {
      failed.push_back("accepted " + Label(text));
    }
  }
  std::uint64_t utc = 0;
  std::uint64_t offset = 0;
  if (!incarnation::ParseStartedAt("2026-11-04T05:35:46.5Z", utc) ||
      !incarnation::ParseStartedAt("2026-11-04T11:05:46.5+05:30", offset) || utc != offset) {
    failed.push_back("an offset does not name the same instant as its UTC form");
  }
  CheckRows(check, "incarnation: a start time is a strict ISO 8601 instant of at most 64 bytes", failed);
}

void TestIncarnationRequests(const CheckFunction& check) {
  const std::string start = "2026-11-04T05:35:46.1234567Z";
  const json::Value valid = IncarnationRequest(json::Value::Integer(1234), Text(start));
  const std::vector<std::pair<std::string, json::Value>> rows = {
      {"pid zero", IncarnationRequest(json::Value::Integer(0), Text(start))},
      {"negative pid", IncarnationRequest(json::Value::Integer(-1), Text(start))},
      {"fractional pid", IncarnationRequest(json::Value::Number(1.5), Text(start))},
      {"textual pid", IncarnationRequest(Text("1234"), Text(start))},
      {"pid above the signed 32-bit range", IncarnationRequest(json::Value::Integer(2147483648LL), Text(start))},
      {"numeric start", IncarnationRequest(json::Value::Integer(1234), json::Value::Number(1))},
      {"null start", IncarnationRequest(json::Value::Integer(1234), json::Value::Null())},
      {"start of 65 bytes", IncarnationRequest(json::Value::Integer(1234), Text(start + std::string(37, '0')))},
      {"start with trailing text", IncarnationRequest(json::Value::Integer(1234), Text(start + "x"))},
      {"missing pid", Without(valid, "pid")},
      {"missing start", Without(valid, "startedAt")},
      {"extra key", With(valid, "operation", Text("probe"))},
      {"array request", json::Value::Array()},
      {"string request", Text(start)},
      {"null request", json::Value::Null()},
  };
  gObservations = 0;
  std::vector<std::string> failed;
  for (const auto& row : rows) {
    const std::string actual =
        IncarnationOutcome(incarnation::HandleApplicationIncarnationRequest(row.second, CountingObserve));
    if (actual != "error:request") {
      failed.push_back(row.first + " -> " + actual);
    }
  }
  CheckRows(check, "incarnation requests: a malformed request is refused", failed);
  check(gObservations == 0, "incarnation requests: a malformed request never inspects a process");
  const json::Value answer = incarnation::HandleApplicationIncarnationRequest(
      IncarnationRequest(json::Value::Integer(2147483647), Text(start)), CountingObserve);
  check(IncarnationOutcome(answer) == "state:unknown" && gObservations == 1,
        "incarnation requests: the largest process identifier is accepted and the answer has only ok and state");
}

void TestIncarnationProcesses(const CheckFunction& check) {
  const ProcessFacts facts = SelfFacts();
  if (!facts.complete) {
    check(false, "incarnation: the helper can read its own start time");
    return;
  }
  const DWORD self = GetCurrentProcessId();
  check(Incarnation(self, facts.startedAt) == "state:running",
        "incarnation: this process at its recorded start is running");
  check(Incarnation(self, facts.startedAt.substr(0, 23) + "Z") == "state:running",
        "incarnation: a start recorded with millisecond resolution still matches");
  check(Incarnation(self, "1970-01-01T00:00:00.000Z") == "state:exited",
        "incarnation: a process id now naming a much later process proves the recorded one exited");
  check(Incarnation(self, "2999-01-01T00:00:00.000Z") == "state:unknown",
        "incarnation: a process id naming an earlier process proves nothing");
  check(Incarnation(2147483644, facts.startedAt) == "state:exited",
        "incarnation: a process identifier nothing owns is exited");
  check(Incarnation(4, facts.startedAt) == "state:unknown",
        "incarnation: the System process, started before this one, is unknown");

  ChildProcess child;
  if (!child.Started()) {
    NoteSkipped("application incarnation: a child process cannot be started here; skipping the child cases");
    return;
  }
  const json::Value described = Describe(child.Pid());
  const json::Value* identity = described.Find("identity");
  if (Result(described) != "ok" || identity == nullptr) {
    check(false, "incarnation: a child of this user and session can be described [" + Result(described) + "]");
    return;
  }
  const std::string childStart = identity->StringField("startedAt");
  check(Incarnation(child.Pid(), childStart) == "state:running", "incarnation: a live child is running");
  child.Stop();
  check(Incarnation(child.Pid(), childStart) == "state:exited", "incarnation: a child that has exited is exited");
}

void RunIncarnationSections(const CheckFunction& check) {
  Section(check, "incarnation classifier", [&] { TestIncarnationClassifier(check); });
  Section(check, "incarnation start times", [&] { TestIncarnationStartTimes(check); });
  Section(check, "incarnation requests", [&] { TestIncarnationRequests(check); });
  Section(check, "incarnation processes", [&] { TestIncarnationProcesses(check); });
}

}  // namespace

void RunAuthoritySelfTests(const CheckFunction& check) {
  Section(check, "record names", [&] { TestRecordNames(check); });
  Section(check, "base64", [&] { TestBase64(check); });
  Section(check, "UTF-8", [&] { TestStrictUtf8(check); });
  Section(check, "canonical roots", [&] { TestCanonicalRoots(check); });
  Section(check, "ancestor ACLs", [&] { TestAncestorAcls(check); });
  Section(check, "loopback URLs", [&] { TestLoopbackUrls(check); });
  Section(check, "listener ownership", [&] { TestListenerOwnership(check); });
  Section(check, "default root", [&] { TestDefaultStorageRoot(check); });
  Section(check, "private storage", [&] { RunStorageSections(check); });
  Section(check, "service identity", [&] { RunServiceSections(check); });
  Section(check, "application incarnation", [&] { RunIncarnationSections(check); });
}

}  // namespace furn
