// swift-tools-version: 5.9

import PackageDescription

let package = Package(
  name: "FurnDesktopDriverHost",
  platforms: [
    .macOS(.v14),
  ],
  products: [
    .executable(name: "furn-desktop-driver-host", targets: ["DesktopDriverHost"]),
  ],
  targets: [
    .executableTarget(
      name: "DesktopDriverHost",
      linkerSettings: [
        .linkedFramework("ApplicationServices"),
        .linkedFramework("AppKit"),
        .linkedFramework("ImageIO"),
        .linkedFramework("ScreenCaptureKit"),
        .linkedFramework("UniformTypeIdentifiers"),
      ]
    ),
  ]
)
