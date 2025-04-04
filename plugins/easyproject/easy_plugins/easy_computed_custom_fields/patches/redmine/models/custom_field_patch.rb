module EasyComputedCustomFields
  module CustomFieldPatch

    def self.included(base)

      base.include(InstanceMethods)

      base.class_eval do

        alias_method_chain :set_searchable, :easy_computed_custom_fields
        alias_method_chain :available_form_fields, :easy_computed_custom_fields

        has_many :easy_dependent_custom_fields, :dependent => :destroy
        has_many :inverted_easy_dependent_custom_fields, :class_name => 'EasyDependentCustomField', :as => :dependency

        after_save :set_computed_token_dependencies, :create_recompute_rake_task, :if => Proc.new { |custom_field| custom_field.field_format == 'easy_computed_token' }

        validates_length_of :easy_computed_token, :maximum => 255, :if => Proc.new { |custom_field| custom_field.field_format == 'easy_computed_token' }
        validates_with EasyComputedCustomFields::Validators::EasyComputedCustomFieldValidator, :if => Proc.new { |custom_field| custom_field.field_format == 'easy_computed_token' }

        safe_attributes 'easy_computed_token'

        def easy_computed_token_format=(format)
          self.settings = self.settings.merge('easy_computed_token_format' => format)
        end

        def record_for_computed_value_search(customizable, assoc_name=nil)
          return nil unless customized_class = self.class.customized_class

          assoc_name ||= customizable.class.reflect_on_all_associations(:belongs_to).detect { |ref| ref.klass <= customized_class }.try(:name)
          if assoc_name
            customizable.send(assoc_name) rescue nil
          else
            nil
          end
        end

        # Compute a value for associated custom fields
        # @customizable customizable object where is token placed
        def value_for_computed_token(customizable, assoc_name=nil)
          return '' if assoc_name == 'self'
          return '' unless customizable_to_search = record_for_computed_value_search(customizable, assoc_name)

          founded_value = customizable_to_search.custom_values.where(:custom_field_id => self.id).first

          return '' unless founded_value

          return founded_value.value
        end

        def join_for_dependent_values
          "INNER JOIN #{self.class.customized_class.table_name} " +
            "ON #{CustomValue.table_name}.customized_type = '#{self.class.customized_class.name}' " +
            "AND #{CustomValue.table_name}.customized_id = #{self.class.customized_class.table_name}.id"
        end

        # called to get dependent values
        # called on easy_computed_token
        # @var dependency entity, which was changend and for values dependent on this entity should be returned
        def dependent_values(dependency)
          return [] unless customized_class = self.class.customized_class

          if (assoc = customized_class.reflect_on_all_associations(:belongs_to).detect { |a| a.name == dependency.class.name.underscore.to_sym })
            dependent_foreign_key = assoc.foreign_key
            result = custom_values.joins(join_for_dependent_values).readonly(false).
              where("#{customized_class.table_name}" => {dependent_foreign_key => dependency}).to_a
            return result unless dependency.respond_to?(customized_class.name.underscore.pluralize)

            not_created = dependency.send(customized_class.name.underscore.pluralize).
              joins("LEFT JOIN #{CustomValue.table_name} " +
                      "ON #{CustomValue.table_name}.customized_id = #{customized_class.table_name}.id " +
                      "AND #{CustomValue.table_name}.customized_type = '#{customized_class.name}' " +
                      "AND #{CustomValue.table_name}.custom_field_id = #{self.id}").
              where("#{CustomValue.table_name}.id IS NULL")

            not_created.each do |customized_without_value|
              result << CustomValue.new(:custom_field => self, :customized => customized_without_value)
            end

            result

          elsif dependency.class.reflect_on_all_associations(:belongs_to).detect { |a| a.name == customized_class.name.underscore.to_sym }
            #if dependency belongs_to customized
            method = customized_class.name.underscore.to_sym
            return [] unless dependency.respond_to?(method)

            customized = dependency.send(method)

            return [] unless customized

            return [customized.custom_value_for(self)].compact
          else
            []
          end
        end

        def recompute_computed_token_values
          custom_values.preload(:customized).find_each(:batch_size => 50) do |custom_value|
            next unless custom_value.customized

            custom_value.update_column(:value, custom_value.customized.compute_token_value(custom_value))
          end
        end

        def set_computed_token_dependencies
          EasyComputedCustomFields::FieldFormats::EasyComputedToken.available_symbols.each do |symbol|
            symbol.set_dependencies(easy_computed_token, self)
          end
        end

        def ensure_custom_field_values
          entity_class = self.class.customized_class
          entity_ids = CustomValue.where(custom_field_id: self.id).group(:customized_id).pluck(:customized_id)
          entity_class.where.not(id: entity_ids).select(:id).find_each(batch_size: 500) do |entity|
            CustomValue.create(customized_id: entity.id, customized_type: entity_class.to_s, custom_field_id: self.id)
          end
        end

        def create_recompute_rake_task
          @recompute_rake_task = OneTimeEasyRakeTask.create_one_time_task('recompute_computed_custom_field_values', {:custom_field_id => self.id}).easy_rake_task
        end

        def recompute_computed_custom_field_values
          OneTimeEasyRakeTask.execute_task(@recompute_rake_task) if @recompute_rake_task.present?
        end
      end
    end

    module InstanceMethods

      def set_searchable_with_easy_computed_custom_fields
        self.is_required = false if 'easy_computed_token' == field_format

        set_searchable_without_easy_computed_custom_fields
      end

      def available_form_fields_with_easy_computed_custom_fields
        result = available_form_fields_without_easy_computed_custom_fields
        result.delete(:is_required) if 'easy_computed_token' == field_format
        result
      end

    end
  end
end
EasyExtensions::PatchManager.register_model_patch('CustomField', 'EasyComputedCustomFields::CustomFieldPatch', :before => EasyExtensions::REDMINE_CUSTOM_FIELDS)
