Rails.application.config.to_prepare do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'ryspec', 'lib', 'ryspec', 'hooks', 'view_hooks').to_s
end

