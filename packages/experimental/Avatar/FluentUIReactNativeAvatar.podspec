require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'FluentUI-React-Native-Avatar'
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = package['license']

  s.authors      = package['author']
  s.homepage     = package['homepage']

  s.source           = { :git => "https://github.com/microsoft/fluentui-react-native.git", :tag => "#{s.version}" }
  s.swift_version    = "5"

  s.ios.deployment_target = "13.0"
  s.ios.source_files      = "ios/*.{swift,h,m}"
  s.ios.dependency 'MicrosoftFluentUI', '~> 0.2.6'

  s.osx.deployment_target = "10.14"
  s.osx.source_files      = "macos/*.{swift,h,m}"
  s.osx.dependency 'MicrosoftFluentUI', '~> 0.2.2'

  s.dependency 'React'
end