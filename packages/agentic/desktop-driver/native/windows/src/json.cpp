#include "json.h"

#include <array>
#include <charconv>
#include <cmath>
#include <cstdio>

#include "common.h"

namespace furn::json {
namespace {

constexpr int kMaximumDepth = 64;

class Parser {
 public:
  explicit Parser(std::string_view text) : text_(text) {}

  Value Parse() {
    SkipWhitespace();
    Value value = ParseValue(0);
    SkipWhitespace();
    if (cursor_ != text_.size()) {
      Fail(kErrorInvalidRequest, "Trailing content followed a JSON document.");
    }
    return value;
  }

 private:
  [[noreturn]] void Reject(std::string_view reason) const {
    Fail(kErrorInvalidRequest, "Invalid JSON at offset " + std::to_string(cursor_) + ": " + std::string(reason));
  }

  void SkipWhitespace() {
    while (cursor_ < text_.size()) {
      const char character = text_[cursor_];
      if (character == ' ' || character == '\t' || character == '\n' || character == '\r') {
        cursor_ += 1;
        continue;
      }
      break;
    }
  }

  char Peek() const {
    if (cursor_ >= text_.size()) {
      Reject("unexpected end of document");
    }
    return text_[cursor_];
  }

  void Expect(char character) {
    if (Peek() != character) {
      Reject(std::string("expected '") + character + "'");
    }
    cursor_ += 1;
  }

  bool Consume(std::string_view literal) {
    if (text_.compare(cursor_, literal.size(), literal) == 0) {
      cursor_ += literal.size();
      return true;
    }
    return false;
  }

  Value ParseValue(int depth) {
    if (depth > kMaximumDepth) {
      Reject("document is nested too deeply");
    }
    switch (Peek()) {
      case '{':
        return ParseObject(depth);
      case '[':
        return ParseArray(depth);
      case '"':
        return Value::String(ParseString());
      case 't':
        if (Consume("true")) {
          return Value::Bool(true);
        }
        Reject("expected true");
      case 'f':
        if (Consume("false")) {
          return Value::Bool(false);
        }
        Reject("expected false");
      case 'n':
        if (Consume("null")) {
          return Value::Null();
        }
        Reject("expected null");
      default:
        return ParseNumber();
    }
  }

  Value ParseObject(int depth) {
    Expect('{');
    Value object = Value::Object();
    SkipWhitespace();
    if (Peek() == '}') {
      cursor_ += 1;
      return object;
    }
    while (true) {
      SkipWhitespace();
      std::string key = ParseString();
      SkipWhitespace();
      Expect(':');
      SkipWhitespace();
      object.Set(std::move(key), ParseValue(depth + 1));
      SkipWhitespace();
      const char separator = Peek();
      cursor_ += 1;
      if (separator == '}') {
        return object;
      }
      if (separator != ',') {
        cursor_ -= 1;
        Reject("expected ',' or '}'");
      }
    }
  }

  Value ParseArray(int depth) {
    Expect('[');
    Value array = Value::Array();
    SkipWhitespace();
    if (Peek() == ']') {
      cursor_ += 1;
      return array;
    }
    while (true) {
      SkipWhitespace();
      array.Append(ParseValue(depth + 1));
      SkipWhitespace();
      const char separator = Peek();
      cursor_ += 1;
      if (separator == ']') {
        return array;
      }
      if (separator != ',') {
        cursor_ -= 1;
        Reject("expected ',' or ']'");
      }
    }
  }

  void AppendCodepoint(std::string& output, std::uint32_t codepoint) const {
    if (codepoint <= 0x7f) {
      output.push_back(static_cast<char>(codepoint));
    } else if (codepoint <= 0x7ff) {
      output.push_back(static_cast<char>(0xc0 | (codepoint >> 6)));
      output.push_back(static_cast<char>(0x80 | (codepoint & 0x3f)));
    } else if (codepoint <= 0xffff) {
      output.push_back(static_cast<char>(0xe0 | (codepoint >> 12)));
      output.push_back(static_cast<char>(0x80 | ((codepoint >> 6) & 0x3f)));
      output.push_back(static_cast<char>(0x80 | (codepoint & 0x3f)));
    } else {
      output.push_back(static_cast<char>(0xf0 | (codepoint >> 18)));
      output.push_back(static_cast<char>(0x80 | ((codepoint >> 12) & 0x3f)));
      output.push_back(static_cast<char>(0x80 | ((codepoint >> 6) & 0x3f)));
      output.push_back(static_cast<char>(0x80 | (codepoint & 0x3f)));
    }
  }

