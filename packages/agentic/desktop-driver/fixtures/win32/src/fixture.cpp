// A plain Win32 application that the desktop-driver native contract drives. It
// is test-only: the contract builds it on demand into the external native cache
// and it is never published or built at install time.
//
//   --title <text>     main window title (default "FURN Win32 Fixture")
//   --nodes <count>    add a tree view with this many items
//   --hang-ms <count>  how long the Hang button blocks the UI thread (default 20000)
//   --stuck-ms <count> add a control whose UI Automation Invoke blocks this long
//                      on a provider thread (default 0: no such control)
//   --stuck-started-file <path> create this file when the stuck Invoke starts
//   --offscreen <0|1>  place the main window off every monitor (default 0)
//   --lifetime-ms <count> exit the process after this long even when the UI thread is
//                      blocked, so an abandoned run cannot linger (default 600000, 0: never)
//   --child-pid-file <path> start one offscreen descendant copy of this fixture and
//                      write "<descendant pid> <parent pid>" to this file, so a
//                      contract can prove which processes an owned launch reaches
//   --no-default-action <0|1> add an MSAA control whose no-op default method returns S_OK
//   --tool-windows <0|1> add a button that opens content and non-content tool roots
#define NOMINMAX
#define WIN32_LEAN_AND_MEAN
#include <windows.h>

#include <objbase.h>
#include <oleauto.h>
#include <oleacc.h>

#include <commctrl.h>
#include <shellapi.h>
#include <tlhelp32.h>
#include <uiautomation.h>

#include <algorithm>
#include <atomic>
#include <cstdlib>
#include <string>
#include <thread>
#include <vector>

