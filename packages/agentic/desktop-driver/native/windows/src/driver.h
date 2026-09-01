#pragma once

#include <cstdint>
#include <string>
#include <vector>

#include "application.h"
#include "automation.h"
#include "capture.h"
#include "common.h"
#include "input.h"
#include "inputlock.h"
#include "json.h"

namespace furn {

struct CommandResult {
  json::Value result;
  bool hasBinary{false};
  std::string binaryId;
  std::vector<std::uint8_t> binaryData;
  json::Value binaryMetadata;
};

// Executes one protocol command at a time on the dedicated UI Automation
// worker. Every entry point observes cancellation between bounded native steps.
class Driver {
 public:
  CommandResult Execute(const std::string& command, const json::Value& params, const CancellationToken& token);

  void ReleaseInput() noexcept;
  bool HasDepressedInput() const noexcept { return input_.HasDepressedInput(); }

 private:
  // Holds the cross-process physical input mutex for a whole action chain and
  // guarantees that a failed or cancelled chain releases its depressed input
  // before the next owner acquires the lock.
  template <typename Fn>
  void RunPhysical(const CancellationToken& token, Fn&& body) {
    const PhysicalInputScope scope(token);
    try {
      body();
    } catch (...) {
      if (input_.HasDepressedInput()) {
        try {
          input_.ReleaseAll();
        } catch (...) {
          // Preserve the original failure.
        }
      }
      throw;
    }
  }

  WindowContext ContextForWindow(const std::string& windowId, HWND& window);
  HWND ReferenceWindow();
  json::Value ProbeResult(const json::Value& params);
  json::Value WindowSummary(const WindowInfo& info);
  void PerformActions(const json::Value& actions, const CancellationToken& token);
  POINT ResolveActionPoint(const json::Value& action, const CancellationToken& token);
  ElementSnapshot RequireLiveElement(const std::string& elementId, const CancellationToken& token);
  CommandResult EncodeCapture(HWND window, const RECT& cropScreen, bool cropToElement, const CancellationToken& token);

  ApplicationManager applications_;
  Automation automation_;
  InputController input_;
  CaptureEngine capture_;
};

}  // namespace furn
