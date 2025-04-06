Rails.application.config.to_prepare do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'search_in_administration', 'lib', 'search_in_administration', 'hooks', 'view_hooks').to_s
end

