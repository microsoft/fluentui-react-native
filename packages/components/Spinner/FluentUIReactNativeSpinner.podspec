require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))
version = package['version']

Pod::Spec.new do |s|
  s.name             = 'FluentUI-React-Native-Spinner'
  s.version          = "#{version}"
  s.summary          = 'Fluent UI React Native Spinner Control'
  s.homepage         = "https://www.microsoft.com/design/fluent/#/"
  s.author           = { "Microsoft" => "fluentuinativeowners@microsoft.com"}
  s.source           = { :git => "https://github.com/microsoft/fluentui-react-native.git", :tag => "#{s.version}" }
  s.swift_version    = "5"
  s.module_name      = 'FluentUIReactNativeSpinner'

  s.ios.deployment_target = "11.0"
  s.ios.source_files      = "ios/*.{swift,h,m}"

  s.dependency 'React'
  s.dependency 'MicrosoftFluentUI', '~> 0.1.16'
end
