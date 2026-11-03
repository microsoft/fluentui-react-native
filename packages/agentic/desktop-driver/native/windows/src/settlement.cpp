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
};

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

std::string DescribeSettlement(const AbandonedMutation& entry) {
  if (!entry.call->Settled()) {
    return "is still pending";
  }
  return "completed late with " + DescribeHresult(entry.call->result.load());
}

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
  std::string message = "The mutation was refused because \"" + first.operation + "\" did not settle within " +
                        std::to_string(first.timeoutMs) + " ms and " + DescribeSettlement(first) +
                        ", so its effect on the application is unknown.";
  if (ledger.abandoned.size() > 1) {
    message += " " + std::to_string(ledger.abandoned.size()) + " mutations are unsettled.";
  }
  message += " Reads remain available for re-observation; restart the helper session once the application is safe.";
  Fail(kErrorTargetQuarantined, std::move(message));
}

bool MutationsQuarantined() {
  Ledger& ledger = LedgerInstance();
  const std::lock_guard<std::mutex> lock(ledger.mutex);
  return !ledger.abandoned.empty();
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
    return result;
  }
  if (kind == ProviderCall::Read) {
    Fail(timeoutCode, std::string(operation) + " did not complete within " + std::to_string(timeoutMs) + " ms.");
  }
  {
    Ledger& ledger = LedgerInstance();
    const std::lock_guard<std::mutex> lock(ledger.mutex);
    ledger.abandoned.push_back(AbandonedMutation{std::string(operation), timeoutMs, state});
  }
  Fail(kErrorMutationIndeterminate,
       std::string(operation) + " did not settle within " + std::to_string(timeoutMs) +
           " ms, so its effect on the application is unknown. Later mutations in this helper session are refused; reads "
           "remain available for re-observation.");
}

}  // namespace furn
