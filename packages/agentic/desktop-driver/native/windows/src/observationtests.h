#pragma once

#include "authoritytests.h"

namespace furn {

// Checks bounded observation without a provider: request parsing, string
// clipping, the sampler against synthetic trees (every truncation reason on its
// own, stale and unreadable elements, duplicates, deadlines, cancellation, the
// byte budget, and randomized trees against the structural rules), and the
// element table's pin, release, and capacity rules. When
// FURN_DRIVER_SELF_TEST_OBSERVATIONS names a file, the samples are written there
// as JSON so the package's Jest suite can check them with the Node validator.
void RunObservationSelfTests(const CheckFunction& check);

}  // namespace furn
