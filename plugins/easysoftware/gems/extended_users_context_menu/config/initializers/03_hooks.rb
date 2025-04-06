Rails.application.config.to_prepare do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'extended_users_context_menu', 'lib', 'extended_users_context_menu', 'hooks', 'view_hooks').to_s
end

