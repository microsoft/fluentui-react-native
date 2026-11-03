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

// The ledger is process wide by design; tests restore the clean state.
void ResetMutationQuarantineForTesting();

}  // namespace furn
