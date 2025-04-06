module EasySso
  module SamlServer
     class Hooks < ::Redmine::Hook::ViewListener

       render_on :view_account_login_after_submit, partial: 'account/easy_sso_saml_server/view_account_login_after_submit'

     end
  end
end

