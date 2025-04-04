require_dependency Rails.root.join('lib', 'redmine', 'hook').to_s
require_dependency Rails.root.join('lib', 'redmine', 'hook', 'listener').to_s
require_dependency Rails.root.join('lib', 'redmine', 'hook', 'view_listener').to_s
# Hooks definitions
# http://www.redmine.org/projects/redmine/wiki/Hooks
#
module Easy
  module Redmine
    # class Hooks < ::Redmine::Hook::ViewListener
    #   render_on :view_issues_show_details_bottom, partial: 'issues/easy-redmine/view_issues_show_details_bottom'
    # end
  end
end