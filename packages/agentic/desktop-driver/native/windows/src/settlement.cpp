#include "settlement.h"

#include <algorithm>
#include <atomic>
#include <memory>
#include <mutex>
#include <thread>
#include <vector>

#include "common.h"

namespace furn {
namespace {

struct CallState {
  std::atomic<HRESULT> result{E_PENDING};
  HANDLE done{nullptr};

  ~CallState() {
    if (done != nullptr) {
      CloseHandle(done);
    }
  }

  bool Settled() const { return WaitForSingleObject(done, 0) == WAIT_OBJECT_0; }
};

struct AbandonedMutation {
  std::string operation;
  DWORD timeoutMs{0};
  std::shared_ptr<CallState> call;
  // The provider call itself returned a timeout instead of the helper giving up.
  bool providerTimedOut{false};
  // The lease of the application the mutation acted on; empty when unknown.
  std::string leaseId;
  // The command was cancelled before the call settled.
  bool cancelled{false};
};

std::string& CurrentLeaseId() {
  thread_local std::string leaseId;
  return leaseId;
}

EffectLedger*& CurrentEffectLedger() {
  thread_local EffectLedger* ledger = nullptr;
  return ledger;
}

const CancellationToken*& CurrentCancellationToken() {
  thread_local const CancellationToken* token = nullptr;
  return token;
}

// The longest a bounded call waits before it looks at the command's
// cancellation token again.
constexpr DWORD kCancellationSliceMs = 50;

// UI Automation refusals, repeated here because the header defines them only
// for UI Automation clients.
constexpr HRESULT kUiaElementNotEnabled = static_cast<HRESULT>(0x80040200);
constexpr HRESULT kUiaElementNotAvailable = static_cast<HRESULT>(0x80040201);
constexpr HRESULT kUiaNotSupported = static_cast<HRESULT>(0x80040204);
constexpr HRESULT kUiaInvalidOperation = static_cast<HRESULT>(0x80131509);

// Leaked on purpose: abandoned workers can outlive static destruction, and the
// ledger must stay valid for them until the process exits.
struct Ledger {
  std::mutex mutex;
  std::vector<AbandonedMutation> abandoned;
};

Ledger& LedgerInstance() {
  static Ledger* const ledger = new Ledger();
  return *ledger;
}

// UI Automation and COM report their own client-side timeouts as failures. The
// provider may still apply a timed-out mutation, so such a result is exactly as
// uncertain as a call the helper stopped waiting for.
bool IsProviderTimeout(HRESULT result) {
  return result == kUiaTimeoutResult || result == RPC_E_TIMEOUT || result == HRESULT_FROM_WIN32(ERROR_TIMEOUT);
}

std::string DescribeUnsettled(const AbandonedMutation& entry) {
  const std::string subject = "\"" + entry.operation + "\"";
  if (entry.providerTimedOut) {
    return subject + " timed out in the provider (" + DescribeHresult(entry.call->result.load()) + ")";
  }
  const std::string settlement = entry.call->Settled()
                                     ? "completed late with " + DescribeHresult(entry.call->result.load())
                                     : std::string("is still pending");
  if (entry.cancelled) {
    return subject + " was cancelled before it settled and " + settlement;
  }
  return subject + " did not settle within " + std::to_string(entry.timeoutMs) + " ms and " + settlement;
}

void Abandon(std::string_view operation, DWORD timeoutMs, std::shared_ptr<CallState> call, bool providerTimedOut,
             bool cancelled = false) {
  Ledger& ledger = LedgerInstance();
  const std::lock_guard<std::mutex> lock(ledger.mutex);
  ledger.abandoned.push_back(AbandonedMutation{std::string(operation), timeoutMs, std::move(call), providerTimedOut,
                                               CurrentLeaseId(), cancelled});
}

constexpr char kUnsettledNotice[] =
    "Later mutations in this helper session are refused; reads are still allowed so the application can be "
    "re-observed once it responds.";

HRESULT RunBounded(std::function<HRESULT()> call, DWORD timeoutMs, std::shared_ptr<CallState>& state,
                   bool& completed, bool& cancelled) {
  state = std::make_shared<CallState>();
  state->done = CreateEventW(nullptr, TRUE, FALSE, nullptr);
  if (state->done == nullptr) {
    completed = true;
    return call();
  }
  const std::shared_ptr<CallState> shared = state;
  std::thread worker([shared, call]() {
    const HRESULT initialized = CoInitializeEx(nullptr, COINIT_MULTITHREADED);
    shared->result.store(call());
    SetEvent(shared->done);
    if (SUCCEEDED(initialized)) {
      CoUninitialize();
    }
  });
  worker.detach();
  const CancellationToken* token = CurrentCancellationToken();
  const ULONGLONG expiresAt = GetTickCount64() + timeoutMs;
  while (true) {
    const ULONGLONG now = GetTickCount64();
    const DWORD slice =
        now >= expiresAt ? 0 : static_cast<DWORD>(std::min<ULONGLONG>(expiresAt - now, kCancellationSliceMs));
    if (WaitForSingleObject(state->done, slice) == WAIT_OBJECT_0) {
      completed = true;
      return state->result.load();
    }
    if (GetTickCount64() >= expiresAt) {
      return E_PENDING;
    }
    if (token != nullptr && token->IsCancelled()) {
      cancelled = true;
      return E_PENDING;
    }
  }
}

}  // namespace

void RequireMutationsAllowed() {
  Ledger& ledger = LedgerInstance();
  const std::lock_guard<std::mutex> lock(ledger.mutex);
  if (ledger.abandoned.empty()) {
    return;
  }
  const AbandonedMutation& first = ledger.abandoned.front();
  std::string message =
      "The mutation was refused because " + DescribeUnsettled(first) + ", so its effect on the application is unknown.";
  if (ledger.abandoned.size() > 1) {
    message += " " + std::to_string(ledger.abandoned.size()) + " mutations are unsettled.";
  }
  message +=
      " Reads are still allowed so the application can be re-observed once it responds. Closing the launched "
      "application ends the quarantine; otherwise restart the helper session once the application is safe.";
  Fail(kErrorTargetQuarantined, std::move(message));
}

bool MutationsQuarantined() {
  Ledger& ledger = LedgerInstance();
  const std::lock_guard<std::mutex> lock(ledger.mutex);
  return !ledger.abandoned.empty();
}

MutationScope::MutationScope(std::string leaseId) : previous_(CurrentLeaseId()) {
  CurrentLeaseId() = std::move(leaseId);
}

MutationScope::~MutationScope() {
  CurrentLeaseId() = std::move(previous_);
}

void ReleaseMutationQuarantine(const std::string& leaseId) {
  if (leaseId.empty()) {
    return;
  }
  Ledger& ledger = LedgerInstance();
  const std::lock_guard<std::mutex> lock(ledger.mutex);
  std::erase_if(ledger.abandoned, [&leaseId](const AbandonedMutation& entry) { return entry.leaseId == leaseId; });
}

void ResetMutationQuarantineForTesting() {
  Ledger& ledger = LedgerInstance();
  const std::lock_guard<std::mutex> lock(ledger.mutex);
  ledger.abandoned.clear();
}

void EffectLedger::Reset() noexcept {
  pending_ = false;
  ambiguous_ = false;
  applied_ = 0;
}

void EffectLedger::Dispatching() noexcept {
  if (pending_) {
    ambiguous_ = true;
  }
  pending_ = true;
}

void EffectLedger::Settled(HRESULT result) noexcept {
  if (SUCCEEDED(result)) {
    pending_ = false;
    applied_ += 1;
  } else if (ProvesNoEffect(result)) {
    pending_ = false;
  }
}

void EffectLedger::Delivered() noexcept {
  Dispatching();
  Settled(S_OK);
}

MutationEffect EffectLedger::Effect() const noexcept {
  if (pending_ || ambiguous_) {
    return MutationEffect::Unknown;
  }
  return applied_ > 0 ? MutationEffect::Partial : MutationEffect::None;
}

bool ProvesNoEffect(HRESULT result) noexcept {
  switch (result) {
    case kUiaElementNotEnabled:
    case kUiaElementNotAvailable:
    case kUiaNotSupported:
    case kUiaInvalidOperation:
    case E_INVALIDARG:
    case E_NOTIMPL:
    case E_NOINTERFACE:
    case E_ACCESSDENIED:
      return true;
    default:
      return false;
  }
}

EffectScope::EffectScope(EffectLedger& ledger) noexcept : previous_(CurrentEffectLedger()) {
  CurrentEffectLedger() = &ledger;
}

EffectScope::~EffectScope() {
  CurrentEffectLedger() = previous_;
}

CancellationScope::CancellationScope(const CancellationToken& token) noexcept : previous_(CurrentCancellationToken()) {
  CurrentCancellationToken() = &token;
}

CancellationScope::~CancellationScope() {
  CurrentCancellationToken() = previous_;
}

void RecordDispatching() noexcept {
  if (EffectLedger* ledger = CurrentEffectLedger(); ledger != nullptr) {
    ledger->Dispatching();
  }
}

void RecordSettled(HRESULT result) noexcept {
  if (EffectLedger* ledger = CurrentEffectLedger(); ledger != nullptr) {
    ledger->Settled(result);
  }
}

void RecordDelivered() noexcept {
  if (EffectLedger* ledger = CurrentEffectLedger(); ledger != nullptr) {
    ledger->Delivered();
  }
}

HRESULT RunBoundedProviderCall(ProviderCall kind, std::function<HRESULT()> call, DWORD timeoutMs,
                               std::string_view operation, const std::string& timeoutCode) {
  if (kind == ProviderCall::Mutation) {
    RequireMutationsAllowed();
  }
  std::shared_ptr<CallState> state;
  bool completed = false;
  bool cancelled = false;
  const HRESULT result = RunBounded(std::move(call), timeoutMs, state, completed, cancelled);
  if (completed) {
    if (kind == ProviderCall::Mutation && IsProviderTimeout(result)) {
      Abandon(operation, timeoutMs, state, true);
      Fail(kErrorMutationIndeterminate,
           std::string(operation) + " timed out in the provider (" + DescribeHresult(result) +
               "), so its effect on the application is unknown. " + kUnsettledNotice);
    }
    return result;
  }
  if (cancelled) {
    if (kind == ProviderCall::Mutation) {
      // The provider may still apply the mutation, exactly as after a timeout,
      // so the command's effect is unknown even when nothing was counted yet.
      Abandon(operation, timeoutMs, state, false, true);
      RecordDispatching();
    }
    throw CancelledError{};
  }
  if (kind == ProviderCall::Read) {
    Fail(timeoutCode, std::string(operation) + " did not complete within " + std::to_string(timeoutMs) + " ms.");
  }
  Abandon(operation, timeoutMs, state, false);
  Fail(kErrorMutationIndeterminate,
       std::string(operation) + " did not settle within " + std::to_string(timeoutMs) +
           " ms, so its effect on the application is unknown. " + kUnsettledNotice);
}

}  // namespace furn
