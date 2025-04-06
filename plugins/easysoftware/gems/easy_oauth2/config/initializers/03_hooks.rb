# Hooks definitions
# http://www.redmine.org/projects/redmine/wiki/Hooks
#
ActiveSupport.on_load(:after_initialize) do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'easy_oauth2', 'lib', 'easy_oauth2', 'hooks', 'view_hooks').to_s
end

