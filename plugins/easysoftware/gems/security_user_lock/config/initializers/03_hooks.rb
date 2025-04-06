Rails.application.config.to_prepare do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'security_user_lock', 'lib', 'security_user_lock', 'hooks', 'view_hooks').to_s
end

