#include "winsecurity.h"

#include <sddl.h>

namespace furn {

Sid Sid::Copy(PSID source) {
  Sid copy;
  if (source == nullptr || !IsValidSid(source)) {
    return copy;
  }
  const DWORD length = GetLengthSid(source);
  copy.bytes_.assign(length, 0);
  if (!CopySid(length, copy.bytes_.data(), source)) {
    copy.bytes_.clear();
  }
  return copy;
}

Sid Sid::WellKnown(WELL_KNOWN_SID_TYPE type) {
  Sid sid;
  DWORD length = SECURITY_MAX_SID_SIZE;
  sid.bytes_.assign(length, 0);
  if (!CreateWellKnownSid(type, nullptr, sid.bytes_.data(), &length)) {
    sid.bytes_.clear();
    return sid;
  }
  sid.bytes_.resize(length);
  return sid;
}

Sid Sid::Parse(const wchar_t* text) {
  PSID parsed = nullptr;
  if (!ConvertStringSidToSidW(text, &parsed)) {
    return {};
  }
  Sid sid = Copy(parsed);
  LocalFree(parsed);
  return sid;
}

bool Sid::Equals(PSID other) const noexcept {
  return Valid() && other != nullptr && IsValidSid(other) && EqualSid(Get(), other) != FALSE;
}

Sid TokenUserSid(HANDLE token) {
  DWORD length = 0;
  GetTokenInformation(token, TokenUser, nullptr, 0, &length);
  if (length == 0) {
    return {};
  }
  std::vector<BYTE> buffer(length);
  if (!GetTokenInformation(token, TokenUser, buffer.data(), length, &length)) {
    return {};
  }
  return Sid::Copy(reinterpret_cast<const TOKEN_USER*>(buffer.data())->User.Sid);
}

Sid CurrentUserSid() {
  HANDLE raw = nullptr;
  if (!OpenProcessToken(GetCurrentProcess(), TOKEN_QUERY, &raw)) {
    return {};
  }
  const ScopedHandle token(raw);
  return TokenUserSid(token.Get());
}

bool ProcessSession(DWORD processId, DWORD& session) {
  DWORD value = 0;
  if (!ProcessIdToSessionId(processId, &value)) {
    return false;
  }
  session = value;
  return true;
}

}  // namespace furn
