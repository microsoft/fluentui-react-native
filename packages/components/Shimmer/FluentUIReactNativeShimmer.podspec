require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'FluentUI-React-Native-Shimmer'
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = package['license']

  s.authors      = package['author']
  s.homepage     = package['homepage']

  s.source           = { :git => "https://github.com/microsoft/fluentui-react-native.git", :tag => "#{s.version}" }
  s.swift_version    = "5"

  s.ios.deployment_target = "11.0"
  s.ios.source_files      = "ios/*.{swift,h,m}"

  s.dependency 'React'
  s.dependency 'MicrosoftFluentUI/Shimmer_ios', '~> 0.1.28'
end