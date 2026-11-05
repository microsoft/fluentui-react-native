#include "applicationincarnation.h"

#include <cmath>
#include <string>

#include "common.h"

namespace furn::incarnation {
namespace {

constexpr std::size_t kMaximumStartedAtBytes = 64;
constexpr double kMaximumProcessId = 2147483647.0;

class ProcessHandle {
 public:
  explicit ProcessHandle(HANDLE handle) : handle_(handle) {}
  ProcessHandle(const ProcessHandle&) = delete;
  ProcessHandle& operator=(const ProcessHandle&) = delete;
  ~ProcessHandle() {
    if (handle_ != nullptr) {
      CloseHandle(handle_);
    }
  }
  HANDLE Get() const noexcept { return handle_; }

 private:
  HANDLE handle_;
};

bool IsDigit(std::string_view text, std::size_t index) {
  return index < text.size() && text[index] >= '0' && text[index] <= '9';
}

bool DigitsAt(std::string_view text, std::size_t offset, std::size_t count) {
  for (std::size_t index = offset; index < offset + count; index += 1) {
    if (!IsDigit(text, index)) {
      return false;
    }
  }
  return true;
}

json::Value Rejected() {
  json::Value response = json::Value::Object();
  response.Set("ok", json::Value::Bool(false));
  response.Set("reason", json::Value::String(std::string("request")));
  return response;
}

const char* StateName(State state) {
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

}  // namespace

State Classify(std::uint64_t recordedTicks, const Observation& observed) {
  switch (observed.kind) {
    case Observation::Kind::kGone:
      return State::kExited;
    case Observation::Kind::kUnavailable:
      return State::kUnknown;
    case Observation::Kind::kStarted:
      break;
  }
  if (observed.createdTicks >= recordedTicks) {
    const std::uint64_t later = observed.createdTicks - recordedTicks;
    if (later <= kSameStartTicks) {
      return State::kRunning;
    }
    // Windows reuses a process id only once no process object holds it, so a
    // process created well after the recorded start proves the recorded one
    // exited.
    return later > kReusedStartTicks ? State::kExited : State::kUnknown;
  }
  // An earlier creation time means the record does not describe this process,
  // which proves nothing about the recorded one.
  return recordedTicks - observed.createdTicks <= kSameStartTicks ? State::kRunning : State::kUnknown;
}

bool ParseStartedAt(std::string_view text, std::uint64_t& ticks) {
  if (text.size() < 20 || text.size() > kMaximumStartedAtBytes) {
    return false;
  }
  if (!DigitsAt(text, 0, 4) || text[4] != '-' || !DigitsAt(text, 5, 2) || text[7] != '-' || !DigitsAt(text, 8, 2) ||
      text[10] != 'T' || !DigitsAt(text, 11, 2) || text[13] != ':' || !DigitsAt(text, 14, 2) || text[16] != ':' ||
      !DigitsAt(text, 17, 2)) {
    return false;
  }
  std::size_t cursor = 19;
  if (text[cursor] == '.') {
    const std::size_t start = cursor + 1;
    cursor = start;
    while (IsDigit(text, cursor)) {
      cursor += 1;
    }
    if (cursor == start || cursor - start > 9) {
      return false;
    }
  }
  if (cursor < text.size() && text[cursor] == 'Z') {
    cursor += 1;
  } else if (cursor < text.size() && (text[cursor] == '+' || text[cursor] == '-')) {
    if (!DigitsAt(text, cursor + 1, 2) || cursor + 3 >= text.size() || text[cursor + 3] != ':' ||
        !DigitsAt(text, cursor + 4, 2)) {
      return false;
    }
    cursor += 6;
  } else {
    return false;
  }
  FILETIME parsed{};
  if (cursor != text.size() || !TryParseIso8601(text, parsed)) {
    return false;
  }
  ticks = FileTimeTicks(parsed);
  return true;
}

Observation ObserveProcess(DWORD pid) {
  bool canWait = true;
  HANDLE raw = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION | SYNCHRONIZE, FALSE, pid);
  if (raw == nullptr && GetLastError() == ERROR_ACCESS_DENIED) {
    canWait = false;
    raw = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, FALSE, pid);
  }
  if (raw == nullptr) {
    // Only a process id that names no process object proves anything; access
    // denied and every other failure do not.
    return {GetLastError() == ERROR_INVALID_PARAMETER ? Observation::Kind::kGone : Observation::Kind::kUnavailable};
  }
  const ProcessHandle process(raw);
  if (canWait) {
    const DWORD wait = WaitForSingleObject(process.Get(), 0);
    if (wait == WAIT_OBJECT_0) {
      return {Observation::Kind::kGone};
    }
    if (wait != WAIT_TIMEOUT) {
      return {Observation::Kind::kUnavailable};
    }
  } else {
    // A process that exited with STILL_ACTIVE as its code reads as live here,
    // which can only make the answer `running` or `unknown`, never `exited`.
    DWORD code = 0;
    if (!GetExitCodeProcess(process.Get(), &code)) {
      return {Observation::Kind::kUnavailable};
    }
    if (code != STILL_ACTIVE) {
      return {Observation::Kind::kGone};
    }
  }
  FILETIME created{};
  FILETIME exited{};
  FILETIME kernel{};
  FILETIME user{};
  if (!GetProcessTimes(process.Get(), &created, &exited, &kernel, &user)) {
    return {Observation::Kind::kUnavailable};
  }
  return {Observation::Kind::kStarted, FileTimeTicks(created)};
}

json::Value HandleApplicationIncarnationRequest(const json::Value& request, Observe observe) {
  try {
    if (!request.IsObject() || request.Members().size() != 2) {
      return Rejected();
    }
    const json::Value* pid = request.Find("pid");
    const json::Value* startedAt = request.Find("startedAt");
    if (pid == nullptr || startedAt == nullptr || !pid->IsNumber() || !startedAt->IsString()) {
      return Rejected();
    }
    const double number = pid->AsNumber();
    if (!(number >= 1.0 && number <= kMaximumProcessId) || std::floor(number) != number) {
      return Rejected();
    }
    std::uint64_t recordedTicks = 0;
    if (!ParseStartedAt(startedAt->AsString(), recordedTicks)) {
      return Rejected();
    }
    const State state = Classify(recordedTicks, observe(static_cast<DWORD>(number)));
    json::Value response = json::Value::Object();
    response.Set("ok", json::Value::Bool(true));
    response.Set("state", json::Value::String(std::string(StateName(state))));
    return response;
  } catch (...) {
    return Rejected();
  }
}

json::Value HandleApplicationIncarnationRequest(const json::Value& request) {
  return HandleApplicationIncarnationRequest(request, ObserveProcess);
}

}  // namespace furn::incarnation
