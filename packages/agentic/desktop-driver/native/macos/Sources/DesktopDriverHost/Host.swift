import Foundation
import Darwin

func createHello() -> JSONObject {
  [
    "type": "hello",
    "provider": "macos",
    "architecture": "arm64",
    "buildId": FurnBuildInfo.buildId,
    "sourceDigest": FurnBuildInfo.sourceDigest,
    "minimumOs": "14.0",
    "protocol": [
      "major": 1,
      "minor": 1,
    ],
    "features": [
      "accessibilityClick",
      "activeElement",
      "attach",
      "capture",
      "elementCapture",
      "find",
      "focus",
      "hitTest",
      "keyboard",
      "launch",
      "pointer",
      "probe",
      "releaseActions",
      "setWindowRect",
      "source",
      "tree",
      "wheel",
    ],
  ]
}

private struct PendingRequest {
  let id: String
  let command: String
  let params: JSONObject
}

final class Host {
  private let condition = NSCondition()
  private let token = CancellationToken()
  private let driver = Driver()
  private var queue: [PendingRequest] = []
  private var activeID: String?
  private var stopping = false
  private var writer: FrameWriter?
  private let workerDone = DispatchSemaphore(value: 0)

  func run() -> Int32 {
    let writer = FrameWriter(.standardOutput)
    self.writer = writer
    let reader = FrameReader(.standardInput)
    do {
      try writer.writeJSON(createHello())
    } catch {
      writeDiagnostic("furn-desktop-driver-host: writing hello failed: \(error)")
      return 1
    }

    let worker = Thread { [weak self] in
      self?.workerLoop()
    }
    worker.name = "furn-desktop-driver-worker"
    worker.start()

    var exitCode: Int32 = 0
    do {
      while let frame = try reader.read() {
        if frame.type != .json {
          writeDiagnostic("The native helper ignored an unexpected binary frame on stdin.")
          continue
        }
        let value: Any
        do {
          value = try parseJSON(frame.payload)
        } catch {
          writeDiagnostic("The native helper ignored malformed JSON: \(error)")
          continue
        }
        guard let message = value as? JSONObject else {
          writeDiagnostic("The native helper ignored a JSON message that is not an object.")
          continue
        }
        let type = message["type"] as? String ?? ""
        let id = message["id"] as? String ?? ""
        if (type == "cancel" || type == "request")
          && (id.isEmpty || id.utf8.count > Framing.maximumCorrelationIDBytes)
        {
          writeDiagnostic("The native helper ignored a request with an invalid correlation identifier.")
          continue
        }
        if type == "cancel" {
          handleCancel(id)
          continue
        }
        guard type == "request" else {
          writeDiagnostic("The native helper received a message that is not a correlated request.")
          continue
        }
        let command = message["command"] as? String ?? ""
        let params = message["params"] as? JSONObject ?? [:]
        condition.lock()
        queue.append(PendingRequest(id: id, command: command, params: params))
        condition.signal()
        condition.unlock()
      }
    } catch {
      writeDiagnostic("furn-desktop-driver-host: \(error)")
      exitCode = 1
    }

    condition.lock()
    stopping = true
    token.cancel()
    condition.broadcast()
    condition.unlock()
    workerDone.wait()
    self.writer = nil
    return exitCode
  }

  private func handleCancel(_ id: String) {
    condition.lock()
    if activeID == id {
      token.cancel()
      condition.unlock()
      return
    }
    if let index = queue.firstIndex(where: { $0.id == id }) {
      queue.remove(at: index)
    }
    condition.unlock()
    writeCancelled(id)
  }

  private func workerLoop() {
    defer { workerDone.signal() }
    while true {
      condition.lock()
      while queue.isEmpty && !stopping {
        condition.wait()
      }
      if stopping && queue.isEmpty {
        condition.unlock()
        return
      }
      let request = queue.removeFirst()
      activeID = request.id
      token.reset()
      condition.unlock()

      var cancelled = false
      do {
        let result = try driver.execute(command: request.command, params: request.params, token: token)
        try writeResponse(id: request.id, command: request.command, result: result)
      } catch is CancelledError {
        cancelled = true
      } catch let error as HelperError {
        writeError(id: request.id, command: request.command, code: error.code, message: error.message, data: error.data)
      } catch {
        writeError(
          id: request.id,
          command: request.command,
          code: ErrorCode.internalError,
          message: error.localizedDescription
        )
      }

      if cancelled {
        driver.releaseInput()
        writeCancelled(request.id)
      }
      condition.lock()
      activeID = nil
      condition.unlock()

      if request.command == "dispose" && !cancelled {
        try? FileHandle.standardOutput.synchronize()
        Darwin.exit(EXIT_SUCCESS)
      }
    }
  }

  private func writeResponse(id: String, command: String, result: CommandResult) throws {
    if let binaryID = result.binaryID, let binaryData = result.binaryData {
      guard 4 + binaryID.utf8.count + binaryData.count <= Framing.maximumBinaryBytes else {
        writeError(
          id: id,
          command: command,
          code: ErrorCode.captureFailed,
          message: "The captured image exceeds the 64 MiB native binary frame limit."
        )
        return
      }
    }
    var response: JSONObject = [
      "type": "response",
      "id": id,
      "result": result.result,
    ]
    if let metadata = result.binaryMetadata {
      response["binary"] = metadata
    }
    let serialized = try serializeJSON(response)
    if serialized.count > Framing.maximumJSONBytes {
      let treeCommand = command == "find" || command == "source" || command == "tree"
      writeError(
        id: id,
        command: command,
        code: treeCommand ? ErrorCode.treeTooLarge : ErrorCode.internalError,
        message: "The native command response exceeds the 8 MiB JSON frame limit."
      )
      return
    }
    try writer?.writeJSON(response)
    if let binaryID = result.binaryID, let binaryData = result.binaryData {
      try writer?.writeBinary(id: binaryID, data: binaryData)
    }
  }

  private func writeError(
    id: String,
    command: String,
    code: String,
    message: String,
    data: JSONObject? = nil
  ) {
    var errorData = data ?? [:]
    errorData["command"] = bounded(command, bytes: 256)
    var response: JSONObject = [
      "type": "response",
      "id": id,
      "error": [
        "code": code,
        "message": bounded(message, bytes: 4096),
        "data": errorData,
      ],
    ]
    do {
      if try serializeJSON(response).count > Framing.maximumJSONBytes {
        response["error"] = [
          "code": code,
          "message": bounded(message, bytes: 4096),
          "data": [
            "command": bounded(command, bytes: 256),
            "diagnosticsTruncated": true,
          ],
        ]
      }
      try writer?.writeJSON(response)
    } catch {
      writeDiagnostic("Native error write failed: \(error)")
      Darwin.exit(EXIT_FAILURE)
    }
  }

  private func writeCancelled(_ id: String) {
    do {
      try writer?.writeJSON([
        "type": "cancelled",
        "id": id,
      ])
    } catch {
      writeDiagnostic("Native cancellation write failed: \(error)")
      Darwin.exit(EXIT_FAILURE)
    }
  }
}
