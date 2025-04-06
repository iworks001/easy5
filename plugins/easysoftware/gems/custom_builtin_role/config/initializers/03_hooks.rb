Rails.application.config.to_prepare do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'custom_builtin_role', 'lib', 'custom_builtin_role', 'hooks', 'view_hooks').to_s
end

# Hooks definitions
# http://www.redmine.org/projects/redmine/wiki/Hooks
