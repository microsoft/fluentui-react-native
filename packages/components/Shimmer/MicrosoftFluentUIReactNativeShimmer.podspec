Pod::Spec.new do |s|
  s.name             = 'MicrosoftFluentUIReactNativeShimmer'
  s.version          = '0.1.0'
  s.summary          = 'Fluent UI React Native iOS Shimmer Control'
  s.homepage         = "https://www.microsoft.com/design/fluent/#/"
  s.license          = { :type => 'MIT', :file => 'LICENSE' }
  s.author           = { "Microsoft" => "fluentuinativeowners@microsoft.com"}
  s.source       = { :git => "https://github.com/microsoft/fluentui-react-native.git", :tag => "#{s.version}" }
  s.swift_version = "5.0"
  s.module_name = 'FluentUI'

  s.ios.deployment_target = "11.0"
  s.ios.source_files   = "ios/FluentUI/**/*.{swift,h}"
  s.ios.resource_bundle = { 'FluentUIResources-ios' => "ios/FluentUI/**/*.{storyboard,xib,xcassets,strings,stringsdict}" }
end
