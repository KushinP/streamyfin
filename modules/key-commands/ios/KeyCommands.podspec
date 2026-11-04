Pod::Spec.new do |s|
  s.name           = 'KeyCommands'
  s.version        = '1.0.0'
  s.summary        = 'Hardware keyboard shortcuts for iPad and the Mac'
  s.description    = 'Registers UIKeyCommands on the root view controller and relays them to JavaScript.'
  s.author         = ''
  s.homepage       = 'https://github.com/streamyfin/streamyfin'
  # iPhone and iPad (and the iPad app on a Mac); tvOS has no keyboard shortcuts.
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift}"
end
