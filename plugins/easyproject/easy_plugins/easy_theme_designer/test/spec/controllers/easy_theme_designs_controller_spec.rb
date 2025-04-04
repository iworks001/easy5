require 'easy_extensions/spec_helper'

describe EasyThemeDesignsController, :type => :controller do
  let(:easy_theme_designs) { FactoryGirl.create_list(:easy_theme_design, 3) }

  context 'with admin user', :logged => :admin do

    describe 'GETs' do
      render_views
      it 'get index and response all ok' do
        easy_theme_designs

        get :index
        expect(response).to be_successful
        assert_response 200
      end

      it 'get new with priamry color' do
        attributes = FactoryGirl.attributes_for(:easy_theme_design)

        get :new, :params => {:easy_theme_design => attributes}
        expect(assigns(:easy_theme).primary_color).to eq(attributes[:primary_color])
      end
    end

    describe 'Submit forms' do
      render_views
      it 'submit invalid theme' do
        attributes = FactoryGirl.attributes_for(:easy_theme_design)
        attributes.delete(:primary_color)

        post :create, :params => {:easy_theme_design => attributes}
        expect(response).to be_successful
      end

      it 'submit with logo png' do
        attributes = FactoryGirl.attributes_for(:easy_theme_design)
        attributes[:images] = { logo: fixture_file_upload('logo.png', 'image/png', true) }
        post :create, params: { easy_theme_design: attributes, continue: true }

        expect(response).to redirect_to(easy_theme_designs_path)
        expect(assigns(:easy_theme).get_image('logo')).not_to eq(nil)
        EasyThemeDesigner::ASSETS_FILENAMES.each do |asset_name|
          expect(File.exist?(File.join(Rails.root, 'public', assigns(:easy_theme).asset_path(asset_name)))).to eq(true)
        end
      end

      it 'submit with logo svg' do
        attributes = FactoryGirl.attributes_for(:easy_theme_design)
        attributes[:images] = { logo: fixture_file_upload('logo.svg', 'image/svg+xml', true) }
        post :create, params: { easy_theme_design: attributes }

        expect(response).to redirect_to(easy_theme_designs_path)
        expect(assigns(:easy_theme).get_image('logo')).not_to eq(nil)
        EasyThemeDesigner::ASSETS_FILENAMES.each do |asset_name|
          expect(File.exist?(File.join(Rails.root, 'public', assigns(:easy_theme).asset_path(asset_name)))).to eq(true)
        end
      end

    end

    describe 'Edit theme' do
      render_views
      let!(:easy_theme_design) { FactoryGirl.create(:easy_theme_design) }

      it 'display edit form' do
        get :edit, :params => {:id => easy_theme_design.id}
        expect(response).to be_successful
      end

      it 'upload logo and try to remove it' do
        put :update, params: { id: easy_theme_design.id,
                               easy_theme_design: { images: { logo: fixture_file_upload('logo.png', 'image/png', true) } } }
        expect(response).to redirect_to(easy_theme_designs_path)

        expect { delete :remove_image, params: { id: easy_theme_design.id, image_name: :logo } }.
          to change { easy_theme_design.attachments.count }.by(-1)
        expect(easy_theme_design.get_image('logo')).to be_nil
      end

      it 'remove theme' do
        expect{delete :destroy, :params => {:id => easy_theme_design.id}}.to change(EasyThemeDesign, :count).by(-1)
        expect(response).to redirect_to(easy_theme_designs_path)
      end

      it 'remove compiled theme' do
        expect(easy_theme_design.compile_all(true)).to eq(true)
        expect{delete :destroy, :params => {:id => easy_theme_design.id}}.to change(EasyThemeDesign, :count).by(-1)
      end
    end
    
    it 'save plugin settings' do
      patch :save_settings, params: {settings: {enable_user_theming: '1'}}
      expect(EasyThemeDesigner::Settings.enable_user_theming?).to eq(true)
      patch :save_settings, params: {settings: {enable_user_theming: '0'}}
      expect(EasyThemeDesigner::Settings.enable_user_theming?).to eq(false)
    end


  end

  context 'with regular user', :logged => true do

    describe 'GETs' do
      it 'get index and access denied' do
        get :index
        assert_response 403
      end
    end

  end

end