namespace {

constexpr wchar_t kMainClass[] = L"FurnWin32Fixture";
constexpr wchar_t kDialogClass[] = L"FurnWin32FixtureDialog";
constexpr wchar_t kStuckClass[] = L"FurnWin32FixtureStuck";
constexpr wchar_t kNoActionClass[] = L"FurnWin32FixtureNoAction";
constexpr wchar_t kToolClass[] = L"FurnWin32FixtureTool";

constexpr int kActivateButton = 1001;
constexpr int kNameEdit = 1002;
constexpr int kEnabledCheckbox = 1003;
constexpr int kStatusLabel = 1004;
constexpr int kRenameButton = 1005;
constexpr int kDialogButton = 1006;
constexpr int kHangButton = 1007;
constexpr int kNameLabel = 1008;
constexpr int kStuckControl = 1009;
constexpr int kTree = 1010;
constexpr int kNoActionControl = 1011;
constexpr int kToolButton = 1012;
constexpr int kPassiveControl = 1013;
constexpr int kMenuIncrement = 2001;
constexpr int kMenuExit = 2002;
constexpr int kMenuAbout = 2003;
constexpr int kDialogOk = 3001;
constexpr int kDialogLabel = 3002;
constexpr int kToolAction = 3101;
constexpr int kToolClose = 3102;
constexpr UINT kStuckApplied = WM_APP + 1;
constexpr UINT kNoActionDispatched = WM_APP + 2;
constexpr UINT kToolApplied = WM_APP + 3;

struct Options {
  std::wstring title = L"FURN Win32 Fixture";
  int nodes = 0;
  DWORD hangMilliseconds = 20000;
  DWORD stuckMilliseconds = 0;
  DWORD lifetimeMilliseconds = 600000;
  bool offscreen = false;
  bool noDefaultAction = false;
  bool toolWindows = false;
  std::wstring childPidFile;
  std::wstring stuckStartedFile;
};

Options options;
HWND mainWindow = nullptr;
HWND statusLabel = nullptr;
HWND dialogWindow = nullptr;
int activations = 0;
int renames = 0;
int stuckApplications = 0;
int toolActivations = 0;
std::vector<HWND> toolWindows;

Options ParseOptions() {
  Options parsed;
  int count = 0;
  LPWSTR* arguments = CommandLineToArgvW(GetCommandLineW(), &count);
  if (arguments == nullptr) {
    return parsed;
  }
  for (int index = 1; index + 1 < count; index += 2) {
    const std::wstring name = arguments[index];
    const wchar_t* value = arguments[index + 1];
    if (name == L"--title") {
      parsed.title = value;
    } else if (name == L"--nodes") {
      parsed.nodes = std::max(0, _wtoi(value));
    } else if (name == L"--hang-ms") {
      parsed.hangMilliseconds = static_cast<DWORD>(std::max(0, _wtoi(value)));
    } else if (name == L"--stuck-ms") {
      parsed.stuckMilliseconds = static_cast<DWORD>(std::max(0, _wtoi(value)));
    } else if (name == L"--stuck-started-file") {
      parsed.stuckStartedFile = value;
    } else if (name == L"--lifetime-ms") {
      parsed.lifetimeMilliseconds = static_cast<DWORD>(std::max(0, _wtoi(value)));
    } else if (name == L"--offscreen") {
      parsed.offscreen = _wtoi(value) != 0;
    } else if (name == L"--child-pid-file") {
      parsed.childPidFile = value;
    } else if (name == L"--no-default-action") {
      parsed.noDefaultAction = _wtoi(value) != 0;
    } else if (name == L"--tool-windows") {
      parsed.toolWindows = _wtoi(value) != 0;
    }
  }
  LocalFree(arguments);
  return parsed;
}

int Scale(int value, HWND window) {
  return MulDiv(value, static_cast<int>(GetDpiForWindow(window)), 96);
}

HWND AddChild(HWND parent, const wchar_t* className, const wchar_t* text, DWORD style, int id, int x, int y,
              int width, int height) {
  return CreateWindowExW(0, className, text, WS_CHILD | WS_VISIBLE | style, Scale(x, parent), Scale(y, parent),
                         Scale(width, parent), Scale(height, parent), parent,
                         reinterpret_cast<HMENU>(static_cast<INT_PTR>(id)), GetModuleHandleW(nullptr), nullptr);
}

void SetStatus(const std::wstring& text) {
  if (statusLabel != nullptr) {
    SetWindowTextW(statusLabel, text.c_str());
  }
}

void CreateTree(HWND window) {
  INITCOMMONCONTROLSEX controls{};
  controls.dwSize = sizeof(controls);
  controls.dwICC = ICC_TREEVIEW_CLASSES;
  InitCommonControlsEx(&controls);
  const HWND tree = AddChild(window, WC_TREEVIEWW, L"Items",
                             WS_TABSTOP | WS_BORDER | TVS_HASLINES | TVS_HASBUTTONS | TVS_LINESATROOT, kTree, 10, 140,
                             440, 150);
  for (int index = 0; index < options.nodes; index += 1) {
    const std::wstring text = L"Item " + std::to_wstring(index);
    TVINSERTSTRUCTW item{};
    item.hParent = TVI_ROOT;
    item.hInsertAfter = TVI_LAST;
    item.item.mask = TVIF_TEXT;
    item.item.pszText = const_cast<LPWSTR>(text.c_str());
    TreeView_InsertItem(tree, &item);
  }
}

void CreateMenuBar(HWND window) {
  HMENU file = CreatePopupMenu();
  AppendMenuW(file, MF_STRING, kMenuIncrement, L"Increment");
  AppendMenuW(file, MF_STRING, kMenuExit, L"Exit");
  HMENU help = CreatePopupMenu();
  AppendMenuW(help, MF_STRING, kMenuAbout, L"About");
  HMENU bar = CreateMenu();
  AppendMenuW(bar, MF_POPUP, reinterpret_cast<UINT_PTR>(file), L"File");
  AppendMenuW(bar, MF_POPUP, reinterpret_cast<UINT_PTR>(help), L"Help");
  SetMenu(window, bar);
}

// A button whose UI Automation Invoke is stuck. The provider blocks on a UI
// Automation thread, so the UI thread stays responsive, and applies its effect
// only when the wait ends: a mutation whose outcome the client cannot know,
// like a wedged or very slow application.
class StuckProvider : public IRawElementProviderSimple, public IInvokeProvider, public IScrollItemProvider {
 public:
  explicit StuckProvider(HWND window) : window_(window), passive_(GetDlgCtrlID(window) == kPassiveControl) {}

