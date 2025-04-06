Rails.application.config.to_prepare do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'issue_duration', 'lib', 'issue_duration', 'hooks', 'view_hooks').to_s
end

