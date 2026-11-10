#include "selftest.h"

#include <windows.h>
#include <wtsapi32.h>

#include <algorithm>
#include <atomic>
#include <chrono>
#include <cmath>
#include <deque>
#include <functional>
#include <iostream>
#include <memory>
#include <mutex>
#include <set>
#include <stdexcept>
#include <string>
#include <thread>
#include <vector>

#include "authoritytests.h"
#include "observationtests.h"
#include "automation.h"
#include "common.h"
#include "driver.h"
#include "events.h"
#include "framing.h"
#include "geometry.h"
#include "host.h"
#include "input.h"
#include "inputauthority.h"
#include "inputlock.h"
#include "json.h"
#include "settlement.h"

namespace furn {
namespace {

int failures = 0;
int checks = 0;

void Check(bool condition, const std::string& name) {
  checks += 1;
  if (condition) {
    std::cout << "ok - " << name << '\n';
    return;
  }
  failures += 1;
  std::cout << "not ok - " << name << '\n';
}

std::vector<INPUT> recordedInputs;

UINT WINAPI RecordInput(UINT count, LPINPUT inputs, int size) {
  if (size != sizeof(INPUT)) {
    return 0;
  }
  for (UINT index = 0; index < count; index += 1) {
    recordedInputs.push_back(inputs[index]);
  }
  return count;
}

void TestFraming() {
  const std::string payload = R"({"type":"response","id":"a"})";
  const std::vector<std::uint8_t> frame = EncodeJsonFrame(payload);
  Check(frame.size() == kFrameHeaderBytes + payload.size(), "json frame length");
  std::uint8_t type = 0;
  std::uint32_t length = 0;
  Check(DecodeFrameHeader(frame.data(), type, length), "json frame header decodes");
  Check(type == kJsonFrameType && length == payload.size(), "json frame header fields");
  Check(std::string(reinterpret_cast<const char*>(frame.data() + kFrameHeaderBytes), length) == payload,
        "json frame payload round trip");

  const std::vector<std::uint8_t> data{1, 2, 3, 4, 5};
  const std::vector<std::uint8_t> binary = EncodeBinaryFrame("image-1", data);
  Check(DecodeFrameHeader(binary.data(), type, length), "binary frame header decodes");
  Check(type == kBinaryFrameType, "binary frame type");
  Check(length == 4 + 7 + data.size(), "binary frame payload length");
  const std::uint8_t* payloadStart = binary.data() + kFrameHeaderBytes;
  const std::uint32_t identifierLength = static_cast<std::uint32_t>(payloadStart[0]) |
                                         (static_cast<std::uint32_t>(payloadStart[1]) << 8) |
                                         (static_cast<std::uint32_t>(payloadStart[2]) << 16) |
                                         (static_cast<std::uint32_t>(payloadStart[3]) << 24);
  Check(identifierLength == 7, "binary frame identifier length");
  Check(std::string(reinterpret_cast<const char*>(payloadStart + 4), identifierLength) == "image-1",
        "binary frame identifier");
  Check(std::equal(data.begin(), data.end(), payloadStart + 4 + identifierLength), "binary frame data");

  std::uint8_t corrupt[kFrameHeaderBytes] = {'F', 'D', 'R', '0'};
  Check(!DecodeFrameHeader(corrupt, type, length), "invalid magic is rejected");
  std::uint8_t reserved[kFrameHeaderBytes] = {'F', 'D', 'R', '1', kJsonFrameType, 1};
  Check(!DecodeFrameHeader(reserved, type, length), "nonzero reserved frame bytes are rejected");
  std::uint8_t oversized[kFrameHeaderBytes] = {'F', 'D', 'R', '1', kJsonFrameType};
  const std::uint32_t oversizedLength = kMaximumJsonFramePayload + 1;
  oversized[8] = static_cast<std::uint8_t>(oversizedLength & 0xffu);
  oversized[9] = static_cast<std::uint8_t>((oversizedLength >> 8) & 0xffu);
  oversized[10] = static_cast<std::uint8_t>((oversizedLength >> 16) & 0xffu);
  oversized[11] = static_cast<std::uint8_t>((oversizedLength >> 24) & 0xffu);
  Check(!DecodeFrameHeader(oversized, type, length), "oversized frame headers are rejected");
}

void TestJson() {
  const std::string document =
      R"({"a":1,"b":-2.5,"c":"x\ny\u00e9\ud83d\ude00","d":[true,false,null],"e":{"f":9007199254740991}})";
  const json::Value parsed = json::Value::Parse(document);
  Check(parsed.IsObject(), "json object parses");
  Check(parsed.NumberField("a", 0) == 1.0, "json integer field");
  Check(parsed.NumberField("b", 0) == -2.5, "json fractional field");
  Check(parsed.StringField("c").find("\n") == 1, "json escape decoding");
  Check(parsed.StringField("c").size() == 1 + 1 + 1 + 2 + 4, "json utf-8 encoding of escapes");
  const json::Value* list = parsed.Find("d");
  Check(list != nullptr && list->IsArray() && list->Items().size() == 3, "json array parses");
  Check(list->Items()[0].AsBool() && !list->Items()[1].AsBool() && list->Items()[2].IsNull(), "json literal values");

  const std::string reserialized = parsed.Serialize();
  const json::Value round = json::Value::Parse(reserialized);
  Check(round.StringField("c") == parsed.StringField("c"), "json round trip preserves text");
  Check(round.Serialize() == reserialized, "json serialization is stable");
  Check(reserialized.find("\"a\":1") != std::string::npos, "json integers avoid decimal noise");
  Check(reserialized.find("9007199254740991") != std::string::npos, "json preserves large integers");

  json::Value ordered = json::Value::Object();
  ordered.Set("z", json::Value::Integer(1));
  ordered.Set("a", json::Value::Integer(2));
  ordered.Set("z", json::Value::Integer(3));
  Check(ordered.Serialize() == R"({"z":3,"a":2})", "json preserves insertion order");

  bool rejected = false;
  try {
    json::Value::Parse("{\"a\":}");
  } catch (const HelperError& error) {
    rejected = std::string(error.code()) == kErrorInvalidRequest;
  }
  Check(rejected, "malformed json is rejected");
}

void TestGeometry() {
  Check(Deadline(0).Expired(), "zero-duration deadlines expire immediately");
  Check(std::fabs(DipsFromPhysical(150.0, 144) - 100.0) < 0.001, "physical to dips at 150 percent");
  Check(std::fabs(PhysicalFromDips(100.0, 192) - 200.0) < 0.001, "dips to physical at 200 percent");
  Check(std::fabs(DipsFromPhysical(PhysicalFromDips(37.5, 144), 144) - 37.5) < 0.001, "dip round trip");

  WindowMetrics metrics;
  metrics.dpi = 144;
  metrics.clientOrigin = POINT{300, 200};
  metrics.clientSize = SIZE{1200, 900};
  metrics.windowRect = RECT{292, 160, 1508, 1108};

  const RECT physical{420, 350, 660, 470};
  const RectD logical = PhysicalRectToClientDips(physical, metrics);
  Check(std::fabs(logical.x - 80.0) < 0.001, "element x is client relative");
  Check(std::fabs(logical.y - 100.0) < 0.001, "element y is client relative");
  Check(std::fabs(logical.width - 160.0) < 0.001, "element width is logical");
  Check(std::fabs(logical.height - 80.0) < 0.001, "element height is logical");

  const POINT center = ClientDipsToPhysicalPoint(logical.x + logical.width / 2, logical.y + logical.height / 2,
                                                 metrics);
  Check(center.x == (physical.left + physical.right) / 2, "center maps back to physical x");
  Check(center.y == (physical.top + physical.bottom) / 2, "center maps back to physical y");

  const RectD windowRect = ClientRectInScreenDips(metrics);
  Check(std::fabs(windowRect.x - 200.0) < 0.001 && std::fabs(windowRect.width - 800.0) < 0.001,
        "window rect uses logical client geometry");

  const RECT crop = IntersectRects(RECT{0, 0, 100, 100}, RECT{50, 50, 200, 200});
  Check(crop.left == 50 && crop.top == 50 && crop.right == 100 && crop.bottom == 100, "capture crop intersects");
  Check(IsEmptyRect(IntersectRects(RECT{0, 0, 10, 10}, RECT{20, 20, 30, 30})), "disjoint crop is empty");

  const POINT normalized = NormalizeToVirtualDesktop(POINT{0, 0}, RECT{0, 0, 1921, 1081});
  Check(normalized.x == 0 && normalized.y == 0, "virtual desktop origin normalizes to zero");
  const POINT corner = NormalizeToVirtualDesktop(POINT{1920, 1080}, RECT{0, 0, 1921, 1081});
  Check(corner.x == 65535 && corner.y == 65535, "virtual desktop corner normalizes to full scale");
}

void TestInputLedger() {
  Check(IsSingleWebDriverKeyValue(L"A"), "ASCII key values contain one code point");
  Check(IsSingleWebDriverKeyValue(L"\U0001F600"), "surrogate-pair key values contain one code point");
  Check(!IsSingleWebDriverKeyValue(L"AB") && !IsSingleWebDriverKeyValue(std::wstring(1, 0xd800)),
        "multi-code-point and unpaired-surrogate key values are rejected");

  recordedInputs.clear();
  InputController input;
  input.UseTestSender(&RecordInput);
  CancellationToken token;

  input.KeyDown(L"\uE008", token);
  input.KeyDown(L"\u4e2d", token);
  input.PointerDown(0, token);
  Check(input.DepressedKeyCount() == 2 && input.DepressedButtonCount() == 1, "ledger records depressed input");
  Check(recordedInputs.size() == 3, "ledger injected three down events");
  Check(recordedInputs[0].ki.wVk == VK_SHIFT, "special keys map to virtual keys");
  Check((recordedInputs[1].ki.dwFlags & KEYEVENTF_UNICODE) != 0 && recordedInputs[1].ki.wScan == 0x4e2d,
        "characters without an unmodified layout key inject unicode");
  constexpr DWORD kPositionedPress = MOUSEEVENTF_MOVE | MOUSEEVENTF_ABSOLUTE | MOUSEEVENTF_LEFTDOWN;
  Check(recordedInputs[2].type == INPUT_MOUSE && (recordedInputs[2].mi.dwFlags & kPositionedPress) == kPositionedPress,
        "pointer presses carry their coordinate");

  recordedInputs.clear();
  input.ReleaseAll();
  Check(!input.HasDepressedInput(), "release empties the ledger");
  Check(recordedInputs.size() == 3, "release emits one event per depressed input");
  Check(recordedInputs[0].type == INPUT_KEYBOARD && (recordedInputs[0].ki.dwFlags & KEYEVENTF_UNICODE) != 0,
        "release unwinds keys in reverse order");
  Check(recordedInputs[1].ki.wVk == VK_SHIFT && (recordedInputs[1].ki.dwFlags & KEYEVENTF_KEYUP) != 0,
        "modifier release carries the key-up flag");
  Check(recordedInputs[2].type == INPUT_MOUSE && (recordedInputs[2].mi.dwFlags & MOUSEEVENTF_LEFTUP) != 0,
        "pointer button is released last");

  recordedInputs.clear();
  input.KeyDown(L"b", token);
  input.KeyUp(L"b", token);
  Check(!input.HasDepressedInput(), "explicit key release clears the ledger");
  const WORD layoutKey = UnmodifiedLayoutKey(L'b');
  Check(recordedInputs.size() == 2 &&
            (layoutKey != 0 ? recordedInputs[0].ki.wVk == layoutKey &&
                                  (recordedInputs[0].ki.dwFlags & KEYEVENTF_UNICODE) == 0
                            : (recordedInputs[0].ki.dwFlags & KEYEVENTF_UNICODE) != 0) &&
            recordedInputs[1].ki.wVk == recordedInputs[0].ki.wVk && recordedInputs[1].ki.wScan == recordedInputs[0].ki.wScan,
        "characters with an unmodified layout key inject and release that key");

  input.PointerDown(0, token);
  recordedInputs.clear();
  input.PointerUp(0, token);
  constexpr DWORD kPositionedRelease = MOUSEEVENTF_MOVE | MOUSEEVENTF_ABSOLUTE | MOUSEEVENTF_LEFTUP;
  Check(recordedInputs.size() == 1 && (recordedInputs[0].mi.dwFlags & kPositionedRelease) == kPositionedRelease,
        "pointer releases carry their coordinate");
  Check(!input.HasDepressedInput(), "explicit pointer release clears the ledger");

  const std::vector<INPUT> click = MakeClickInputs(POINT{10, 20}, 0);
  Check(click.size() == 2 && (click[0].mi.dwFlags & kPositionedPress) == kPositionedPress &&
            (click[1].mi.dwFlags & kPositionedRelease) == kPositionedRelease && click[0].mi.dx == click[1].mi.dx &&
            click[0].mi.dy == click[1].mi.dy,
        "clicks press and release at one coordinate in one batch");

  recordedInputs.clear();
  input.PressChord({VK_CONTROL, 'A'}, token);
  Check(!input.HasDepressedInput(), "chords leave no depressed input");
  Check(recordedInputs.size() == 4, "chords press and release every key");
  Check(recordedInputs[0].ki.wVk == VK_CONTROL && (recordedInputs[0].ki.dwFlags & KEYEVENTF_KEYUP) == 0,
        "chords press modifiers first");
  Check(recordedInputs[3].ki.wVk == VK_CONTROL && (recordedInputs[3].ki.dwFlags & KEYEVENTF_KEYUP) != 0,
        "chords release modifiers last");

  recordedInputs.clear();
  input.TypeText(L"x", token);
  Check(!input.HasDepressedInput(), "typed text leaves no depressed input");
  Check(recordedInputs.size() == 2, "typed text emits one down and one up event");
  Check((recordedInputs[0].ki.dwFlags & KEYEVENTF_KEYUP) == 0 &&
            (recordedInputs[1].ki.dwFlags & KEYEVENTF_KEYUP) != 0,
        "typed text releases its ledgered key");

  recordedInputs.clear();
  input.TypeText(L"\n", token);
  Check(recordedInputs.size() == 2 && recordedInputs[0].ki.wVk == VK_RETURN &&
            recordedInputs[1].ki.wVk == VK_RETURN,
        "typed newlines use the recoverable WebDriver Return key");

  WORD virtualKey = 0;
  bool extended = false;
  Check(TryMapWebDriverKey(L"\uE012", virtualKey, extended) && virtualKey == VK_LEFT && extended,
        "arrow keys are extended keys");
  Check(!TryMapWebDriverKey(L"a", virtualKey, extended), "printable characters are not special keys");
}

void TestSnapshotShape() {
  ElementSnapshot snapshot;
  snapshot.id = "element-1";
  snapshot.automationId = "button-primary";
  snapshot.name = "Primary";
  snapshot.role = "button";
  snapshot.windowId = "window-1";
  snapshot.parentId = "element-0";
  snapshot.scope = ElementScope::Preview;
  snapshot.rect = RectD{10.0, 20.0, 120.0, 40.0};
  snapshot.enabled = SupportedBool{true, true, {}};
  snapshot.focused = SupportedBool{true, false, {}};
  snapshot.visible = SupportedBool{true, true, {}};
  snapshot.selected = SupportedBool{false, false, "no selection pattern"};
  snapshot.expanded = SupportedBool{false, false, "leaf"};
  snapshot.checked = SupportedChecked{true, CheckedValue::Mixed, {}};

  const std::string serialized = SerializeSnapshot(snapshot).Serialize();
  Check(serialized.find(R"("scope":"preview")") != std::string::npos, "snapshot serializes its scope");
  Check(serialized.find(R"("checked":{"supported":true,"value":"mixed"})") != std::string::npos,
        "mixed checked state serializes as a string");
  Check(serialized.find(R"("selected":{"supported":false,"reason":"no selection pattern"})") != std::string::npos,
        "unsupported state keeps its reason");
  Check(serialized.find(R"("required":{"supported":false,"reason":)") != std::string::npos,
        "unknown required-form state is unsupported, not false");
  for (const bool required : {false, true}) {
    snapshot.required = SupportedBool{true, required, {}};
    const std::string state = required ? R"("required":{"supported":true,"value":true})"
                                       : R"("required":{"supported":true,"value":false})";
    Check(SerializeSnapshot(snapshot).Serialize().find(state) != std::string::npos,
          required ? "required-form true is retained" : "required-form false is retained");
  }
  Check(serialized.find(R"("text")") == std::string::npos, "absent optional text is omitted");
  Check(serialized.find(R"("helpText":{"supported":false,"reason":)") != std::string::npos,
        "unknown help text is unsupported, not empty");
  snapshot.helpText = SupportedString{true, "", {}};
  Check(SerializeSnapshot(snapshot).Serialize().find(R"("helpText":{"supported":true,"value":""})") != std::string::npos,
        "an explicitly empty help text is retained");
  snapshot.helpText.value = "Accessible hint";
  Check(SerializeSnapshot(snapshot).Serialize().find(R"("helpText":{"supported":true,"value":"Accessible hint"})") !=
            std::string::npos,
        "help text is retained");
  Check(serialized.find(R"("rect":{"height":40,"width":120,"x":10,"y":20})") != std::string::npos,
        "rect serializes logical geometry");
  Check(serialized.find(R"("parentId":"element-0")") != std::string::npos, "parent identifier is exposed");
  Check(serialized.find("element-1") != std::string::npos && serialized.find("0x") == std::string::npos,
        "identifiers stay opaque");

  Check(NormalizeRoleQuery(" Edit ") == "textbox", "role aliases normalize");
  Check(RoleForControlType(UIA_CheckBoxControlTypeId) == "checkbox", "control types map to roles");

  Selector byTestId{"accessibility id", "button-primary"};
  Selector byRole{"tag name", "Button"};
  Selector byName{"link text", "Primary"};
  Selector byPartialName{"partial link text", "rima"};
  Selector byText{"-furn:text", "Primary"};
  Check(MatchesSelector(snapshot, byTestId), "accessibility id matches the automation id");
  Check(MatchesSelector(snapshot, byRole), "tag name matches the normalized role");
  Check(MatchesSelector(snapshot, byName), "link text matches the accessible name");
  Check(MatchesSelector(snapshot, byPartialName), "partial link text matches a substring");
  Check(MatchesSelector(snapshot, byText), "-furn:text falls back to the accessible name");
  Check(!MatchesSelector(snapshot, Selector{"accessibility id", "other"}), "non-matching selectors are rejected");

  ElementSnapshot root = snapshot;
  root.parentId.clear();
  ElementSnapshot child = root;
  child.id = "element-2";
  child.parentId = root.id;
  child.automationId = "child&<id";
  child.name = "\"child\"";
  child.role = "text";
  child.hasText = true;
  child.text = "ignored by source attributes";
  Automation automation;
  const std::string source = automation.SerializeSourceXml({root, child});
  Check(source.find(R"(automationId="child&amp;&lt;id")") != std::string::npos,
        "source XML escapes automation identifiers");
  Check(source.find(R"(name="&quot;child&quot;")") != std::string::npos, "source XML escapes names");
  Check(source.find("element-2") == std::string::npos, "source XML does not expose native element identifiers");
}

void TestLeaseIdentity() {
  Check(!ReadProcessImagePath(GetCurrentProcess()).empty(), "process image paths are readable");
  Check(QuoteWindowsCommandLineArgument(L"") == L"\"\"", "empty command-line arguments are preserved");
  Check(QuoteWindowsCommandLineArgument(L"plain") == L"\"plain\"", "plain command-line arguments are quoted");
  Check(QuoteWindowsCommandLineArgument(L"two words") == L"\"two words\"",
        "command-line arguments preserve spaces");
  Check(QuoteWindowsCommandLineArgument(L"a\"b") == L"\"a\\\"b\"",
        "command-line arguments escape embedded quotes");
  Check(QuoteWindowsCommandLineArgument(L"C:\\path\\") == L"\"C:\\path\\\\\"",
        "command-line arguments double trailing backslashes");

  FILETIME parsed{};
  Check(TryParseIso8601("2026-08-31T21:59:59.1234567Z", parsed), "lease timestamps parse");
  Check(FormatFileTimeIso8601(parsed) == "2026-08-31T21:59:59.1234567Z", "lease timestamps round trip");
  FILETIME offset{};
  Check(TryParseIso8601("2026-08-31T23:59:59.0000000+02:00", offset), "offset timestamps parse");
  Check(FileTimeTicks(offset) == FileTimeTicks(parsed) - 1234567, "offset timestamps normalize to UTC");
  Check(!TryParseIso8601("not-a-timestamp", parsed), "invalid timestamps are rejected");

  ApplicationManager applications;
  CancellationToken token;
  for (const double timeout : {0.0, -1.0, 0.5, 2147483648.0}) {
    json::Value request = json::Value::Parse(R"({"application":{"executablePath":"unused.exe","windowTitle":"self-test"}})");
    request.Set("launchTimeoutMs", json::Value::Number(timeout));
    bool rejected = false;
    try {
      applications.Launch(request, token);
    } catch (const HelperError& error) {
      rejected = std::string(error.code()) == kErrorInvalidParams;
    }
    Check(rejected, "invalid launch deadlines are rejected before application side effects");
  }
  bool titleOnlyRejected = false;
  try {
    applications.Attach(json::Value::Parse(R"({"application":{"windowTitle":"self-test"}})"), token);
  } catch (const HelperError& error) {
    titleOnlyRejected = std::string(error.code()) == kErrorInvalidParams;
  }
  Check(titleOnlyRejected, "unleased title-only attach is rejected");
}

void TestHello() {
  const json::Value hello = CreateHello();
  Check(hello.StringField("type") == "hello", "hello announces its type");
  Check(hello.StringField("provider") == "windows" && hello.StringField("architecture") == "x64",
        "hello reports the provider identity");
  Check(!hello.StringField("buildId").empty() && !hello.StringField("sourceDigest").empty(),
        "hello carries the generated build identity");
  const json::Value* protocol = hello.Find("protocol");
  Check(protocol != nullptr && protocol->NumberField("major", 0) == 1, "hello reports the wire protocol");
  const json::Value* features = hello.Find("features");
  const bool announcesEvents =
      features != nullptr && std::any_of(features->Items().begin(), features->Items().end(),
                                         [](const json::Value& feature) { return feature.AsString() == "windowEvents"; });
  Check(announcesEvents, "hello announces window event support");
  const bool announcesObservation =
      features != nullptr &&
      std::any_of(features->Items().begin(), features->Items().end(),
                  [](const json::Value& feature) { return feature.AsString() == "boundedObservation"; });
  Check(announcesObservation, "hello announces bounded observation");
  const bool announcesStrictClear =
      features != nullptr &&
      std::any_of(features->Items().begin(), features->Items().end(),
                  [](const json::Value& feature) { return feature.AsString() == "strictClear"; });
  Check(announcesStrictClear, "hello announces strict clear");
}

void TestReleaseLedger() {
  const auto parse = [](const std::string& document) { return ParseReleaseLedger(json::Value::Parse(document)); };
  const auto rejects = [&parse](const std::string& document, const std::string& label) {
    bool rejected = false;
    try {
      parse(document);
    } catch (const HelperError& error) {
      rejected = error.code() == kErrorInvalidParams || error.code() == kErrorInvalidRequest;
    }
    Check(rejected, label);
  };

  const ReleaseLedger parsed = parse(R"({"keys":["a","\uE008"],"buttons":[0,2]})");
  Check(parsed.keys.size() == 2 && parsed.keys[0] == L"a" && parsed.keys[1] == L"\uE008",
        "ledger parses webdriver key values in order");
  Check(parsed.buttons.size() == 2 && parsed.buttons[0] == 0 && parsed.buttons[1] == 2,
        "ledger parses pointer buttons in order");
  Check(parse("{}").empty() && parse(R"({"keys":[],"buttons":[]})").empty(), "an empty ledger parses");

  rejects("[]", "a non-object ledger is rejected");
  rejects(R"({"keys":"a"})", "a non-array key list is rejected");
  rejects(R"({"keys":[1]})", "a non-string key is rejected");
  rejects(R"({"keys":["ab"]})", "a multi-character key value is rejected");
  rejects(R"({"keys":[""]})", "an empty key value is rejected");
  rejects(R"({"buttons":2})", "a non-array button list is rejected");
  rejects(R"({"buttons":["0"]})", "a non-numeric button is rejected");
  rejects(R"({"buttons":[1.5]})", "a fractional button is rejected");
  rejects(R"({"buttons":[9]})", "an out-of-range button is rejected");
  rejects(R"({"buttons":[-1]})", "a negative button is rejected");
  rejects(R"({"keys":[],"extra":1})", "an unknown ledger field is rejected");
  rejects(R"({"keys":[)", "malformed ledger json is rejected");

  InputController empty;
  const ReleaseCounts nothing = empty.ReleaseExact(parse("{}"));
  Check(nothing.keys == 0 && nothing.buttons == 0, "an empty ledger releases nothing");

  recordedInputs.clear();
  InputController input;
  input.UseTestSender(&RecordInput);
  const ReleaseCounts released = input.ReleaseExact(parse(R"({"keys":["\uE008","\u4e2d"],"buttons":[0,1,2]})"));
  Check(released.keys == 2 && released.buttons == 3, "ledger release reports its counts");
  Check(recordedInputs.size() == 5, "ledger release emits one event per entry");
  Check(recordedInputs[0].type == INPUT_KEYBOARD && (recordedInputs[0].ki.dwFlags & KEYEVENTF_UNICODE) != 0 &&
            recordedInputs[0].ki.wScan == 0x4e2d && (recordedInputs[0].ki.dwFlags & KEYEVENTF_KEYUP) != 0,
        "ledger releases keys in reverse order");
  Check(recordedInputs[1].ki.wVk == VK_SHIFT && (recordedInputs[1].ki.dwFlags & KEYEVENTF_KEYUP) != 0,
        "ledger releases special keys with their virtual key");
  Check((recordedInputs[2].mi.dwFlags & MOUSEEVENTF_RIGHTUP) != 0, "ledger releases buttons in reverse order");
  Check((recordedInputs[3].mi.dwFlags & MOUSEEVENTF_MIDDLEUP) != 0, "ledger releases the middle button");
  Check((recordedInputs[4].mi.dwFlags & MOUSEEVENTF_LEFTUP) != 0, "ledger releases the left button last");

  recordedInputs.clear();
  input.ReleaseExact(parse(R"({"keys":["\uE012"]})"));
  Check(recordedInputs.size() == 1 && recordedInputs[0].ki.wVk == VK_LEFT &&
            (recordedInputs[0].ki.dwFlags & KEYEVENTF_EXTENDEDKEY) != 0 &&
            (recordedInputs[0].ki.dwFlags & KEYEVENTF_KEYUP) != 0,
        "ledger releases extended keys with the extended flag");

  recordedInputs.clear();
  input.ReleaseExact(parse(R"({"keys":["\u00e9"]})"));
  Check(recordedInputs.size() == 1 && (recordedInputs[0].ki.dwFlags & KEYEVENTF_UNICODE) != 0 &&
            recordedInputs[0].ki.wScan == 0x00e9,
        "ledger releases printable unicode as a unicode scan code");

  recordedInputs.clear();
  input.ReleaseExact(parse(R"({"keys":["\ud83d\ude00"]})"));
  Check(recordedInputs.size() == 2, "a supplementary code point releases both code units");
  Check(recordedInputs[0].ki.wScan == 0xde00 && recordedInputs[1].ki.wScan == 0xd83d,
        "surrogate pairs release in reverse code unit order");

  recordedInputs.clear();
  const ReleaseCounts buttonsOnly = input.ReleaseExact(parse(R"({"buttons":[3,4]})"));
  Check(buttonsOnly.buttons == 2 && recordedInputs.size() == 2, "extended buttons release exactly");
  Check(recordedInputs[0].mi.mouseData == XBUTTON2 && recordedInputs[1].mi.mouseData == XBUTTON1,
        "extended buttons carry their button data");
  Check(!input.HasDepressedInput(), "ledger release never adds to the local ledger");
}

void TestPhysicalInputLock() {
  SetPhysicalInputMutexNameForTesting(L"Local\\FurnDesktopDriverPhysicalInputSelfTest-" +
                                      std::to_wstring(GetCurrentProcessId()));
  Check(std::wstring(PhysicalInputMutexName()).find(std::to_wstring(GetCurrentProcessId())) != std::wstring::npos,
        "self-test uses an isolated physical input mutex");
  // Every acquisition attempt runs on its own thread because the mutex is
  // owned per thread, so this exercises real cross-owner exclusion without
  // injecting input.
  const auto acquireElsewhere = [](unsigned int timeoutMs, AbandonPolicy policy = AbandonPolicy::Fail) {
    std::string outcome = "unknown";
    std::thread worker([&outcome, timeoutMs, policy]() {
      const CancellationToken token;
      try {
        const PhysicalInputScope scope(token, timeoutMs, policy);
        outcome = scope.owns() ? "acquired" : "unowned";
      } catch (const HelperError& error) {
        outcome = error.code();
      } catch (const CancelledError&) {
        outcome = "cancelled";
      }
    });
    worker.join();
    return outcome;
  };

  const CancellationToken token;
  Check(acquireElsewhere(500) == "acquired", "an idle physical input mutex is available");

  {
    const PhysicalInputScope outer(token, 1000);
    Check(outer.owns() && !outer.nested(), "the first scope owns the physical input mutex");
    Check(acquireElsewhere(200) == kErrorInputBusy, "a busy physical input mutex reports input-busy");
    {
      const PhysicalInputScope inner(token, 1000);
      Check(inner.owns() && inner.nested(), "a nested scope reuses the owned mutex");
      Check(acquireElsewhere(200) == kErrorInputBusy, "nesting keeps other owners out");
    }
    Check(acquireElsewhere(200) == kErrorInputBusy, "releasing a nested scope keeps the mutex held");

    std::string cancelledOutcome = "unknown";
    std::thread waiter([&cancelledOutcome]() {
      CancellationToken cancelled;
      cancelled.Cancel();
      try {
        const PhysicalInputScope scope(cancelled, 30000);
        cancelledOutcome = "acquired";
      } catch (const CancelledError&) {
        cancelledOutcome = "cancelled";
      } catch (const HelperError& error) {
        cancelledOutcome = error.code();
      }
    });
    waiter.join();
    Check(cancelledOutcome == "cancelled", "a cancelled wait stops instead of hanging");
  }
  Check(acquireElsewhere(1000) == "acquired", "scope destruction releases the mutex");

  {
    PhysicalInputScope moved(token, 500);
    Check(moved.owns(), "a scope can be acquired for a move");
    const PhysicalInputScope adopted(std::move(moved));
    Check(adopted.owns() && !moved.owns(), "moving a scope transfers ownership exactly once");
    Check(acquireElsewhere(200) == kErrorInputBusy, "a moved scope still holds the mutex");
  }
  Check(acquireElsewhere(500) == "acquired", "a moved scope releases once");

  // A thread that exits while owning the mutex abandons it, which is exactly
  // what a helper crash looks like to the next owner.
  std::thread abandoner([]() {
    const HANDLE handle = CreateMutexW(nullptr, FALSE, PhysicalInputMutexName());
    if (handle != nullptr) {
      WaitForSingleObject(handle, 1000);
      CloseHandle(handle);
    }
  });
  abandoner.join();
  Check(acquireElsewhere(500) == kErrorInputBusy, "an abandoned mutex reports input-busy");
  Check(acquireElsewhere(500) == "acquired", "the reported abandonment leaves the mutex usable");

  std::thread secondAbandoner([]() {
    const HANDLE handle = CreateMutexW(nullptr, FALSE, PhysicalInputMutexName());
    if (handle != nullptr) {
      WaitForSingleObject(handle, 1000);
      CloseHandle(handle);
    }
  });
  secondAbandoner.join();
  Check(acquireElsewhere(500, AbandonPolicy::Adopt) == "acquired", "recovery adopts an abandoned mutex");
  Check(acquireElsewhere(500) == "acquired", "adoption releases the mutex when recovery finishes");
}

// Manual-reset event that outlives the stalled worker which waits on it.
struct Gate {
  HANDLE event{CreateEventW(nullptr, TRUE, FALSE, nullptr)};
  ~Gate() { CloseHandle(event); }
  Gate() = default;
  Gate(const Gate&) = delete;
  Gate& operator=(const Gate&) = delete;
  void Open() const { SetEvent(event); }
  HRESULT Hold() const {
    WaitForSingleObject(event, 10000);
    return S_OK;
  }
};

void TestMutationSettlement() {
  ResetMutationQuarantineForTesting();
  Check(!MutationsQuarantined(), "a fresh session has no unsettled mutation");

  const auto outcome = [](ProviderCall kind, std::function<HRESULT()> call, DWORD timeoutMs) {
    try {
      const HRESULT result =
          RunBoundedProviderCall(kind, std::move(call), timeoutMs, "Testing the provider", kErrorAutomationFailed);
      return std::string(SUCCEEDED(result) ? "completed" : "failed");
    } catch (const HelperError& error) {
      return std::string(error.code());
    }
  };
  const auto refusalMessage = []() {
    try {
      RequireMutationsAllowed();
    } catch (const HelperError& error) {
      return std::string(error.code()) + ": " + error.what();
    }
    return std::string("allowed");
  };

  Check(outcome(ProviderCall::Mutation, []() { return S_OK; }, 1000) == "completed",
        "a settled mutation reports its result");
  Check(outcome(ProviderCall::Mutation, []() { return E_FAIL; }, 1000) == "failed",
        "a rejected mutation reports its failure");
  Check(!MutationsQuarantined(), "settled mutations never quarantine the session");

  const auto readGate = std::make_shared<Gate>();
  Check(outcome(ProviderCall::Read, [readGate]() { return readGate->Hold(); }, 50) == kErrorAutomationFailed,
        "a stalled read fails with the caller's error code");
  Check(!MutationsQuarantined(), "a stalled read does not quarantine the session");
  readGate->Open();

  const auto mutationGate = std::make_shared<Gate>();
  Check(outcome(ProviderCall::Mutation, [mutationGate]() { return mutationGate->Hold(); }, 50) ==
            kErrorMutationIndeterminate,
        "a stalled mutation reports an indeterminate effect");
  Check(MutationsQuarantined(), "a stalled mutation quarantines the session");

  const auto laterRan = std::make_shared<std::atomic<bool>>(false);
  Check(outcome(ProviderCall::Mutation, [laterRan]() {
          laterRan->store(true);
          return S_OK;
        }, 1000) == kErrorTargetQuarantined,
        "a later mutation is refused while quarantined");
  Check(!laterRan->load(), "a refused mutation never reaches the provider");
  Check(outcome(ProviderCall::Read, []() { return S_OK; }, 1000) == "completed",
        "reads stay available for re-observation while quarantined");
  Check(refusalMessage().find("target-quarantined: ") == 0 && refusalMessage().find("still pending") != std::string::npos,
        "the refusal reports the pending operation");

  Driver driver;
  const CancellationToken token;
  for (const char* command : {"click", "clear", "sendKeys", "performActions", "activate", "setWindowRect"}) {
    std::string code = "none";
    std::optional<MutationEffect> effect;
    try {
      driver.Execute(command, json::Value::Object(), token);
    } catch (const HelperError& error) {
      code = error.code();
      effect = error.effect();
    }
    Check(code == kErrorTargetQuarantined && effect == MutationEffect::None,
          std::string("the ") + command + " command is refused while quarantined, with no effect");
  }
  std::string readCode = "none";
  try {
    driver.Execute("getWindowRect", json::Value::Object(), token);
  } catch (const HelperError& error) {
    readCode = error.code();
  }
  Check(readCode == kErrorInvalidParams, "window reads are not blocked by the quarantine");

  mutationGate->Open();
  std::string settled = refusalMessage();
  for (int attempt = 0; attempt < 100 && settled.find("completed late") == std::string::npos; attempt += 1) {
    Sleep(20);
    settled = refusalMessage();
  }
  Check(settled.find("completed late") != std::string::npos,
        "a late completion is reported but does not clear the quarantine");
  Check(MutationsQuarantined(), "the quarantine outlives the late completion");

  ResetMutationQuarantineForTesting();
  Check(outcome(ProviderCall::Mutation, []() { return S_OK; }, 1000) == "completed",
        "mutations run again after the session is reset");

  // A provider that reports its own timeout may still apply the mutation later.
  for (const HRESULT timeout : {kUiaTimeoutResult, RPC_E_TIMEOUT, HRESULT_FROM_WIN32(ERROR_TIMEOUT)}) {
    ResetMutationQuarantineForTesting();
    Check(outcome(ProviderCall::Read, [timeout]() { return timeout; }, 1000) == "failed" && !MutationsQuarantined(),
          "a timeout reported by a read is an ordinary failure that never quarantines");
    Check(outcome(ProviderCall::Mutation, [timeout]() { return timeout; }, 1000) == kErrorMutationIndeterminate,
          "a mutation that the provider reports as timed out is indeterminate");
    Check(MutationsQuarantined(), "a provider-reported mutation timeout quarantines the session");
  }
  const std::string providerTimeout = refusalMessage();
  Check(providerTimeout.find("target-quarantined: ") == 0 && providerTimeout.find("timed out in the provider") !=
                                                                 std::string::npos &&
            providerTimeout.find("did not settle within") == std::string::npos,
        "the refusal after a provider timeout names the provider rather than the helper bound");

  ResetMutationQuarantineForTesting();
  Check(outcome(ProviderCall::Mutation, []() { return static_cast<HRESULT>(0x80040200); }, 1000) == "failed" &&
            !MutationsQuarantined(),
        "a mutation that is rejected as not enabled settles without quarantine");

  // A stalled mutation is recorded against the lease scope active on its thread,
  // and only a release for that lease ends the quarantine.
  const auto stallUnder = [&](const std::string& leaseId) {
    ResetMutationQuarantineForTesting();
    const auto gate = std::make_shared<Gate>();
    const MutationScope scope(leaseId);
    const std::string code = outcome(ProviderCall::Mutation, [gate]() { return gate->Hold(); }, 50);
    gate->Open();
    return code;
  };
  Check(stallUnder("lease-a") == kErrorMutationIndeterminate && MutationsQuarantined(),
        "a mutation stalled under a lease scope quarantines the session");
  ReleaseMutationQuarantine("lease-b");
  ReleaseMutationQuarantine("");
  Check(MutationsQuarantined(), "another lease's release and an empty lease id leave the quarantine in place");
  ReleaseMutationQuarantine("lease-a");
  Check(!MutationsQuarantined() && outcome(ProviderCall::Mutation, []() { return S_OK; }, 1000) == "completed",
        "releasing the lease that raised the quarantine lets mutations run again");

  Check(stallUnder("") == kErrorMutationIndeterminate && MutationsQuarantined(),
        "a mutation stalled without a lease scope still quarantines the session");
  ReleaseMutationQuarantine("lease-a");
  ReleaseMutationQuarantine("");
  Check(MutationsQuarantined(), "a mutation recorded without a lease is never released by a close");

  ResetMutationQuarantineForTesting();
  {
    const MutationScope outer("lease-outer");
    {
      const MutationScope inner("lease-inner");
    }
    const auto gate = std::make_shared<Gate>();
    Check(outcome(ProviderCall::Mutation, [gate]() { return gate->Hold(); }, 50) == kErrorMutationIndeterminate,
          "a mutation stalls after an inner scope ended");
    gate->Open();
  }
  ReleaseMutationQuarantine("lease-inner");
  Check(MutationsQuarantined(), "a finished inner scope does not claim a later mutation");
  ReleaseMutationQuarantine("lease-outer");
  Check(!MutationsQuarantined(), "the outer scope is restored when an inner scope ends");
  ResetMutationQuarantineForTesting();
}

void TestHresultDescriptions() {
  const std::string timeout = DescribeHresult(kUiaTimeoutResult);
  Check(timeout.find("did not respond") != std::string::npos && timeout.find("(0x80131505)") != std::string::npos,
        "a UI Automation timeout is described with its hexadecimal code");
  const std::string disabled = DescribeHresult(static_cast<HRESULT>(0x80040200));
  Check(disabled.find("not enabled") != std::string::npos && disabled.find("(0x80040200)") != std::string::npos,
        "a disabled UI Automation element is named");
  const std::string invalid = DescribeHresult(static_cast<HRESULT>(0x80131509));
  Check(invalid.find("allows the operation") != std::string::npos, "an invalid UI Automation operation is named");
  const std::string system = DescribeHresult(E_ACCESSDENIED);
  Check(system.find("(0x80070005)") != std::string::npos && system.size() > std::string("(0x80070005)").size(),
        "other failures keep the system message text with the code appended");
  const std::string unknown = DescribeHresult(static_cast<HRESULT>(0x8ABC0001));
  Check(unknown.find("0x8ABC0001") != std::string::npos, "an unknown failure still reports its code");
}

constexpr UINT kWindowTask = WM_APP + 1;

HWND FakeWindow(std::uintptr_t value) {
  return reinterpret_cast<HWND>(value);
}

WindowNotification Notification(DWORD processId, DWORD event, HWND window) {
  WindowNotification notification;
  notification.processId = processId;
  notification.event = event;
  notification.window = window;
  return notification;
}

const std::vector<json::Value>& EventsOf(const json::Value& log) {
  static const std::vector<json::Value> none;
  const json::Value* events = log.Find("events");
  return events == nullptr ? none : events->Items();
}

int CountEvents(const json::Value& log, const std::string& notification, const std::string& windowId) {
  int count = 0;
  for (const json::Value& event : EventsOf(log)) {
    if (event.StringField("notification") == notification && event.StringField("windowId") == windowId) {
      count += 1;
    }
  }
  return count;
}

int CountHandleEvents(const json::Value& log, const std::string& notification, HWND window) {
  int count = 0;
  for (const json::Value& event : EventsOf(log)) {
    if (event.StringField("notification") == notification &&
        event.StringField("element") == DescribeWindowHandle(window)) {
      count += 1;
    }
  }
  return count;
}

// The helper error code a call fails with, or "none" when it succeeds.
std::string FailureCode(const std::function<void()>& call, std::string* message = nullptr) {
  try {
    call();
  } catch (const HelperError& error) {
    if (message != nullptr) {
      *message = error.what();
    }
    return error.code();
  }
  return "none";
}

// The `effect` a failed or cancelled call reports: "absent" when it reports
// none, and "succeeded" when the call does not fail. `code` receives the error
// code, "cancelled", or "none".
std::string FailureEffect(const std::function<void()>& call, std::string* code = nullptr) {
  const auto name = [](const std::optional<MutationEffect>& effect) {
    return effect ? std::string(MutationEffectName(*effect)) : std::string("absent");
  };
  std::string failure = "none";
  std::string effect = "succeeded";
  try {
    call();
  } catch (const CancelledError& cancelled) {
    failure = "cancelled";
    effect = name(cancelled.effect());
  } catch (const HelperError& error) {
    failure = error.code();
    effect = name(error.effect());
  }
  if (code != nullptr) {
    *code = failure;
  }
  return effect;
}

// WinEvent callbacks reach the monitor asynchronously, so tests poll for them.
bool WaitFor(const std::function<bool()>& condition, DWORD timeoutMs = 3000) {
  const ULONGLONG deadline = GetTickCount64() + timeoutMs;
  while (!condition()) {
    if (GetTickCount64() >= deadline) {
      return condition();
    }
    Sleep(10);
  }
  return true;
}

void RegisterTestWindowClass(const wchar_t* name, WNDPROC procedure = DefWindowProcW) {
  WNDCLASSEXW windowClass{};
  windowClass.cbSize = sizeof(windowClass);
  windowClass.lpfnWndProc = procedure;
  windowClass.hInstance = GetModuleHandleW(nullptr);
  windowClass.lpszClassName = name;
  RegisterClassExW(&windowClass);  // A repeated registration is harmless.
}

// Counts the notifications controls send their parent, which is how a test sees
// that an accessibility click reached a button.
std::atomic<int> commandNotifications{0};
// Clicks of the control with id 101, ignoring other controls' notifications.
std::atomic<int> buttonClicks{0};

LRESULT CALLBACK CountingWindowProc(HWND window, UINT message, WPARAM wparam, LPARAM lparam) {
  if (message == WM_COMMAND) {
    commandNotifications.fetch_add(1);
    if (LOWORD(wparam) == 101 && HIWORD(wparam) == BN_CLICKED) {
      buttonClicks.fetch_add(1);
    }
  }
  return DefWindowProcW(window, message, wparam, lparam);
}

// While a gate is set, writing an edit control's text holds its window thread,
// so a value write through UI Automation never settles.
std::mutex editGateMutex;
std::shared_ptr<Gate> editGate;
WNDPROC originalEditProc = nullptr;

void SetEditGate(std::shared_ptr<Gate> gate) {
  const std::lock_guard<std::mutex> guard(editGateMutex);
  editGate = std::move(gate);
}

LRESULT CALLBACK GatedEditProc(HWND window, UINT message, WPARAM wparam, LPARAM lparam) {
  if (message == WM_SETTEXT) {
    std::shared_ptr<Gate> gate;
    {
      const std::lock_guard<std::mutex> guard(editGateMutex);
      gate = editGate;
    }
    if (gate != nullptr) {
      gate->Hold();
    }
  }
  return CallWindowProcW(originalEditProc, window, message, wparam, lparam);
}

// A thread with its own message loop that owns real top-level windows, so the
// tests create and destroy windows the way an application does. Windows are
// offscreen and never activate, so a test cannot move focus or show UI.
class WindowThread {
 public:
  WindowThread() {
    thread_ = std::thread([this]() {
      MSG message{};
      PeekMessageW(&message, nullptr, WM_USER, WM_USER, PM_NOREMOVE);
      threadId_.store(GetCurrentThreadId());
      started_.Open();
      while (GetMessageW(&message, nullptr, 0, 0) > 0) {
        if (message.hwnd == nullptr && message.message == kWindowTask) {
          RunTasks();
          continue;
        }
        TranslateMessage(&message);
        DispatchMessageW(&message);
      }
    });
    started_.Hold();
  }

