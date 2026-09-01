#include "framing.h"

#include <algorithm>

#include "common.h"

namespace furn {
namespace {

constexpr std::uint8_t kFrameMagic[4] = {'F', 'D', 'R', '1'};

void WriteLittleEndian(std::uint8_t* target, std::uint32_t value) {
  target[0] = static_cast<std::uint8_t>(value & 0xffu);
  target[1] = static_cast<std::uint8_t>((value >> 8) & 0xffu);
  target[2] = static_cast<std::uint8_t>((value >> 16) & 0xffu);
  target[3] = static_cast<std::uint8_t>((value >> 24) & 0xffu);
}

std::uint32_t ReadLittleEndian(const std::uint8_t* source) {
  return static_cast<std::uint32_t>(source[0]) | (static_cast<std::uint32_t>(source[1]) << 8) |
         (static_cast<std::uint32_t>(source[2]) << 16) | (static_cast<std::uint32_t>(source[3]) << 24);
}

}  // namespace

std::vector<std::uint8_t> EncodeFrame(std::uint8_t type, const std::uint8_t* payload, std::size_t size) {
  if (size > kMaximumFramePayload) {
    Fail(kErrorInternal, "The native helper attempted to write an oversized frame.");
  }
  std::vector<std::uint8_t> frame(kFrameHeaderBytes + size);
  std::copy(std::begin(kFrameMagic), std::end(kFrameMagic), frame.begin());
  frame[4] = type;
  frame[5] = 0;
  frame[6] = 0;
  frame[7] = 0;
  WriteLittleEndian(frame.data() + 8, static_cast<std::uint32_t>(size));
  if (size > 0) {
    std::copy(payload, payload + size, frame.begin() + static_cast<std::ptrdiff_t>(kFrameHeaderBytes));
  }
  return frame;
}

std::vector<std::uint8_t> EncodeJsonFrame(std::string_view json) {
  return EncodeFrame(kJsonFrameType, reinterpret_cast<const std::uint8_t*>(json.data()), json.size());
}

std::vector<std::uint8_t> EncodeBinaryFrame(std::string_view identifier, const std::vector<std::uint8_t>& data) {
  std::vector<std::uint8_t> payload(4 + identifier.size() + data.size());
  WriteLittleEndian(payload.data(), static_cast<std::uint32_t>(identifier.size()));
  std::copy(identifier.begin(), identifier.end(), reinterpret_cast<char*>(payload.data()) + 4);
  std::copy(data.begin(), data.end(), payload.begin() + static_cast<std::ptrdiff_t>(4 + identifier.size()));
  return EncodeFrame(kBinaryFrameType, payload.data(), payload.size());
}

bool DecodeFrameHeader(const std::uint8_t* header, std::uint8_t& type, std::uint32_t& length) {
  if (!std::equal(std::begin(kFrameMagic), std::end(kFrameMagic), header)) {
    return false;
  }
  type = header[4];
  if (header[5] != 0 || header[6] != 0 || header[7] != 0) {
    return false;
  }
  length = ReadLittleEndian(header + 8);
  return length <= kMaximumFramePayload && (type == kJsonFrameType || type == kBinaryFrameType);
}

bool FrameReader::ReadExact(void* buffer, std::size_t length) {
  auto* cursor = static_cast<std::uint8_t*>(buffer);
  std::size_t remaining = length;
  while (remaining > 0) {
    DWORD read = 0;
    if (!ReadFile(input_, cursor, static_cast<DWORD>(remaining), &read, nullptr)) {
      const DWORD error = GetLastError();
      if (error == ERROR_BROKEN_PIPE || error == ERROR_HANDLE_EOF) {
        return false;
      }
      FailLastError(kErrorInternal, "Reading the native helper input stream", error);
    }
    if (read == 0) {
      return false;
    }
    cursor += read;
    remaining -= read;
  }
  return true;
}

bool FrameReader::Read(Frame& frame) {
  std::uint8_t header[kFrameHeaderBytes]{};
  if (!ReadExact(header, sizeof(header))) {
    return false;
  }
  std::uint32_t length = 0;
  if (!DecodeFrameHeader(header, frame.type, length)) {
    Fail(kErrorInvalidRequest, "The native helper received a malformed frame header.");
  }
  frame.payload.assign(length, 0);
  if (length > 0 && !ReadExact(frame.payload.data(), frame.payload.size())) {
    Fail(kErrorInvalidRequest, "The native helper input stream ended inside a frame.");
  }
  return true;
}

void FrameWriter::Write(const std::vector<std::uint8_t>& bytes) {
  const std::lock_guard<std::mutex> guard(mutex_);
  const std::uint8_t* cursor = bytes.data();
  std::size_t remaining = bytes.size();
  while (remaining > 0) {
    DWORD written = 0;
    if (!WriteFile(output_, cursor, static_cast<DWORD>(remaining), &written, nullptr)) {
      FailLastError(kErrorInternal, "Writing the native helper output stream", GetLastError());
    }
    cursor += written;
    remaining -= written;
  }
}

void FrameWriter::WriteJson(const json::Value& message) {
  Write(EncodeJsonFrame(message.Serialize()));
}

void FrameWriter::WriteBinary(std::string_view identifier, const std::vector<std::uint8_t>& data) {
  Write(EncodeBinaryFrame(identifier, data));
}

}  // namespace furn
