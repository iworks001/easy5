require_dependency Rails.root.join('lib', 'redmine', 'hook').to_s
require_dependency Rails.root.join('lib', 'redmine', 'hook', 'view_listener').to_s

module AdvancedImporter
  module Hooks
    class ViewHooks < ::Redmine::Hook::ViewListener
      render_on :view_issues_show_details_bottom,
        partial: 'issues/advanced_importer/view_issues_show_details_bottom'
    end
  end
end

