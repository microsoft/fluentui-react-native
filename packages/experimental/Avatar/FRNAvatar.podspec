require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'FRNAvatar'
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = package['license']

  s.authors      = package['author']
  s.homepage     = package['homepage']

  s.source           = { :git => "https://github.com/microsoft/fluentui-react-native.git", :tag => "#{s.version}" }
  s.swift_version    = "5.0"

  s.ios.deployment_target = "14.0"
  s.ios.source_files      = "ios/*.{swift,h,m}"
  s.ios.dependency 'MicrosoftFluentUI/Avatar_ios', '0.6.1'

  s.osx.deployment_target = "10.15"
  s.osx.source_files      = "macos/*.{swift,h,m}"
  s.osx.dependency 'MicrosoftFluentUI', '0.6.1'

  s.dependency 'React'
end