#pragma once

#include <array>
#include <cstdint>
#include <string_view>
#include <vector>

#include "json.h"

namespace furn::service {

enum class Family { kIpv4, kIpv6 };

// A TCP endpoint. IPv4 addresses use the first four bytes.
struct Endpoint {
  Family family{Family::kIpv4};
  std::array<unsigned char, 16> address{};
  std::uint16_t port{0};
};

// One row of the system listening-socket table.
struct Listener {
  Endpoint local;
  std::uint32_t pid{0};
};

// Accepts only `http://127.0.0.1:<port>` and `http://[::1]:<port>` with a port
// from 1 to 65535 and nothing before or after.
bool ParseLoopbackUrl(std::string_view url, Endpoint& destination);

// True when at least one listening socket can accept a connection to the
// destination and every such socket is owned by `pid`. A wildcard listener on
// the same port counts, because another process can bind one beside a
// loopback-specific listener.
bool ListenersBelongTo(const std::vector<Listener>& listeners, const Endpoint& destination, std::uint32_t pid);

// Every listening TCP socket in both address families. Throws on failure.
std::vector<Listener> ReadListeners();

// Handles one `describe` or `verify` request document. The response is
// `{"ok":false,"reason":"request"}` for a malformed request, `{"ok":false,...}`
// when `describe` cannot attest the process, and `{"ok":true,"verified":...}`
// for `verify`. This function never throws for bad input.
json::Value HandleServiceIdentityRequest(const json::Value& request);

}  // namespace furn::service
