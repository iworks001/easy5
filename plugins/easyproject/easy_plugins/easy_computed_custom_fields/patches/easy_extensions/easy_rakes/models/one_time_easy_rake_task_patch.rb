module EasyComputedCustomFields
  module OneTimeEasyRakeTaskPatch

    def self.included(base)

      base.include(InstanceMethods)

      base.class_eval do
        def execute_recompute_computed_custom_field_values(options={})
          custom_field_id = options[:custom_field_id]
          custom_field = CustomField.find(custom_field_id)
          custom_field.ensure_custom_field_values
          custom_field.recompute_computed_token_values
          true
        end
      end

    end

    module InstanceMethods
    end
  end
end
EasyExtensions::PatchManager.register_model_patch( 'OneTimeEasyRakeTask', 'EasyComputedCustomFields::OneTimeEasyRakeTaskPatch')
