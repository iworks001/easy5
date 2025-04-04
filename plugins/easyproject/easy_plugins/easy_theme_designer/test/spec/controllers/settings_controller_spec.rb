require 'easy_extensions/spec_helper'

describe SettingsController, type: :controller do
  let(:easy_theme_design) { FactoryBot.create(:easy_theme_design) }

  context 'update global theme', logged: :admin do
    it 'sets theme' do
      post :edit, params: {easy_theme_design_id: easy_theme_design.id, settings: {dummy: ''}}
      expect(EasyThemeDesign.in_use_globally).to eq(easy_theme_design)
    end

    it 'disable theme' do
      easy_theme_design.set_in_use!
      post :edit, params: {easy_theme_design_id: '', settings: {dummy: ''}}
      expect(EasyThemeDesign.in_use_globally).to eq(nil)
    end

    it 'shouldnt change theme' do
      easy_theme_design.set_in_use!
      post :edit, params: {settings: {dummy: ''}}
      expect(EasyThemeDesign.in_use_globally).to eq(easy_theme_design)
    end
  end
end
