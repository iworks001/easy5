module EasyComputedCustomFields
  module CustomFieldsHelperPatch

    def self.included(base)

      base.include(InstanceMethods)
      include EasyExtensions::EasyAttributeFormatter

      base.class_eval do

        alias_method_chain :custom_field_tag_with_label, :easy_computed_custom_fields
        alias_method_chain :available_easy_lookup_entity_custom_field_formats, :easy_computed_custom_fields

        def easy_computed_token_custom_field_tag_for_bulk_edit(custom_field, field_name, field_id, projects, value, options={})
          l(:text_easy_computed_token_edit_not_allowed)
        end

        def easy_available_symbols
          "<span>#{custom_value.value}</span>"
        end

        def available_computed_token_formats
          %w(string int float amount link)
        end

        def available_computed_token_form_partials
          partials = {}
          Redmine::FieldFormat.all.each do |type, format|
            if available_computed_token_formats.include?(type) && !format.form_partial.nil?
              partials[type] = format.form_partial
            end
          end
          partials
        end

        def computed_custom_field_formats_for_select(custom_field)
          custom_field_formats_for_select(custom_field).
            select { |format| available_computed_token_formats.include? format.second }
        end

      end

    end

    module InstanceMethods

      def custom_field_tag_with_label_with_easy_computed_custom_fields(name, custom_value, label_tag_options = {}, custom_field_tag_options = {})
        if custom_value.custom_field.field_format == 'easy_computed_token'
          cv = custom_value.dup
          cv.value = cv.custom_field.format.formatted_value(self, custom_value.custom_field, custom_value.value, custom_value.customized, false)
          custom_field_tag_with_label_without_easy_computed_custom_fields(name, cv, label_tag_options, custom_field_tag_options.reverse_merge(disabled: true))
        else
          custom_field_tag_with_label_without_easy_computed_custom_fields(name, custom_value, label_tag_options, custom_field_tag_options)
        end
      end

      def available_easy_lookup_entity_custom_field_formats_with_easy_computed_custom_fields
        available_easy_lookup_entity_custom_field_formats_without_easy_computed_custom_fields + ['easy_computed_token']
      end

    end

  end
end
EasyExtensions::PatchManager.register_helper_patch('CustomFieldsHelper', 'EasyComputedCustomFields::CustomFieldsHelperPatch')
