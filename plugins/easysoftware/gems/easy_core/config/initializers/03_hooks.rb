ActiveSupport.on_load(:after_initialize) do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'easy_core', 'lib', 'easy_core', 'hooks', 'view_hooks').to_s
end

# Hooks definitions
# http://www.redmine.org/projects/redmine/wiki/Hooks
#
# module EasyCore
#   class Hooks < ::Redmine::Hook::ViewListener
#     render_on :view_issues_show_details_bottom, partial: 'issues/easy_core/view_issues_show_details_bottom'
#   end
# end
