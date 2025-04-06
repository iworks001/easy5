Rails.application.config.to_prepare do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'show_last_comments_on_issue', 'lib', 'show_last_comments_on_issue', 'hooks', 'view_hooks').to_s
end