  ULONG STDMETHODCALLTYPE AddRef() override { return ++references_; }

  ULONG STDMETHODCALLTYPE Release() override {
    const ULONG remaining = --references_;
    if (remaining == 0) {
      delete this;
    }
    return remaining;
  }

  HRESULT STDMETHODCALLTYPE QueryInterface(REFIID id, void** object) override {
    if (object == nullptr) {
      return E_POINTER;
    }
    if (id == __uuidof(IUnknown) || id == __uuidof(IRawElementProviderSimple)) {
      *object = static_cast<IRawElementProviderSimple*>(this);
    } else if (id == __uuidof(IInvokeProvider)) {
      *object = static_cast<IInvokeProvider*>(this);
    } else if (id == __uuidof(IScrollItemProvider) && passive_) {
      *object = static_cast<IScrollItemProvider*>(this);
    } else {
      *object = nullptr;
      return E_NOINTERFACE;
    }
    AddRef();
    return S_OK;
  }

  HRESULT STDMETHODCALLTYPE get_ProviderOptions(ProviderOptions* providerOptions) override {
    if (providerOptions == nullptr) {
      return E_POINTER;
    }
    *providerOptions = ProviderOptions_ServerSideProvider;
    return S_OK;
  }

  HRESULT STDMETHODCALLTYPE GetPatternProvider(PATTERNID pattern, IUnknown** provider) override {
    if (provider == nullptr) {
      return E_POINTER;
    }
    *provider = nullptr;
    if (pattern == UIA_InvokePatternId && !passive_) {
      *provider = static_cast<IInvokeProvider*>(this);
      AddRef();
    } else if (pattern == UIA_ScrollItemPatternId && passive_) {
      *provider = static_cast<IScrollItemProvider*>(this);
      AddRef();
    }
    return S_OK;
  }

  HRESULT STDMETHODCALLTYPE GetPropertyValue(PROPERTYID property, VARIANT* value) override {
    if (value == nullptr) {
      return E_POINTER;
    }
    VariantInit(value);
    if (property == UIA_ControlTypePropertyId) {
      value->vt = VT_I4;
      value->lVal = UIA_ButtonControlTypeId;
    } else if (property == UIA_NamePropertyId) {
      value->vt = VT_BSTR;
      value->bstrVal = SysAllocString(passive_ ? L"No action pattern" : L"Stuck action");
    } else if (property == UIA_AutomationIdPropertyId) {
      value->vt = VT_BSTR;
      value->bstrVal = SysAllocString(std::to_wstring(passive_ ? kPassiveControl : kStuckControl).c_str());
    }
    return S_OK;
  }

  HRESULT STDMETHODCALLTYPE get_HostRawElementProvider(IRawElementProviderSimple** host) override {
    if (host == nullptr) {
      return E_POINTER;
    }
    return UiaHostProviderFromHwnd(window_, host);
  }

  HRESULT STDMETHODCALLTYPE Invoke() override {
    if (passive_) {
      PostMessageW(mainWindow, kNoActionDispatched, 0, 0);
      return S_OK;
    }
    if (!options.stuckStartedFile.empty()) {
      const HANDLE started = CreateFileW(options.stuckStartedFile.c_str(), GENERIC_WRITE, FILE_SHARE_READ, nullptr,
                                         CREATE_NEW, FILE_ATTRIBUTE_NORMAL, nullptr);
      if (started == INVALID_HANDLE_VALUE) {
        return HRESULT_FROM_WIN32(GetLastError());
      }
      CloseHandle(started);
    }
    Sleep(options.stuckMilliseconds);
    PostMessageW(mainWindow, kStuckApplied, 0, 0);
    return S_OK;
  }

  HRESULT STDMETHODCALLTYPE ScrollIntoView() override { return S_OK; }

