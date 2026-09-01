#pragma once

#include <windows.h>

#include <string>

#include "common.h"

namespace furn {

// Physical input is a single machine-wide resource. Independent helper
// processes in one interactive session serialize on this named mutex, which
// lives in the session-local namespace so no privilege is required.
inline constexpr wchar_t kPhysicalInputMutexName[] = L"Local\\FurnDesktopDriverPhysicalInput-v1";
inline constexpr unsigned int kPhysicalInputWaitMs = 30000;
inline constexpr unsigned int kPhysicalInputCleanupWaitMs = 5000;

enum class AbandonPolicy {
  // A helper that died holding physical input may have left keys depressed, so
  // the next owner reports it instead of silently continuing.
  Fail,
  // The recovery path exists precisely to clean that state up.
  Adopt,
};

// RAII ownership of the cross-process physical input mutex. Nested scopes on
// the owning thread are counted, so a command boundary can hold the lock while
// inner helpers run without a second operating-system wait.
class PhysicalInputScope {
 public:
  PhysicalInputScope() noexcept = default;
  explicit PhysicalInputScope(const CancellationToken& token, unsigned int timeoutMs = kPhysicalInputWaitMs,
                              AbandonPolicy policy = AbandonPolicy::Fail);
  ~PhysicalInputScope();

  PhysicalInputScope(const PhysicalInputScope&) = delete;
  PhysicalInputScope& operator=(const PhysicalInputScope&) = delete;
  PhysicalInputScope(PhysicalInputScope&& other) noexcept;
  PhysicalInputScope& operator=(PhysicalInputScope&& other) noexcept;

  bool owns() const noexcept { return owns_; }
  bool nested() const noexcept { return nested_; }
  void Release() noexcept;

 private:
  bool owns_{false};
  bool nested_{false};
};

const wchar_t* PhysicalInputMutexName() noexcept;
void SetPhysicalInputMutexNameForTesting(std::wstring name);

}  // namespace furn
