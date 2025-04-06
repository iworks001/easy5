Rails.application.config.to_prepare do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'easy_twofa', 'lib', 'easy_twofa', 'hooks', 'view_hooks').to_s
end