  ~WindowThread() {
    PostThreadMessageW(threadId_.load(), WM_QUIT, 0, 0);
    thread_.join();
  }

  WindowThread(const WindowThread&) = delete;
  WindowThread& operator=(const WindowThread&) = delete;

  HWND Create(const wchar_t* className, const wchar_t* title, WNDPROC procedure = DefWindowProcW) {
    HWND window = nullptr;
    Run([&window, className, title, procedure]() {
      RegisterTestWindowClass(className, procedure);
      window = CreateWindowExW(WS_EX_NOACTIVATE | WS_EX_TOOLWINDOW, className, title, WS_POPUP, -32000, -32000, 64, 64,
                               nullptr, nullptr, GetModuleHandleW(nullptr), nullptr);
      if (window != nullptr) {
        ShowWindow(window, SW_SHOWNOACTIVATE);
      }
    });
    return window;
  }

  HWND CreateChild(HWND parent, const wchar_t* className, const wchar_t* text, int controlId, DWORD style = 0) {
    HWND child = nullptr;
    Run([&child, parent, className, text, controlId, style]() {
      child = CreateWindowExW(0, className, text, WS_CHILD | WS_VISIBLE | style, 4, 4, 48, 24, parent,
                              reinterpret_cast<HMENU>(static_cast<INT_PTR>(controlId)), GetModuleHandleW(nullptr),
                              nullptr);
    });
    return child;
  }

