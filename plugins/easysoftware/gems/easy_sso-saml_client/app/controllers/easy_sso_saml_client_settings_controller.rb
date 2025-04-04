class EasySsoSamlClientSettingsController < ApplicationController

  skip_before_action :check_if_login_required, only: :metadata
  before_action :require_admin, except: :metadata

  def index
  end

  def save_settings
    save_easy_settings

    flash[:notice] = l(:notice_successful_update)

    redirect_back_or_default easy_sso_saml_client_settings_path
  end

  def metadata
    settings = EasySso::SamlClient.saml_settings
    metadata = OneLogin::RubySaml::Metadata.new
    output   = metadata.generate(settings)

    render xml: output, content_type: 'application/xml', layout: false
  end

  def new_sp_certificate
    EasySetting.where(name: "easy_sso_saml_client_sp_certificate").destroy_all
    EasySetting.where(name: "easy_sso_saml_client_sp_certificate_private_key").destroy_all

    respond_to do |format|
      format.js
    end
  end

end
