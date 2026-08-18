require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'FRNMacosNative'
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = package['license']

  s.authors      = package['author']
  s.homepage     = "https://github.com/microsoft/fluentui-react-native"

  s.source           = { :git => "https://github.com/microsoft/fluentui-react-native.git", :tag => "#{s.version}" }
  s.swift_version    = "5.0"

  s.pod_target_xcconfig = { 'OTHER_SWIFT_FLAGS' => '-gline-tables-only' }

  s.osx.deployment_target = "10.15"
  s.osx.source_files      = "macos/*.{swift,h,m,mm}"

  s.dependency 'React'
end
