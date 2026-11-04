#pragma once

#include <windows.h>

#include <atomic>
#include <condition_variable>
#include <deque>
#include <functional>
#include <mutex>
#include <optional>
#include <string>
#include <unordered_set>

#include "driver.h"
#include "framing.h"
#include "json.h"

namespace furn {

json::Value CreateHello();

// Long-lived stdio host. The reader loop stays responsive while one command
// executes on the dedicated UI Automation worker, so a cancel can always be
// observed mid-command.
class Host {
 public:
  // Serves FDR1 on the process's standard input and output.
  int Run();
  // Serves FDR1 on the given handles until the input ends. Tests drive the
  // host in process through pipes.
  int Run(HANDLE input, HANDLE output);
  // Called on the worker with each request just before the driver executes
  // it. Set before Run; tests use it to hold the worker and record dispatch.
  void SetBeforeExecuteForTesting(std::function<void(const std::string& id, const std::string& command)> hook);

 private:
  struct PendingRequest {
    std::string id;
    std::string command;
    json::Value params;
  };

  void WorkerLoop();
  void HandleCancel(const std::string& id);
  bool WriteResponse(const std::string& id, const std::string& command, const CommandResult& result) noexcept;
  bool WriteError(const std::string& id, const std::string& command, const std::string& code,
                  const std::string& message, std::optional<MutationEffect> effect = std::nullopt) noexcept;
  bool WriteCancelled(const std::string& id, std::optional<MutationEffect> effect) noexcept;
  void RecordWriteFailure(std::string_view operation, const char* message) noexcept;
  void PublishWindowClosed(const std::string& windowId) noexcept;

  FrameWriter* writer_{nullptr};
  HANDLE output_{nullptr};
  HANDLE readerThread_{nullptr};
  std::function<void(const std::string&, const std::string&)> beforeExecute_;
  Driver driver_;
  CancellationToken token_;
  std::mutex mutex_;
  std::condition_variable signal_;
  std::deque<PendingRequest> queue_;
  std::string activeId_;
  std::atomic<bool> writeFailed_{false};
  std::atomic<std::uint64_t> eventSequence_{0};
  bool stopping_{false};
};

}  // namespace furn
