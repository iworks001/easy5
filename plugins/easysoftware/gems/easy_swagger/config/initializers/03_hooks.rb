Rails.application.config.to_prepare do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'easy_swagger', 'lib', 'easy_swagger', 'hooks', 'view_hooks').to_s
end

