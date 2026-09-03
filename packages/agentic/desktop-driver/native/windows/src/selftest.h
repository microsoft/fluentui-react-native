#pragma once

namespace furn {

// Runs the helper-internal checks that do not require a live application:
// framing, JSON, coordinate conversion, selector normalization, snapshot shape,
// lease timestamps, and the physical-input release ledger.
int RunSelfTest();

}  // namespace furn
