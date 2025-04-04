require_dependency Rails.root.join('lib', 'redmine', 'hook').to_s
require_dependency Rails.root.join('lib', 'redmine', 'hook', 'listener').to_s
require_dependency Rails.root.join('lib', 'redmine', 'hook', 'view_listener').to_s
# Hooks definitions
# http://www.redmine.org/projects/redmine/wiki/Hooks
#
module EasySso
  module SamlServer
     class Hooks < ::Redmine::Hook::ViewListener

       render_on :view_account_login_after_submit, partial: 'account/easy_sso_saml_server/view_account_login_after_submit'

     end
  end
end