Rails.application.config.to_prepare do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'easy_service_manager', 'lib', 'easy_service_manager', 'hooks', 'view_hooks').to_s
end

# Hooks definitions
# http://www.redmine.org/projects/redmine/wiki/Hooks
#
# module EasyServiceManager
#   class Hooks < ::Redmine::Hook::ViewListener
#     render_on :view_issues_show_details_bottom, partial: 'issues/easy_service_manager/view_issues_show_details_bottom'
#   end
# end
