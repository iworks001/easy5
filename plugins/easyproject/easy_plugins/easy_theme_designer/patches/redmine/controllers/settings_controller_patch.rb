module EasyThemeDesigner
  module SettingsControllerPatch
    def self.included(base)
      base.include(InstanceMethods)

      base.class_eval do
        alias_method_chain :edit, :easy_theme_designer
      end
    end

    module InstanceMethods
      def edit_with_easy_theme_designer
        if request.post?
          theme_id = params[:easy_theme_design_id]
          if theme_id.present?
            EasyThemeDesign.find_by(id: theme_id)&.set_in_use! if theme_id.to_i != EasyThemeDesign.in_use_globally&.id
          elsif theme_id == ''
            EasyThemeDesign.disable!
          end
        end

        edit_without_easy_theme_designer
      end
    end
  end
end
EasyExtensions::PatchManager.register_controller_patch 'SettingsController', 'EasyThemeDesigner::SettingsControllerPatch'
