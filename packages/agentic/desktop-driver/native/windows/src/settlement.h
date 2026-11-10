#pragma once

#include <windows.h>

#include <cstddef>
#include <functional>
#include <string>
#include <string_view>

#include "common.h"

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
// `target-quarantined` before the provider is called. The wait observes the
// token of the active CancellationScope in short slices: a cancelled read is
// abandoned, and a cancelled mutation is abandoned and quarantined like one
// that timed out, leaving the command's effect unknown; both throw
// CancelledError.
HRESULT RunBoundedProviderCall(ProviderCall kind, std::function<HRESULT()> call, DWORD timeoutMs,
                               std::string_view operation, const std::string& timeoutCode);

// Names the cancellation token of the command running on this thread, so
// bounded provider calls stop waiting once it is cancelled. Without an active
// scope they wait for their full bound. The previous scope returns when the
// guard ends.
class CancellationScope {
 public:
  explicit CancellationScope(const CancellationToken& token) noexcept;
  ~CancellationScope();
  CancellationScope(const CancellationScope&) = delete;
  CancellationScope& operator=(const CancellationScope&) = delete;

 private:
  const CancellationToken* previous_;
};

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

// Records what the running mutating command handed to the application, so its
// failure or cancellation can report an `effect`. Only primary mutations count:
// UI Automation pattern actions and value writes, injected key, button, and
// wheel input, a posted window close, and window geometry changes. Focus,
// activation, pointer placement, and the release of input are idempotent and
// are not counted.
class EffectLedger {
 public:
  void Reset() noexcept;
  // A provider call that may change the application is about to start. A
  // dispatch that never settles stays ambiguous for the rest of the command.
  void Dispatching() noexcept;
  // Settles the pending dispatch from its result. Only results that prove the
  // provider never acted (ProvesNoEffect) leave no effect; any other failure
  // stays unresolved.
  void Settled(HRESULT result) noexcept;
  // A mutation whose hand-off to the application is complete when the call
  // returns, such as input events Windows inserted into the input stream or a
  // posted close. It counts toward `partial`; whether and how the application
  // handled it is unknown here and needs authoritative re-observation.
  void Delivered() noexcept;
  // Unresolved dispatches are `unknown`; otherwise `partial` once anything was
  // applied, and `none` before that.
  MutationEffect Effect() const noexcept;

 private:
  bool pending_{false};
  bool ambiguous_{false};
  std::size_t applied_{0};
};

// True for provider results that report the request was refused before it was
// acted on: a disabled, vanished, or unsupported element, an invalid
// operation or argument, a missing implementation, or denied access.
bool ProvesNoEffect(HRESULT result) noexcept;

// Routes the Record* calls made on this thread to `ledger` for one command.
// Without an active scope they are ignored, so components behave the same
// outside a command.
class EffectScope {
 public:
  explicit EffectScope(EffectLedger& ledger) noexcept;
  ~EffectScope();
  EffectScope(const EffectScope&) = delete;
  EffectScope& operator=(const EffectScope&) = delete;

 private:
  EffectLedger* previous_;
};

void RecordDispatching() noexcept;
void RecordSettled(HRESULT result) noexcept;
void RecordDelivered() noexcept;

}  // namespace furn
