#pragma once

#include <windows.h>

#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

#include "common.h"
#include "json.h"

namespace furn {

struct WindowInfo {
  std::string id;
  HWND window{nullptr};
  DWORD processId{0};
  std::wstring title;
  bool primary{false};
};

struct ApplicationLease {
  std::string id;
  std::string ownership;  // "attached" or "launched"
  std::string endpoint;
  std::string storyRootTestId;
  DWORD processId{0};
  FILETIME startTime{};
  std::wstring windowTitle;
  HANDLE process{nullptr};
  HWND primaryWindow{nullptr};
};

// Owns application identity, launch/attach leases, and the opaque window table.
// Attached applications are never terminated; owned launches close only the
// exact windows and process that this helper created.
class ApplicationManager {
 public:
  ~ApplicationManager();

  const ApplicationLease& Launch(const json::Value& params, const CancellationToken& token);
  const ApplicationLease& Attach(const json::Value& params, const CancellationToken& token);
  void CloseApplication(const std::string& leaseId, const CancellationToken& token);
  void Dispose(const CancellationToken& token);
  std::vector<WindowInfo> Windows(const std::string& leaseId, const CancellationToken& token);

  WindowInfo RequireWindow(const std::string& windowId);
  const ApplicationLease* FindLease(const std::string& leaseId) const;
  const ApplicationLease* LeaseForWindow(HWND window) const;
  const ApplicationLease* PrimaryLease() const;
  std::vector<std::string> WindowIdsForLease(const std::string& leaseId) const;
  void ForgetWindow(const std::string& windowId);
  json::Value SerializeLease(const ApplicationLease& lease) const;

 private:
  std::string RegisterWindow(HWND window, DWORD processId, const std::string& leaseId, bool primary);
  ApplicationLease& CreateLease(std::string ownership, DWORD processId, HANDLE process, HWND primaryWindow,
                                const std::wstring& title, const json::Value& params);
  void TrackPendingCleanupProcess(DWORD processId, HANDLE process);

  struct WindowRecord {
    std::string id;
    HWND window{nullptr};
    DWORD processId{0};
    std::string leaseId;
    bool primary{false};
  };

  struct PendingCleanupProcess {
    DWORD processId{0};
    FILETIME startTime{};
    HANDLE process{nullptr};
  };

  std::unordered_map<std::string, ApplicationLease> leases_;
  std::vector<std::string> leaseOrder_;
  std::unordered_map<std::string, WindowRecord> windowsById_;
  std::unordered_map<HWND, std::string> windowIdsByHandle_;
  std::vector<PendingCleanupProcess> pendingCleanupProcesses_;
};

std::vector<HWND> EnumerateTopLevelWindows(DWORD processId);
std::vector<HWND> FindWindowsWithTitle(const std::wstring& title);
std::wstring ReadWindowTitle(HWND window);
bool TryReadProcessStartTime(HANDLE process, FILETIME& startTime);
std::wstring ReadProcessImagePath(HANDLE process);
std::wstring QuoteWindowsCommandLineArgument(std::wstring_view value);
void ActivateWindow(HWND window, const CancellationToken& token);
bool TryActivateWindow(HWND window, const CancellationToken& token);

}  // namespace furn
