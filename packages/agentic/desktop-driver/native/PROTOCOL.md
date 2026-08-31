# Desktop Driver native host protocol

The private native host protocol connects the Node `DesktopHost` adapter to one
long-lived operating-system helper over inherited stdin and stdout.

Each frame has a 12-byte little-endian header:

| Offset | Size | Value                            |
| ------ | ---- | -------------------------------- |
| 0      | 4    | ASCII `FDR1`                     |
| 4      | 1    | frame type: `1` JSON, `2` binary |
| 5      | 3    | reserved zero bytes              |
| 8      | 4    | payload byte length              |

JSON frames use UTF-8 and contain one of:

- `hello`: helper identity, protocol range, build identity, and features;
- `request`: correlated command and serializable parameters;
- `response`: correlated result or structured error;
- `event`: native application, window, structure, or transport event;
- `cancel`: request cancellation;
- `cancelled`: cancellation acknowledgement.

Binary frames start with a four-byte UTF-8 identifier length, the identifier,
then the raw payload. Image responses name the corresponding binary identifier
in their JSON response.

Stderr is reserved for bounded human-readable diagnostics. The helper never
opens a listener, accepts arbitrary commands, or receives WebDriver
capabilities directly.
