get 'settings/plugin/easy_theme_designer', :to => 'easy_theme_designs#index'
resources :easy_theme_designs do
  collection do
    get :choose_easy_theme
    patch :save_settings
  end
  member do
    get :preview
    post :assign_easy_theme
    delete :remove_image
  end
end

scope :easy_xml_easy_theme_designs, controller: :easy_xml_easy_theme_designs, as: :easy_xml_easy_theme_designs do
  post :export
end

get 'easy_theme_designer/off', :to => 'easy_theme_designs#disable', :as => 'disable_easy_theme_designs'
get 'easy_theme_designer/generate/:id', :to => 'easy_theme_designs#generate', :as => 'generate_easy_theme_design'
