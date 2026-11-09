#pragma once

#include <windows.h>

#include <cstddef>
#include <optional>
#include <stdexcept>
#include <string>
#include <string_view>
#include <vector>

#include "json.h"

namespace furn::storage {

// A record is at most 16 KiB of UTF-8, the bound the Node adapter enforces.
inline constexpr std::size_t kMaximumRecordBytes = 16 * 1024;

// Fixed, non-secret failure categories. A reason never carries a path or the
// contents of a record, so it can cross the process boundary unredacted.
inline constexpr char kReasonRequest[] = "request";
inline constexpr char kReasonName[] = "name";
inline constexpr char kReasonRoot[] = "root";
inline constexpr char kReasonAncestor[] = "ancestor";
inline constexpr char kReasonOwner[] = "owner";
inline constexpr char kReasonDacl[] = "dacl";
inline constexpr char kReasonReparse[] = "reparse";
inline constexpr char kReasonLinks[] = "links";
inline constexpr char kReasonType[] = "type";
inline constexpr char kReasonVolume[] = "volume";
inline constexpr char kReasonPath[] = "path";
inline constexpr char kReasonIdentity[] = "identity";
inline constexpr char kReasonSize[] = "size";
inline constexpr char kReasonEncoding[] = "encoding";
inline constexpr char kReasonExists[] = "exists";
inline constexpr char kReasonIo[] = "io";

class StorageError : public std::runtime_error {
 public:
  StorageError(const char* reason, const std::string& detail, unsigned long win32 = 0)
      : std::runtime_error(detail), reason_(reason), win32_(win32) {}

  const char* reason() const noexcept { return reason_; }
  unsigned long win32() const noexcept { return win32_; }

 private:
  const char* reason_;
  unsigned long win32_;
};

// Identifies one directory on one volume. The Node adapter keeps it from the
// first operation and sends it back so a replaced root is never trusted.
struct RootIdentity {
  std::string volume;  // 16 lowercase hexadecimal digits
  std::string file;    // 32 lowercase hexadecimal digits

  bool operator==(const RootIdentity&) const = default;
};

// The portable record-name rule: one bounded ASCII filename that is neither
// dot-terminated nor a DOS device name with or without an extension.
bool IsSafeRecordName(std::string_view name);

std::string EncodeBase64(std::string_view bytes);

// Accepts only canonical padded standard base64.
bool DecodeBase64(std::string_view text, std::string& bytes);

// A canonical, fully qualified local drive path. `path` has no `\\?\` prefix,
// separators other than backslash, `.` or `..` components, or trailing
// separator.
bool IsCanonicalRoot(std::wstring_view path);

// True when no principal outside `trusted` holds a right in the directory's own
// DACL that lets it replace, delete, or re-secure an existing child. A missing
// DACL, which grants everyone full control, and unknown entry types are unsafe.
bool AncestorAclSafe(PACL dacl, const std::vector<PSID>& trusted);

// `%LOCALAPPDATA%` from the known-folder API, never from the environment.
std::wstring DefaultStorageRoot();

// The owner-only directory and the records inside it. Every operation revalidates
// the ancestors, the root, and the root identity from open handles.
class PrivateStore {
 public:
  // Validates the ancestors and the root. A missing root is created only when
  // `createIfMissing`, and only beneath an existing validated parent. When
  // `expected` is set the root must be that same directory.
  static PrivateStore Open(const std::wstring& root, bool createIfMissing, const RootIdentity* expected);

  const std::wstring& Root() const noexcept { return root_; }
  const RootIdentity& Identity() const noexcept { return identity_; }

  // Absent only when the record itself does not exist.
  std::optional<std::string> Read(std::string_view name);

  // Publishes atomically and never replaces an existing record.
  void Publish(std::string_view name, std::string_view contents);

  // Deletes only a validated record whose contents equal `expected`.
  bool Remove(std::string_view name, std::string_view expected);

 private:
  PrivateStore() = default;

  // Re-proves the ancestors, the root, and the root identity.
  void Revalidate() const;

  std::wstring root_;
  RootIdentity identity_;
};

// Handles one request document and returns the response document. A failure is
// `{"ok":false,"reason":...}`; this function never throws for a bad request.
json::Value HandlePrivateStorageRequest(const json::Value& request);

}  // namespace furn::storage
