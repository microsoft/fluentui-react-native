#include "serviceidentity.h"

#include <winsock2.h>
#include <ws2tcpip.h>

#include <iphlpapi.h>
#include <tcpmib.h>

#include <algorithm>
#include <cmath>
#include <cstddef>
#include <cstring>
#include <stdexcept>
#include <string>

#include "common.h"
#include "winsecurity.h"

namespace furn::service {
namespace {

constexpr int kMaximumTableAttempts = 8;
constexpr DWORD kMaximumImageChars = 32768;
constexpr char kSessionPrefix[] = "windows-session:";

// A check that did not hold. The reason is a fixed, non-secret category.
class Refusal : public std::runtime_error {
 public:
  Refusal(const char* reason, const std::string& detail, unsigned long win32 = 0)
      : std::runtime_error(detail), reason_(reason), win32_(win32) {}

  const char* reason() const noexcept { return reason_; }
  unsigned long win32() const noexcept { return win32_; }

 private:
  const char* reason_;
  unsigned long win32_;
};

// The request itself is not shaped as documented.
struct MalformedRequest {};

[[noreturn]] void Refuse(const char* reason, const char* detail, DWORD win32 = 0) {
  throw Refusal(reason, detail, win32);
}

bool EqualsIgnoreCase(std::wstring_view left, std::wstring_view right) {
  return left.size() == right.size() &&
         (left.empty() || CompareStringOrdinal(left.data(), static_cast<int>(left.size()), right.data(),
                                                static_cast<int>(right.size()), TRUE) == CSTR_EQUAL);
}

std::string SessionLabel(DWORD session) {
  return std::string(kSessionPrefix) + std::to_string(session);
}

bool AllZero(const std::array<unsigned char, 16>& bytes, std::size_t count) {
  return std::all_of(bytes.begin(), bytes.begin() + static_cast<std::ptrdiff_t>(count),
                     [](unsigned char value) { return value == 0; });
}

// ::ffff:a.b.c.d, the form an IPv6 socket reports for an IPv4 address.
bool IsMappedIpv4(const std::array<unsigned char, 16>& bytes, const std::array<unsigned char, 4>& tail) {
  for (std::size_t index = 0; index < 10; index += 1) {
    if (bytes[index] != 0) {
      return false;
    }
  }
  return bytes[10] == 0xff && bytes[11] == 0xff && std::equal(tail.begin(), tail.end(), bytes.begin() + 12);
}

bool IsIpv4Loopback(const std::array<unsigned char, 16>& bytes) {
  return bytes[0] == 127 && bytes[1] == 0 && bytes[2] == 0 && bytes[3] == 1;
}

bool IsIpv6Loopback(const std::array<unsigned char, 16>& bytes) {
  return AllZero(bytes, 15) && bytes[15] == 1;
}

// Whether a listening socket could take a connection made to the destination.
bool CouldAccept(const Listener& listener, const Endpoint& destination) {
  if (listener.local.port != destination.port) {
    return false;
  }
  const auto& address = listener.local.address;
  if (destination.family == Family::kIpv4) {
    if (listener.local.family == Family::kIpv4) {
      return AllZero(address, 4) || IsIpv4Loopback(address);
    }
    // An IPv6 wildcard accepts IPv4 connections unless it is IPv6-only, which
    // the table cannot tell apart, so it counts.
    return AllZero(address, 16) || IsMappedIpv4(address, {0, 0, 0, 0}) || IsMappedIpv4(address, {127, 0, 0, 1});
  }
  return listener.local.family == Family::kIpv6 && (AllZero(address, 16) || IsIpv6Loopback(address));
}

std::uint16_t PortFromTable(DWORD networkOrderPort) {
  return static_cast<std::uint16_t>(((networkOrderPort & 0xFF) << 8) | ((networkOrderPort >> 8) & 0xFF));
}

// The identity of a process as the operating system reports it, with the process
// held open so its identifier cannot be reused while the checks run.
struct Inspection {
  ScopedHandle process;
  FILETIME created{};
  std::wstring image;
  DWORD session{0};
};

void RequireAlive(HANDLE process) {
  const DWORD wait = WaitForSingleObject(process, 0);
  if (wait == WAIT_OBJECT_0) {
    Refuse("exited", "The process has exited.");
  }
  if (wait != WAIT_TIMEOUT) {
    Refuse("process", "The process state cannot be read.", GetLastError());
  }
}

std::wstring ImagePath(HANDLE process) {
  std::wstring image(1024, L'\0');
  while (true) {
    DWORD size = static_cast<DWORD>(image.size());
    if (QueryFullProcessImageNameW(process, 0, image.data(), &size)) {
      image.resize(size);
      return image;
    }
    const DWORD error = GetLastError();
    if (error != ERROR_INSUFFICIENT_BUFFER || image.size() >= kMaximumImageChars) {
      Refuse("process", "The executable path cannot be read.", error);
    }
    image.resize(std::min<std::size_t>(image.size() * 2, kMaximumImageChars));
  }
}

// Opens the process and proves it belongs to the same user and interactive
// session as this verifier. A caller that asks for more checks adds them.
Inspection Inspect(DWORD pid) {
  Inspection inspection;
  inspection.process.Reset(OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION | SYNCHRONIZE, FALSE, pid));
  if (!inspection.process) {
    const DWORD error = GetLastError();
    if (error == ERROR_INVALID_PARAMETER) {
      Refuse("exited", "No process has this identifier.", error);
    }
    Refuse("process", "The process cannot be opened.", error);
  }
  RequireAlive(inspection.process.Get());

