Rails.application.config.to_prepare do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'easy_integration', 'lib', 'easy_integration', 'hooks', 'view_hooks').to_s
end

# Hooks definitions
# http://www.redmine.org/projects/redmine/wiki/Hooks
#
