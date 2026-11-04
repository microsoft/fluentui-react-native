#pragma once

#include <functional>
#include <string>

namespace furn {

// Records one check. The self-test harness owns the counters and the output.
using CheckFunction = std::function<void(bool, const std::string&)>;

// Checks the private-storage, service-identity, and application-incarnation
// helper modes: the record name, base64, UTF-8, root, ancestor, URL, and
// listener rules; an owner-only store in a scratch directory with its tamper
// and race cases; the describe and verify operations against this process, a
// child process, and a loopback listener; and the incarnation classifier,
// request rules, and probes of this process and a child. A case the machine
// cannot host prints an `info` line and is skipped.
void RunAuthoritySelfTests(const CheckFunction& check);

}  // namespace furn