  FILETIME exited{};
  FILETIME kernel{};
  FILETIME user{};
  if (!GetProcessTimes(inspection.process.Get(), &inspection.created, &exited, &kernel, &user)) {
    Refuse("process", "The process start time cannot be read.", GetLastError());
  }
  inspection.image = ImagePath(inspection.process.Get());

  HANDLE rawToken = nullptr;
  if (!OpenProcessToken(inspection.process.Get(), TOKEN_QUERY, &rawToken)) {
    Refuse("user", "The process token cannot be opened.", GetLastError());
  }
  const ScopedHandle token(rawToken);
  const Sid owner = TokenUserSid(token.Get());
  const Sid self = CurrentUserSid();
  if (!owner.Valid() || !self.Valid() || !self.Equals(owner.Get())) {
    Refuse("user", "The process does not run as the current user.");
  }
  DWORD returned = 0;
  if (!GetTokenInformation(token.Get(), TokenSessionId, &inspection.session, sizeof(inspection.session), &returned)) {
    Refuse("session", "The process session cannot be read.", GetLastError());
  }
  DWORD ownSession = 0;
  if (!ProcessSession(GetCurrentProcessId(), ownSession) || ownSession != inspection.session) {
    Refuse("session", "The process is not in this interactive session.");
  }
  return inspection;
}

json::Value Rejected(const char* reason) {
  json::Value response = json::Value::Object();
  response.Set("ok", json::Value::Bool(false));
  response.Set("reason", json::Value::String(std::string(reason)));
  return response;
}

void AddDiagnostics(json::Value& response, const Refusal& refusal) {
  response.Set("reason", json::Value::String(std::string(refusal.reason())));
  response.Set("detail", json::Value::String(std::string(refusal.what())));
  if (refusal.win32() != 0) {
    response.Set("win32", json::Value::Integer(static_cast<std::int64_t>(refusal.win32())));
  }
}

const std::string& RequiredString(const json::Value& object, std::string_view key) {
  const json::Value* value = object.Find(key);
  if (value == nullptr || !value->IsString()) {
    throw MalformedRequest{};
  }
  return value->AsString();
}

DWORD RequiredPid(const json::Value& object, std::string_view key) {
  const json::Value* value = object.Find(key);
  if (value == nullptr || !value->IsNumber()) {
    throw MalformedRequest{};
  }
  const double number = value->AsNumber();
  if (!(number >= 1.0 && number <= 2147483647.0) || std::floor(number) != number) {
    throw MalformedRequest{};
  }
  return static_cast<DWORD>(number);
}

json::Value Describe(const json::Value& request) {
  const DWORD pid = RequiredPid(request, "pid");
  try {
    const Inspection inspection = Inspect(pid);
    RequireAlive(inspection.process.Get());
    json::Value identity = json::Value::Object();
    identity.Set("platform", json::Value::String(std::string("windows")));
    identity.Set("pid", json::Value::Integer(static_cast<std::int64_t>(pid)));
    identity.Set("startedAt", json::Value::String(FormatFileTimeIso8601(inspection.created)));
    identity.Set("executablePath", json::Value::String(std::wstring_view(inspection.image)));
    identity.Set("interactiveSession", json::Value::String(SessionLabel(inspection.session)));
    json::Value response = json::Value::Object();
    response.Set("ok", json::Value::Bool(true));
    response.Set("identity", identity);
    return response;
  } catch (const Refusal& refusal) {
    json::Value response = json::Value::Object();
    response.Set("ok", json::Value::Bool(false));
    AddDiagnostics(response, refusal);
    return response;
  }
}

json::Value Verify(const json::Value& request) {
  const std::string& url = RequiredString(request, "url");
  const json::Value* service = request.Find("service");
  if (service == nullptr || !service->IsObject()) {
    throw MalformedRequest{};
  }
  const std::string& platform = RequiredString(*service, "platform");
  const DWORD pid = RequiredPid(*service, "pid");
  const std::string& startedAt = RequiredString(*service, "startedAt");
  const std::string& executablePath = RequiredString(*service, "executablePath");
  const std::string& interactiveSession = RequiredString(*service, "interactiveSession");
  RequiredString(*service, "incarnation");

  json::Value response = json::Value::Object();
  response.Set("ok", json::Value::Bool(true));
  try {
    Endpoint destination;
    if (!ParseLoopbackUrl(url, destination)) {
      Refuse("url", "The service address is not a numeric loopback http origin.");
    }
    FILETIME claimedStart{};
    if (platform != "windows" || !IsStrictUtf8(executablePath) || !TryParseIso8601(startedAt, claimedStart)) {
      Refuse("claim", "The service identity claim is not a Windows identity.");
    }

    const Inspection inspection = Inspect(pid);
    if (FileTimeTicks(inspection.created) != FileTimeTicks(claimedStart)) {
      Refuse("start", "The process start time differs from the claim.");
    }
    if (!EqualsIgnoreCase(inspection.image, ToWide(executablePath))) {
      Refuse("image", "The process executable differs from the claim.");
    }
    if (SessionLabel(inspection.session) != interactiveSession) {
      Refuse("session", "The process session differs from the claim.");
    }

    std::vector<Listener> listeners;
    try {
      listeners = ReadListeners();
    } catch (const std::exception&) {
      Refuse("listener", "The listening sockets cannot be enumerated.");
    }
    if (!ListenersBelongTo(listeners, destination, pid)) {
      Refuse("listener", "The address is not served exclusively by the process.");
    }
    RequireAlive(inspection.process.Get());
    response.Set("verified", json::Value::Bool(true));
    return response;
  } catch (const Refusal& refusal) {
    response.Set("verified", json::Value::Bool(false));
    AddDiagnostics(response, refusal);
    return response;
  }
}

// Reads one address family of the listener table into `listeners`.
void ReadFamily(ULONG family, std::vector<Listener>& listeners) {
  std::vector<BYTE> buffer(16 * 1024);
  for (int attempt = 0; attempt < kMaximumTableAttempts; attempt += 1) {
    DWORD size = static_cast<DWORD>(buffer.size());
    const DWORD status = GetExtendedTcpTable(buffer.data(), &size, FALSE, family, TCP_TABLE_OWNER_PID_LISTENER, 0);
    if (status == ERROR_INSUFFICIENT_BUFFER) {
      // The table can grow between the two calls, so ask for slack.
      buffer.resize(static_cast<std::size_t>(size) + 4096);
      continue;
    }
    if (status != NO_ERROR) {
      throw std::runtime_error("The TCP listener table cannot be read.");
    }
    if (family == AF_INET) {
      const auto* table = reinterpret_cast<const MIB_TCPTABLE_OWNER_PID*>(buffer.data());
      if (offsetof(MIB_TCPTABLE_OWNER_PID, table) + static_cast<std::size_t>(table->dwNumEntries) * sizeof(MIB_TCPROW_OWNER_PID) >
          buffer.size()) {
        throw std::runtime_error("The TCP listener table is truncated.");
      }
      for (DWORD index = 0; index < table->dwNumEntries; index += 1) {
        const MIB_TCPROW_OWNER_PID& row = table->table[index];
        Listener listener;
        listener.local.family = Family::kIpv4;
        std::memcpy(listener.local.address.data(), &row.dwLocalAddr, 4);
        listener.local.port = PortFromTable(row.dwLocalPort);
        listener.pid = row.dwOwningPid;
        listeners.push_back(listener);
      }
    } else {
      const auto* table = reinterpret_cast<const MIB_TCP6TABLE_OWNER_PID*>(buffer.data());
      if (offsetof(MIB_TCP6TABLE_OWNER_PID, table) + static_cast<std::size_t>(table->dwNumEntries) * sizeof(MIB_TCP6ROW_OWNER_PID) >
          buffer.size()) {
        throw std::runtime_error("The TCP listener table is truncated.");
      }
      for (DWORD index = 0; index < table->dwNumEntries; index += 1) {
        const MIB_TCP6ROW_OWNER_PID& row = table->table[index];
        Listener listener;
        listener.local.family = Family::kIpv6;
        std::memcpy(listener.local.address.data(), row.ucLocalAddr, 16);
        listener.local.port = PortFromTable(row.dwLocalPort);
        listener.pid = row.dwOwningPid;
        listeners.push_back(listener);
      }
    }
    return;
  }
  throw std::runtime_error("The TCP listener table kept changing.");
}

}  // namespace

