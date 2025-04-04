require_dependency Rails.root.join('lib', 'redmine', 'hook').to_s
require_dependency Rails.root.join('lib', 'redmine', 'hook', 'listener').to_s
require_dependency Rails.root.join('lib', 'redmine', 'hook', 'view_listener').to_s
# Hooks definitions
# http://www.redmine.org/projects/redmine/wiki/Hooks
#
# module Swagger
#   class Hooks < ::Redmine::Hook::ViewListener
#     render_on :view_issues_show_details_bottom, partial: 'issues/easy_swagger/view_issues_show_details_bottom'
#   end
# end
