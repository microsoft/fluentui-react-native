import Foundation
import Darwin

private let maximumLedgerBytes = 16 * 1024 * 1024

private func readReleaseLedgerInput() throws -> Data {
  var data = Data()
  while true {
    let chunk = try FileHandle.standardInput.read(upToCount: 4096) ?? Data()
    if chunk.isEmpty {
      return data
    }
    data.append(chunk)
    if data.count > maximumLedgerBytes {
      try fail(ErrorCode.invalidRequest, "The release ledger on standard input is too large.")
    }
  }
}

private func printUsage() -> Int32 {
  writeDiagnostic(
    """
    Usage: furn-desktop-driver-host --handshake --json | --self-test | --stdio
           furn-desktop-driver-host --release-input          (reads {"keys":[],"buttons":[]} from stdin)
           furn-desktop-driver-host --release-input --sweep  (diagnostics: release held modifiers/buttons)
    """
  )
  return 2
}

private func releaseInput(sweep: Bool) -> Int32 {
  let input = InputController()
  let token = CancellationToken()
  do {
    if sweep {
      let counts = try PhysicalInputLock.shared.withLock(
        token: token,
        timeoutMilliseconds: 5_000,
        policy: .adopt
      ) {
        try input.releaseDesktopModifiers()
      }
      print(#"{"releasedKeys":\#(counts.keys),"releasedButtons":\#(counts.buttons),"sweep":true}"#)
      return 0
    }
    guard isatty(STDIN_FILENO) == 0 else {
      try fail(
        ErrorCode.invalidRequest,
        #"Standard input did not carry a release ledger such as {"keys":[],"buttons":[]}."#
      )
    }
    let data = try readReleaseLedgerInput()
    guard !data.isEmpty else {
      try fail(
        ErrorCode.invalidRequest,
        #"Standard input did not carry a release ledger such as {"keys":[],"buttons":[]}."#
      )
    }
    let ledger = try parseReleaseLedger(parseJSON(data))
    let counts = try PhysicalInputLock.shared.withLock(
      token: token,
      timeoutMilliseconds: 5_000,
      policy: .adopt
    ) {
      try input.releaseExact(ledger)
    }
    print(#"{"releasedKeys":\#(counts.keys),"releasedButtons":\#(counts.buttons)}"#)
    return 0
  } catch let error as HelperError {
    writeDiagnostic("furn-desktop-driver-host: \(error.code): \(error.message)")
    return error.code == ErrorCode.inputUnavailable ? 3 : 1
  } catch {
    writeDiagnostic("furn-desktop-driver-host: \(error.localizedDescription)")
    return 1
  }
}

let arguments = Array(CommandLine.arguments.dropFirst())
let result: Int32
switch arguments.first {
case "--handshake":
  do {
    FileHandle.standardOutput.write(try serializeJSON(createHello()))
    FileHandle.standardOutput.write(Data([0x0A]))
    result = 0
  } catch {
    writeDiagnostic("furn-desktop-driver-host: \(error)")
    result = 1
  }
case "--self-test":
  result = arguments.count == 1 ? runSelfTest() : printUsage()
case "--release-input":
  if arguments.count == 1 {
    result = releaseInput(sweep: false)
  } else if arguments.count == 2 && arguments[1] == "--sweep" {
    result = releaseInput(sweep: true)
  } else {
    result = printUsage()
  }
case "--stdio":
  result = arguments.count == 1 ? Host().run() : printUsage()
default:
  result = printUsage()
}
Darwin.exit(result)
