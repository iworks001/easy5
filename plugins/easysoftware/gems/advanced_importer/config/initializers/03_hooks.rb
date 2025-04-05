
require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'advanced_importer', 'lib', 'advanced_importer', 'hooks', 'view_hooks').to_s

# Hooks definitions
# http://www.redmine.org/projects/redmine/wiki/Hooks
#
# module AdvancedImporter
#   class Hooks < ::Redmine::Hook::ViewListener
#     render_on :view_issues_show_details_bottom, partial: 'issues/advanced_importer/view_issues_show_details_bottom'
#   end
# end
