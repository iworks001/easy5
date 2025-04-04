require_dependency Rails.root.join('lib', 'redmine', 'hook').to_s
require_dependency Rails.root.join('lib', 'redmine', 'hook', 'listener').to_s
require_dependency Rails.root.join('lib', 'redmine', 'hook', 'view_listener').to_s
module EasyCalculoid
  class Hooks < ::Redmine::Hook::ViewListener
    render_on :edit_trend_module_form_bottom, partial: 'easy_calculoid/trends_hidden_checkbox'
    render_on :show_trend_module_bottom, partial: 'easy_calculoid/trends_hide'
  end
end
