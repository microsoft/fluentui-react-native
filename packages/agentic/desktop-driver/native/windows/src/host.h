#pragma once

#include <windows.h>

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
  void WriteResponse(const std::string& id, const CommandResult& result);
  void WriteError(const std::string& id, const std::string& command, const std::string& code,
                  const std::string& message);
  void WriteCancelled(const std::string& id);

  FrameWriter* writer_{nullptr};
  Driver driver_;
  CancellationToken token_;
  std::mutex mutex_;
  std::condition_variable signal_;
  std::deque<PendingRequest> queue_;
  std::string activeId_;
  bool stopping_{false};
};

}  // namespace furn
