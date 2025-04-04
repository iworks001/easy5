module EasyThemeDesigner
  module IssuePatch

    def self.included(base)
      base.extend(ClassMethods)
      base.include(InstanceMethods)

      base.class_eval do

        acts_as_easy_theming

      end
    end

    module InstanceMethods

    end

    module ClassMethods

    end

  end

end
EasyExtensions::PatchManager.register_model_patch 'Issue', 'EasyThemeDesigner::IssuePatch'
