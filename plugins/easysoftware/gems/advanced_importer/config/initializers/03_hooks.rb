
require_dependency Rails.root.join('lib', 'redmine', 'i18n').to_s
require_dependency Rails.root.join('lib', 'redmine', 'menu_manager.rb').to_s
require_dependency Rails.root.join('lib', 'redmine', 'themes.rb').to_s
require_dependency Rails.root.join('lib', 'redmine', 'sudo_mode.rb').to_s
require_dependency Rails.root.join('lib', 'redmine', 'pagination.rb').to_s
require_dependency Rails.root.join('lib', 'redmine', 'wiki_formatting', 'common_mark', 'markdown_filter.rb').to_s
require_dependency Rails.root.join('lib', 'redmine', 'wiki_formatting', 'macros.rb').to_s
require_dependency Rails.root.join('lib', 'redmine', 'wiki_formatting', 'links_helper.rb').to_s
require_dependency Rails.root.join('lib', 'redmine', 'safe_attributes.rb').to_s
require_dependency Rails.root.join('lib', 'redmine', 'string_array_diff','diffable.rb').to_s
require_dependency Rails.root.join('lib', 'redmine', 'string_array_diff','diff.rb').to_s
require_dependency Rails.root.join('lib', 'redmine', 'utils').to_s
Dir.glob(Rails.root.join('lib', 'redmine', 'helpers', '*.rb')).sort.each do |file|
  require_dependency file
end
require_dependency Rails.root.join('lib', 'redmine', 'wiki_formatting').to_s
require_dependency Rails.root.join('lib', 'redmine', 'hook').to_s
require_dependency Rails.root.join('lib', 'redmine', 'hook', 'listener').to_s
require_dependency Rails.root.join('lib', 'redmine', 'hook', 'view_listener').to_s
# Hooks definitions
# http://www.redmine.org/projects/redmine/wiki/Hooks
#
# module AdvancedImporter
#   class Hooks < ::Redmine::Hook::ViewListener
#     render_on :view_issues_show_details_bottom, partial: 'issues/advanced_importer/view_issues_show_details_bottom'
#   end
# end
