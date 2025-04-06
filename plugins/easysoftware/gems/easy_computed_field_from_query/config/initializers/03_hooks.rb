ActiveSupport.on_load(:after_initialize) do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'easy_computed_field_from_query', 'lib', 'easy_computed_field_from_query', 'hooks', 'view_hooks').to_s
end

# Hooks definitions
# http://www.redmine.org/projects/redmine/wiki/Hooks
#
