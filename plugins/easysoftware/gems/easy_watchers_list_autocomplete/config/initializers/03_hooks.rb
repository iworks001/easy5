Rails.application.config.to_prepare do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'easy_watchers_list_autocomplete', 'lib', 'easy_watchers_list_autocomplete', 'hooks', 'view_hooks').to_s
end

