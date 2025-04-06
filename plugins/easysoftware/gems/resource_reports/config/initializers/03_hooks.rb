Rails.application.config.to_prepare do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'resource_reports', 'lib', 'resource_reports', 'hooks', 'view_hooks').to_s
end

