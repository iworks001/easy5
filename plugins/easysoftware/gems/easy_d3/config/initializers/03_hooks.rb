ActiveSupport.on_load(:after_initialize) do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'easy_d3', 'lib', 'easy_d3', 'hooks', 'view_hooks').to_s
end
# Hooks definitions
# http://www.redmine.org/projects/redmine/wiki/Hooks
