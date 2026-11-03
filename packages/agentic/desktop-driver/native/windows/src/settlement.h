#pragma once

#include <windows.h>

#include <functional>
#include <string>
#include <string_view>

namespace furn {

// Whether a provider call can change application state. A mutation that does
// not settle leaves its effect unknown: the provider may still apply it after
// the helper stopped waiting. That uncertainty quarantines every later
// mutation in this helper session so a late effect cannot interleave with new
// input. Reads never change state, so they stay allowed for re-observation,
// though they can still time out while the application is unresponsive.
enum class ProviderCall { Read, Mutation };

// Runs a provider call on its own worker, bounded by `timeoutMs`, and returns
// its HRESULT. A read that does not complete fails with `timeoutCode`. A
// mutation that does not complete, or that the provider reports as timed out
// (UI Automation or RPC timeout), fails with `mutation-indeterminate` and
// quarantines the session; a timeout reported by a read is an ordinary
// failure. A mutation requested while quarantined fails with
// `target-quarantined` before the provider is called.
HRESULT RunBoundedProviderCall(ProviderCall kind, std::function<HRESULT()> call, DWORD timeoutMs,
                               std::string_view operation, const std::string& timeoutCode);

// Fails with `target-quarantined` while an abandoned mutation exists. Call it
// before any non-provider mutation, such as physical input or window changes.
void RequireMutationsAllowed();

bool MutationsQuarantined();

// Names the application lease that the mutations on this thread act on, so a
// mutation that does not settle is recorded against it. A command that cannot
// resolve its lease records the mutation without one, and no close releases it.
// The previous scope returns when the guard ends.
class MutationScope {
 public:
  explicit MutationScope(std::string leaseId);
  ~MutationScope();
  MutationScope(const MutationScope&) = delete;
  MutationScope& operator=(const MutationScope&) = delete;

 private:
  std::string previous_;
};

// Forgets the unsettled mutations recorded against `leaseId`, which ends their
// quarantine. Call it only after the exit of the application the helper
// launched for that lease is verified: nothing it left in flight can land any
// more. An attached application keeps running, so its quarantine stays, and a
// mutation recorded without a lease is never released.
void ReleaseMutationQuarantine(const std::string& leaseId);

// Refusals are process wide by design, whichever lease raised the quarantine;
// tests restore the clean state.
void ResetMutationQuarantineForTesting();

}  // namespace furn