 private:
  std::atomic<ULONG> references_{1};
  HWND window_;
  bool passive_;
};

LRESULT CALLBACK StuckProc(HWND window, UINT message, WPARAM wparam, LPARAM lparam) {
  switch (message) {
    case WM_GETOBJECT:
      if (static_cast<long>(lparam) == static_cast<long>(UiaRootObjectId)) {
        StuckProvider* provider = new StuckProvider(window);
        const LRESULT result = UiaReturnRawElementProvider(window, wparam, lparam, provider);
        provider->Release();
        return result;
      }
      break;
    case WM_PAINT: {
      PAINTSTRUCT paint{};
      const HDC context = BeginPaint(window, &paint);
      RECT bounds{};
      GetClientRect(window, &bounds);
      FrameRect(context, &bounds, static_cast<HBRUSH>(GetStockObject(BLACK_BRUSH)));
      SetBkMode(context, TRANSPARENT);
      DrawTextW(context, GetDlgCtrlID(window) == kPassiveControl ? L"No action pattern" : L"Stuck action", -1, &bounds,
                 DT_CENTER | DT_VCENTER | DT_SINGLELINE);
      EndPaint(window, &paint);
      return 0;
    }
    default:
      break;
  }
  return DefWindowProcW(window, message, wparam, lparam);
}

// Keep the normal MSAA properties without an actionable pattern. The default
// action acknowledges a call without effect, exercising the driver's refusal
// of legacy-only activation.
class NoActionAccessible : public IAccessible {
 public:
  explicit NoActionAccessible(IAccessible* standard) : standard_(standard) {}
  ~NoActionAccessible() { standard_->Release(); }

  ULONG STDMETHODCALLTYPE AddRef() override { return ++references_; }
  ULONG STDMETHODCALLTYPE Release() override {
    const ULONG remaining = --references_;
    if (remaining == 0) {
      delete this;
    }
    return remaining;
  }
  HRESULT STDMETHODCALLTYPE QueryInterface(REFIID id, void** object) override {
    if (object == nullptr) return E_POINTER;
    *object = nullptr;
    if (id != IID_IUnknown && id != IID_IDispatch && id != IID_IAccessible) return E_NOINTERFACE;
    *object = static_cast<IAccessible*>(this);
    AddRef();
    return S_OK;
  }
  HRESULT STDMETHODCALLTYPE GetTypeInfoCount(UINT* count) override { return standard_->GetTypeInfoCount(count); }
  HRESULT STDMETHODCALLTYPE GetTypeInfo(UINT index, LCID locale, ITypeInfo** info) override {
    return standard_->GetTypeInfo(index, locale, info);
  }
  HRESULT STDMETHODCALLTYPE GetIDsOfNames(REFIID id, LPOLESTR* names, UINT count, LCID locale, DISPID* ids) override {
    return standard_->GetIDsOfNames(id, names, count, locale, ids);
  }
  HRESULT STDMETHODCALLTYPE Invoke(DISPID member, REFIID id, LCID locale, WORD flags, DISPPARAMS* params,
                                    VARIANT* result, EXCEPINFO* exception, UINT* argument) override {
    return standard_->Invoke(member, id, locale, flags, params, result, exception, argument);
  }
  HRESULT STDMETHODCALLTYPE get_accParent(IDispatch** parent) override { return standard_->get_accParent(parent); }
  HRESULT STDMETHODCALLTYPE get_accChildCount(long* count) override { return standard_->get_accChildCount(count); }
  HRESULT STDMETHODCALLTYPE get_accChild(VARIANT child, IDispatch** result) override {
    return standard_->get_accChild(child, result);
  }
  HRESULT STDMETHODCALLTYPE get_accName(VARIANT child, BSTR* result) override { return standard_->get_accName(child, result); }
  HRESULT STDMETHODCALLTYPE get_accValue(VARIANT child, BSTR* result) override { return standard_->get_accValue(child, result); }
  HRESULT STDMETHODCALLTYPE get_accDescription(VARIANT child, BSTR* result) override {
    return standard_->get_accDescription(child, result);
  }
  HRESULT STDMETHODCALLTYPE get_accRole(VARIANT, VARIANT* result) override {
    if (result == nullptr) return E_POINTER;
    VariantInit(result);
    result->vt = VT_I4;
    result->lVal = ROLE_SYSTEM_STATICTEXT;
    return S_OK;
  }
  HRESULT STDMETHODCALLTYPE get_accState(VARIANT child, VARIANT* result) override { return standard_->get_accState(child, result); }
  HRESULT STDMETHODCALLTYPE get_accHelp(VARIANT child, BSTR* result) override { return standard_->get_accHelp(child, result); }
  HRESULT STDMETHODCALLTYPE get_accHelpTopic(BSTR* file, VARIANT child, long* topic) override {
    return standard_->get_accHelpTopic(file, child, topic);
  }
  HRESULT STDMETHODCALLTYPE get_accKeyboardShortcut(VARIANT child, BSTR* result) override {
    return standard_->get_accKeyboardShortcut(child, result);
  }
  HRESULT STDMETHODCALLTYPE get_accFocus(VARIANT* result) override { return standard_->get_accFocus(result); }
  HRESULT STDMETHODCALLTYPE get_accSelection(VARIANT* result) override { return standard_->get_accSelection(result); }
  HRESULT STDMETHODCALLTYPE get_accDefaultAction(VARIANT, BSTR* result) override {
    if (result == nullptr) return E_POINTER;
    *result = nullptr;
    return S_FALSE;
  }
  HRESULT STDMETHODCALLTYPE accSelect(long flags, VARIANT child) override { return standard_->accSelect(flags, child); }
  HRESULT STDMETHODCALLTYPE accLocation(long* x, long* y, long* width, long* height, VARIANT child) override {
    return standard_->accLocation(x, y, width, height, child);
  }
  HRESULT STDMETHODCALLTYPE accNavigate(long direction, VARIANT from, VARIANT* result) override {
    return standard_->accNavigate(direction, from, result);
  }
  HRESULT STDMETHODCALLTYPE accHitTest(long x, long y, VARIANT* result) override { return standard_->accHitTest(x, y, result); }
  HRESULT STDMETHODCALLTYPE accDoDefaultAction(VARIANT) override {
    PostMessageW(mainWindow, kNoActionDispatched, 0, 0);
    return S_OK;
  }
  HRESULT STDMETHODCALLTYPE put_accName(VARIANT child, BSTR value) override { return standard_->put_accName(child, value); }
  HRESULT STDMETHODCALLTYPE put_accValue(VARIANT child, BSTR value) override { return standard_->put_accValue(child, value); }

