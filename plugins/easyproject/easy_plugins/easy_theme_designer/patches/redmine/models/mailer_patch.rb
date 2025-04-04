module EasyThemeDesigner
  module MailerPatch

    def self.included(base)
      base.extend(ClassMethods)
      base.include(InstanceMethods)

      base.class_eval do

        class << self

          alias_method_chain :inline_css_file_path, :easy_theme_designer
          alias_method_chain :non_inline_css_file_path, :easy_theme_designer

        end

      end
    end

    module ClassMethods
      def inline_css_file_path_with_easy_theme_designer
        if (custom_theme = EasyThemeDesign.in_use_globally)
          File.join(Rails.public_path, custom_theme.asset_path('mailer_inline'))
        else
          inline_css_file_path_without_easy_theme_designer
        end
      end

      def non_inline_css_file_path_with_easy_theme_designer
        if (custom_theme = EasyThemeDesign.in_use_globally)
          File.join(Rails.public_path, custom_theme.asset_path('mailer_non_inline'))
        else
          non_inline_css_file_path_without_easy_theme_designer
        end
      end
    end

    module InstanceMethods

    end
  end
end
EasyExtensions::PatchManager.register_model_patch 'Mailer', 'EasyThemeDesigner::MailerPatch'
