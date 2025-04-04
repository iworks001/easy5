module EasyThemeDesigner
  module Logo

    def self.included(base)
      base.extend(ClassMethods)
      base.include(InstanceMethods)

      base.class_eval do

        class << self

          alias_method_chain :logo, :easy_theme_designer

        end

      end
    end

    module InstanceMethods

    end

    module ClassMethods

      def logo_with_easy_theme_designer
        if (logo = EasyThemeDesign.in_use_globally&.get_image('logo'))
          logo.diskfile
        else
          logo_without_easy_theme_designer
        end
      end

    end

  end

end
RedmineExtensions::PatchManager.register_other_patch 'EasyExtensions::Logo', 'EasyThemeDesigner::Logo'
