#pragma once

#include <windows.h>

#include <cstdint>
#include <mutex>
#include <string>
#include <string_view>
#include <vector>

#include "json.h"

namespace furn {

inline constexpr std::uint8_t kJsonFrameType = 1;
inline constexpr std::uint8_t kBinaryFrameType = 2;
inline constexpr std::size_t kFrameHeaderBytes = 12;
inline constexpr std::uint32_t kMaximumFramePayload = 256u * 1024u * 1024u;

struct Frame {
  std::uint8_t type{kJsonFrameType};
  std::vector<std::uint8_t> payload;
};

std::vector<std::uint8_t> EncodeFrame(std::uint8_t type, const std::uint8_t* payload, std::size_t size);
std::vector<std::uint8_t> EncodeJsonFrame(std::string_view json);
std::vector<std::uint8_t> EncodeBinaryFrame(std::string_view identifier, const std::vector<std::uint8_t>& data);
bool DecodeFrameHeader(const std::uint8_t* header, std::uint8_t& type, std::uint32_t& length);

// Blocking framed reader over an inherited pipe or file handle.
class FrameReader {
 public:
  explicit FrameReader(HANDLE input) : input_(input) {}

  bool Read(Frame& frame);

 private:
  bool ReadExact(void* buffer, std::size_t length);

  HANDLE input_;
};

// Serializes every outbound frame so the worker and reader threads never
// interleave partial writes on stdout.
class FrameWriter {
 public:
  explicit FrameWriter(HANDLE output) : output_(output) {}

  void WriteJson(const json::Value& message);
  void WriteBinary(std::string_view identifier, const std::vector<std::uint8_t>& data);

 private:
  void Write(const std::vector<std::uint8_t>& bytes);

  std::mutex mutex_;
  HANDLE output_;
};

}  // namespace furn