 private:
  std::atomic<ULONG> references_{1};
  IAccessible* standard_;
};

LRESULT CALLBACK NoActionProc(HWND window, UINT message, WPARAM wparam, LPARAM lparam) {
  if (message == WM_GETOBJECT && static_cast<LONG>(lparam) == OBJID_CLIENT) {
    IAccessible* standard = nullptr;
    if (SUCCEEDED(CreateStdAccessibleObject(window, OBJID_CLIENT, IID_IAccessible, reinterpret_cast<void**>(&standard)))) {
      auto* accessible = new NoActionAccessible(standard);
      const LRESULT result = LresultFromObject(IID_IAccessible, wparam, accessible);
      accessible->Release();
      return result;
    }
  }
  return DefWindowProcW(window, message, wparam, lparam);
}

LRESULT CALLBACK ToolProc(HWND window, UINT message, WPARAM wparam, LPARAM lparam) {
  if (message == WM_COMMAND) {
    if (LOWORD(wparam) == kToolAction) {
      PostMessageW(mainWindow, kToolApplied, 0, 0);
      return 0;
    }
    if (LOWORD(wparam) == kToolClose) {
      DestroyWindow(window);
      return 0;
    }
  }
  return DefWindowProcW(window, message, wparam, lparam);
}

void OpenToolWindows(HWND owner) {
  if (!toolWindows.empty()) return;
  INITCOMMONCONTROLSEX controls{sizeof(INITCOMMONCONTROLSEX), ICC_WIN95_CLASSES};
  InitCommonControlsEx(&controls);
  RECT bounds{};
  GetWindowRect(owner, &bounds);
  const auto create = [&](HWND parent, bool content, bool visible, bool empty, const wchar_t* className = kToolClass) {
    const HWND tool = CreateWindowExW(WS_EX_TOOLWINDOW | WS_EX_NOACTIVATE | WS_EX_TOPMOST, className, L"",
                                      WS_POPUP | WS_BORDER, bounds.left + Scale(30, owner), bounds.top + Scale(80, owner),
                                      empty ? 0 : Scale(280, owner), empty ? 0 : Scale(120, owner),
                                      parent, nullptr, GetModuleHandleW(nullptr), nullptr);
    if (tool == nullptr) return static_cast<HWND>(nullptr);
    toolWindows.push_back(tool);
    if (content) {
      AddChild(tool, L"BUTTON", L"Tool action", WS_TABSTOP | BS_PUSHBUTTON, kToolAction, 10, 10, 120, 28);
      AddChild(tool, L"BUTTON", L"Close tool", WS_TABSTOP | BS_PUSHBUTTON, kToolClose, 10, 50, 120, 28);
    }
    if (visible) ShowWindow(tool, SW_SHOWNOACTIVATE);
    return tool;
  };
  create(owner, true, true, false);
  const HWND unowned = create(nullptr, true, true, false);
  create(unowned, true, true, false);
  create(owner, false, true, false);
  create(owner, true, false, false);
  create(owner, true, true, true);
  create(owner, true, true, false, TOOLTIPS_CLASSW);
  SetStatus(L"Opened " + std::to_wstring(toolWindows.size()) + L" tool windows");
}

void CreateMainControls(HWND window) {
  CreateMenuBar(window);
  statusLabel = AddChild(window, L"STATIC", L"Ready", SS_LEFT, kStatusLabel, 10, 10, 440, 20);
  AddChild(window, L"BUTTON", L"Activate", WS_TABSTOP | BS_PUSHBUTTON, kActivateButton, 10, 36, 100, 28);
  AddChild(window, L"BUTTON", L"Rename window", WS_TABSTOP | BS_PUSHBUTTON, kRenameButton, 120, 36, 110, 28);
  AddChild(window, L"BUTTON", L"Open dialog", WS_TABSTOP | BS_PUSHBUTTON, kDialogButton, 240, 36, 100, 28);
  AddChild(window, L"BUTTON", L"Hang", WS_TABSTOP | BS_PUSHBUTTON, kHangButton, 350, 36, 100, 28);
  // The label precedes the edit so assistive technology names the edit after it.
  AddChild(window, L"STATIC", L"Name:", SS_LEFT, kNameLabel, 10, 78, 60, 20);
  AddChild(window, L"EDIT", L"", WS_TABSTOP | WS_BORDER | ES_AUTOHSCROLL, kNameEdit, 74, 74, 376, 24);
  AddChild(window, L"BUTTON", L"Enabled", WS_TABSTOP | BS_AUTOCHECKBOX, kEnabledCheckbox, 10, 108, 120, 22);
  if (options.stuckMilliseconds > 0) {
    AddChild(window, kStuckClass, L"", 0, kStuckControl, 140, 108, 200, 22);
  }
  if (options.nodes > 0) {
    CreateTree(window);
  }
  if (options.noDefaultAction) {
    AddChild(window, kNoActionClass, L"No default action", 0, kNoActionControl, 10, 140, 200, 28);
    AddChild(window, kStuckClass, L"", 0, kPassiveControl, 10, 180, 200, 28);
  }
  if (options.toolWindows) {
    AddChild(window, L"BUTTON", L"Open tool windows", WS_TABSTOP | BS_PUSHBUTTON, kToolButton, 10, 140, 180, 28);
  }
}

// The dialog is owned by the main window and modal in the Win32 sense: it
// disables its owner until it closes, without a nested message loop.
void OpenDialog(HWND owner) {
  if (dialogWindow != nullptr) {
    return;
  }
  RECT bounds{};
  GetWindowRect(owner, &bounds);
  dialogWindow = CreateWindowExW(WS_EX_DLGMODALFRAME | WS_EX_TOPMOST | WS_EX_NOACTIVATE, kDialogClass,
                                 L"Fixture dialog", WS_POPUP | WS_CAPTION | WS_SYSMENU, bounds.left + Scale(60, owner),
                                 bounds.top + Scale(80, owner), Scale(300, owner), Scale(150, owner), owner, nullptr,
                                 GetModuleHandleW(nullptr), nullptr);
  if (dialogWindow == nullptr) {
    return;
  }
  EnableWindow(owner, FALSE);
  ShowWindow(dialogWindow, SW_SHOWNOACTIVATE);
}

LRESULT CALLBACK DialogProc(HWND window, UINT message, WPARAM wparam, LPARAM lparam) {
  switch (message) {
    case WM_CREATE:
      AddChild(window, L"STATIC", L"Dialog open", SS_LEFT, kDialogLabel, 10, 10, 260, 20);
      AddChild(window, L"BUTTON", L"Dialog OK", WS_TABSTOP | BS_PUSHBUTTON, kDialogOk, 10, 40, 100, 28);
      return 0;
    case WM_COMMAND:
      if (LOWORD(wparam) == kDialogOk) {
        DestroyWindow(window);
        return 0;
      }
      break;
    case WM_CLOSE:
      DestroyWindow(window);
      return 0;
    case WM_DESTROY:
      if (window == dialogWindow) {
        dialogWindow = nullptr;
        EnableWindow(mainWindow, TRUE);
      }
      return 0;
    default:
      break;
  }
  return DefWindowProcW(window, message, wparam, lparam);
}

LRESULT CALLBACK MainProc(HWND window, UINT message, WPARAM wparam, LPARAM lparam) {
  switch (message) {
    case WM_CREATE:
      mainWindow = window;
      CreateMainControls(window);
      return 0;
    case WM_COMMAND:
      switch (LOWORD(wparam)) {
        case kActivateButton:
        case kMenuIncrement:
          activations += 1;
          SetStatus(L"Activated " + std::to_wstring(activations) + L" times");
          return 0;
        case kRenameButton:
          renames += 1;
          SetWindowTextW(window, (options.title + L" - renamed " + std::to_wstring(renames)).c_str());
          return 0;
        case kDialogButton:
          OpenDialog(window);
          return 0;
        case kToolButton:
          OpenToolWindows(window);
          return 0;
        case kHangButton:
          // A busy or suspended application: nothing is pumped until this returns.
          Sleep(options.hangMilliseconds);
          SetStatus(L"Hang finished");
          return 0;
        case kMenuExit:
          DestroyWindow(window);
          return 0;
        default:
          break;
      }
      break;
    case kStuckApplied:
      stuckApplications += 1;
      SetStatus(L"Stuck action applied " + std::to_wstring(stuckApplications) + L" times");
      return 0;
    case kNoActionDispatched:
      SetStatus(L"Nonactionable default dispatched");
      return 0;
    case kToolApplied:
      toolActivations += 1;
      SetStatus(L"Tool activated " + std::to_wstring(toolActivations) + L" times");
      return 0;
    case WM_DESTROY:
      PostQuitMessage(0);
      return 0;
    default:
      break;
  }
  return DefWindowProcW(window, message, wparam, lparam);
}

void RegisterClasses(HINSTANCE instance) {
  WNDCLASSEXW windowClass{};
  windowClass.cbSize = sizeof(windowClass);
  windowClass.hInstance = instance;
  windowClass.hCursor = LoadCursorW(nullptr, IDC_ARROW);
  windowClass.hbrBackground = reinterpret_cast<HBRUSH>(COLOR_WINDOW + 1);
  windowClass.lpfnWndProc = MainProc;
  windowClass.lpszClassName = kMainClass;
  RegisterClassExW(&windowClass);
  windowClass.lpfnWndProc = DialogProc;
  windowClass.lpszClassName = kDialogClass;
  RegisterClassExW(&windowClass);
  windowClass.lpfnWndProc = StuckProc;
  windowClass.lpszClassName = kStuckClass;
  RegisterClassExW(&windowClass);
  windowClass.lpfnWndProc = NoActionProc;
  windowClass.lpszClassName = kNoActionClass;
  RegisterClassExW(&windowClass);
  windowClass.lpfnWndProc = ToolProc;
  windowClass.lpszClassName = kToolClass;
  RegisterClassExW(&windowClass);
}

void StartWatchdog() {
  if (options.lifetimeMilliseconds == 0) {
    return;
  }
  std::thread([lifetime = options.lifetimeMilliseconds]() {
    Sleep(lifetime);
    ExitProcess(2);
  }).detach();
}

DWORD ReadParentProcessId() {
  const HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
  if (snapshot == INVALID_HANDLE_VALUE) {
    return 0;
  }
  DWORD parent = 0;
  PROCESSENTRY32W entry{};
  entry.dwSize = sizeof(entry);
  for (BOOL more = Process32FirstW(snapshot, &entry); more != FALSE; more = Process32NextW(snapshot, &entry)) {
    if (entry.th32ProcessID == GetCurrentProcessId()) {
      parent = entry.th32ParentProcessID;
      break;
    }
  }
  CloseHandle(snapshot);
  return parent;
}

// Starts one offscreen copy of this fixture with the default title, then
// publishes its process id and this process's parent id through a rename, so a
// reader never sees a partial file. Returns false when either step fails.
bool StartDescendant() {
  if (options.childPidFile.empty()) {
    return true;
  }
  wchar_t modulePath[MAX_PATH * 4] = {};
  const DWORD length = GetModuleFileNameW(nullptr, modulePath, static_cast<DWORD>(std::size(modulePath)));
  if (length == 0 || length >= std::size(modulePath)) {
    return false;
  }
  std::wstring commandLine = L"\"" + std::wstring(modulePath, length) +
                             L"\" --offscreen 1 --lifetime-ms " + std::to_wstring(options.lifetimeMilliseconds);
  STARTUPINFOW startup{};
  startup.cb = sizeof(startup);
  PROCESS_INFORMATION information{};
  if (CreateProcessW(modulePath, commandLine.data(), nullptr, nullptr, FALSE, 0, nullptr, nullptr, &startup,
                     &information) == FALSE) {
    return false;
  }
  CloseHandle(information.hThread);
  CloseHandle(information.hProcess);

  const std::string contents =
      std::to_string(information.dwProcessId) + " " + std::to_string(ReadParentProcessId()) + "\n";
  const std::wstring temporary = options.childPidFile + L".tmp";
  const HANDLE file = CreateFileW(temporary.c_str(), GENERIC_WRITE, 0, nullptr, CREATE_ALWAYS,
                                  FILE_ATTRIBUTE_NORMAL, nullptr);
  if (file == INVALID_HANDLE_VALUE) {
    return false;
  }
  DWORD written = 0;
  const bool complete = WriteFile(file, contents.data(), static_cast<DWORD>(contents.size()), &written, nullptr) !=
                            FALSE &&
                        written == contents.size();
  CloseHandle(file);
  return complete &&
         MoveFileExW(temporary.c_str(), options.childPidFile.c_str(), MOVEFILE_REPLACE_EXISTING) != FALSE;
}

}  // namespace