  void Destroy(HWND window) {
    Run([window]() { DestroyWindow(window); });
  }

  // Blocks the thread until `gate` opens, so its windows stop answering, and
  // returns once the thread is blocked.
  void Stall(const std::shared_ptr<Gate>& gate) {
    const auto blocked = std::make_shared<Gate>();
    {
      const std::lock_guard<std::mutex> guard(mutex_);
      tasks_.push_back([gate, blocked]() {
        blocked->Open();
        gate->Hold();
      });
    }
    PostThreadMessageW(threadId_.load(), kWindowTask, 0, 0);
    blocked->Hold();
  }

 private:
  void Run(std::function<void()> task) {
    const auto finished = std::make_shared<Gate>();
    {
      const std::lock_guard<std::mutex> guard(mutex_);
      tasks_.push_back([task = std::move(task), finished]() {
        task();
        finished->Open();
      });
    }
    PostThreadMessageW(threadId_.load(), kWindowTask, 0, 0);
    finished->Hold();
  }

  void RunTasks() {
    while (true) {
      std::function<void()> task;
      {
        const std::lock_guard<std::mutex> guard(mutex_);
        if (tasks_.empty()) {
          return;
        }
        task = std::move(tasks_.front());
        tasks_.pop_front();
      }
      task();
    }
  }

