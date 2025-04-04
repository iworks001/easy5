require_dependency Rails.root.join('lib', 'redmine', 'hook').to_s
require_dependency Rails.root.join('lib', 'redmine', 'hook', 'listener').to_s
require_dependency Rails.root.join('lib', 'redmine', 'hook', 'view_listener').to_s
module RysManagement
  class Hooks < ::Redmine::Hook::ViewListener
    render_on :view_admin_plugins_bottom, partial: 'admin/rys_management/view_admin_plugins_bottom'
    render_on :view_manage_plugins_form_buttons, partial: 'admin/rys_management/view_admin_plugins_bottom'
  end
end
