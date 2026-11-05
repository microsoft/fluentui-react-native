#pragma once

#include <windows.h>

#include <cstdint>
#include <string_view>

#include "json.h"

// The `--application-incarnation` mode: answers whether the exact process an
// application lease recorded, a process id and its creation time, still runs.
// `exited` is answered only with proof; anything else that is not a match is
// `unknown`.
namespace furn::incarnation {

enum class State { kExited, kRunning, kUnknown };

// What the operating system reports for a process id.
struct Observation {
  enum class Kind {
    // No process has the id, or the process holding it has exited.
    kGone,
    // A live process holds the id; `createdTicks` is its creation FILETIME.
    kStarted,
    // The process cannot be inspected, for example because access is denied.
    kUnavailable,
  };
  Kind kind{Kind::kUnavailable};
  std::uint64_t createdTicks{0};
};

using Observe = Observation (*)(DWORD pid);

// The recorded start matches when the creation times differ by at most 10 ms.
inline constexpr std::uint64_t kSameStartTicks = 100000;
// A process id now naming a process created more than one second after the
// recorded start was reused, so the recorded process has exited.
inline constexpr std::uint64_t kReusedStartTicks = 10000000;

State Classify(std::uint64_t recordedTicks, const Observation& observed);

// Accepts `YYYY-MM-DDTHH:MM:SS`, an optional fraction of 1 to 9 digits, and
// `Z` or a `+HH:MM`/`-HH:MM` offset, at most 64 bytes, and nothing else.
bool ParseStartedAt(std::string_view text, std::uint64_t& ticks);

Observation ObserveProcess(DWORD pid);

// Handles one request document. The response is exactly
// `{"ok":true,"state":...}`, or `{"ok":false,"reason":"request"}` for a
// request that is not exactly `{"pid":<1..2147483647>,"startedAt":<text>}`.
// This function never throws for bad input.
json::Value HandleApplicationIncarnationRequest(const json::Value& request, Observe observe);
json::Value HandleApplicationIncarnationRequest(const json::Value& request);

}  // namespace furn::incarnation
