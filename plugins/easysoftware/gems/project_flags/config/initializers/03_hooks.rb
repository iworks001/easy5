Rails.application.config.to_prepare do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'project_flags', 'lib', 'project_flags', 'hooks', 'view_hooks').to_s
end

