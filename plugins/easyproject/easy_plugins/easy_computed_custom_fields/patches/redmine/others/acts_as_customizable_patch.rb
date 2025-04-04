module EasyComputedCustomFields

  module ActsAsCustomizableInstanceMethodsPatch

    def self.included(base)
      base.include(InstanceMethods)

      base.class_eval do

        def compute_symbol_value(symbol, options={})
          entity = options[:entity] || self
          EasyComputedCustomFields::FieldFormats::EasyComputedToken.available_symbols.each do |rsymbol|
            if rsymbol.regexp.match?(symbol) && (!rsymbol.is_a?(EasyComputedCustomFields::EasyNestedSetTokenSymbol) || entity.is_a?(rsymbol.model))
              return rsymbol.compute(symbol, entity)
            end
          end
          return nil
        end

        def format_computed_symbol(symbol, format)
          case format
          when 'int', 'float', 'amount'
            begin
              if symbol.is_a?(Time) || symbol.is_a?(Date)
                symbol.to_time.to_r / 1.day.to_f
              elsif symbol.respond_to?(:to_f)
                symbol.to_f
              else
                0.0
              end
            end
          else
            return format_time(symbol) if symbol.is_a?(Time)
            return format_date(symbol) if symbol.is_a?(Date)
            symbol
          end
        end

        def format_computed_token(token, format)
          case format
          when 'int', 'float', 'amount'
            value = eval(token).to_f

            if value.nan? || value.infinite?
              value = 0.0
            end

            value.to_s
          else
            token
          end
        rescue ZeroDivisionError => e
          return e.to_s
        end

        def compute_token_value(custom_value, precomputed = {})
          token = custom_value.custom_field.easy_computed_token.to_s.dup
          token.gsub!(/%{([^\}]*)}/) do |m|
            if precomputed[$1]
              format_computed_symbol(precomputed[$1], custom_value.custom_field.settings['easy_computed_token_format'])
            else
              format_computed_symbol(compute_symbol_value($1, :entity => custom_value.customized), custom_value.custom_field.settings['easy_computed_token_format'])
            end
          end
          format_computed_token(token, custom_value.custom_field.settings['easy_computed_token_format'])
        end

        def update_token_values
          return unless EasyDependentCustomField.table_exists?

          custom_field_values.select { |field| field.custom_field.field_format == 'easy_computed_token' }.
            sort! { |f1, f2| f1.custom_field.settings[:order].to_i <=> f2.custom_field.settings[:order].to_i }.each do |token|
            token.value = compute_token_value(token)
          end
        end

        def update_dependent_fields
          if EasyDependentCustomField.table_exists? && !Redmine::Plugin.installation?
            DependentFieldsUpdator.perform_later(customized: self, custom_field: nil, precomputed: {})
          end
        end

        def easy_dependent_custom_fields
          EasyDependentCustomField.preload(:custom_field).where(dependency_type: self.class.name)
        end

      end
    end

    module InstanceMethods

    end

  end

  module ActsAsCustomizableClassMethodsPatch

    def self.included(base)
      base.include(ClassMethods)

      base.class_eval do

        alias_method_chain :acts_as_customizable, :easy_computed_custom_fields

      end
    end

    module ClassMethods

      def acts_as_customizable_with_easy_computed_custom_fields(options={})
        acts_as_customizable_without_easy_computed_custom_fields(options)

        after_create :update_token_values
        before_update :update_token_values
        after_save :update_dependent_fields #, :if => :custom_field_values_changed?
        after_destroy :update_dependent_fields
      end

    end

  end

end
EasyExtensions::PatchManager.register_redmine_plugin_patch('Redmine::Acts::Customizable::InstanceMethods', 'EasyComputedCustomFields::ActsAsCustomizableInstanceMethodsPatch')
EasyExtensions::PatchManager.register_redmine_plugin_patch('Redmine::Acts::Customizable::ClassMethods', 'EasyComputedCustomFields::ActsAsCustomizableClassMethodsPatch')
