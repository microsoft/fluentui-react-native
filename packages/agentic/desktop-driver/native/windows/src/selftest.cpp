#include "selftest.h"

#include <windows.h>

#include <algorithm>
#include <cmath>
#include <iostream>
#include <string>
#include <thread>
#include <vector>

#include "automation.h"
#include "common.h"
#include "framing.h"
#include "geometry.h"
#include "host.h"
#include "input.h"
#include "inputlock.h"
#include "json.h"

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
  input.KeyDown(L"a", token);
  input.PointerDown(0, token);
  Check(input.DepressedKeyCount() == 2 && input.DepressedButtonCount() == 1, "ledger records depressed input");
  Check(recordedInputs.size() == 3, "ledger injected three down events");
  Check(recordedInputs[0].ki.wVk == VK_SHIFT, "special keys map to virtual keys");
  Check((recordedInputs[1].ki.dwFlags & KEYEVENTF_UNICODE) != 0, "printable keys inject unicode");

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
  Check(serialized.find(R"("text")") == std::string::npos, "absent optional text is omitted");
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
  FILETIME parsed{};
  Check(TryParseIso8601("2026-08-31T21:59:59.1234567Z", parsed), "lease timestamps parse");
  Check(FormatFileTimeIso8601(parsed) == "2026-08-31T21:59:59.1234567Z", "lease timestamps round trip");
  FILETIME offset{};
  Check(TryParseIso8601("2026-08-31T23:59:59.0000000+02:00", offset), "offset timestamps parse");
  Check(FileTimeTicks(offset) == FileTimeTicks(parsed) - 1234567, "offset timestamps normalize to UTC");
  Check(!TryParseIso8601("not-a-timestamp", parsed), "invalid timestamps are rejected");
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
  const ReleaseCounts released = input.ReleaseExact(parse(R"({"keys":["\uE008","a"],"buttons":[0,1,2]})"));
  Check(released.keys == 2 && released.buttons == 3, "ledger release reports its counts");
  Check(recordedInputs.size() == 5, "ledger release emits one event per entry");
  Check(recordedInputs[0].type == INPUT_KEYBOARD && (recordedInputs[0].ki.dwFlags & KEYEVENTF_UNICODE) != 0 &&
            recordedInputs[0].ki.wScan == L'a' && (recordedInputs[0].ki.dwFlags & KEYEVENTF_KEYUP) != 0,
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
  TestSnapshotShape();
  TestLeaseIdentity();
  TestHello();
  std::cout << (failures == 0 ? "self-test passed: " : "self-test failed: ") << (checks - failures) << '/' << checks
            << " checks\n";
  return failures == 0 ? 0 : 1;
}

}  // namespace furn
