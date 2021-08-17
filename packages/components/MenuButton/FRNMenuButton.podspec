require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'FRNMenuButton'
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = package['license']

  s.authors      = package['author']
  s.homepage     = package['homepage']

  s.source           = { :git => "https://github.com/microsoft/fluentui-react-native.git", :tag => "#{s.version}" }
  s.swift_version    = "5.0"

  s.pod_target_xcconfig = { 'BUILD_LIBRARY_FOR_DISTRIBUTION' => 'YES', 'OTHER_SWIFT_FLAGS' => '-gline-tables-only' }

  s.osx.deployment_target = "10.14"
  s.osx.source_files      = "macos/*.{swift,h,m,mm}"

  s.dependency 'React'
end
