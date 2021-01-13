require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'FluentUI-React-Native-Button'
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = package['license']

  s.authors      = package['author']
  s.homepage     = "https://github.com/microsoft/fluentui-react-native"

  s.source           = { :git => "https://github.com/microsoft/fluentui-react-native.git", :tag => "#{s.version}" }
  s.swift_version    = "5"
  s.dependency 'React'

  s.ios.deployment_target = "11.0"
  s.ios.source_files      = "ios/*.{swift,h,m}"
  s.ios.dependency 'MicrosoftFluentUI/Controls_ios', '~> 0.1.25'

  s.osx.deployment_target = "10.14"
  s.osx.source_files      = "macos/*.{swift,h,m}"
  s.osx.dependency 'MicrosoftFluentUI/Button_mac', '~> 0.1.25'


end