bool ParseLoopbackUrl(std::string_view url, Endpoint& destination) {
  constexpr std::string_view kIpv4Prefix = "http://127.0.0.1:";
  constexpr std::string_view kIpv6Prefix = "http://[::1]:";
  std::string_view digits;
  Endpoint parsed;
  if (url.substr(0, kIpv4Prefix.size()) == kIpv4Prefix) {
    parsed.family = Family::kIpv4;
    parsed.address = {127, 0, 0, 1};
    digits = url.substr(kIpv4Prefix.size());
  } else if (url.substr(0, kIpv6Prefix.size()) == kIpv6Prefix) {
    parsed.family = Family::kIpv6;
    parsed.address = {};
    parsed.address[15] = 1;
    digits = url.substr(kIpv6Prefix.size());
  } else {
    return false;
  }
  if (digits.empty() || digits.size() > 5 || digits.front() == '0') {
    return false;
  }
  unsigned long port = 0;
  for (const char digit : digits) {
    if (digit < '0' || digit > '9') {
      return false;
    }
    port = port * 10 + static_cast<unsigned long>(digit - '0');
  }
  if (port < 1 || port > 65535) {
    return false;
  }
  parsed.port = static_cast<std::uint16_t>(port);
  destination = parsed;
  return true;
}

bool ListenersBelongTo(const std::vector<Listener>& listeners, const Endpoint& destination, std::uint32_t pid) {
  bool found = false;
  for (const Listener& listener : listeners) {
    if (!CouldAccept(listener, destination)) {
      continue;
    }
    if (listener.pid != pid) {
      return false;
    }
    found = true;
  }
  return found;
}

std::vector<Listener> ReadListeners() {
  std::vector<Listener> listeners;
  ReadFamily(AF_INET, listeners);
  ReadFamily(AF_INET6, listeners);
  return listeners;
}

json::Value HandleServiceIdentityRequest(const json::Value& request) {
  try {
    if (!request.IsObject()) {
      return Rejected("request");
    }
    const std::string& operation = RequiredString(request, "operation");
    if (operation == "describe") {
      return Describe(request);
    }
    if (operation == "verify") {
      return Verify(request);
    }
    return Rejected("request");
  } catch (const MalformedRequest&) {
    return Rejected("request");
  } catch (const std::exception&) {
    return Rejected("request");
  }
}

}  // namespace furn::service
