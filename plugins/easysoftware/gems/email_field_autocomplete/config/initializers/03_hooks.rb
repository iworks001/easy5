Rails.application.config.to_prepare do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'email_field_autocomplete', 'lib', 'email_field_autocomplete', 'hooks', 'view_hooks').to_s
end