  std::mutex mutex_;
  std::deque<std::function<void()>> tasks_;
  std::atomic<DWORD> threadId_{0};
  Gate started_;
  std::thread thread_;
};

void TestBoundedText() {
  Check(BoundedText("short", 16) == "short", "text within the bound is kept whole");
  const std::string ascii = BoundedText(std::string(64, 'a'), 16);
  Check(ascii.size() == 16 && ascii.compare(13, 3, "...") == 0, "long text is cut inside the bound with a marker");
  Check(BoundedText("abcdef", 2).size() <= 2, "a bound smaller than the marker still holds");

  // "é" is two bytes, so a cut between them would leave invalid UTF-8.
  std::string accented;
  for (int index = 0; index < 20; index += 1) {
    accented += "\xC3\xA9";
  }
  bool wholeCharacters = true;
  for (std::size_t limit = 3; limit < accented.size(); limit += 1) {
    const std::string bounded = BoundedText(accented, limit);
    const bool marked = bounded.size() >= 3 && bounded.compare(bounded.size() - 3, 3, "...") == 0;
    wholeCharacters = wholeCharacters && bounded.size() <= limit && marked && (bounded.size() - 3) % 2 == 0;
  }
  Check(wholeCharacters, "text is cut on a UTF-8 code point boundary within the bound");
}

void TestCommandJournal() {
  CommandJournal journal;
  json::Value detail = json::Value::Object();
  detail.Set("windowId", json::Value::String(std::string("window-1")));
  const std::uint64_t first = journal.Begin("click", detail);
  json::Value commands = journal.Diagnostic();
  Check(commands.Items().size() == 1 && commands.Items()[0].StringField("outcome") == "running" &&
            !commands.Items()[0].Has("durationMs"),
        "a started command is reported as running");

  Sleep(15);
  json::Value result = json::Value::Object();
  result.Set("elementId", json::Value::String(std::string("element-1")));
  journal.Finish(first, "ok", result);
  commands = journal.Diagnostic();
  const json::Value* finished = commands.Items().empty() ? nullptr : &commands.Items()[0];
  Check(finished != nullptr && finished->StringField("outcome") == "ok" &&
            finished->NumberField("durationMs", -1) >= 10,
        "a finished command reports its outcome and duration");
  const json::Value* kept = finished == nullptr ? nullptr : finished->Find("detail");
  Check(kept != nullptr && kept->StringField("windowId") == "window-1" && kept->StringField("elementId") == "element-1",
        "finishing a command merges what it found into what it started with");

  for (int index = 0; index < 200; index += 1) {
    journal.Begin("find", json::Value::Null());
  }
  commands = journal.Diagnostic(1000);
  Check(commands.Items().size() == CommandJournal::kMaximumEntries, "the journal keeps only the newest commands");
  journal.Finish(first, "late");
  Check(journal.Diagnostic(1000).Items().size() == CommandJournal::kMaximumEntries,
        "finishing a command that left the journal changes nothing");
  const json::Value recent = journal.Diagnostic(5);
  Check(recent.Items().size() == 5 &&
            recent.Items().back().NumberField("sequence") > recent.Items().front().NumberField("sequence"),
        "diagnostics return the newest commands in order");
}

void TestWindowEventLog() {
  constexpr DWORD processId = 4242;
  const HWND window = FakeWindow(0x1A2B);
  WindowEventMonitor monitor;
  json::Value log = monitor.Diagnostic(processId);
  Check(log.StringField("source") == "WinEvent" && !log.BoolField("observing", true) && EventsOf(log).empty(),
        "a process that was never observed reports an empty unobserved timeline");

  std::vector<std::string> published;
  monitor.SetClosedPublisher([&published](const std::string& id) { published.push_back(id); });
  monitor.Track(window, "window-1", processId);
  WindowNotification shown = Notification(processId, EVENT_OBJECT_SHOW, window);
  shown.hasDescriptor = true;
  shown.descriptor.className = "SelfTestWindow";
  shown.descriptor.visible = true;
  shown.descriptor.topLevel = true;
  monitor.Ingest(shown);
  Check(!monitor.IsClosed("window-1") && published.empty(), "a tracked window stays open until it is destroyed");

  const WindowNotification destroyed = Notification(processId, EVENT_OBJECT_DESTROY, window);
  monitor.Ingest(destroyed);
  monitor.Ingest(destroyed);
  Check(monitor.IsClosed("window-1"), "a destroy notification closes the tracked window");
  Check(published.size() == 1 && published.front() == "window-1", "a window close is published exactly once");

  log = monitor.Diagnostic(processId);
  const std::vector<json::Value>& events = EventsOf(log);
  Check(events.size() == 3 && events[0].StringField("notification") == "EVENT_OBJECT_SHOW" &&
            events[0].StringField("windowId") == "window-1" &&
            events[1].StringField("notification") == "EVENT_OBJECT_DESTROY" &&
            events[1].StringField("windowId") == "window-1" && !events[2].Has("windowId"),
        "events carry the tracked identifier until the handle is released");
  const json::Value* descriptor = events.size() == 3 ? events[0].Find("descriptor") : nullptr;
  Check(descriptor != nullptr && descriptor->StringField("className") == "SelfTestWindow" &&
            descriptor->BoolField("topLevel") && !events[1].Has("descriptor"),
        "live events carry a descriptor and destroy events do not");
  Check(events.size() == 3 && events[0].StringField("element").rfind("hwnd:", 0) == 0 &&
            events[0].StringField("element") == events[1].StringField("element") &&
            events[0].StringField("element") != events[0].StringField("windowId"),
        "events about one handle share an opaque element name");
  Check(events.size() == 3 && events[0].NumberField("sequence") < events[1].NumberField("sequence") &&
            !log.BoolField("eventsTruncated", true),
        "events are sequenced in arrival order and a short timeline is not truncated");

  monitor.Track(window, "window-2", processId);
  Check(!monitor.IsClosed("window-2") && monitor.IsClosed("window-1"),
        "a window that reuses a destroyed handle does not inherit the closed identity");
  monitor.Ingest(destroyed);
  Check(monitor.IsClosed("window-2") && published.size() == 2 && published.back() == "window-2",
        "the reusing window closes under its own identifier");
  monitor.Forget("window-1");
  Check(!monitor.IsClosed("window-1"), "forgetting an identifier clears its closed state");

  const WindowNotification foreground = Notification(processId, EVENT_SYSTEM_FOREGROUND, FakeWindow(0x5E6F));
  for (std::size_t index = 0; index < WindowEventMonitor::kMaximumEvents + 10; index += 1) {
    monitor.Ingest(foreground);
  }
  log = monitor.Diagnostic(processId, WindowEventMonitor::kMaximumEvents);
  Check(EventsOf(log).size() == WindowEventMonitor::kMaximumEvents && log.BoolField("eventsTruncated"),
        "the timeline keeps the newest events and reports truncation");
  log = monitor.Diagnostic(processId);
  Check(EventsOf(log).size() == WindowEventMonitor::kDiagnosticEventLimit && log.BoolField("eventsTruncated") &&
            EventsOf(log).back().NumberField("sequence") > EventsOf(log).front().NumberField("sequence"),
        "diagnostics default to the newest events in order");

  monitor.Stop(processId);
  Check(EventsOf(monitor.Diagnostic(processId)).empty(), "stopping a process discards its events");
}

void TestWindowEventPublisher() {
  const HWND window = FakeWindow(0x3C4D);
  const WindowNotification destroyed = Notification(77, EVENT_OBJECT_DESTROY, window);

  WindowEventMonitor failing;
  failing.Track(window, "window-1", 77);
  failing.SetClosedPublisher([](const std::string&) { throw std::runtime_error("the pipe closed"); });
  bool threw = false;
  try {
    failing.Ingest(destroyed);
  } catch (...) {
    threw = true;
  }
  Check(!threw && failing.IsClosed("window-1"), "a failing publisher never fails observation");

  WindowEventMonitor monitor;
  monitor.Track(window, "window-1", 77);
  Gate release;
  std::atomic<bool> publishing{false};
  std::atomic<bool> cleared{false};
  monitor.SetClosedPublisher([&](const std::string&) {
    publishing.store(true);
    release.Hold();
  });
  std::thread ingest([&]() { monitor.Ingest(destroyed); });
  Check(WaitFor([&]() { return publishing.load(); }), "a window close reaches the publisher");
  std::thread clear([&]() {
    monitor.SetClosedPublisher(nullptr);
    cleared.store(true);
  });
  Sleep(150);
  Check(!cleared.load(), "clearing the publisher waits for an in-flight publication");
  release.Open();
  ingest.join();
  clear.join();
  Check(cleared.load(), "the publisher clears once the in-flight publication finishes");
}

HWINEVENTHOOK RefuseHook() {
  SetLastError(ERROR_ACCESS_DENIED);
  return nullptr;
}

HWINEVENTHOOK InstallRealHook(DWORD first, DWORD last, DWORD processId, WINEVENTPROC callback) {
  return SetWinEventHook(first, last, nullptr, callback, processId, 0, WINEVENT_OUTOFCONTEXT);
}

HWINEVENTHOOK RefuseAllHooks(DWORD, DWORD, DWORD, WINEVENTPROC) {
  return RefuseHook();
}

HWINEVENTHOOK RefuseLifetimeHooks(DWORD first, DWORD last, DWORD processId, WINEVENTPROC callback) {
  return first == EVENT_OBJECT_CREATE ? RefuseHook() : InstallRealHook(first, last, processId, callback);
}

HWINEVENTHOOK RefuseNameHooks(DWORD first, DWORD last, DWORD processId, WINEVENTPROC callback) {
  return first == EVENT_OBJECT_NAMECHANGE ? RefuseHook() : InstallRealHook(first, last, processId, callback);
}

void TestWindowEventRegistration() {
  const DWORD processId = GetCurrentProcessId();
  const auto observe = [processId](WindowEventMonitor::HookInstaller installer) {
    WindowEventMonitor monitor;
    monitor.UseHookInstallerForTesting(installer);
    monitor.Observe(processId);
    return std::make_pair(monitor.IsObserving(processId), monitor.Diagnostic(processId));
  };
  const auto mentions = [](const json::Value& log, const std::string& hook) {
    const json::Value* reported = log.Find("registrationFailures");
    return reported != nullptr && !reported->Items().empty() &&
           std::all_of(reported->Items().begin(), reported->Items().end(), [&hook](const json::Value& failure) {
             return failure.AsString().find(hook) != std::string::npos;
           });
  };

  const auto healthy = observe(nullptr);
  Check(healthy.first && healthy.second.BoolField("observing") && !healthy.second.Has("registrationFailures"),
        "a healthy registration observes without reporting failures");

  const auto refused = observe(&RefuseAllHooks);
  const json::Value* refusals = refused.second.Find("registrationFailures");
  Check(!refused.first && !refused.second.BoolField("observing", true) && refusals != nullptr &&
            refusals->Items().size() > 1 &&
            refusals->Items().front().AsString().find("SetWinEventHook for") != std::string::npos,
        "a monitor whose hooks are all refused reports that it is not observing and why");

  const auto optionalRefused = observe(&RefuseNameHooks);
  Check(optionalRefused.first && mentions(optionalRefused.second, "name change events") &&
            optionalRefused.second.Find("registrationFailures")->Items().size() == 1,
        "refusing an optional hook keeps close detection and reports the refusal");

  const auto lifetimeRefused = observe(&RefuseLifetimeHooks);
  Check(!lifetimeRefused.first && mentions(lifetimeRefused.second, "object lifetime events"),
        "refusing the lifetime hook ends close detection and reports the refusal");
}

void TestWindowCloseWithoutEvents() {
  WindowThread windows;
  const HWND window = windows.Create(L"FurnSelfTestPolling", L"Polling window");
  ApplicationManager applications;
  applications.WindowEventsForTesting().UseHookInstallerForTesting(&RefuseAllHooks);
  const std::string leaseId = applications.AdoptWindowForTesting(window, L"Polling window").id;
  const std::vector<std::string> ids = applications.WindowIdsForLease(leaseId);
  Check(window != nullptr && ids.size() == 1 && !applications.WindowEventsForTesting().IsObserving(GetCurrentProcessId()),
        "a lease whose hooks were refused still tracks its window");
  if (ids.size() != 1) {
    return;
  }
  Check(FailureCode([&]() { applications.RequireWindow(ids.front()); }) == "none",
        "a live window resolves without events");

  windows.Destroy(window);
  std::string message;
  Check(FailureCode([&]() { applications.RequireWindow(ids.front()); }, &message) == kErrorNoSuchWindow &&
            message.find("has been closed") != std::string::npos,
        "polling still detects a destroyed window when no events arrive");
  Check(FailureCode([&]() { applications.RequireWindow("window-unknown"); }, &message) == kErrorNoSuchWindow &&
            message.find("not tracked") != std::string::npos,
        "a window this helper never issued is reported as untracked");
}

void TestLeaseRegistrationFailure() {
  WindowThread windows;
  const HWND window = windows.Create(L"FurnSelfTestLeaseFailure", L"Lease failure window");
  ApplicationManager applications;
  HANDLE attemptedProcess = nullptr;
  applications.UseLeaseRegistrationHookForTesting([&](HANDLE process, HANDLE) {
    attemptedProcess = process;
    throw std::runtime_error("Injected lease registration failure.");
  });
  bool failed = false;
  try {
    applications.AdoptWindowForTesting(window, L"Lease failure window");
  } catch (const std::runtime_error&) {
    failed = true;
  }
  DWORD flags = 0;
  SetLastError(ERROR_SUCCESS);
  Check(failed && attemptedProcess != nullptr && GetHandleInformation(attemptedProcess, &flags) == FALSE &&
            GetLastError() == ERROR_INVALID_HANDLE,
        "failed lease registration closes the process handle");
  Check(applications.PrimaryLease() == nullptr &&
            !applications.WindowEventsForTesting().IsObserving(GetCurrentProcessId()),
        "failed lease registration removes the lease and its event observation");

  applications.UseLeaseRegistrationHookForTesting({});
  const std::string leaseId = applications.AdoptWindowForTesting(window, L"Lease failure window").id;
  Check(applications.WindowIdsForLease(leaseId).size() == 1,
        "a new lease can register the window after a failed registration");
  applications.CloseApplication(leaseId, CancellationToken{});
}

void TestAttachedCloseKeepsQuarantine() {
  ResetMutationQuarantineForTesting();
  WindowThread windows;
  const HWND window = windows.Create(L"FurnSelfTestQuarantine", L"Quarantine window");
  ApplicationManager applications;
  const CancellationToken token;
  const std::string leaseId = applications.AdoptWindowForTesting(window, L"Quarantine window").id;

  const auto gate = std::make_shared<Gate>();
  std::string code = "none";
  {
    const MutationScope scope(leaseId);
    try {
      RunBoundedProviderCall(ProviderCall::Mutation, [gate]() { return gate->Hold(); }, 50, "Testing the provider",
                             kErrorAutomationFailed);
    } catch (const HelperError& error) {
      code = error.code();
    }
  }
  gate->Open();
  Check(code == kErrorMutationIndeterminate && MutationsQuarantined(),
        "a mutation stalled against an attached application quarantines the session");

  applications.CloseApplication(leaseId, token);
  Check(MutationsQuarantined(), "closing an attached lease keeps the quarantine because the application keeps running");
  Check(FailureCode([]() { RequireMutationsAllowed(); }) == kErrorTargetQuarantined,
        "mutations stay refused after an attached lease closes");

  ResetMutationQuarantineForTesting();
  windows.Destroy(window);
}

void TestWindowEventHooks() {
  const DWORD processId = GetCurrentProcessId();
  WindowThread windows;
  const HWND primary = windows.Create(L"FurnSelfTestPrimary", L"Primary window");
  ApplicationManager applications;
  const CancellationToken token;
  const std::string leaseId = applications.AdoptWindowForTesting(primary, L"Primary window").id;
  WindowEventMonitor& monitor = applications.WindowEventsForTesting();
  Check(primary != nullptr && monitor.IsObserving(processId), "a lease starts observing its process window events");

  std::mutex closedMutex;
  std::vector<std::string> closed;
  applications.SetWindowClosedPublisher([&](const std::string& id) {
    const std::lock_guard<std::mutex> guard(closedMutex);
    closed.push_back(id);
  });
  const auto closedWindows = [&]() {
    const std::lock_guard<std::mutex> guard(closedMutex);
    return closed;
  };

  const std::vector<std::string> initialIds = applications.WindowIdsForLease(leaseId);
  Check(initialIds.size() == 1, "the adopted window is tracked");
  if (initialIds.size() != 1) {
    return;
  }
  const std::string primaryId = initialIds.front();

  const HWND secondary = windows.Create(L"FurnSelfTestSecondary", L"Secondary window");
  std::string secondaryId;
  for (const WindowInfo& info : applications.Windows(leaseId, token)) {
    if (info.window == secondary) {
      secondaryId = info.id;
    }
  }
  Check(!secondaryId.empty() && secondaryId != primaryId, "a later window is listed under its own identifier");
  Check(WaitFor([&]() {
          const json::Value log = monitor.Diagnostic(processId, WindowEventMonitor::kMaximumEvents);
          return CountHandleEvents(log, "EVENT_OBJECT_CREATE", secondary) +
                     CountHandleEvents(log, "EVENT_OBJECT_SHOW", secondary) >=
                 1;
        }),
        "the system reports a new window to the monitor");

  windows.Destroy(secondary);
  Check(WaitFor([&]() { return monitor.IsClosed(secondaryId); }), "the system reports a destroyed window to the monitor");
  WaitFor([&]() { return !closedWindows().empty(); });
  const std::vector<std::string> closedAfterDestroy = closedWindows();
  Check(closedAfterDestroy.size() == 1 && closedAfterDestroy.front() == secondaryId,
        "a window close is published once with its identifier");
  std::string message;
  Check(FailureCode([&]() { applications.RequireWindow(secondaryId); }, &message) == kErrorNoSuchWindow &&
            message.find("has been closed") != std::string::npos,
        "a closed window no longer resolves");
  const std::vector<std::string> retired = applications.TakeRetiredWindowIds();
  Check(retired.size() == 1 && retired.front() == secondaryId && applications.TakeRetiredWindowIds().empty(),
        "a closed window is reported as retired exactly once");
  const std::vector<WindowInfo> remaining = applications.Windows(leaseId, token);
  Check(remaining.size() == 1 && remaining.front().id == primaryId,
        "listing windows after a close keeps the surviving identifier");
  Check(FailureCode([&]() { applications.RequireWindow(primaryId); }) == "none", "a surviving window keeps resolving");

  const json::Value log = applications.WindowEventLog(leaseId);
  Check(log.StringField("source") == "WinEvent" && log.BoolField("observing") && !log.Has("registrationFailures"),
        "the event log reports a healthy WinEvent source");
  Check(CountEvents(log, "EVENT_OBJECT_DESTROY", secondaryId) == 1, "the timeline names the window that closed");
  const json::Value* publication = log.Find("publication");
  const json::Value* published = publication == nullptr ? nullptr : publication->Find("windows");
  Check(publication != nullptr && publication->NumberField("processId") == static_cast<double>(processId) &&
            publication->StringField("reason") == "observation" && publication->NumberField("windowCount") >= 1 &&
            published != nullptr && published->IsArray() && !published->Items().empty() &&
            published->Items().front().Has("className"),
        "the event log describes the current window publication");
  const json::Value* tracked = log.Find("trackedWindows");
  Check(tracked != nullptr && tracked->Items().size() == 1 && tracked->Items()[0].StringField("id") == primaryId &&
            tracked->Items()[0].BoolField("primary") && !tracked->Items()[0].BoolField("closed", true) &&
            tracked->Items()[0].StringField("title") == "Primary window",
        "the event log lists the tracked windows");

  // A handle can be reused by a later window, so a destroy notification must
  // end the identifier even while the handle still names a live window.
  monitor.Ingest(Notification(processId, EVENT_OBJECT_DESTROY, primary));
  Check(monitor.IsClosed(primaryId) && closedWindows().size() == 2, "a destroy notification closes a tracked window");
  Check(FailureCode([&]() { applications.RequireWindow(primaryId); }) == kErrorNoSuchWindow,
        "a window reported destroyed no longer resolves while its handle is live");
  const std::vector<WindowInfo> reused = applications.Windows(leaseId, token);
  Check(reused.size() == 1 && reused.front().window == primary && reused.front().id != primaryId,
        "a live window on a closed identifier's handle receives a new identifier");
  Check(FailureCode([&]() { applications.RequireWindow(primaryId); }, &message) == kErrorNoSuchWindow &&
            message.find("has been closed") != std::string::npos,
        "the old identifier keeps reporting that its window closed");
  Check(!reused.empty() && FailureCode([&]() { applications.RequireWindow(reused.front().id); }) == "none",
        "the new identifier resolves");

  // Events for a process stop only when its last lease closes.
  const HWND third = windows.Create(L"FurnSelfTestThird", L"Third window");
  const std::string thirdLease = applications.AdoptWindowForTesting(third, L"Third window").id;
  applications.CloseApplication(leaseId, token);
  Check(monitor.IsObserving(processId), "closing one lease keeps observing a process another lease holds");
  applications.CloseApplication(thirdLease, token);
  Check(!monitor.IsObserving(processId), "closing the last lease stops observing its process");
  Check(FailureCode([&]() { applications.WindowEventLog(leaseId); }) == kErrorNoSuchLease,
        "a closed lease has no event log");
}

void TestDriverWindowEvents() {
  WindowThread windows;
  const HWND window = windows.Create(L"FurnSelfTestDriver", L"Driver window");
  Driver driver;
  const CancellationToken token;
  const json::Value lease = driver.AdoptWindowForTesting(window, L"Driver window");
  json::Value request = json::Value::Object();
  request.Set("lease", lease);

  const CommandResult listed = driver.Execute("windows", request, token);
  const std::string windowId = listed.result.IsArray() && listed.result.Items().size() == 1
                                   ? listed.result.Items().front().StringField("id")
                                   : std::string();
  Check(!windowId.empty(), "the driver lists the adopted window");

  json::Value missing = json::Value::Object();
  missing.Set("windowId", json::Value::String(std::string("window-missing")));
  Check(FailureCode([&]() { driver.Execute("getWindowRect", missing, token); }) == kErrorNoSuchWindow,
        "a command for an unknown window fails");
  Check(FailureCode([&]() { driver.Execute("windowEvents", json::Value::Object(), token); }) == kErrorInvalidParams,
        "the event log requires a lease");
  json::Value unknownLease = json::Value::Object();
  unknownLease.Set("id", json::Value::String(std::string("lease-unknown")));
  json::Value unknown = json::Value::Object();
  unknown.Set("lease", unknownLease);
  Check(FailureCode([&]() { driver.Execute("windowEvents", unknown, token); }) == kErrorNoSuchLease,
        "the event log rejects a lease this helper does not hold");

  const CommandResult report = driver.Execute("windowEvents", request, token);
  Check(report.result.StringField("source") == "WinEvent" && report.result.BoolField("observing") &&
            report.result.Find("events") != nullptr && report.result.Find("publication") != nullptr &&
            report.result.Find("trackedWindows") != nullptr && report.result.Find("commands") != nullptr,
        "the driver returns the window event log with its command journal");

  // The newest entry wins, so the event request itself is the one inspected.
  const auto findCommand = [&report](const std::string& name) -> const json::Value* {
    const json::Value* commands = report.result.Find("commands");
    if (commands == nullptr) {
      return nullptr;
    }
    for (auto command = commands->Items().rbegin(); command != commands->Items().rend(); ++command) {
      if (command->StringField("command") == name) {
        return &*command;
      }
    }
    return nullptr;
  };
  const json::Value* windowsCommand = findCommand("windows");
  const json::Value* windowIds = windowsCommand == nullptr || windowsCommand->Find("detail") == nullptr
                                     ? nullptr
                                     : windowsCommand->Find("detail")->Find("windowIds");
  Check(windowsCommand != nullptr && windowsCommand->StringField("outcome") == "ok" &&
            windowsCommand->Has("durationMs") && windowIds != nullptr && windowIds->Items().size() == 1 &&
            windowIds->Items().front().AsString() == windowId,
        "the journal records a command, its outcome, and the windows it listed");
  const json::Value* failedCommand = findCommand("getWindowRect");
  const json::Value* failedDetail = failedCommand == nullptr ? nullptr : failedCommand->Find("detail");
  Check(failedCommand != nullptr && failedCommand->StringField("outcome") == kErrorNoSuchWindow &&
            failedDetail != nullptr && failedDetail->StringField("windowId") == "window-missing",
        "the journal records a failed command by its error code and window");
  const json::Value* running = findCommand("windowEvents");
  Check(running != nullptr && running->StringField("outcome") == "running" && !running->Has("durationMs"),
        "the journal shows the event request itself as still running");

  const json::Value* retention = report.result.Find("retention");
  Check(retention != nullptr && retention->IsObject() && retention->Has("retainedElements") &&
            retention->Has("retainedElementLimit") && retention->Has("workingSetBytes") &&
            retention->Has("privateBytes"),
        "the event report carries the retention figures");
  if (retention != nullptr) {
    Check(retention->Find("retainedElementLimit") != nullptr &&
              retention->Find("retainedElementLimit")->AsInteger() == static_cast<std::int64_t>(kMaximumRetainedElements),
          "the retention figures report the helper's element cap");
    Check(retention->Find("workingSetBytes") != nullptr && retention->Find("workingSetBytes")->AsInteger() > 0 &&
              retention->Find("privateBytes") != nullptr && retention->Find("privateBytes")->AsInteger() > 0,
          "the retention figures report the helper's own memory");
  }
}

// Senders that model what Windows does when it drops injected input.
UINT WINAPI RejectAllInput(UINT, LPINPUT, int) {
  return 0;
}

UINT WINAPI RejectInputAsDenied(UINT, LPINPUT, int) {
  SetLastError(ERROR_ACCESS_DENIED);
  return 0;
}

UINT WINAPI AcceptFirstInputOnly(UINT, LPINPUT, int) {
  return 1;
}

// Records input and then cancels the command that sent it, once a key press
// reaches the application; the modifier releases before it do not count.
CancellationToken* cancelOnInput = nullptr;

UINT WINAPI RecordInputThenCancel(UINT count, LPINPUT inputs, int size) {
  const UINT sent = RecordInput(count, inputs, size);
  for (UINT index = 0; index < count && cancelOnInput != nullptr; index += 1) {
    if (inputs[index].type == INPUT_KEYBOARD && (inputs[index].ki.dwFlags & KEYEVENTF_KEYUP) == 0) {
      cancelOnInput->Cancel();
    }
  }
  return sent;
}

// A window of another process, or null when this desktop has none to borrow.
HWND ForeignWindow() {
  const HWND shell = GetShellWindow();
  DWORD processId = 0;
  if (shell != nullptr) {
    GetWindowThreadProcessId(shell, &processId);
  }
  return processId != 0 && processId != GetCurrentProcessId() ? shell : nullptr;
}

void NoteSkippedForeignChecks() {
  std::cout << "info - no other application owns the shell window on this desktop; foreign window checks skipped\n";
}

InputEnvironment InteractiveWith(const std::function<void(InputEnvironment&)>& change) {
  InputEnvironment environment = InteractiveEnvironmentForTesting();
  change(environment);
  return environment;
}

bool Contains(const std::string& text, const std::string& fragment) {
  return text.find(fragment) != std::string::npos;
}

void TestInputEnvironment() {
  const auto verdict = [](const std::function<void(InputEnvironment&)>& change) {
    return EvaluateInputEnvironment(InteractiveWith(change));
  };
  const auto refusedFor = [&verdict](const std::function<void(InputEnvironment&)>& change, const std::string& reason) {
    const InputVerdict result = verdict(change);
    return !result.available && Contains(result.reason, reason);
  };

  const InputVerdict interactive = EvaluateInputEnvironment(InteractiveEnvironmentForTesting());
  Check(interactive.available && interactive.reason.empty(),
        "an active, unlocked session on the default desktop accepts input");

  Check(refusedFor([](InputEnvironment& environment) { environment.connectState = WTSDisconnected; }, "disconnected"),
        "a disconnected session refuses input");
  Check(refusedFor([](InputEnvironment& environment) { environment.connectState = WTSConnected; },
                   "without a signed-in user"),
        "a session without a signed-in user refuses input");
  Check(refusedFor([](InputEnvironment& environment) { environment.connectState = WTSShadow; }, "shadowed"),
        "a shadowed session refuses input");
  Check(refusedFor([](InputEnvironment& environment) { environment.connectState = WTSIdle; }, "idle"),
        "an idle session refuses input");
  Check(verdict([](InputEnvironment& environment) { environment.connectState = -1; }).available,
        "an unreadable session state does not refuse input on its own");

  Check(refusedFor([](InputEnvironment& environment) { environment.lock = SessionLock::Locked; }, "locked"),
        "a locked session refuses input");
  Check(verdict([](InputEnvironment& environment) { environment.lock = SessionLock::Unknown; }).available,
        "an unreadable lock state does not refuse input on its own");

  Check(refusedFor([](InputEnvironment& environment) { environment.windowStation = L"Service-0x0-3e7$"; },
                   "Service-0x0-3e7$"),
        "a non-interactive window station refuses input and is named");
  Check(verdict([](InputEnvironment& environment) { environment.windowStation = L"winsta0"; }).available &&
            verdict([](InputEnvironment& environment) { environment.windowStation.clear(); }).available,
        "the interactive window station matches by case and an unreadable name does not refuse input");

  Check(refusedFor([](InputEnvironment& environment) { environment.inputDesktopName = L"Winlogon"; }, "Winlogon"),
        "a secure desktop refuses input and is named");
  Check(refusedFor([](InputEnvironment& environment) { environment.inputDesktopName = L"Screen-saver"; },
                   "secure desktop"),
        "a screen saver desktop refuses input");
  Check(verdict([](InputEnvironment& environment) { environment.inputDesktopName = L"default"; }).available &&
            verdict([](InputEnvironment& environment) { environment.inputDesktopName.clear(); }).available,
        "the default desktop matches by case and an unreadable name does not refuse input");

  const auto denied = [](InputEnvironment& environment) {
    environment.inputDesktopOpened = false;
    environment.inputDesktopName.clear();
    environment.inputDesktopError = ERROR_ACCESS_DENIED;
  };
  Check(verdict(denied).available, "a denied desktop handle with a readable cursor is a hosted session that accepts input");
  Check(refusedFor(
            [&denied](InputEnvironment& environment) {
              denied(environment);
              environment.cursorReadable = false;
            },
            "Windows error 5"),
        "a denied desktop handle with an unreadable cursor is a secure desktop and refuses input");

  Check(refusedFor(
            [](InputEnvironment& environment) {
              environment.connectState = WTSDisconnected;
              environment.lock = SessionLock::Locked;
            },
            "disconnected"),
        "a disconnected session is reported before its lock state");
  Check(refusedFor(
            [](InputEnvironment& environment) {
              environment.lock = SessionLock::Locked;
              environment.inputDesktopName = L"Winlogon";
            },
            "is locked"),
        "a locked session is reported as locked rather than as a secure desktop");
  Check(refusedFor(
            [](InputEnvironment& environment) {
              environment.windowStation = L"Service-0x0-3e7$";
              environment.inputDesktopName = L"Winlogon";
            },
            "window station"),
        "a foreign window station is reported before the desktop");
}

void TestInjectionIntegrity() {
  const auto level = [](DWORD value) {
    ProcessIntegrity integrity;
    integrity.known = true;
    integrity.level = value;
    return integrity;
  };
  const auto unreadable = [](DWORD error) {
    ProcessIntegrity integrity;
    integrity.error = error;
    return integrity;
  };
  const ProcessIntegrity medium = level(SECURITY_MANDATORY_MEDIUM_RID);
  const ProcessIntegrity high = level(SECURITY_MANDATORY_HIGH_RID);

  Check(EvaluateInjectionTarget(medium, medium).available, "equal integrity levels accept injected input");
  Check(EvaluateInjectionTarget(medium, level(SECURITY_MANDATORY_LOW_RID)).available,
        "a target below the helper's integrity accepts injected input");
  Check(EvaluateInjectionTarget(high, medium).available, "an elevated helper reaches a medium integrity target");

  const InputVerdict elevated = EvaluateInjectionTarget(medium, high);
  Check(!elevated.available && Contains(elevated.reason, "high") && Contains(elevated.reason, "medium") &&
            Contains(elevated.reason, "UIPI"),
        "a target above the helper's integrity is refused and both levels are named");
  Check(!EvaluateInjectionTarget(medium, level(SECURITY_MANDATORY_MEDIUM_PLUS_RID)).available,
        "a medium-plus target is above a medium helper");
  Check(!EvaluateInjectionTarget(high, level(SECURITY_MANDATORY_SYSTEM_RID)).available,
        "a system integrity target is above an elevated helper");

  const InputVerdict protectedTarget = EvaluateInjectionTarget(medium, unreadable(ERROR_ACCESS_DENIED));
  Check(!protectedTarget.available && Contains(protectedTarget.reason, "token"),
        "a target whose token cannot be read is refused instead of assumed reachable");
  Check(EvaluateInjectionTarget(medium, unreadable(ERROR_INVALID_PARAMETER)).available,
        "a target that already exited is left to the window and element checks");
  Check(EvaluateInjectionTarget(unreadable(ERROR_ACCESS_DENIED), medium).available,
        "an unreadable helper token does not refuse input on its own");

  Check(std::string(DescribeIntegrityLevel(SECURITY_MANDATORY_UNTRUSTED_RID)) == "untrusted" &&
            std::string(DescribeIntegrityLevel(SECURITY_MANDATORY_LOW_RID)) == "low" &&
            std::string(DescribeIntegrityLevel(SECURITY_MANDATORY_MEDIUM_RID)) == "medium" &&
            std::string(DescribeIntegrityLevel(SECURITY_MANDATORY_MEDIUM_PLUS_RID)) == "medium-plus" &&
            std::string(DescribeIntegrityLevel(SECURITY_MANDATORY_HIGH_RID)) == "high" &&
            std::string(DescribeIntegrityLevel(SECURITY_MANDATORY_SYSTEM_RID)) == "system",
        "integrity levels are named for the messages that report them");
}

void TestActivationRefusal() {
  const auto level = [](DWORD value) {
    ProcessIntegrity integrity;
    integrity.known = true;
    integrity.level = value;
    return integrity;
  };
  ActivationRefusal held;
  held.sawForeground = true;
  held.foreground = "hwnd:0000002a";
  held.foregroundProcess = 4242;
  held.helperIntegrity = level(SECURITY_MANDATORY_MEDIUM_RID);
  held.foregroundIntegrity = level(SECURITY_MANDATORY_MEDIUM_RID);

  ActivationRefusal desktopless;
  Check(Contains(DescribeActivationRefusal(desktopless), "no interactive foreground desktop"),
        "a session without any foreground window reports that there is no interactive desktop");

  ActivationRefusal lost = held;
  lost.foreground.clear();
  Check(Contains(DescribeActivationRefusal(lost), "secure desktop"),
        "a foreground lost during activation names locking, disconnection, or a secure desktop");

  ActivationRefusal sibling = held;
  sibling.foregroundInTargetProcess = true;
  sibling.foregroundIntegrity = level(SECURITY_MANDATORY_HIGH_RID);
  Check(Contains(DescribeActivationRefusal(sibling), "another window of the target application"),
        "a foreground window of the target's own process is reported before integrity");

  ActivationRefusal elevated = held;
  elevated.foregroundIntegrity = level(SECURITY_MANDATORY_HIGH_RID);
  elevated.attachError = ERROR_ACCESS_DENIED;
  const std::string elevatedMessage = DescribeActivationRefusal(elevated);
  Check(Contains(elevatedMessage, "runs at high integrity and this helper at medium") &&
            Contains(elevatedMessage, "hwnd:0000002a of process 4242"),
        "an elevated foreground holder names both integrity levels and the opaque window and process");

  ActivationRefusal unreadable = held;
  unreadable.foregroundIntegrity = ProcessIntegrity{};
  unreadable.foregroundIntegrity.error = ERROR_ACCESS_DENIED;
  Check(Contains(DescribeActivationRefusal(unreadable), "probably elevated"),
        "a foreground holder whose token cannot be read is reported as probably elevated");

  ActivationRefusal hung = held;
  hung.foregroundHung = true;
  hung.attachError = ERROR_ACCESS_DENIED;
  Check(Contains(DescribeActivationRefusal(hung), "is not responding"),
        "a hung foreground holder is reported before a refused attachment");

  ActivationRefusal refused = held;
  refused.attachError = ERROR_ACCESS_DENIED;
  Check(Contains(DescribeActivationRefusal(refused), "input queue") &&
            Contains(DescribeActivationRefusal(refused), "Windows error 5"),
        "a refused input-queue attachment names its Windows error");

  const std::string reclaimed = DescribeActivationRefusal(held);
  Check(Contains(reclaimed, "taking the foreground back") &&
            Contains(reclaimed, "did not become the foreground window"),
        "a refusal with a shared input queue reports that the holder may take the foreground back");
}

// A window whose thread stops pumping messages fails window management with
// target-non-response within the probe's bound instead of blocking the command,
// and a cancelled command stops waiting for it.
void TestHungWindowProbe() {
  const CancellationToken token;
  WindowThread windows;
  const HWND window = windows.Create(L"FurnSelfTestHung", L"Hung window");
  Check(window != nullptr, "the hung-window fixture creates a window");
  if (window == nullptr) {
    return;
  }
  Check(FailureCode([&]() { RequireWindowResponds(window, token); }) == "none",
        "a window whose thread pumps messages responds");

  const auto stall = std::make_shared<Gate>();
  windows.Stall(stall);
  std::string reason = "responded";
  std::string message;
  const ULONGLONG started = GetTickCount64();
  try {
    RequireWindowResponds(window, token);
  } catch (const HelperError& error) {
    reason = error.reason();
    message = error.what();
  }
  Check(reason == "target-non-response" && Contains(message, "did not answer window messages") &&
            GetTickCount64() - started < 4000,
        "a window that stops answering fails as target-non-response within the probe's bound");

  CancellationToken cancelled;
  std::thread canceller([&cancelled]() {
    Sleep(200);
    cancelled.Cancel();
  });
  const ULONGLONG cancelStarted = GetTickCount64();
  std::string outcome = "none";
  try {
    RequireWindowResponds(window, cancelled);
  } catch (const CancelledError&) {
    outcome = "cancelled";
  } catch (const HelperError& error) {
    outcome = error.code();
  }
  canceller.join();
  Check(outcome == "cancelled" && GetTickCount64() - cancelStarted < 1000,
        "a cancelled command stops waiting for a window that does not answer");
  stall->Open();
  Check(WaitFor([&]() { return FailureCode([&]() { RequireWindowResponds(window, token); }) == "none"; }),
        "the window answers again once its thread resumes");
}

void TestHelperSessionCheck() {
  bool accepted = true;
  try {
    RequireProcessInHelperSession(GetCurrentProcessId(), kErrorAttachFailed);
  } catch (const HelperError&) {
    accepted = false;
  }
  Check(accepted, "the helper's own process runs in the helper's session");

  std::string refusedCode;
  try {
    RequireProcessInHelperSession(0xFFFFFFF0u, kErrorLeaseInvalid);
  } catch (const HelperError& error) {
    refusedCode = error.code();
  }
  Check(refusedCode == kErrorLeaseInvalid,
        "a process whose session cannot be read is refused with the caller's failure code");
}

void TestInputAuthorityOnThisMachine() {
  const ProcessIntegrity self = ReadProcessIntegrity(0);
  Check(self.known && self.level >= SECURITY_MANDATORY_LOW_RID, "the helper reads its own integrity level");
  const ProcessIntegrity byId = ReadProcessIntegrity(GetCurrentProcessId());
  Check(byId.known && byId.level == self.level && HelperIntegrity().known && HelperIntegrity().level == self.level,
        "the helper token reads the same through its process id and through the cached value");
  const ProcessIntegrity gone = ReadProcessIntegrity(0xFFFFFFF0u);
  Check(!gone.known && gone.error != ERROR_ACCESS_DENIED && EvaluateInjectionTarget(self, gone).available,
        "a process that does not exist is not mistaken for a protected one");

  const InputEnvironment environment = ReadInputEnvironment();
  Check(!environment.windowStation.empty(), "the helper reads its window station name");
  LPWSTR state = nullptr;
  DWORD bytes = 0;
  if (WTSQuerySessionInformationW(WTS_CURRENT_SERVER_HANDLE, WTS_CURRENT_SESSION, WTSConnectState, &state, &bytes) !=
      FALSE) {
    const int expected = state != nullptr && bytes >= sizeof(int) ? *reinterpret_cast<const int*>(state) : -1;
    WTSFreeMemory(state);
    Check(expected >= 0 && environment.connectState == expected,
          "the environment reports the connection state that Windows reports");
  }

  // The environment is read for every physical operation, so what it costs
  // matters more than what it says. The verdict depends on the machine and is
  // only reported.
  constexpr int kReads = 25;
  const auto start = std::chrono::steady_clock::now();
  for (int read = 0; read < kReads; read += 1) {
    ReadInputEnvironment();
  }
  const double perRead =
      std::chrono::duration<double, std::milli>(std::chrono::steady_clock::now() - start).count() / kReads;
  Check(perRead < 100.0, "reading the input environment stays cheap enough to repeat for every operation");
  const InputVerdict live = EvaluateInputEnvironment(environment);
  std::cout << "info - input on this machine is "
            << (live.available ? std::string("available") : "unavailable (" + live.reason + ")")
            << "; reading its environment costs " << perRead << " ms\n";
}

void TestInputReevaluation() {
  const CancellationToken token;
  bool locked = false;
  int reads = 0;
  InputController input;
  input.UseTestSender(&RecordInput);
  input.UseTestEnvironment([&locked, &reads]() {
    reads += 1;
    return InteractiveWith([locked](InputEnvironment& environment) {
      environment.lock = locked ? SessionLock::Locked : SessionLock::Unlocked;
    });
  });

  InputController redirected;
  redirected.UseTestSender(&RecordInput);
  Check(redirected.Availability().available, "a controller redirected away from the desktop sees an interactive session");

  recordedInputs.clear();
  input.TypeText(L"ab", token);
  Check(reads == 1 && recordedInputs.size() == 4, "typing reads the session once per call rather than per character");
  Check(input.Availability().available && reads == 2, "every availability query reads the session again");

  input.KeyDown(L"\uE008", token);
  input.PointerDown(0, token);
  locked = true;
  recordedInputs.clear();
  std::string message;
  Check(FailureCode([&]() { input.TypeText(L"x", token); }, &message) == kErrorInputUnavailable &&
            Contains(message, "locked"),
        "a session that locks after a success refuses the next typed text and says why");
  Check(FailureCode([&]() { input.KeyDown(L"b", token); }) == kErrorInputUnavailable,
        "a locked session refuses a key press");
  Check(FailureCode([&]() { input.PointerDown(2, token); }) == kErrorInputUnavailable,
        "a locked session refuses a button press");
  Check(FailureCode([&]() { input.MovePointer(POINT{5, 5}, 0, token); }) == kErrorInputUnavailable,
        "a locked session refuses pointer movement");
  Check(FailureCode([&]() { input.Wheel(0.0, 120.0, token); }) == kErrorInputUnavailable,
        "a locked session refuses wheel input");
  Check(FailureCode([&]() { input.PressChord({VK_CONTROL, 'A'}, token); }) == kErrorInputUnavailable,
        "a locked session refuses a chord");
  Check(recordedInputs.empty(), "refused operations inject nothing");

  input.ReleaseAll();
  Check(!input.HasDepressedInput() && recordedInputs.size() == 2 && recordedInputs[0].type == INPUT_KEYBOARD &&
            recordedInputs[0].ki.wVk == VK_SHIFT && (recordedInputs[0].ki.dwFlags & KEYEVENTF_KEYUP) != 0 &&
            recordedInputs[1].type == INPUT_MOUSE && (recordedInputs[1].mi.dwFlags & MOUSEEVENTF_LEFTUP) != 0,
        "input that is already down is still released while the session is locked");

  locked = false;
  recordedInputs.clear();
  input.TypeText(L"z", token);
  Check(recordedInputs.size() == 2, "input is accepted again as soon as the session unlocks");
}

void TestKeyboardGuard() {
  const CancellationToken token;
  InputController input;
  input.UseTestSender(&RecordInput);
  int guarded = 0;
  bool refuse = false;
  input.SetKeyboardGuard([&guarded, &refuse]() {
    guarded += 1;
    if (refuse) {
      Fail(kErrorWindowActivation, "Keys are not sent to the foreground window.");
    }
  });

  recordedInputs.clear();
  input.TypeText(L"abc", token);
  Check(guarded == 3 && recordedInputs.size() == 6, "the guard runs before each typed character");
  guarded = 0;
  input.PressChord({VK_CONTROL, 'A'}, token);
  Check(guarded == 1, "the guard runs once for a chord rather than once per key in it");
  guarded = 0;
  input.KeyDown(L"\uE008", token);
  Check(guarded == 1 && input.DepressedKeyCount() == 1, "the guard runs before a key press");

  refuse = true;
  guarded = 0;
  recordedInputs.clear();
  Check(FailureCode([&]() { input.TypeText(L"x", token); }) == kErrorWindowActivation,
        "a refused typed character fails");
  Check(FailureCode([&]() { input.KeyDown(L"b", token); }) == kErrorWindowActivation, "a refused key press fails");
  Check(FailureCode([&]() { input.PressChord({VK_DELETE}, token); }) == kErrorWindowActivation,
        "a refused chord fails");
  Check(recordedInputs.empty() && input.DepressedKeyCount() == 1,
        "refused presses inject nothing and leave nothing extra to release");

  guarded = 0;
  input.KeyUp(L"\uE008", token);
  Check(guarded == 0 && recordedInputs.size() == 1 && (recordedInputs[0].ki.dwFlags & KEYEVENTF_KEYUP) != 0 &&
            !input.HasDepressedInput(),
        "a key release never consults the guard");
  recordedInputs.clear();
  input.KeyUp(L"q", token);
  Check(guarded == 0 && recordedInputs.size() == 1, "releasing a key this helper never pressed never consults the guard");

  refuse = false;
  input.KeyDown(L"\uE008", token);
  refuse = true;
  guarded = 0;
  recordedInputs.clear();
  input.KeyDown(L"\uE000", token);
  Check(guarded == 0 && !input.HasDepressedInput() && recordedInputs.size() == 1,
        "the null key releases everything without consulting the guard");
  refuse = false;
  input.KeyDown(L"\uE008", token);
  refuse = true;
  guarded = 0;
  recordedInputs.clear();
  input.ReleaseAll();
  Check(guarded == 0 && !input.HasDepressedInput() && recordedInputs.size() == 1,
        "releasing everything never consults the guard");

  guarded = 0;
  input.SetKeyboardGuard([&guarded]() {
    guarded += 1;
    if (guarded == 2) {
      Fail(kErrorWindowActivation, "The foreground changed.");
    }
  });
  recordedInputs.clear();
  Check(FailureCode([&]() { input.TypeText(L"ab", token); }) == kErrorWindowActivation && recordedInputs.size() == 2 &&
            !input.HasDepressedInput(),
        "a guard that refuses mid-text stops there with what was typed already released");

  input.SetKeyboardGuard(nullptr);
  guarded = 0;
  {
    const KeyboardGuardScope scope(input, [&guarded]() { guarded += 1; });
    input.TypeText(L"x", token);
  }
  input.TypeText(L"y", token);
  Check(guarded == 1, "a guard scope installs its guard and removes it when it ends");
  try {
    const KeyboardGuardScope scope(input, [&guarded]() {
      guarded += 1;
      Fail(kErrorWindowActivation, "Refused.");
    });
    input.TypeText(L"x", token);
  } catch (const HelperError&) {
  }
  guarded = 0;
  input.TypeText(L"y", token);
  Check(guarded == 0, "a guard scope removes its guard when the typing it covered fails");
}

void TestInputSendFailures() {
  const CancellationToken token;
  const auto failureOf = [](InputSender sender, const std::function<void(InputController&)>& operation,
                            std::string& message) {
    InputController input;
    input.UseTestSender(sender);
    return FailureCode([&]() { operation(input); }, &message);
  };

  std::string message;
  Check(failureOf(&RejectAllInput, [&token](InputController& input) { input.PointerDown(0, token); }, message) ==
                kErrorInputFailed &&
            Contains(message, "accepted 0 of 1") && Contains(message, "UIPI") && Contains(message, "secure desktop") &&
            !Contains(message, "0x"),
        "a send that Windows drops without an error names the likely causes");
  Check(failureOf(&RejectInputAsDenied, [&token](InputController& input) { input.PointerDown(0, token); }, message) ==
                kErrorInputFailed &&
            Contains(message, "0x80070005"),
        "a send that Windows rejects with an error reports that error");
  Check(failureOf(&AcceptFirstInputOnly, [&token](InputController& input) { input.Wheel(120.0, 120.0, token); },
                  message) == kErrorInputFailed &&
            Contains(message, "accepted 1 of 2"),
        "a partly accepted batch reports how much of it Windows accepted");
}

void TestForegroundOwnership() {
  WindowThread windows;
  const HWND window = windows.Create(L"FurnSelfTestOwner", L"Owner window");
  const HWND sibling = windows.Create(L"FurnSelfTestOwner", L"Sibling window");
  ApplicationManager applications;
  applications.AdoptWindowForTesting(window, L"Owner window");

  Check(applications.ForegroundBelongsToApplication(window, window), "the target window is its own foreground");
  Check(applications.ForegroundBelongsToApplication(window, sibling),
        "another window of the application's process belongs to the application");
  Check(applications.ForegroundBelongsToApplication(nullptr, sibling),
        "a null target accepts a window of any leased application");
  Check(!applications.ForegroundBelongsToApplication(window, nullptr) &&
            !applications.ForegroundBelongsToApplication(nullptr, nullptr),
        "no foreground window belongs to no application");
  Check(FailureCode([&]() { applications.RequireForegroundOwnedBy(window, sibling); }) == "none",
        "a foreground window of the application passes the keyboard check");

  std::string message;
  Check(FailureCode([&]() { applications.RequireForegroundOwnedBy(window, nullptr); }, &message) ==
                kErrorWindowActivation &&
            Contains(message, "No window holds the foreground"),
        "a missing foreground window fails the keyboard check");

  ApplicationManager unleased;
  Check(!unleased.ForegroundBelongsToApplication(nullptr, window),
        "without a lease no window belongs to a target application");

  const HWND foreign = ForeignWindow();
  if (foreign == nullptr) {
    NoteSkippedForeignChecks();
    return;
  }
  Check(!applications.ForegroundBelongsToApplication(window, foreign), "another application's window does not belong");
  Check(!applications.ForegroundBelongsToApplication(nullptr, foreign),
        "another application's window belongs to no leased application");
  Check(FailureCode([&]() { applications.RequireForegroundOwnedBy(window, foreign); }, &message) ==
                kErrorWindowActivation &&
            Contains(message, DescribeWindowHandle(foreign)) && Contains(message, "target application"),
        "another application's foreground window fails the keyboard check and is named");
  Check(FailureCode([&]() { applications.RequireForegroundOwnedBy(nullptr, foreign); }, &message) ==
                kErrorWindowActivation &&
            Contains(message, "launched or attached to"),
        "the any-application check says which applications it accepts");
}

void TestKeyboardTargetRouting() {
  WindowThread windows;
  const HWND window = windows.Create(L"FurnSelfTestTarget", L"Target window");
  ApplicationManager applications;
  applications.AdoptWindowForTesting(window, L"Target window");
  InputController input;
  input.UseTestSender(&RecordInput);
  DWORD applicationLevel = SECURITY_MANDATORY_MEDIUM_RID;
  input.UseTestIntegrity([&applicationLevel](DWORD processId) {
    ProcessIntegrity integrity;
    integrity.known = true;
    integrity.level = processId == 0 ? SECURITY_MANDATORY_MEDIUM_RID : applicationLevel;
    return integrity;
  });

  Check(FailureCode([&]() { RequireKeyboardTarget(applications, input, window, window); }) == "none",
        "keys may reach the target application");
  Check(FailureCode([&]() { RequireKeyboardTarget(applications, input, nullptr, window); }) == "none",
        "keys may reach any leased application when no target is named");

  applicationLevel = SECURITY_MANDATORY_HIGH_RID;
  std::string message;
  Check(FailureCode([&]() { RequireKeyboardTarget(applications, input, window, window); }, &message) ==
                kErrorInputUnavailable &&
            Contains(message, "UIPI"),
        "keys are refused when the foreground application is elevated above the helper");
  applicationLevel = SECURITY_MANDATORY_MEDIUM_RID;

  Check(FailureCode([&]() { RequireKeyboardTarget(applications, input, window, nullptr); }) == kErrorWindowActivation,
        "keys are refused when no window holds the foreground");
  const HWND foreign = ForeignWindow();
  if (foreign == nullptr) {
    NoteSkippedForeignChecks();
    return;
  }
  Check(FailureCode([&]() { RequireKeyboardTarget(applications, input, window, foreign); }) == kErrorWindowActivation,
        "keys are refused when another application holds the foreground");
  applicationLevel = SECURITY_MANDATORY_HIGH_RID;
  Check(FailureCode([&]() { RequireKeyboardTarget(applications, input, window, foreign); }) == kErrorWindowActivation,
        "the owner of the foreground is checked before its integrity");
}

HWND clickHitResult = nullptr;

HWND WINAPI HitConfiguredWindow(POINT) {
  return clickHitResult;
}

void TestClickRouting() {
  Check(RouteClick("accessibility", false) == ClickRoute::Accessibility &&
            RouteClick("accessibility", true) == ClickRoute::Accessibility,
        "an accessibility click never needs physical input");
  Check(RouteClick("auto", true) == ClickRoute::Physical, "an automatic click uses physical input when it can be delivered");
  Check(RouteClick("auto", false) == ClickRoute::Accessibility,
        "an automatic click falls back to the accessibility click when input cannot be delivered");
  Check(RouteClick("physical", true) == ClickRoute::Physical, "a physical click uses physical input");
  Check(RouteClick("physical", false) == ClickRoute::Unavailable,
        "a physical click never falls back to the accessibility click");
  Check(FailureCode([]() { RouteClick("pointer", true); }) == kErrorInvalidParams &&
            FailureCode([]() { RouteClick("", false); }) == kErrorInvalidParams,
        "an unknown click mode is rejected");

  const auto presses = [](const char* actions) { return ActionsPressKeys(json::Value::Parse(actions)); };
  Check(presses(R"([{"type":"key","id":"k","actions":[{"type":"keyDown","value":"a"}]}])"),
        "a key down presses a key");
  Check(!presses(R"([{"type":"key","id":"k","actions":[{"type":"keyUp","value":"a"}]}])"),
        "a key up alone presses nothing");
  Check(!presses(R"([{"type":"key","id":"k","actions":[{"type":"keyDown","value":"\uE000"}]}])"),
        "the null key releases instead of pressing");
  Check(presses(R"([{"type":"key","id":"k","actions":[{"type":"keyDown","value":"\uE000"},{"type":"keyDown","value":"b"}]}])"),
        "a press after the null key still presses a key");
  Check(!presses(R"([{"type":"key","id":"k","actions":[{"type":"keyDown"}]}])"),
        "a key down without a value is left to validation");
  Check(!presses(R"([{"type":"pointer","id":"m","actions":[{"type":"pointerDown","button":0}]}])"),
        "pointer input presses no key");
  Check(!presses(R"([{"type":"key","id":"k","actions":[{"type":"pause","duration":10}]}])"), "a pause presses nothing");
  Check(presses(R"([{"type":"pointer","id":"m","actions":[]},{"type":"key","id":"k","actions":[{"type":"keyDown","value":"c"}]}])"),
        "a key source is found among other input sources");
  Check(!presses("{}") && !presses("[]"), "a malformed or empty action list presses nothing");

  WindowThread windows;
  const HWND window = windows.Create(L"FurnSelfTestClick", L"Click window");
  const HWND sibling = windows.Create(L"FurnSelfTestClick", L"Click sibling");
  const POINT point{10, 10};
  const auto coveredBy = [&](HWND hit, std::string* message = nullptr) {
    clickHitResult = hit;
    return FailureCode([&]() { RequireClickPointOwnedBy(window, point, &HitConfiguredWindow); }, message);
  };
  Check(coveredBy(nullptr) == "none", "a point that hits no window passes");
  Check(coveredBy(window) == "none", "a point on the target window passes");
  Check(coveredBy(sibling) == "none", "a point on another window of the same application passes");
  Check(FailureCode([&]() { RequireClickPointOwnedBy(window, POINT{-32000 + 20, -32000 + 20}); }) == "none",
        "the real hit test never refuses an offscreen window of the same process");
  const HWND foreign = ForeignWindow();
  clickHitResult = foreign;
  Check(FailureCode([&]() { RequireClickPointOwnedBy(nullptr, point, &HitConfiguredWindow); }) == "none",
        "an element without a window skips the cover check");
  if (foreign == nullptr) {
    NoteSkippedForeignChecks();
    return;
  }
  std::string message;
  Check(coveredBy(foreign, &message) == kErrorNotInteractable && Contains(message, DescribeWindowHandle(foreign)) &&
            Contains(message, "another application"),
        "a window of another application covering the point refuses the click and is named");
}

void TestDriverKeyRouting() {
  ResetMutationQuarantineForTesting();
  const CancellationToken token;
  const HWND foreign = ForeignWindow();
  HWND foreground = nullptr;
  bool loseForegroundAfterTwoInputs = false;
  int foregroundReads = 0;
  std::vector<HWND> activations;
  bool activationSucceeds = false;
  bool locked = false;

  WindowThread windows;
  const HWND window = windows.Create(L"FurnSelfTestKeys", L"Key window");
  const HWND popup = windows.Create(L"FurnSelfTestKeys", L"Key popup");
  Driver driver;
  driver.AdoptWindowForTesting(window, L"Key window");
  driver.InputForTesting().UseTestSender(&RecordInput);
  driver.InputForTesting().UseTestEnvironment([&locked]() {
    return InteractiveWith([locked](InputEnvironment& environment) {
      environment.lock = locked ? SessionLock::Locked : SessionLock::Unlocked;
    });
  });
  driver.UseTestForeground(
      [&]() {
        foregroundReads += 1;
        return loseForegroundAfterTwoInputs && recordedInputs.size() >= 2 ? foreign : foreground;
      },
      [&](HWND target, const CancellationToken&) {
        activations.push_back(target);
        if (activationSucceeds) {
          foreground = target;
        }
        return activationSucceeds;
      });

  const auto perform = [&](const char* actions, std::string* message = nullptr) {
    json::Value request = json::Value::Object();
    request.Set("actions", json::Value::Parse(actions));
    return FailureCode([&]() { driver.Execute("performActions", request, token); }, message);
  };
  const auto reset = [&]() {
    recordedInputs.clear();
    activations.clear();
    foregroundReads = 0;
  };
  constexpr const char* kTypeA =
      R"([{"type":"key","id":"keyboard","actions":[{"type":"keyDown","value":"a"},{"type":"keyUp","value":"a"}]}])";

  reset();
  foreground = window;
  Check(perform(kTypeA) == "none" && recordedInputs.size() == 2 && activations.empty(),
        "keys reach the application without activation when it already holds the foreground");
  reset();
  foreground = popup;
  Check(perform(kTypeA) == "none" && recordedInputs.size() == 2 && activations.empty(),
        "a window of the application keeps a foreground it already holds");

  if (foreign == nullptr) {
    NoteSkippedForeignChecks();
  } else {
    reset();
    foreground = foreign;
    activationSucceeds = false;
    std::string message;
    Check(perform(kTypeA, &message) == kErrorWindowActivation && recordedInputs.empty() &&
              !driver.HasDepressedInput() && Contains(message, "launched or attached to"),
          "keys are refused when another application keeps the foreground");
    Check(activations.size() == 1 && activations.front() == window,
          "the application is brought forward once before its keys are refused");

    reset();
    foreground = foreign;
    activationSucceeds = true;
    Check(perform(kTypeA) == "none" && recordedInputs.size() == 2 && activations.size() == 1,
          "keys are sent once activation brings the application forward");

    reset();
    activationSucceeds = false;
    foreground = window;
    loseForegroundAfterTwoInputs = true;
    constexpr const char* kTypeAB =
        R"([{"type":"key","id":"keyboard","actions":[{"type":"keyDown","value":"a"},{"type":"keyUp","value":"a"},{"type":"keyDown","value":"b"},{"type":"keyUp","value":"b"}]}])";
    Check(perform(kTypeAB) == kErrorWindowActivation && recordedInputs.size() == 2 && !driver.HasDepressedInput(),
          "a foreground change in the middle of a sequence stops the keys that follow it");
    loseForegroundAfterTwoInputs = false;
  }

  reset();
  foreground = nullptr;
  Check(perform(R"([{"type":"pointer","id":"mouse","parameters":{"pointerType":"mouse"},"actions":[{"type":"pointerDown","button":0},{"type":"pointerUp","button":0}]}])") ==
                "none" &&
            recordedInputs.size() == 2 && foregroundReads == 0 && activations.empty(),
        "pointer input neither reads nor changes the foreground");
  reset();
  Check(perform(R"([{"type":"key","id":"keyboard","actions":[{"type":"keyUp","value":"a"}]}])") == "none" &&
            recordedInputs.size() == 1 && foregroundReads == 0,
        "a key release alone never consults the foreground");
  reset();
  Check(perform(R"([{"type":"key","id":"keyboard","actions":[{"type":"keyDown","value":"\uE000"}]}])") == "none" &&
            foregroundReads == 0 && activations.empty(),
        "the null key never consults the foreground");
  reset();
  Check(perform(R"([{"type":"key","id":"keyboard","actions":[{"type":"keyDown"}]}])") == kErrorInvalidParams &&
            foregroundReads == 0 && activations.empty(),
        "an invalid key action is reported without touching the foreground");

  const auto physicalFeatures = [&]() {
    const CommandResult probe = driver.Execute("probe", json::Value::Object(), token);
    const json::Value* features = probe.result.Find("features");
    return features != nullptr && features->BoolField("physicalClick") && features->BoolField("keyboard") &&
           features->BoolField("wheel");
  };
  reset();
  foreground = window;
  Check(physicalFeatures(), "a probe reports physical input while the session is interactive");
  locked = true;
  std::string message;
  Check(perform(kTypeA, &message) == kErrorInputUnavailable && Contains(message, "locked") && recordedInputs.empty(),
        "a locked session refuses a key sequence and says why");
  Check(!physicalFeatures(), "a probe re-reads the session and reports physical input unavailable");
  locked = false;
  Check(physicalFeatures(), "a probe reports physical input again once the session unlocks");
}

ElementFingerprint Fingerprint(DWORD processId, CONTROLTYPEID controlType, const char* automationId,
                               const char* className) {
  ElementFingerprint fingerprint;
  fingerprint.processId = processId;
  fingerprint.controlType = controlType;
  fingerprint.automationId = automationId;
  fingerprint.className = className;
  return fingerprint;
}

ElementRecord Candidate(const std::wstring& key, const std::string& parentId = {},
                        const std::string& windowId = "window-a", const ElementFingerprint& fingerprint = {}) {
  ElementRecord record;
  record.runtimeKey = key;
  record.parentId = parentId;
  record.windowId = windowId;
  record.fingerprint = fingerprint;
  return record;
}

// Each registration is its own observation, the way separate reads are.
std::string RegisterNew(ElementRegistry& registry, ElementRecord candidate) {
  return registry.Register(std::move(candidate), registry.BeginObservation());
}

void TestElementFingerprints() {
  const ElementFingerprint button = Fingerprint(100, UIA_ButtonControlTypeId, "save", "Button");
  struct Case {
    const char* name;
    ElementFingerprint observed;
    bool conflicts;
  };
  const Case cases[] = {
      {"the same values", button, false},
      {"nothing known", {}, false},
      {"a different process", Fingerprint(200, UIA_ButtonControlTypeId, "save", "Button"), true},
      {"a different control type", Fingerprint(100, UIA_EditControlTypeId, "save", "Button"), true},
      {"a different automation id", Fingerprint(100, UIA_ButtonControlTypeId, "cancel", "Button"), true},
      {"a different class", Fingerprint(100, UIA_ButtonControlTypeId, "save", "Edit"), true},
      {"an unanswered process", Fingerprint(0, UIA_ButtonControlTypeId, "save", "Button"), false},
      {"an unanswered control type", Fingerprint(100, 0, "save", "Button"), false},
      {"an unanswered automation id", Fingerprint(100, UIA_ButtonControlTypeId, "", "Button"), false},
      {"an unanswered class", Fingerprint(100, UIA_ButtonControlTypeId, "save", ""), false},
      {"one unanswered value beside a different one", Fingerprint(0, UIA_ButtonControlTypeId, "cancel", "Button"),
       true},
  };
  for (const Case& entry : cases) {
    Check(FingerprintsConflict(button, entry.observed) == entry.conflicts &&
              FingerprintsConflict(entry.observed, button) == entry.conflicts,
          std::string("fingerprints ") + (entry.conflicts ? "conflict" : "agree") + " for " + entry.name);
  }

  const ElementFingerprint merged = MergeFingerprints(Fingerprint(100, 0, "", "Button"),
                                                       Fingerprint(999, UIA_EditControlTypeId, "save", "Other"));
  Check(merged.processId == 100 && merged.controlType == UIA_EditControlTypeId && merged.automationId == "save" &&
            merged.className == "Button",
        "merging keeps what was already known and fills only what was missing");
}

void TestElementRegistryIdentity() {
  const ElementFingerprint button = Fingerprint(100, UIA_ButtonControlTypeId, "save", "Button");
  ElementRegistry registry;
  const std::string first = RegisterNew(registry, Candidate(L"1.2.", {}, "window-a", button));
  const std::string again = RegisterNew(registry, Candidate(L"1.2.", {}, "window-b", button));
  Check(!first.empty() && again == first && registry.size() == 1,
        "a native identity keeps its id when it is observed again");
  const ElementRecord* known = registry.FindByRuntimeKey(L"1.2.");
  Check(known != nullptr && known->id == first && known->windowId == "window-b",
        "observing an element again refreshes where it lives");
  Check(registry.FindByRuntimeKey(L"9.9.") == nullptr && registry.FindByRuntimeKey(L"") == nullptr,
        "an unknown or empty native identity matches nothing");

  const std::string replacement =
      RegisterNew(registry, Candidate(L"1.2.", {}, "window-a", Fingerprint(100, UIA_EditControlTypeId, "save", "Edit")));
  std::string message;
  Check(replacement != first && registry.size() == 1 && registry.Contains(replacement) && !registry.Contains(first) &&
            FailureCode([&]() { registry.Require(first); }, &message) == kErrorStaleElement &&
            Contains(message, first),
        "an element that reuses a native identity gets a new id and the old id answers stale-element");

  ElementRegistry partial;
  const std::string early = RegisterNew(partial, Candidate(L"7.", {}, "window-a", Fingerprint(100, 0, "", "")));
  const std::string later = RegisterNew(
      partial, Candidate(L"7.", {}, "window-a", Fingerprint(100, UIA_ButtonControlTypeId, "save", "")));
  const std::string last =
      RegisterNew(partial, Candidate(L"7.", {}, "window-a", Fingerprint(0, 0, "cancel", "")));
  Check(later == early, "a provider that answers more later keeps the id the element had");
  Check(last != later && !partial.Contains(later), "what was learned about an element is held against later reads");

  ElementRegistry keyless;
  const std::string unnamed = RegisterNew(keyless, Candidate(L""));
  const std::string unnamedAgain = RegisterNew(keyless, Candidate(L""));
  Check(unnamed != unnamedAgain && keyless.size() == 2,
        "an element without a native identity gets a new id each time it is seen");

  ElementRegistry cycling;
  std::set<std::string> issued;
  for (int round = 0; round < 5; round += 1) {
    const std::string id = RegisterNew(cycling, Candidate(L"5."));
    issued.insert(id);
    cycling.Erase(id);
  }
  Check(issued.size() == 5, "an id that was dropped is never issued again");

  ElementRegistry tree;
  const std::string parent = RegisterNew(tree, Candidate(L"1."));
  const std::string child = RegisterNew(tree, Candidate(L"2.", parent));
  const std::string grandchild = RegisterNew(tree, Candidate(L"3.", child));
  const std::string sibling = RegisterNew(tree, Candidate(L"4."));
  tree.Erase(child);
  Check(tree.Contains(parent) && !tree.Contains(child) && !tree.Contains(grandchild) && tree.Contains(sibling) &&
            tree.FindByRuntimeKey(L"3.") == nullptr && tree.ParentsRetainedForTesting(),
        "dropping an element also drops everything beneath it");

  ElementRegistry windows;
  const std::string first_a = RegisterNew(windows, Candidate(L"1.", {}, "window-a"));
  RegisterNew(windows, Candidate(L"2.", first_a, "window-a"));
  const std::string first_b = RegisterNew(windows, Candidate(L"3.", {}, "window-b"));
  windows.ForgetWindow("window-a");
  Check(windows.size() == 1 && windows.Contains(first_b) && windows.FindByRuntimeKey(L"1.") == nullptr &&
            windows.FindByRuntimeKey(L"2.") == nullptr,
        "forgetting a window releases its elements and their native identities");
  Check(RegisterNew(windows, Candidate(L"1.", {}, "window-a")) != first_a,
        "an element of a forgotten window is issued a new id");

  windows.Erase("element-missing");
  windows.SetScope("element-missing", ElementScope::Preview);
  windows.Refresh("element-missing", winrt::com_ptr<IUIAutomationElement>(), ElementFingerprint());
  Check(windows.size() == 2, "dropping or refreshing an untracked id changes nothing");
  windows.Clear();
  Check(windows.size() == 0 && windows.FindByRuntimeKey(L"3.") == nullptr,
        "clearing the table releases every element and native identity");
}

void TestElementRegistryRetention() {
  // A capacity of 20 releases down to 18, so each overflow drops the oldest few.
  const auto fill = [](ElementRegistry& registry) {
    std::vector<std::string> ids;
    for (int index = 0; index < 20; index += 1) {
      ids.push_back(RegisterNew(registry, Candidate(L"k" + std::to_wstring(index) + L".")));
    }
    return ids;
  };

  ElementRegistry oldest(20);
  std::vector<std::string> ids = fill(oldest);
  Check(oldest.size() == 20, "a table at its capacity keeps every element");
  ids.push_back(RegisterNew(oldest, Candidate(L"k20.")));
  Check(oldest.size() == 18 && !oldest.Contains(ids[0]) && !oldest.Contains(ids[1]) && !oldest.Contains(ids[2]) &&
            oldest.Contains(ids[3]) && oldest.Contains(ids[20]),
        "going over capacity releases the least recently observed elements");
  std::string message;
  Check(FailureCode([&]() { oldest.Require(ids[0]); }, &message) == kErrorStaleElement &&
            Contains(message, "bound retained memory"),
        "a released element answers stale-element and says why");
  Check(RegisterNew(oldest, Candidate(L"k0.")) != ids[0], "a released element that is seen again gets a new id");

  ElementRegistry used(20);
  std::vector<std::string> usedIds = fill(used);
  used.Require(usedIds[0]);
  usedIds.push_back(RegisterNew(used, Candidate(L"k20.")));
  Check(used.Contains(usedIds[0]) && !used.Contains(usedIds[1]) && !used.Contains(usedIds[2]) &&
            !used.Contains(usedIds[3]),
        "using an element protects it from release");

  ElementRegistry seen(20);
  const std::vector<std::string> seenIds = fill(seen);
  Check(RegisterNew(seen, Candidate(L"k0.")) == seenIds[0], "an element observed again keeps its id");
  RegisterNew(seen, Candidate(L"k20."));
  Check(seen.Contains(seenIds[0]) && !seen.Contains(seenIds[1]), "observing an element again protects it from release");

  ElementRegistry wide(20);
  const std::uint64_t generation = wide.BeginObservation();
  for (int index = 0; index < 30; index += 1) {
    wide.Register(Candidate(L"w" + std::to_wstring(index) + L"."), generation);
  }
  Check(wide.size() == 30, "an observation in progress is never released, even when it alone exceeds the capacity");
  RegisterNew(wide, Candidate(L"next."));
  Check(wide.size() == 1, "the next observation releases an older one as a whole");

  ElementRegistry closure(20);
  const std::uint64_t firstGeneration = closure.BeginObservation();
  const std::string root = closure.Register(Candidate(L"root."), firstGeneration);
  const std::string leaf = closure.Register(Candidate(L"leaf.", root), firstGeneration);
  for (int index = 0; index < 18; index += 1) {
    RegisterNew(closure, Candidate(L"f" + std::to_wstring(index) + L"."));
  }
  closure.Require(leaf);
  RegisterNew(closure, Candidate(L"overflow."));
  Check(closure.Contains(root) && closure.Contains(leaf) && closure.size() == 18 && closure.ParentsRetainedForTesting(),
        "using an element keeps its ancestors");

  ElementRegistry subtree(20);
  const std::uint64_t subtreeGeneration = subtree.BeginObservation();
  const std::string top = subtree.Register(Candidate(L"top."), subtreeGeneration);
  const std::string middle = subtree.Register(Candidate(L"middle.", top), subtreeGeneration);
  const std::string bottom = subtree.Register(Candidate(L"bottom.", middle), subtreeGeneration);
  for (int index = 0; index < 17; index += 1) {
    RegisterNew(subtree, Candidate(L"s" + std::to_wstring(index) + L"."));
  }
  RegisterNew(subtree, Candidate(L"overflow."));
  Check(!subtree.Contains(top) && !subtree.Contains(middle) && !subtree.Contains(bottom) &&
            subtree.ParentsRetainedForTesting(),
        "an old subtree is released together, never leaving a child without its parent");

  Check(ElementRegistry(0).capacity() == 1, "a zero capacity is raised so the table can hold an element");
}

void TestElementRegistryChurn() {
  ElementRegistry registry(100);
  std::string rootId;
  std::vector<std::string> stableIds;
  bool bounded = true;
  bool stableKept = true;
  bool parentsKept = true;
  for (int observation = 0; observation < 500; observation += 1) {
    const std::uint64_t generation = registry.BeginObservation();
    const std::string root = registry.Register(Candidate(L"stable-root."), generation);
    std::vector<std::string> stable;
    for (int index = 0; index < 4; index += 1) {
      stable.push_back(registry.Register(Candidate(L"stable-" + std::to_wstring(index) + L".", root), generation));
    }
    // Fresh elements arrive in chains of four, the way a rebuilt subtree does.
    std::string parent = root;
    for (int index = 0; index < 20; index += 1) {
      const std::wstring key = L"fresh-" + std::to_wstring(observation) + L"-" + std::to_wstring(index) + L".";
      const std::string id = registry.Register(Candidate(key, index % 4 == 0 ? root : parent), generation);
      parent = id;
    }
    if (observation == 0) {
      rootId = root;
      stableIds = stable;
    }
    stableKept = stableKept && root == rootId && stable == stableIds;
    bounded = bounded && registry.size() <= registry.capacity();
    parentsKept = parentsKept && registry.ParentsRetainedForTesting();
  }
  Check(bounded, "retained elements stay within the capacity across 500 observations");
  Check(stableKept, "elements observed every time keep their ids while others churn");
  Check(parentsKept, "churn never leaves an element whose parent was released");
}

// What a refresh reports is the one place a replaced element shows, so these
// tests give the registry a fingerprint that disagrees with the real control.
void TestAutomationElementIdentity() {
  const CancellationToken token;
  WindowThread windows;
  const HWND window = windows.Create(L"FurnSelfTestIdentity", L"Identity window");
  const HWND button = windows.CreateChild(window, L"BUTTON", L"Identity button", 101);
  const HWND edit = windows.CreateChild(window, L"EDIT", L"Identity text", 102);
  Check(window != nullptr && button != nullptr && edit != nullptr,
        "the identity fixture creates a window with two controls");
  if (window == nullptr || button == nullptr || edit == nullptr) {
    return;
  }

  Automation automation;
  ElementRegistry& registry = automation.RegistryForTesting();
  WindowContext context;
  context.windowId = "window-identity";
  context.window = window;
  context.primary = true;

  const auto ids = [](const std::vector<ElementSnapshot>& tree) {
    std::vector<std::string> result;
    for (const ElementSnapshot& snapshot : tree) {
      result.push_back(snapshot.id);
    }
    return result;
  };
  const auto idOfRole = [](const std::vector<ElementSnapshot>& tree, const char* role) {
    for (const ElementSnapshot& snapshot : tree) {
      if (snapshot.role == role) {
        return snapshot.id;
      }
    }
    return std::string();
  };

  const std::vector<ElementSnapshot> first = automation.SnapshotWindowTree(context, token);
  const std::string rootId = first.empty() ? std::string() : first.front().id;
  const std::string buttonId = idOfRole(first, "button");
  const std::string editId = idOfRole(first, "textbox");
  Check(!rootId.empty() && !buttonId.empty() && !editId.empty() && registry.size() == first.size(),
        "a window tree registers one id for each element it lists");
  if (buttonId.empty() || editId.empty()) {
    return;
  }

  const std::vector<ElementSnapshot> second = automation.SnapshotWindowTree(context, token);
  Check(ids(second) == ids(first) && registry.size() == first.size(),
        "reading the tree again keeps every id and adds none");
  const ElementSnapshot live = automation.SnapshotElement(buttonId, token);
  Check(live.id == buttonId && live.role == "button" && live.name == "Identity button",
        "a tracked id reads the element it was issued for");

  // A recycled native identity reaches a different element through the old
  // reference; the stored fingerprint stands in for the original occupant.
  registry.SetFingerprintForTesting(buttonId, Fingerprint(0, UIA_EditControlTypeId, "", ""));
  std::string message;
  Check(FailureCode([&]() { automation.SnapshotElement(buttonId, token); }, &message) == kErrorStaleElement &&
            Contains(message, "reused its native identity"),
        "a reference whose element now reports a different control type is refused as stale");
  Check(!registry.Contains(buttonId) &&
            FailureCode([&]() { automation.SnapshotElement(buttonId, token); }) == kErrorStaleElement,
        "a refused reference is released and stays stale");
  const std::vector<ElementSnapshot> third = automation.SnapshotWindowTree(context, token);
  const std::string renewedButtonId = idOfRole(third, "button");
  Check(!renewedButtonId.empty() && renewedButtonId != buttonId && idOfRole(third, "textbox") == editId,
        "the element is found again under a new id while unaffected elements keep theirs");

  registry.SetFingerprintForTesting(renewedButtonId, Fingerprint(0, 0, "", "NotAButton"));
  const std::vector<ElementSnapshot> fourth = automation.SnapshotWindowTree(context, token);
  const std::string finalButtonId = idOfRole(fourth, "button");
  Check(!finalButtonId.empty() && finalButtonId != renewedButtonId && !registry.Contains(renewedButtonId),
        "a walk that meets a conflicting fingerprint issues a new id and releases the old one");

  const Selector buttons{"tag name", "button"};
  const std::vector<ElementSnapshot> scoped = automation.Find(context, rootId, buttons, token);
  Check(scoped.size() == 1 && scoped.front().id == finalButtonId,
        "a find under a tracked root returns the ids the tree reported");
  registry.SetFingerprintForTesting(rootId, Fingerprint(0, UIA_ButtonControlTypeId, "", ""));
  Check(FailureCode([&]() { automation.Find(context, rootId, buttons, token); }, &message) == kErrorStaleElement &&
            Contains(message, "reused its native identity"),
        "a find under a replaced root fails before it searches the successor");
  Check(registry.size() == 0, "a replaced root releases everything that was registered beneath it");

  const std::vector<ElementSnapshot> fifth = automation.SnapshotWindowTree(context, token);
  const std::string lastEditId = idOfRole(fifth, "textbox");
  windows.Destroy(window);
  Check(FailureCode([&]() { automation.SnapshotElement(lastEditId, token); }, &message) == kErrorStaleElement,
        "an element of a destroyed window answers stale-element");
  automation.ForgetWindow(context.windowId);
  Check(registry.size() == 0, "forgetting a window releases every element it registered");
}

void TestAutomationRetention() {
  const CancellationToken token;
  WindowThread windows;
  const HWND window = windows.Create(L"FurnSelfTestRetention", L"Retention window");
  Automation automation(12);
  ElementRegistry& registry = automation.RegistryForTesting();
  WindowContext context;
  context.windowId = "window-retention";
  context.window = window;
  context.primary = true;

  std::size_t largest = 0;
  bool parentsKept = true;
  std::set<std::string> issued;
  for (int cycle = 0; cycle < 60; cycle += 1) {
    const HWND child = windows.CreateChild(window, L"BUTTON", L"Churn", 200 + cycle);
    for (const ElementSnapshot& snapshot : automation.SnapshotWindowTree(context, token)) {
      issued.insert(snapshot.id);
    }
    largest = std::max(largest, registry.size());
    parentsKept = parentsKept && registry.ParentsRetainedForTesting();
    windows.Destroy(child);
  }
  Check(issued.size() > registry.capacity(), "the retention fixture issues more ids than the table can hold");
  Check(largest <= registry.capacity() && parentsKept,
        "retained elements stay within the capacity while a window creates and destroys controls");
}

void TestDriverRefusesReplacedElements() {
  commandNotifications.store(0);
  const CancellationToken token;
  WindowThread windows;
  const HWND window = windows.Create(L"FurnSelfTestGate", L"Gate window", &CountingWindowProc);
  const HWND button = windows.CreateChild(window, L"BUTTON", L"Gate button", 101);
  Check(window != nullptr && button != nullptr, "the gate fixture creates a window with a button");
  if (window == nullptr || button == nullptr) {
    return;
  }

  Driver driver;
  json::Value leaseRequest = json::Value::Object();
  leaseRequest.Set("lease", driver.AdoptWindowForTesting(window, L"Gate window"));
  const CommandResult listed = driver.Execute("windows", leaseRequest, token);
  const std::string windowId = listed.result.IsArray() && listed.result.Items().size() == 1
                                   ? listed.result.Items().front().StringField("id")
                                   : std::string();
  json::Value treeRequest = json::Value::Object();
  treeRequest.Set("windowId", json::Value::String(windowId));
  const auto buttonId = [&]() {
    const CommandResult tree = driver.Execute("tree", treeRequest, token);
    for (const json::Value& entry : tree.result.Items()) {
      if (entry.StringField("role") == "button") {
        return entry.StringField("id");
      }
    }
    return std::string();
  };
  const std::string id = buttonId();
  Check(!windowId.empty() && !id.empty(), "the driver lists the button of an adopted window");
  if (id.empty()) {
    return;
  }
  const CommandResult eventReport = driver.Execute("windowEvents", leaseRequest, token);
  const json::Value* retention = eventReport.result.Find("retention");
  const json::Value* retained = retention == nullptr ? nullptr : retention->Find("retainedElements");
  Check(retained != nullptr && retained->AsInteger() > 0 &&
            retained->AsInteger() ==
                static_cast<std::int64_t>(driver.AutomationForTesting().RegistryForTesting().size()),
        "the retention figures count the elements an observation registered");

  json::Value request = json::Value::Object();
  request.Set("elementId", json::Value::String(id));
  request.Set("mode", json::Value::String(std::string("accessibility")));
  Check(FailureCode([&]() { driver.Execute("click", request, token); }) == "none" &&
            WaitFor([]() { return commandNotifications.load() >= 1; }),
        "an accessibility click on a tracked element reaches the control");

  driver.AutomationForTesting().RegistryForTesting().SetFingerprintForTesting(id,
                                                                              Fingerprint(0, UIA_EditControlTypeId, "", ""));
  const int before = commandNotifications.load();
  Check(FailureCode([&]() { driver.Execute("click", request, token); }) == kErrorStaleElement,
        "a click on an element that was replaced is refused as stale");
  Check(FailureCode([&]() { driver.Execute("snapshot", request, token); }) == kErrorStaleElement,
        "a snapshot of a refused element stays stale");
  Sleep(150);
  Check(commandNotifications.load() == before, "a refused click reaches nothing");
}

void TestDriverDisabledElements() {
  const CancellationToken token;
  WindowThread windows;
  const HWND window = windows.Create(L"FurnSelfTestDisabled", L"Disabled window", &CountingWindowProc);
  const HWND button = windows.CreateChild(window, L"BUTTON", L"Disabled button", 101);
  Check(window != nullptr && button != nullptr, "the disabled fixture creates a window with a button");
  if (window == nullptr || button == nullptr) {
    return;
  }
  EnableWindow(button, FALSE);

  commandNotifications.store(0);
  Driver driver;
  json::Value leaseRequest = json::Value::Object();
  leaseRequest.Set("lease", driver.AdoptWindowForTesting(window, L"Disabled window"));
  const CommandResult listed = driver.Execute("windows", leaseRequest, token);
  const std::string windowId = listed.result.IsArray() && listed.result.Items().size() == 1
                                   ? listed.result.Items().front().StringField("id")
                                   : std::string();
  json::Value treeRequest = json::Value::Object();
  treeRequest.Set("windowId", json::Value::String(windowId));
  std::string id;
  const CommandResult tree = driver.Execute("tree", treeRequest, token);
  for (const json::Value& entry : tree.result.Items()) {
    if (entry.StringField("role") == "button") {
      id = entry.StringField("id");
    }
  }
  Check(!id.empty(), "the driver lists the disabled button");
  if (id.empty()) {
    return;
  }

  json::Value request = json::Value::Object();
  request.Set("elementId", json::Value::String(id));
  request.Set("mode", json::Value::String(std::string("accessibility")));
  std::string message;
  std::string code;
  const std::string effect = FailureEffect(
      [&]() {
        try {
          driver.Execute("click", request, token);
        } catch (const HelperError& error) {
          message = error.what();
          throw;
        }
      },
      &code);
  Check(code == kErrorNotInteractable && Contains(message, "not enabled"),
        "an accessibility click on a disabled element is refused as not interactable");
  Check(effect == "none", "a click the provider refuses as not enabled reports no effect");
  Sleep(100);
  Check(commandNotifications.load() == 0, "a click on a disabled element reaches nothing");
  Check(!MutationsQuarantined(), "a disabled element does not quarantine later mutations");
}

json::Value StringFields(std::initializer_list<std::pair<const char*, std::string>> fields) {
  json::Value value = json::Value::Object();
  for (const auto& [name, text] : fields) {
    value.Set(name, json::Value::String(text));
  }
  return value;
}

void TestEffectLedger() {
  EffectLedger ledger;
  Check(ledger.Effect() == MutationEffect::None, "a command that dispatched nothing has no effect");
  ledger.Delivered();
  Check(ledger.Effect() == MutationEffect::Partial, "a delivered mutation is a partial effect");
  ledger.Reset();
  Check(ledger.Effect() == MutationEffect::None, "each command starts with an empty ledger");
  ledger.Dispatching();
  Check(ledger.Effect() == MutationEffect::Unknown, "a dispatch that has not settled leaves the effect unknown");
  ledger.Settled(S_OK);
  Check(ledger.Effect() == MutationEffect::Partial, "a dispatch that settles successfully is applied");

  bool refusalsProveNothing = true;
  for (const HRESULT refused : {static_cast<HRESULT>(0x80040200), static_cast<HRESULT>(0x80040201),
                                static_cast<HRESULT>(0x80040204), static_cast<HRESULT>(0x80131509), E_INVALIDARG,
                                E_NOTIMPL, E_NOINTERFACE, E_ACCESSDENIED}) {
    ledger.Reset();
    ledger.Dispatching();
    ledger.Settled(refused);
    refusalsProveNothing = refusalsProveNothing && ProvesNoEffect(refused) && ledger.Effect() == MutationEffect::None;
  }
  Check(refusalsProveNothing, "a provider refusal proves the mutation never acted");
  bool failuresStayUnknown = true;
  for (const HRESULT failed : {E_FAIL, RPC_E_DISCONNECTED, kUiaTimeoutResult}) {
    ledger.Reset();
    ledger.Dispatching();
    ledger.Settled(failed);
    failuresStayUnknown = failuresStayUnknown && !ProvesNoEffect(failed) && ledger.Effect() == MutationEffect::Unknown;
  }
  Check(failuresStayUnknown, "a provider failure that may have acted leaves the effect unknown");

  ledger.Reset();
  ledger.Dispatching();
  ledger.Settled(E_FAIL);
  ledger.Delivered();
  ledger.Dispatching();
  ledger.Settled(S_OK);
  Check(ledger.Effect() == MutationEffect::Unknown, "later mutations never resolve an earlier unknown dispatch");
  ledger.Reset();
  ledger.Delivered();
  ledger.Dispatching();
  ledger.Settled(E_ACCESSDENIED);
  Check(ledger.Effect() == MutationEffect::Partial, "a refusal after a delivered mutation keeps the partial effect");

  EffectLedger outer;
  EffectLedger inner;
  RecordDelivered();
  {
    const EffectScope outerScope(outer);
    {
      const EffectScope innerScope(inner);
      RecordDelivered();
    }
    RecordDispatching();
  }
  RecordDispatching();
  Check(inner.Effect() == MutationEffect::Partial && outer.Effect() == MutationEffect::Unknown,
        "records reach the innermost active scope and are ignored outside every scope");

  // The bounded provider call a counted mutation makes, abandoned at its deadline.
  ResetMutationQuarantineForTesting();
  EffectLedger abandoned;
  const auto gate = std::make_shared<Gate>();
  std::string code;
  {
    const EffectScope scope(abandoned);
    code = FailureCode([&]() {
      RecordDispatching();
      RecordSettled(RunBoundedProviderCall(ProviderCall::Mutation, [gate]() { return gate->Hold(); }, 50,
                                           "Testing the provider", kErrorAutomationFailed));
    });
  }
  gate->Open();
  Check(code == kErrorMutationIndeterminate && abandoned.Effect() == MutationEffect::Unknown,
        "a provider mutation abandoned at its deadline leaves the effect unknown");
  std::string refusal;
  WaitFor([&refusal]() {
    FailureCode([]() { RequireMutationsAllowed(); }, &refusal);
    return Contains(refusal, "completed late");
  });
  ResetMutationQuarantineForTesting();

  // A cancelled command stops waiting for a stalled provider call well before
  // the call's own bound, and a mutation it abandons leaves the effect unknown.
  CancellationToken cancelled;
  cancelled.Cancel();
  const auto cancelledCall = [&cancelled](ProviderCall kind, const std::shared_ptr<Gate>& stalled,
                                          EffectLedger& ledger) {
    const CancellationScope cancellationScope(cancelled);
    const EffectScope effectScope(ledger);
    const ULONGLONG started = GetTickCount64();
    std::string outcome = "none";
    try {
      RunBoundedProviderCall(kind, [stalled]() { return stalled->Hold(); }, 5000, "Testing the provider",
                             kErrorAutomationFailed);
    } catch (const CancelledError&) {
      outcome = "cancelled";
    } catch (const HelperError& error) {
      outcome = error.code();
    }
    return GetTickCount64() - started < 1000 ? outcome : outcome + " late";
  };
  EffectLedger readLedger;
  const auto stalledRead = std::make_shared<Gate>();
  Check(cancelledCall(ProviderCall::Read, stalledRead, readLedger) == "cancelled" &&
            readLedger.Effect() == MutationEffect::None && !MutationsQuarantined(),
        "a cancelled command stops waiting for a stalled read without quarantining the session");
  stalledRead->Open();
  EffectLedger mutationLedger;
  const auto stalledMutation = std::make_shared<Gate>();
  Check(cancelledCall(ProviderCall::Mutation, stalledMutation, mutationLedger) == "cancelled" &&
            mutationLedger.Effect() == MutationEffect::Unknown && MutationsQuarantined(),
        "a cancelled command stops waiting for a stalled mutation, leaving its effect unknown and quarantined");
  FailureCode([]() { RequireMutationsAllowed(); }, &refusal);
  Check(Contains(refusal, "cancelled before it settled"), "the quarantine names the cancelled mutation");
  stalledMutation->Open();
  ResetMutationQuarantineForTesting();
}

// Every mutating command reports what it handed to the application when it
// fails or is cancelled; reads report nothing.
void TestDriverMutationEffects() {
  ResetMutationQuarantineForTesting();
  SetEditGate(nullptr);
  buttonClicks.store(0);
  recordedInputs.clear();
  const CancellationToken token;
  WindowThread windows;
  const HWND window = windows.Create(L"FurnSelfTestEffects", L"Effects window", &CountingWindowProc);
  const HWND button = windows.CreateChild(window, L"BUTTON", L"Effects button", 101);
  const HWND edit = windows.CreateChild(window, L"EDIT", L"Effects text", 102);
  Check(window != nullptr && button != nullptr && edit != nullptr,
        "the effects fixture creates a window with a button and an edit");
  if (window == nullptr || button == nullptr || edit == nullptr) {
    return;
  }
  originalEditProc = reinterpret_cast<WNDPROC>(
      SetWindowLongPtrW(edit, GWLP_WNDPROC, reinterpret_cast<LONG_PTR>(&GatedEditProc)));

  Driver driver;
  json::Value leaseRequest = json::Value::Object();
  leaseRequest.Set("lease", driver.AdoptWindowForTesting(window, L"Effects window"));
  driver.InputForTesting().UseTestSender(&RecordInput);
  driver.InputForTesting().UseTestEnvironment([]() { return InteractiveEnvironmentForTesting(); });
  driver.UseTestForeground([window]() { return window; }, [](HWND, const CancellationToken&) { return true; });
  const CommandResult listed = driver.Execute("windows", leaseRequest, token);
  const std::string windowId = listed.result.IsArray() && listed.result.Items().size() == 1
                                   ? listed.result.Items().front().StringField("id")
                                   : std::string();
  std::string buttonId;
  std::string editId;
  const CommandResult tree = driver.Execute("tree", StringFields({{"windowId", windowId}}), token);
  for (const json::Value& entry : tree.result.Items()) {
    if (entry.StringField("role") == "button") {
      buttonId = entry.StringField("id");
    } else if (entry.StringField("role") == "textbox") {
      editId = entry.StringField("id");
    }
  }
  Check(!windowId.empty() && !buttonId.empty() && !editId.empty(), "the driver lists the effects controls");
  if (buttonId.empty() || editId.empty()) {
    return;
  }

  const auto effectOf = [&](const char* command, const json::Value& params, const CancellationToken& with,
                            std::string* code = nullptr) {
    return FailureEffect([&]() { driver.Execute(command, params, with); }, code);
  };
  const auto actions = [](const char* list) {
    json::Value request = json::Value::Object();
    request.Set("actions", json::Value::Parse(list));
    return request;
  };
  const json::Value empty = json::Value::Object();
  const json::Value unknownElement = StringFields({{"elementId", "element-unknown"}});
  const json::Value unknownWindow = StringFields({{"windowId", "window-unknown"}});
  const json::Value knownWindow = StringFields({{"windowId", windowId}});
  json::Value resize = StringFields({{"windowId", windowId}});
  resize.Set("rect", json::Value::Parse(R"({"x":0,"y":0,"width":40,"height":40})"));
  const json::Value typeA = actions(
      R"([{"type":"key","id":"keyboard","actions":[{"type":"keyDown","value":"a"},{"type":"keyUp","value":"a"}]}])");

  // Rejected before anything reached the application.
  const std::vector<std::pair<const char*, json::Value>> rejected = {
      {"click", unknownElement},
      {"performAccessibilityAction", StringFields({{"elementId", "element-unknown"}, {"key", "unknown"}})},
      {"clear", unknownElement},
      {"sendKeys", StringFields({{"elementId", buttonId}})},
      {"performActions", empty},
      {"activate", unknownWindow},
      {"closeWindow", unknownWindow},
      {"setWindowRect", knownWindow},
  };
  for (const auto& [command, params] : rejected) {
    std::string code;
    Check(effectOf(command, params, token, &code) == "none" && code != "none" && code != "cancelled",
          std::string("a rejected ") + command + " reports no effect");
  }
  // Another helper that crashed while holding physical input leaves the lock
  // abandoned, which refuses the next physical command before it starts.
  std::thread abandoner([]() {
    const HANDLE handle = CreateMutexW(nullptr, FALSE, PhysicalInputMutexName());
    if (handle != nullptr) {
      WaitForSingleObject(handle, 1000);
      CloseHandle(handle);
    }
  });
  abandoner.join();
  std::string code;
  Check(effectOf("releaseActions", empty, token, &code) == "none" && code == kErrorInputBusy,
        "a refused releaseActions reports no effect");
  driver.InputForTesting().UseTestSender(&RejectAllInput);
  Check(effectOf("performActions", typeA, token, &code) == "none" && code != "none" && code != "cancelled",
        "input that Windows refuses entirely reports no effect");
  driver.InputForTesting().UseTestSender(&RecordInput);
  Check(effectOf("getWindowRect", unknownWindow, token) == "absent" &&
            effectOf("snapshot", unknownElement, token) == "absent",
        "a failed read carries no effect");

  // Cancelled before the command started.
  CancellationToken cancelled;
  cancelled.Cancel();
  const std::vector<std::pair<const char*, json::Value>> started = {
      {"click", StringFields({{"elementId", buttonId}, {"mode", "accessibility"}})},
      {"performAccessibilityAction", StringFields({{"elementId", buttonId}, {"key", "unknown"}})},
      {"clear", StringFields({{"elementId", buttonId}})},
      {"sendKeys", StringFields({{"elementId", buttonId}, {"text", "a"}})},
      {"performActions", typeA},
      {"activate", knownWindow},
      {"closeWindow", knownWindow},
      {"setWindowRect", resize},
      {"releaseActions", empty},
  };
  for (const auto& [command, params] : started) {
    Check(effectOf(command, params, cancelled, &code) == "none" && code == "cancelled",
          std::string("a ") + command + " cancelled before it starts reports no effect");
  }
  Check(effectOf("getWindowRect", knownWindow, cancelled, &code) == "absent" && code == "cancelled",
        "a cancelled read carries no effect");
  Sleep(100);
  Check(recordedInputs.empty() && buttonClicks.load() == 0 && IsWindow(window) != FALSE,
        "rejected and cancelled mutations reach nothing");

  // A clear that names its mechanism uses only that mechanism.
  const auto clearWith = [](const std::string& elementId, const char* mechanism) {
    json::Value request = StringFields({{"elementId", elementId}});
    if (mechanism != nullptr) {
      request.Set("mechanism", json::Value::String(std::string(mechanism)));
    }
    return request;
  };
  json::Value numericMechanism = StringFields({{"elementId", editId}});
  numericMechanism.Set("mechanism", json::Value::Integer(1));
  bool unknownMechanismsRefused = true;
  for (const json::Value& params : std::vector<json::Value>{clearWith(editId, "pointer"), clearWith(editId, ""),
                                                            numericMechanism}) {
    unknownMechanismsRefused =
        unknownMechanismsRefused && effectOf("clear", params, token, &code) == "none" && code == kErrorInvalidParams;
  }
  Check(unknownMechanismsRefused, "a clear naming an unknown mechanism is refused before dispatch");
  SetWindowTextW(edit, L"abc");
  Check(effectOf("clear", clearWith(buttonId, "semantic"), token, &code) == "none" && code == kErrorNotInteractable,
        "a semantic clear of an element without a value is refused before dispatch");
  SendMessageW(edit, EM_SETREADONLY, TRUE, 0);
  Check(effectOf("clear", clearWith(editId, "semantic"), token, &code) == "none" && code == kErrorNotInteractable &&
            GetWindowTextLengthW(edit) == 3,
        "a semantic clear of a read-only value is refused before dispatch");
  SendMessageW(edit, EM_SETREADONLY, FALSE, 0);
  driver.InputForTesting().UseTestEnvironment([]() {
    return InteractiveWith([](InputEnvironment& environment) { environment.lock = SessionLock::Locked; });
  });
  Check(effectOf("clear", clearWith(editId, "keyboard"), token, &code) == "none" && code == kErrorInputUnavailable &&
            GetWindowTextLengthW(edit) == 3,
        "a keyboard clear honors the input gates instead of writing the value");
  driver.InputForTesting().UseTestEnvironment([]() { return InteractiveEnvironmentForTesting(); });
  const CommandResult semanticClear = driver.Execute("clear", clearWith(editId, "semantic"), token);
  Check(semanticClear.result.StringField("mechanism") == "semantic" && GetWindowTextLengthW(edit) == 0,
        "a semantic clear writes the value and reports it");
  SetWindowTextW(edit, L"abc");
  const CommandResult chosenClear = driver.Execute("clear", clearWith(editId, nullptr), token);
  Check(chosenClear.result.StringField("mechanism") == "semantic" && GetWindowTextLengthW(edit) == 0 &&
            recordedInputs.empty(),
        "a clear that names no mechanism reports the value write it chose");
  const CommandResult probe = driver.Execute("probe", empty, token);
  const json::Value* features = probe.result.Find("features");
  Check(features != nullptr && features->BoolField("strictClear"), "the probe reports strict clear");

  // Stopped after part of the command reached the application.
  recordedInputs.clear();
  const json::Value brokenSequence =
      actions(R"([{"type":"key","id":"keyboard","actions":[{"type":"keyDown","value":"a"},{"type":"keyDown"}]}])");
  Check(effectOf("performActions", brokenSequence, token, &code) == "partial" && code == kErrorInvalidParams &&
            !recordedInputs.empty(),
        "an action sequence that fails after delivering input reports a partial effect");
  driver.ReleaseInput();

  recordedInputs.clear();
  CancellationToken interrupted;
  cancelOnInput = &interrupted;
  driver.InputForTesting().UseTestSender(&RecordInputThenCancel);
  Check(effectOf("performActions", typeA, interrupted, &code) == "partial" && code == "cancelled" &&
            !recordedInputs.empty(),
        "an action sequence cancelled after delivering input reports a partial effect");
  cancelOnInput = nullptr;
  driver.InputForTesting().UseTestSender(&RecordInput);
  driver.ReleaseInput();

  // Abandoned: the provider never returns from the value write.
  ResetMutationQuarantineForTesting();
  const auto gate = std::make_shared<Gate>();
  SetEditGate(gate);
  Check(effectOf("clear", StringFields({{"elementId", editId}}), token, &code) == "unknown" &&
            code == kErrorMutationIndeterminate,
        "a value write that never settles reports an unknown effect");
  Check(effectOf("click", StringFields({{"elementId", buttonId}, {"mode", "accessibility"}}), token, &code) ==
                "none" &&
            code == kErrorTargetQuarantined,
        "a mutation refused by the resulting quarantine reports no effect");
  Check(effectOf("performAccessibilityAction", StringFields({{"elementId", buttonId}, {"key", "unknown"}}), token, &code) ==
                "none" && code == kErrorTargetQuarantined,
        "a named action refused by the resulting quarantine reports no effect");
  SetEditGate(nullptr);
  gate->Open();
  std::string refusal;
  WaitFor([&refusal]() {
    FailureCode([]() { RequireMutationsAllowed(); }, &refusal);
    return Contains(refusal, "completed late");
  });
  ResetMutationQuarantineForTesting();
}

// Drives the real Host over in-process pipes: a cancel for a request still in
// the queue must acknowledge it with the right effect and keep it from ever
// reaching the driver, while later requests still run.
void TestHostQueuedCancellation() {
  HANDLE hostInput = nullptr;
  HANDLE testOutput = nullptr;
  HANDLE testInput = nullptr;
  HANDLE hostOutput = nullptr;
  if (!CreatePipe(&hostInput, &testOutput, nullptr, 0) || !CreatePipe(&testInput, &hostOutput, nullptr, 0)) {
    Check(false, "the host test creates its pipes");
    return;
  }

  std::mutex mutex;
  std::vector<json::Value> messages;
  std::vector<std::string> executed;
  const auto blocker = std::make_shared<Gate>();
  Host host;
  host.SetBeforeExecuteForTesting([&](const std::string& id, const std::string&) {
    {
      const std::lock_guard<std::mutex> guard(mutex);
      executed.push_back(id);
    }
    if (id == "blocker") {
      blocker->Hold();
    }
  });
  std::thread reader([&]() {
    try {
      FrameReader frames(testInput);
      Frame frame;
      while (frames.Read(frame)) {
        if (frame.type == kJsonFrameType) {
          json::Value message = json::Value::Parse(
              std::string_view(reinterpret_cast<const char*>(frame.payload.data()), frame.payload.size()));
          const std::lock_guard<std::mutex> guard(mutex);
          messages.push_back(std::move(message));
        }
      }
    } catch (...) {
    }
  });
  std::thread server([&]() { host.Run(hostInput, hostOutput); });

  FrameWriter writer(testOutput);
  const auto send = [&writer](const std::string& type, const std::string& id, const char* command,
                              json::Value params) {
    json::Value message = json::Value::Object();
    message.Set("type", json::Value::String(type));
    message.Set("id", json::Value::String(id));
    if (command != nullptr) {
      message.Set("command", json::Value::String(std::string(command)));
      message.Set("params", std::move(params));
    }
    writer.WriteJson(message);
  };
  const auto find = [&](const char* type, const std::string& id) -> std::optional<json::Value> {
    const std::lock_guard<std::mutex> guard(mutex);
    for (const json::Value& message : messages) {
      if (message.StringField("type") == type && message.StringField("id") == id) {
        return message;
      }
    }
    return std::nullopt;
  };
  const auto ran = [&](const std::string& id) {
    const std::lock_guard<std::mutex> guard(mutex);
    return std::find(executed.begin(), executed.end(), id) != executed.end();
  };

  send("request", "blocker", "probe", json::Value::Object());
  Check(WaitFor([&]() { return ran("blocker"); }), "the host worker starts the blocking request");
  send("request", "queued-click", "click", StringFields({{"elementId", "element-never-issued"}}));
  send("request", "queued-read", "windows", json::Value::Object());
  send("request", "after", "probe", json::Value::Object());
  send("cancel", "queued-click", nullptr, json::Value::Object());
  send("cancel", "queued-read", nullptr, json::Value::Object());
  send("cancel", "never-sent", nullptr, json::Value::Object());

  const bool acknowledged = WaitFor([&]() {
    return find("cancelled", "queued-click") && find("cancelled", "queued-read") && find("cancelled", "never-sent");
  });
  Check(acknowledged && !ran("queued-click") && !ran("queued-read"),
        "queued requests are acknowledged as cancelled while the worker is still busy");
  const std::optional<json::Value> click = find("cancelled", "queued-click");
  const std::optional<json::Value> read = find("cancelled", "queued-read");
  const std::optional<json::Value> unknown = find("cancelled", "never-sent");
  Check(click && click->StringField("effect") == "none", "a cancelled queued mutation reports no effect on the wire");
  Check(read && read->Find("effect") == nullptr, "a cancelled queued read carries no effect on the wire");
  Check(unknown && unknown->StringField("effect") == "none", "a cancel for an id the host does not hold reports none");

  blocker->Open();
  Check(WaitFor([&]() { return find("response", "blocker") && find("response", "after"); }),
        "the host runs the requests around the cancelled ones");
  {
    const std::lock_guard<std::mutex> guard(mutex);
    Check(executed == std::vector<std::string>({"blocker", "after"}), "cancelled queued requests never reach the driver");
  }
  Check(!find("response", "queued-click") && !find("response", "queued-read"),
        "cancelled queued requests never produce a response");

  CloseHandle(testOutput);
  server.join();
  CloseHandle(hostOutput);
  reader.join();
  CloseHandle(hostInput);
  CloseHandle(testInput);
}

void TestDriverHitTestBeyondScreens() {
  const CancellationToken token;
  WindowThread windows;
  const HWND window = windows.Create(L"FurnSelfTestHit", L"Hit window");
  Check(window != nullptr, "the hit-test fixture creates a window");
  if (window == nullptr) {
    return;
  }

  Driver driver;
  json::Value leaseRequest = json::Value::Object();
  leaseRequest.Set("lease", driver.AdoptWindowForTesting(window, L"Hit window"));
  const CommandResult listed = driver.Execute("windows", leaseRequest, token);
  const std::string windowId = listed.result.IsArray() && listed.result.Items().size() == 1
                                   ? listed.result.Items().front().StringField("id")
                                   : std::string();
  json::Value request = json::Value::Object();
  request.Set("windowId", json::Value::String(windowId));
  request.Set("x", json::Value::Number(100000.0));
  request.Set("y", json::Value::Number(100000.0));
  const CommandResult hit = driver.Execute("hitTest", request, token);
  Check(!windowId.empty() && hit.result.IsNull(),
        "a hit test beyond every monitor reports no element instead of the desktop root");
  Check(driver.AutomationForTesting().RegistryForTesting().size() == 0,
        "a hit test beyond every monitor registers no foreign element");
}

void TestAccessibilityActions() {
  const CancellationToken token;
  buttonClicks.store(0);
  WindowThread windows;
  const HWND window = windows.Create(L"FurnSelfTestNamedActions", L"Named actions", &CountingWindowProc);
  const HWND button = windows.CreateChild(window, L"BUTTON", L"Invoke control", 101);
  const HWND toggle = windows.CreateChild(window, L"BUTTON", L"Toggle control", 102, BS_AUTOCHECKBOX);
  const HWND label = windows.CreateChild(window, L"STATIC", L"No actions", 103);
  Check(window != nullptr && button != nullptr && toggle != nullptr && label != nullptr,
        "the named-action fixture creates invoke, toggle, and read-only controls");
  if (window == nullptr || button == nullptr || toggle == nullptr || label == nullptr) {
    return;
  }
  Driver driver;
  json::Value lease = json::Value::Object();
  lease.Set("lease", driver.AdoptWindowForTesting(window, L"Named actions"));
  const auto listed = driver.Execute("windows", lease, token).result;
  const std::string windowId = listed.Items().front().StringField("id");
  const auto tree = driver.Execute("tree", StringFields({{"windowId", windowId}}), token).result;
  const auto idFor = [&](const char* id) {
    for (const auto& node : tree.Items()) {
      if (node.StringField("automationId") == id) {
        return node.StringField("id");
      }
    }
    return std::string();
  };
  const std::string buttonId = idFor("101");
  const std::string toggleId = idFor("102");
  const std::string labelId = idFor("103");
  const auto actions = [&](const std::string& id) {
    return driver.Execute("accessibilityActions", StringFields({{"elementId", id}}), token).result;
  };
  const auto keyFor = [](const json::Value& list, const char* name) {
    const auto* names = list.Find("actions");
    const auto* keys = list.Find("keys");
    if (names != nullptr && keys != nullptr && names->Items().size() == keys->Items().size()) {
      for (std::size_t index = 0; index < names->Items().size(); ++index) {
        if (names->Items()[index].AsString() == name) {
          return keys->Items()[index].AsString();
        }
      }
    }
    return std::string();
  };
  const std::string invokeKey = keyFor(actions(buttonId), "Invoke");
  const std::string toggleKey = keyFor(actions(toggleId), "Toggle");
  const auto opaque = [](const std::string& key) {
    return key.size() == 32 && key.find_first_not_of("0123456789abcdef") == std::string::npos;
  };
  Check(opaque(invokeKey) && opaque(toggleKey) && invokeKey != toggleKey &&
            keyFor(actions(buttonId), "Invoke") == invokeKey,
        "named-action keys are opaque, stable, and distinguish exact pattern operations");
  const auto empty = actions(labelId);
  Check(empty.Find("actions") != nullptr && empty.Find("actions")->Items().empty() &&
            empty.Find("keys") != nullptr && empty.Find("keys")->Items().empty(),
        "an element without supported action patterns returns empty names and keys");
  const auto perform = [&](const std::string& id, const std::string& key) {
    return driver.Execute("performAccessibilityAction", StringFields({{"elementId", id}, {"key", key}}), token);
  };
  perform(buttonId, invokeKey);
  Check(WaitFor([]() { return buttonClicks.load() == 1; }),
        "performing the published Invoke key reaches the button once");
  perform(toggleId, toggleKey);
  Check(WaitFor([toggle]() { return SendMessageW(toggle, BM_GETCHECK, 0, 0) == BST_CHECKED; }),
        "performing the published Toggle key changes the checkbox");
  const auto refused = [&](const std::string& id, const std::string& key) {
    try {
      perform(id, key);
    } catch (const HelperError& error) {
      return error.code() == kErrorNotInteractable && error.reason() == "action-changed" &&
             error.effect() == MutationEffect::None;
    }
    return false;
  };
  Check(refused(buttonId, "unknown-key"), "an unknown action key is refused with action-changed and no effect");
  Check(refused(buttonId, toggleKey), "a key whose pattern is absent never falls through to another action");
  Check(refused(labelId, invokeKey), "an action that is not in the live list is refused without dispatch");
  windows.Destroy(button);
  std::string code;
  Check(FailureEffect([&]() { perform(buttonId, invokeKey); }, &code) == "none" && code == kErrorStaleElement,
        "performing a formerly published action on a destroyed element is stale with no effect");
  Check(buttonClicks.load() == 1, "refused named actions dispatch no additional button notifications");
  const auto journal = driver.Execute("windowEvents", lease, token).result;
  const auto* commands = journal.Find("commands");
  Check(commands != nullptr && commands->Serialize().find(invokeKey) == std::string::npos &&
            commands->Serialize().find(toggleKey) == std::string::npos &&
            commands->Serialize().find("Invoke") == std::string::npos &&
            commands->Serialize().find("Toggle") == std::string::npos,
        "the native command journal records neither action names nor keys");
}

void TestDriverObservation() {
  const CancellationToken token;
  WindowThread windows;
  const HWND window = windows.Create(L"FurnSelfTestObserve", L"Observe window");
  const HWND button = windows.CreateChild(window, L"BUTTON", L"Observe button", 101);
  const HWND password = windows.CreateChild(window, L"EDIT", L"hunter2", 102, ES_PASSWORD);
  const HWND other = windows.Create(L"FurnSelfTestObserveOther", L"Other window");
  const HWND otherButton = windows.CreateChild(other, L"BUTTON", L"Other button", 103);
  Check(window != nullptr && button != nullptr && password != nullptr && other != nullptr && otherButton != nullptr,
        "the observation fixture creates two windows with controls and a password field");
  if (window == nullptr || button == nullptr || password == nullptr || other == nullptr || otherButton == nullptr) {
    return;
  }

  Driver driver;
  const auto adopt = [&](HWND target, const wchar_t* title) {
    json::Value leaseRequest = json::Value::Object();
    leaseRequest.Set("lease", driver.AdoptWindowForTesting(target, title));
    const CommandResult listed = driver.Execute("windows", leaseRequest, token);
    const std::string wanted = ToUtf8(title);
    for (const json::Value& entry : listed.result.Items()) {
      if (entry.StringField("title") == wanted) {
        return entry.StringField("id");
      }
    }
    return std::string();
  };
  const std::string windowId = adopt(window, L"Observe window");
  const std::string otherId = adopt(other, L"Other window");
  Check(!windowId.empty() && !otherId.empty() && windowId != otherId, "the driver lists both adopted windows");
  if (windowId.empty() || otherId.empty()) {
    return;
  }

  const auto request = [](const std::string& target, std::int64_t maxVisited, std::optional<std::string> rootId = {}) {
    json::Value budget = json::Value::Object();
    budget.Set("maxVisited", json::Value::Integer(maxVisited));
    budget.Set("maxDepth", json::Value::Integer(64));
    budget.Set("maxStringLength", json::Value::Integer(256));
    budget.Set("maxBytes", json::Value::Integer(1048576));
    budget.Set("deadlineMs", json::Value::Integer(10000));
    json::Value facts = json::Value::Array();
    for (const char* fact : {"value", "text", "checked", "enabled", "geometry", "actions"}) {
      facts.Append(json::Value::String(std::string(fact)));
    }
    json::Value value = json::Value::Object();
    value.Set("windowId", json::Value::String(target));
    value.Set("budget", budget);
    value.Set("facts", facts);
    if (rootId) {
      value.Set("rootId", json::Value::String(*rootId));
    }
    return value;
  };
  const auto observe = [&](const json::Value& params) { return driver.Execute("observe", params, token).result; };
  const auto nodeIds = [](const json::Value& sample) {
    std::vector<std::string> ids;
    if (const json::Value* nodes = sample.Find("nodes"); nodes != nullptr) {
      for (const json::Value& node : nodes->Items()) {
        ids.push_back(node.StringField("id"));
      }
    }
    return ids;
  };
  const auto nodeOfRole = [](const json::Value& sample, const char* role) {
    const json::Value* nodes = sample.Find("nodes");
    if (nodes != nullptr) {
      for (const json::Value& node : nodes->Items()) {
        if (node.StringField("role") == role) {
          return node;
        }
      }
    }
    return json::Value::Null();
  };

  const json::Value first = observe(request(windowId, 5000));
  const json::Value* unsupported = first.Find("unsupportedFacts");
  const json::Value buttonNode = nodeOfRole(first, "button");
  const json::Value passwordNode = nodeOfRole(first, "textbox");
  const std::vector<std::string> ids = nodeIds(first);
  Check(first.BoolField("complete") && ids.size() >= 3 && unsupported != nullptr &&
            unsupported->Items().empty(),
        "a window observed within every budget is complete with all requested facts supported");
  Check(buttonNode.IsObject() && buttonNode.StringField("name") == "Observe button" &&
            buttonNode.StringField("parentId") == ids.front() && buttonNode.Find("rect") != nullptr &&
            buttonNode.Find("enabled") != nullptr && buttonNode.Find("enabled")->BoolField("value") &&
            buttonNode.Find("actions") != nullptr &&
            buttonNode.Find("actions")->Serialize() == R"(["Invoke"])",
        "an observed button reports its parent, name, geometry, states, and UIA actions");
  Check(passwordNode.IsObject() && !passwordNode.Has("value") && !passwordNode.Has("text"),
        "an observed password field never reports its value or text");

  const json::Value second = observe(request(windowId, 5000));
  Check(nodeIds(second) == ids, "observing an unchanged window again reports the same ids in the same order");
  const CommandResult tree = driver.Execute("tree", [&]() {
    json::Value params = json::Value::Object();
    params.Set("windowId", json::Value::String(windowId));
    return params;
  }(), token);
  std::vector<std::string> treeIds;
  for (const json::Value& entry : tree.result.Items()) {
    treeIds.push_back(entry.StringField("id"));
  }
  Check(treeIds == ids, "a tree walk of the observed window reports the observed ids");

  const json::Value limited = observe(request(windowId, 1));
  const json::Value* truncation = limited.Find("truncation");
  Check(!limited.BoolField("complete", true) && nodeIds(limited) == std::vector<std::string>{ids.front()} &&
            truncation != nullptr && truncation->Items().size() == 1 &&
            truncation->Items().front().StringField("reason") == "visited",
        "a visited budget of one reports the window root and the visited reason");

  const std::string buttonId = buttonNode.StringField("id");
  const json::Value rooted = observe(request(windowId, 5000, buttonId));
  const json::Value* rootedNodes = rooted.Find("nodes");
  Check(rootedNodes != nullptr && !rootedNodes->Items().empty() &&
            rootedNodes->Items().front().StringField("id") == buttonId &&
            !rootedNodes->Items().front().Has("parentId") && rootedNodes->Items().front().NumberField("depth", -1) == 0,
        "an observation rooted at a tracked element starts at that element without a parent");

  const json::Value otherSample = observe(request(otherId, 5000));
  const std::string otherButtonId = nodeOfRole(otherSample, "button").StringField("id");
  Check(!otherButtonId.empty() &&
            FailureCode([&]() { observe(request(windowId, 5000, otherButtonId)); }) == kErrorStaleElement,
        "a root from another window is refused as stale-element");
  Check(FailureCode([&]() { observe(request(windowId, 5000, std::string("element-unknown"))); }) ==
            kErrorStaleElement,
        "an untracked root is refused as stale-element");
  Check(FailureCode([&]() { observe(request("window-unknown", 5000)); }) == kErrorNoSuchWindow,
        "an unknown window is refused as no-such-window");

  const auto release = [&](std::vector<std::string> released) {
    json::Value list = json::Value::Array();
    for (std::string& id : released) {
      list.Append(json::Value::String(std::move(id)));
    }
    json::Value params = json::Value::Object();
    params.Set("ids", list);
    return driver.Execute("releaseElements", params, token).result;
  };
  const auto released = [&](std::vector<std::string> named) {
    const json::Value* count = release(std::move(named)).Find("released");
    return count == nullptr ? -1 : count->AsInteger(-1);
  };
  Check(released({otherButtonId, "element-unknown"}) == 1 && released({otherButtonId}) == 0,
        "releasing reports how many tracked ids it dropped");
  Check(FailureCode([&]() { release({buttonId, buttonId}); }) == kErrorInvalidParams,
        "a release that names an id twice is refused");
  json::Value snapshot = json::Value::Object();
  snapshot.Set("elementId", json::Value::String(otherButtonId));
  Check(FailureCode([&]() { driver.Execute("snapshot", snapshot, token); }) == kErrorStaleElement,
        "a released id answers stale-element");
  const std::string renewed = nodeOfRole(observe(request(otherId, 5000)), "button").StringField("id");
  Check(!renewed.empty() && renewed != otherButtonId, "an element observed again after release gets a new id");

  const CommandResult probe = driver.Execute("probe", json::Value::Object(), token);
  const json::Value* features = probe.result.Find("features");
  Check(features != nullptr && features->BoolField("boundedObservation"), "the probe reports bounded observation");

  ElementRegistry& registry = driver.AutomationForTesting().RegistryForTesting();
  const std::size_t before = registry.size();
  driver.AutomationForTesting().ForgetWindow(windowId);
  driver.AutomationForTesting().ForgetWindow(otherId);
  Check(before > 0 && registry.size() == 0, "forgetting the windows drops every observed element");
}

}  // namespace

int RunSelfTest() {
  failures = 0;
  checks = 0;
  TestFraming();
  TestJson();
  TestGeometry();
  TestInputLedger();
  TestReleaseLedger();
  TestPhysicalInputLock();
  TestMutationSettlement();
  TestHresultDescriptions();
  TestBoundedText();
  TestCommandJournal();
  TestWindowEventLog();
  TestWindowEventPublisher();
  TestWindowEventRegistration();
  TestWindowCloseWithoutEvents();
  TestLeaseRegistrationFailure();
  TestAttachedCloseKeepsQuarantine();
  TestWindowEventHooks();
  TestDriverWindowEvents();
  TestInputEnvironment();
  TestInjectionIntegrity();
  TestActivationRefusal();
  TestHungWindowProbe();
  TestHelperSessionCheck();
  TestInputAuthorityOnThisMachine();
  TestInputReevaluation();
  TestKeyboardGuard();
  TestInputSendFailures();
  TestForegroundOwnership();
  TestKeyboardTargetRouting();
  TestClickRouting();
  TestDriverKeyRouting();
  TestElementFingerprints();
  TestElementRegistryIdentity();
  TestElementRegistryRetention();
  TestElementRegistryChurn();
  TestAutomationElementIdentity();
  TestAutomationRetention();
  TestDriverRefusesReplacedElements();
  TestDriverDisabledElements();
  TestEffectLedger();
  TestDriverMutationEffects();
  TestHostQueuedCancellation();
  TestDriverHitTestBeyondScreens();
  TestAccessibilityActions();
  TestDriverObservation();
  TestSnapshotShape();
  TestLeaseIdentity();
  TestHello();
  RunAuthoritySelfTests(Check);
  RunObservationSelfTests(Check);
  std::cout << (failures == 0 ? "self-test passed: " : "self-test failed: ") << (checks - failures) << '/' << checks
            << " checks\n";
  return failures == 0 ? 0 : 1;
}

}  // namespace furn