int WINAPI wWinMain(HINSTANCE instance, HINSTANCE, PWSTR, int) {
  options = ParseOptions();
  StartWatchdog();
  RegisterClasses(instance);

  constexpr DWORD style = WS_OVERLAPPED | WS_CAPTION | WS_SYSMENU | WS_MINIMIZEBOX;
  constexpr DWORD exStyle = WS_EX_TOPMOST | WS_EX_NOACTIVATE;
  const UINT dpi = GetDpiForSystem();
  RECT frame{0, 0, MulDiv(460, static_cast<int>(dpi), 96), MulDiv(300, static_cast<int>(dpi), 96)};
  AdjustWindowRectExForDpi(&frame, style, TRUE, exStyle, dpi);
  const int origin = options.offscreen ? -32000 : 40;
  const HWND window = CreateWindowExW(exStyle, kMainClass, options.title.c_str(), style, origin, origin,
                                      frame.right - frame.left, frame.bottom - frame.top, nullptr, nullptr, instance,
                                      nullptr);
  if (window == nullptr) {
    return 1;
  }
  ShowWindow(window, SW_SHOWNOACTIVATE);
  if (!StartDescendant()) {
    return 3;
  }

  MSG message{};
  while (GetMessageW(&message, nullptr, 0, 0) > 0) {
    TranslateMessage(&message);
    DispatchMessageW(&message);
  }
  return static_cast<int>(message.wParam);
}
