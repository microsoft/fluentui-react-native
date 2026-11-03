#include "settlement.h"

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
};

std::string& CurrentLeaseId() {
  thread_local std::string leaseId;
  return leaseId;
}

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
  return subject + " did not settle within " + std::to_string(entry.timeoutMs) + " ms and " + settlement;
}

void Abandon(std::string_view operation, DWORD timeoutMs, std::shared_ptr<CallState> call, bool providerTimedOut) {
  Ledger& ledger = LedgerInstance();
  const std::lock_guard<std::mutex> lock(ledger.mutex);
  ledger.abandoned.push_back(
      AbandonedMutation{std::string(operation), timeoutMs, std::move(call), providerTimedOut, CurrentLeaseId()});
}

constexpr char kUnsettledNotice[] =
    "Later mutations in this helper session are refused; reads are still allowed so the application can be "
    "re-observed once it responds.";

HRESULT RunBounded(std::function<HRESULT()> call, DWORD timeoutMs, std::shared_ptr<CallState>& state,
                   bool& completed) {
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
  completed = WaitForSingleObject(state->done, timeoutMs) == WAIT_OBJECT_0;
  return completed ? state->result.load() : E_PENDING;
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

HRESULT RunBoundedProviderCall(ProviderCall kind, std::function<HRESULT()> call, DWORD timeoutMs,
                               std::string_view operation, const std::string& timeoutCode) {
  if (kind == ProviderCall::Mutation) {
    RequireMutationsAllowed();
  }
  std::shared_ptr<CallState> state;
  bool completed = false;
  const HRESULT result = RunBounded(std::move(call), timeoutMs, state, completed);
  if (completed) {
    if (kind == ProviderCall::Mutation && IsProviderTimeout(result)) {
      Abandon(operation, timeoutMs, state, true);
      Fail(kErrorMutationIndeterminate,
           std::string(operation) + " timed out in the provider (" + DescribeHresult(result) +
               "), so its effect on the application is unknown. " + kUnsettledNotice);
    }
    return result;
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