  std::uint32_t ParseHexQuad() {
    if (cursor_ + 4 > text_.size()) {
      Reject("truncated \\u escape");
    }
    std::uint32_t value = 0;
    for (int index = 0; index < 4; index += 1) {
      const char character = text_[cursor_ + static_cast<std::size_t>(index)];
      value *= 16;
      if (character >= '0' && character <= '9') {
        value += static_cast<std::uint32_t>(character - '0');
      } else if (character >= 'a' && character <= 'f') {
        value += static_cast<std::uint32_t>(character - 'a' + 10);
      } else if (character >= 'A' && character <= 'F') {
        value += static_cast<std::uint32_t>(character - 'A' + 10);
      } else {
        Reject("invalid \\u escape");
      }
    }
    cursor_ += 4;
    return value;
  }

  std::string ParseString() {
    Expect('"');
    std::string output;
    while (true) {
      if (cursor_ >= text_.size()) {
        Reject("unterminated string");
      }
      const char character = text_[cursor_];
      cursor_ += 1;
      if (character == '"') {
        return output;
      }
      if (character != '\\') {
        output.push_back(character);
        continue;
      }
      if (cursor_ >= text_.size()) {
        Reject("unterminated escape");
      }
      const char escape = text_[cursor_];
      cursor_ += 1;
      switch (escape) {
        case '"':
          output.push_back('"');
          break;
        case '\\':
          output.push_back('\\');
          break;
        case '/':
          output.push_back('/');
          break;
        case 'b':
          output.push_back('\b');
          break;
        case 'f':
          output.push_back('\f');
          break;
        case 'n':
          output.push_back('\n');
          break;
        case 'r':
          output.push_back('\r');
          break;
        case 't':
          output.push_back('\t');
          break;
        case 'u': {
          std::uint32_t codepoint = ParseHexQuad();
          if (codepoint >= 0xd800 && codepoint <= 0xdbff && cursor_ + 1 < text_.size() && text_[cursor_] == '\\' &&
              text_[cursor_ + 1] == 'u') {
            const std::size_t restore = cursor_;
            cursor_ += 2;
            const std::uint32_t low = ParseHexQuad();
            if (low >= 0xdc00 && low <= 0xdfff) {
              codepoint = 0x10000 + ((codepoint - 0xd800) << 10) + (low - 0xdc00);
            } else {
              cursor_ = restore;
            }
          }
          if (codepoint >= 0xd800 && codepoint <= 0xdfff) {
            codepoint = 0xfffd;
          }
          AppendCodepoint(output, codepoint);
          break;
        }
        default:
          Reject("unsupported escape sequence");
      }
    }
  }

  Value ParseNumber() {
    const std::size_t start = cursor_;
    if (cursor_ < text_.size() && (text_[cursor_] == '-' || text_[cursor_] == '+')) {
      cursor_ += 1;
    }
    while (cursor_ < text_.size()) {
      const char character = text_[cursor_];
      if ((character >= '0' && character <= '9') || character == '.' || character == 'e' || character == 'E' ||
          character == '-' || character == '+') {
        cursor_ += 1;
        continue;
      }
      break;
    }
    if (start == cursor_) {
      Reject("expected a value");
    }
    double parsed = 0.0;
    const char* begin = text_.data() + start;
    const char* end = text_.data() + cursor_;
    const auto result = std::from_chars(begin, end, parsed);
    if (result.ec != std::errc{} || result.ptr != end) {
      Reject("invalid number");
    }
    return Value::Number(parsed);
  }

