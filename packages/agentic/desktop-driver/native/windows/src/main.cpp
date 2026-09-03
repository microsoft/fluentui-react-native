#include <windows.h>

#include <fcntl.h>
#include <io.h>

#include <iostream>
#include <string>
#include <string_view>

#include <winrt/base.h>

#include "common.h"
#include "host.h"
#include "input.h"
#include "inputlock.h"
#include "json.h"
#include "selftest.h"

namespace {

// A key ledger is a set of single Unicode code points. Sixteen MiB exceeds the
// JSON encoding of the complete Unicode code-point space while remaining
// bounded independently from ordinary framed commands.
constexpr std::size_t kMaximumLedgerBytes = 16 * 1024 * 1024;

// Reads the whole standard input stream. A stream that was never redirected is
// reported as missing so the restricted mode fails closed instead of blocking
// on an interactive console.
std::string ReadStandardInput(bool& redirected) {
  const HANDLE input = GetStdHandle(STD_INPUT_HANDLE);
  redirected = input != nullptr && input != INVALID_HANDLE_VALUE && GetFileType(input) != FILE_TYPE_CHAR;
  if (!redirected) {
    return {};
  }
  _setmode(_fileno(stdin), _O_BINARY);
  std::string contents;
  char buffer[4096];
  DWORD read = 0;
  while (ReadFile(input, buffer, sizeof(buffer), &read, nullptr) != FALSE && read > 0) {
    contents.append(buffer, read);
    if (contents.size() > kMaximumLedgerBytes) {
      furn::Fail(furn::kErrorInvalidRequest, "The release ledger on standard input is too large.");
    }
  }
  if (contents.size() >= 3 && static_cast<unsigned char>(contents[0]) == 0xEF &&
      static_cast<unsigned char>(contents[1]) == 0xBB && static_cast<unsigned char>(contents[2]) == 0xBF) {
    contents.erase(0, 3);
  }
  return contents;
}

// Restricted mode: release exactly the depressed input that the adapter reports
// on standard input, without touching applications, windows, or any other key.
int ReleaseInputFromLedger() {
  try {
    bool redirected = false;
    const std::string document = ReadStandardInput(redirected);
    if (!redirected || furn::TrimAscii(document).empty()) {
      furn::Fail(furn::kErrorInvalidRequest,
                 "Standard input did not carry a release ledger such as {\"keys\":[],\"buttons\":[]}.");
    }
    const furn::ReleaseLedger ledger = furn::ParseReleaseLedger(furn::json::Value::Parse(document));
    furn::InputController input;
    const furn::CancellationToken idle;
    // Recovery owns physical input for the whole release chain and adopts a
    // mutex abandoned by the helper it is recovering from.
    const furn::PhysicalInputScope scope = ledger.empty()
                                               ? furn::PhysicalInputScope()
                                               : furn::PhysicalInputScope(idle, furn::kPhysicalInputCleanupWaitMs,
                                                                          furn::AbandonPolicy::Adopt);
    const furn::ReleaseCounts released = input.ReleaseExact(ledger);
    furn::json::Value result = furn::json::Value::Object();
    result.Set("releasedKeys", furn::json::Value::Integer(static_cast<std::int64_t>(released.keys)));
    result.Set("releasedButtons", furn::json::Value::Integer(static_cast<std::int64_t>(released.buttons)));
    std::cout << result.Serialize() << '\n';
    return 0;
  } catch (const furn::HelperError& error) {
    std::cerr << "furn-desktop-driver-host: " << error.code() << ": " << error.what() << '\n';
    return error.code() == furn::kErrorInputUnavailable ? 3 : 1;
  }
}

// Diagnostics mode: report and release whatever the operating system still
// holds down, for operators recovering a desktop by hand.
int ReleaseInputSweep() {
  furn::InputController input;
  if (!input.PhysicalInputAvailable()) {
    std::cerr << "furn-desktop-driver-host: physical input is unavailable on this desktop.\n";
    return 3;
  }
  try {
    const furn::CancellationToken idle;
    const furn::PhysicalInputScope scope(idle, furn::kPhysicalInputCleanupWaitMs, furn::AbandonPolicy::Adopt);
    const std::size_t released = input.ReleaseDesktopModifiers();
    furn::json::Value result = furn::json::Value::Object();
    result.Set("releasedKeys", furn::json::Value::Integer(static_cast<std::int64_t>(released)));
    result.Set("releasedButtons", furn::json::Value::Integer(0));
    result.Set("sweep", furn::json::Value::Bool(true));
    std::cout << result.Serialize() << '\n';
    return 0;
  } catch (const furn::HelperError& error) {
    std::cerr << "furn-desktop-driver-host: " << error.code() << ": " << error.what() << '\n';
    return error.code() == furn::kErrorInputUnavailable ? 3 : 1;
  }
}

int PrintUsage() {
  std::cerr << "Usage: furn-desktop-driver-host --handshake --json | --self-test | --stdio\n"
               "       furn-desktop-driver-host --release-input          "
               "(reads {\"keys\":[],\"buttons\":[]} from stdin)\n"
               "       furn-desktop-driver-host --release-input --sweep  "
               "(diagnostics: release everything the desktop holds down)\n";
  return 2;
}

}  // namespace

int wmain(int argc, wchar_t** argv) {
  try {
    winrt::init_apartment(winrt::apartment_type::multi_threaded);
    SetProcessDpiAwarenessContext(DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2);
    if (argc < 2) {
      return PrintUsage();
    }
    const std::wstring_view mode(argv[1]);
    if (mode == L"--handshake") {
      std::cout << furn::CreateHello().Serialize() << '\n';
      return 0;
    }
    if (mode == L"--self-test") {
      return furn::RunSelfTest();
    }
    if (mode == L"--release-input") {
      if (argc >= 3 && std::wstring_view(argv[2]) == L"--sweep") {
        return ReleaseInputSweep();
      }
      if (argc >= 3) {
        return PrintUsage();
      }
      return ReleaseInputFromLedger();
    }
    if (mode == L"--stdio") {
      furn::Host host;
      return host.Run();
    }
    return PrintUsage();
  } catch (const winrt::hresult_error& error) {
    std::cerr << furn::ToUtf8(error.message().c_str()) << '\n';
    return 1;
  } catch (const furn::HelperError& error) {
    std::cerr << error.code() << ": " << error.what() << '\n';
    return 1;
  } catch (const std::exception& error) {
    std::cerr << error.what() << '\n';
    return 1;
  }
}
