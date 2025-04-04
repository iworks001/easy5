require_dependency Rails.root.join('lib', 'redmine', 'hook').to_s
require_dependency Rails.root.join('lib', 'redmine', 'hook', 'listener').to_s
require_dependency Rails.root.join('lib', 'redmine', 'hook', 'view_listener').to_s
# Hooks definitions
# http://www.redmine.org/projects/redmine/wiki/Hooks
#
module EasyOauth2
  class Hooks < ::Redmine::Hook::ViewListener

    render_on :view_easy_sso_index_sidebar, partial: 'easy_sso/easy_oauth2/view_easy_sso_index_sidebar'
    render_on :view_account_login_after_submit, partial: 'easy_sso/easy_oauth2/view_account_login_after_submit'

  end
end