  std::string_view text_;
  std::size_t cursor_{0};
};

void SerializeInto(const Value& value, std::string& output) {
  switch (value.kind()) {
    case Kind::Null:
      output += "null";
      return;
    case Kind::Bool:
      output += value.AsBool() ? "true" : "false";
      return;
    case Kind::Number: {
      const double number = value.AsNumber();
      if (!std::isfinite(number)) {
        output += "null";
        return;
      }
      if (number == std::floor(number) && std::fabs(number) < 9007199254740992.0) {
        output += std::to_string(static_cast<long long>(number));
        return;
      }
      std::array<char, 40> buffer{};
      const auto result = std::to_chars(buffer.data(), buffer.data() + buffer.size(), number);
      output.append(buffer.data(), result.ptr);
      return;
    }
    case Kind::String:
      output += EscapeString(value.AsString());
      return;
    case Kind::Array: {
      output.push_back('[');
      bool first = true;
      for (const Value& item : value.Items()) {
        if (!first) {
          output.push_back(',');
        }
        first = false;
        SerializeInto(item, output);
      }
      output.push_back(']');
      return;
    }
    case Kind::Object: {
      output.push_back('{');
      bool first = true;
      for (const auto& member : value.Members()) {
        if (!first) {
          output.push_back(',');
        }
        first = false;
        output += EscapeString(member.first);
        output.push_back(':');
        SerializeInto(member.second, output);
      }
      output.push_back('}');
      return;
    }
  }
}

}  // namespace

Value Value::Null() {
  return Value{};
}

Value Value::Bool(bool value) {
  Value result;
  result.kind_ = Kind::Bool;
  result.boolean_ = value;
  return result;
}

Value Value::Number(double value) {
  Value result;
  result.kind_ = Kind::Number;
  result.number_ = value;
  return result;
}

Value Value::Integer(std::int64_t value) {
  return Number(static_cast<double>(value));
}

Value Value::String(std::string value) {
  Value result;
  result.kind_ = Kind::String;
  result.string_ = std::move(value);
  return result;
}

Value Value::String(std::wstring_view value) {
  return String(ToUtf8(value));
}

Value Value::Array() {
  Value result;
  result.kind_ = Kind::Array;
  return result;
}

Value Value::Object() {
  Value result;
  result.kind_ = Kind::Object;
  return result;
}

std::int64_t Value::AsInteger(std::int64_t fallback) const noexcept {
  if (kind_ != Kind::Number || !std::isfinite(number_)) {
    return fallback;
  }
  return static_cast<std::int64_t>(std::llround(number_));
}

const std::string& Value::AsString() const noexcept {
  static const std::string empty;
  return kind_ == Kind::String ? string_ : empty;
}

std::wstring Value::AsWide() const {
  return ToWide(AsString());
}

void Value::Append(Value value) {
  if (kind_ != Kind::Array) {
    kind_ = Kind::Array;
  }
  items_.push_back(std::move(value));
}

void Value::Set(std::string key, Value value) {
  if (kind_ != Kind::Object) {
    kind_ = Kind::Object;
  }
  for (auto& member : members_) {
    if (member.first == key) {
      member.second = std::move(value);
      return;
    }
  }
  members_.emplace_back(std::move(key), std::move(value));
}

const Value* Value::Find(std::string_view key) const noexcept {
  if (kind_ != Kind::Object) {
    return nullptr;
  }
  for (const auto& member : members_) {
    if (member.first == key) {
      return &member.second;
    }
  }
  return nullptr;
}

std::string Value::StringField(std::string_view key, std::string fallback) const {
  const Value* member = Find(key);
  return member != nullptr && member->IsString() ? member->AsString() : fallback;
}

std::wstring Value::WideField(std::string_view key, std::wstring fallback) const {
  const Value* member = Find(key);
  return member != nullptr && member->IsString() ? ToWide(member->AsString()) : fallback;
}

double Value::NumberField(std::string_view key, double fallback) const {
  const Value* member = Find(key);
  return member != nullptr && member->IsNumber() ? member->AsNumber() : fallback;
}

bool Value::BoolField(std::string_view key, bool fallback) const {
  const Value* member = Find(key);
  return member != nullptr && member->IsBool() ? member->AsBool() : fallback;
}

std::string Value::Serialize() const {
  std::string output;
  SerializeInto(*this, output);
  return output;
}

Value Value::Parse(std::string_view text) {
  return Parser(text).Parse();
}

std::string EscapeString(std::string_view value) {
  std::string output;
  output.reserve(value.size() + 2);
  output.push_back('"');
  for (const char character : value) {
    switch (character) {
      case '"':
        output += "\\\"";
        break;
      case '\\':
        output += "\\\\";
        break;
      case '\b':
        output += "\\b";
        break;
      case '\f':
        output += "\\f";
        break;
      case '\n':
        output += "\\n";
        break;
      case '\r':
        output += "\\r";
        break;
      case '\t':
        output += "\\t";
        break;
      default:
        if (static_cast<unsigned char>(character) < 0x20) {
          std::array<char, 8> buffer{};
          std::snprintf(buffer.data(), buffer.size(), "\\u%04x", static_cast<unsigned>(character) & 0xffu);
          output += buffer.data();
        } else {
          output.push_back(character);
        }
        break;
    }
  }
  output.push_back('"');
  return output;
}

}  // namespace furn::json
