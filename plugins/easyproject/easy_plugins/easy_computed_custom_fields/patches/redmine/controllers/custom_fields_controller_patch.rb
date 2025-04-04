module EasyComputedCustomFields
  module CustomFieldsControllerPatch

    def self.included(base)
      base.include(InstanceMethods)
      base.class_eval do

        helper :easy_query
        include EasyQueryHelper

      end
    end

    module InstanceMethods

    end

  end

end
EasyExtensions::PatchManager.register_controller_patch 'CustomFieldsController', 'EasyComputedCustomFields::CustomFieldsControllerPatch'
