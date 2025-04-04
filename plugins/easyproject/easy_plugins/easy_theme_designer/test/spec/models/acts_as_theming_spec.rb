require 'easy_extensions/spec_helper'

describe EasyThemeDesigner::Acts::EasyTheming, type: :controller, admin: true do

  context 'Cache' do

    let!(:easy_theme_designs) { FactoryGirl.create_list(:easy_theme_design, 3) }
    let(:user) { FactoryGirl.create(:user) }

    it 'assign theme to user and change' do
      with_settings({ plugin_easy_theme_designer: {enable_user_theming: true} }) do
        user.safe_attributes = {'easy_theme_design_id' => easy_theme_designs.first.id}
        expect(user.save).to be_truthy
        expect(user.reload.easy_theme_design).not_to be_nil
        path = Rails.cache.fetch([:individual_easy_theme, user.easy_theme_design_entity]) do
          user.easy_theme_design.try(:asset_url)
        end

        user.safe_attributes = {'easy_theme_design_id' => easy_theme_designs.last.id}
        expect(user.save).to be_truthy
        expect(user.reload.easy_theme_design).not_to be_nil

        new_path = Rails.cache.fetch([:individual_easy_theme, user.easy_theme_design_entity]) do
          user.easy_theme_design.try(:asset_url)
        end

        expect(new_path).not_to eq(path)

        user.safe_attributes = {'easy_theme_design_id' => easy_theme_designs.first.id}
        expect(user.save).to be_truthy
        expect(user.reload.easy_theme_design).not_to be_nil

        new_path = Rails.cache.fetch([:individual_easy_theme, user.easy_theme_design_entity]) do
          user.easy_theme_design.try(:asset_url)
        end

        expect(new_path).to eq(path)

        admin_path = Rails.cache.fetch([:individual_easy_theme, User.current.easy_theme_design_entity]) do
          User.current.easy_theme_design.try(:asset_url)
        end

        expect(admin_path).to be_nil
      end
    end
  end



end
