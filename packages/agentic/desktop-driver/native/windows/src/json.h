#pragma once

#include <cstdint>
#include <initializer_list>
#include <string>
#include <string_view>
#include <utility>
#include <vector>

namespace furn::json {

enum class Kind { Null, Bool, Number, String, Array, Object };

// Minimal ordered JSON document model. Insertion order is preserved so every
// response, XML dump, and diagnostic payload is byte-for-byte deterministic.
class Value {
 public:
  Value() = default;

  static Value Null();
  static Value Bool(bool value);
  static Value Number(double value);
  static Value Integer(std::int64_t value);
  static Value String(std::string value);
  static Value String(std::wstring_view value);
  static Value Array();
  static Value Object();

  Kind kind() const noexcept { return kind_; }
  bool IsNull() const noexcept { return kind_ == Kind::Null; }
  bool IsBool() const noexcept { return kind_ == Kind::Bool; }
  bool IsNumber() const noexcept { return kind_ == Kind::Number; }
  bool IsString() const noexcept { return kind_ == Kind::String; }
  bool IsArray() const noexcept { return kind_ == Kind::Array; }
  bool IsObject() const noexcept { return kind_ == Kind::Object; }

  bool AsBool(bool fallback = false) const noexcept { return kind_ == Kind::Bool ? boolean_ : fallback; }
  double AsNumber(double fallback = 0.0) const noexcept { return kind_ == Kind::Number ? number_ : fallback; }
  std::int64_t AsInteger(std::int64_t fallback = 0) const noexcept;
  const std::string& AsString() const noexcept;
  std::wstring AsWide() const;

  const std::vector<Value>& Items() const noexcept { return items_; }
  const std::vector<std::pair<std::string, Value>>& Members() const noexcept { return members_; }

  void Append(Value value);
  void Set(std::string key, Value value);
  const Value* Find(std::string_view key) const noexcept;
  bool Has(std::string_view key) const noexcept { return Find(key) != nullptr; }

  std::string StringField(std::string_view key, std::string fallback = {}) const;
  std::wstring WideField(std::string_view key, std::wstring fallback = {}) const;
  double NumberField(std::string_view key, double fallback = 0.0) const;
  bool BoolField(std::string_view key, bool fallback = false) const;

  std::string Serialize() const;
  static Value Parse(std::string_view text);

 private:
  Kind kind_{Kind::Null};
  bool boolean_{false};
  double number_{0.0};
  std::string string_;
  std::vector<Value> items_;
  std::vector<std::pair<std::string, Value>> members_;
};

std::string EscapeString(std::string_view value);

}  // namespace furn::json
