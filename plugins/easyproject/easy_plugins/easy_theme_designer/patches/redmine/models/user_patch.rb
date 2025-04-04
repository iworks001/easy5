module EasyThemeDesigner
  module UserPatch

    def self.included(base)
      base.extend(ClassMethods)
      base.include(InstanceMethods)

      base.class_eval do

        acts_as_easy_theming

        safe_attributes 'easy_theme_design_id', if: ->(obj, _user) { obj.individual_theme_enabled? }

        def individual_theme_enabled?
          EasyThemeDesigner::Settings.enable_user_theming?
        end

      end
    end

    module InstanceMethods

    end

    module ClassMethods

    end

  end

end
EasyExtensions::PatchManager.register_model_patch 'User', 'EasyThemeDesigner::UserPatch'
