import Foundation

enum FrameType: UInt8 {
  case json = 1
  case binary = 2
}

struct Frame {
  let type: FrameType
  let payload: Data
}

enum Framing {
  static let headerBytes = 12
  static let maximumJSONBytes = 8 * 1024 * 1024
  static let maximumBinaryBytes = 64 * 1024 * 1024
  static let maximumCorrelationIDBytes = 256
  static let maximumBinaryIDBytes = 1024
  static let magic = Data("FDR1".utf8)

  static func encode(type: FrameType, payload: Data) throws -> Data {
    let limit = type == .json ? maximumJSONBytes : maximumBinaryBytes
    guard payload.count <= limit else {
      try fail(ErrorCode.internalError, "Native frame length \(payload.count) exceeds the \(limit)-byte type limit.")
    }
    var frame = Data()
    frame.append(magic)
    frame.append(type.rawValue)
    frame.append(contentsOf: [0, 0, 0])
    var length = UInt32(payload.count).littleEndian
    withUnsafeBytes(of: &length) { frame.append(contentsOf: $0) }
    frame.append(payload)
    return frame
  }

  static func encodeJSON(_ value: Any) throws -> Data {
    try encode(type: .json, payload: serializeJSON(value))
  }

  static func encodeBinary(id: String, data: Data) throws -> Data {
    let idData = Data(id.utf8)
    guard !idData.isEmpty, idData.count <= maximumBinaryIDBytes else {
      try fail(ErrorCode.internalError, "The binary frame identifier is invalid.")
    }
    guard 4 + idData.count + data.count <= maximumBinaryBytes else {
      try fail(ErrorCode.captureFailed, "The captured image exceeds the 64 MiB native binary frame limit.")
    }
    var payload = Data()
    var length = UInt32(idData.count).littleEndian
    withUnsafeBytes(of: &length) { payload.append(contentsOf: $0) }
    payload.append(idData)
    payload.append(data)
    return try encode(type: .binary, payload: payload)
  }

  static func decodeHeader(_ data: Data) -> (FrameType, Int)? {
    guard data.count == headerBytes, data.prefix(4) == magic else {
      return nil
    }
    guard data[5] == 0, data[6] == 0, data[7] == 0, let type = FrameType(rawValue: data[4]) else {
      return nil
    }
    let length = data.withUnsafeBytes {
      Int(UInt32(littleEndian: $0.loadUnaligned(fromByteOffset: 8, as: UInt32.self)))
    }
    let limit = type == .json ? maximumJSONBytes : maximumBinaryBytes
    guard length <= limit else {
      return nil
    }
    return (type, length)
  }
}

final class FrameReader {
  private let input: FileHandle

  init(_ input: FileHandle) {
    self.input = input
  }

  func read() throws -> Frame? {
    guard let header = try readExact(Framing.headerBytes) else {
      return nil
    }
    guard let (type, length) = Framing.decodeHeader(header) else {
      try fail(ErrorCode.invalidRequest, "The native helper received an invalid FDR1 frame header.")
    }
    guard let payload = try readExact(length) else {
      try fail(ErrorCode.invalidRequest, "The native helper received a truncated FDR1 frame.")
    }
    return Frame(type: type, payload: payload)
  }

  private func readExact(_ count: Int) throws -> Data? {
    if count == 0 {
      return Data()
    }
    var output = Data()
    while output.count < count {
      let chunk: Data
      do {
        chunk = try input.read(upToCount: count - output.count) ?? Data()
      } catch {
        try fail(ErrorCode.invalidRequest, "Reading native protocol input failed: \(error.localizedDescription)")
      }
      if chunk.isEmpty {
        return output.isEmpty ? nil : output
      }
      output.append(chunk)
    }
    return output
  }
}

final class FrameWriter: @unchecked Sendable {
  private let lock = NSLock()
  private let output: FileHandle

  init(_ output: FileHandle) {
    self.output = output
  }

  func writeJSON(_ value: Any) throws {
    try write(Framing.encodeJSON(value))
  }

  func writeBinary(id: String, data: Data) throws {
    try write(Framing.encodeBinary(id: id, data: data))
  }

  private func write(_ data: Data) throws {
    lock.lock()
    defer { lock.unlock() }
    do {
      try output.write(contentsOf: data)
    } catch {
      try fail(ErrorCode.internalError, "Writing native protocol output failed: \(error.localizedDescription)")
    }
  }
}
