Rails.application.config.to_prepare do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'easy_zapier', 'lib', 'easy_zapier', 'hooks', 'view_hooks').to_s
end

