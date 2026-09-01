#pragma once

#include <windows.h>

#include <atomic>
#include <condition_variable>
#include <deque>
#include <mutex>
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
  int Run();

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
                  const std::string& message) noexcept;
  bool WriteCancelled(const std::string& id) noexcept;
  void RecordWriteFailure(std::string_view operation, const char* message) noexcept;

  FrameWriter* writer_{nullptr};
  HANDLE readerThread_{nullptr};
  Driver driver_;
  CancellationToken token_;
  std::mutex mutex_;
  std::condition_variable signal_;
  std::deque<PendingRequest> queue_;
  std::string activeId_;
  std::atomic<bool> writeFailed_{false};
  bool stopping_{false};
};

}  // namespace furn
