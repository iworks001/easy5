module EasyThemeDesigner
  module EasyAssetsControllerPatch

    def self.included(base)
      base.send(:include, InstanceMethods)
      base.class_eval do

        alias_method_chain :file_path, :easy_theme_designer

      end
    end

    module InstanceMethods
      def file_path_with_easy_theme_designer
        theme_path ||= EasyThemeDesign.in_use.try(:asset_url, 'theme_typography')
        file_path = File.join(Rails.public_path, theme_path.to_s)
        theme_path.present? && File.exists?(file_path) ? file_path : file_path_without_easy_theme_designer
      end
    end

  end
end
EasyExtensions::PatchManager.register_controller_patch 'EasyAssetsController', 'EasyThemeDesigner::EasyAssetsControllerPatch'
