module EasyComputedCustomFields
  module CustomValuePatch

    def self.included(base)

      base.include(InstanceMethods)

      base.class_eval do
        after_save :update_dependent_fields, if: proc {|cv| cv.saved_changes? && !Redmine::Plugin.installation?}

        def update_dependent_fields
          DependentFieldsUpdator.perform_later(customized: customized, custom_field: custom_field, precomputed: { "cf_#{custom_field_id}" => value })
        end

      end

    end

    module InstanceMethods

    end
  end
end
EasyExtensions::PatchManager.register_model_patch('CustomValue', 'EasyComputedCustomFields::CustomValuePatch')
