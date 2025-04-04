module EasyComputedCustomFields
  module Validators

    class EasyComputedCustomFieldValidator < ActiveModel::Validator

      include ::Redmine::I18n

      INT_REGEX = /\A\s*\-?\s*\d+\s*([+\-\/\*]\s*\d+\s*)*\z/
      FLOAT_REGEX = /\A\s*\-?\s*\d+(\.\d+)?\s*([+\-\/\*]\s*\d+(\.\d+)?\s*)*\z/

      def validate_easy_custom_field_format_int(record)
        token = record.easy_computed_token.to_s.gsub(/%{[^\}]+}/,'0')
        unless is_valid_expr?(token, INT_REGEX)
          record.errors[:easy_computed_token] << l(:error_computed_custom_field_not_int)
        end
      end

      def validate_easy_custom_field_format_float(record)
        token = record.easy_computed_token.to_s.gsub(/%{[^\}]+}/,'0')
        unless is_valid_expr?(token, FLOAT_REGEX)
          record.errors[:easy_computed_token] << l(:error_computed_custom_field_not_float)
        end
      end

      alias_method :validate_easy_custom_field_format_amount, :validate_easy_custom_field_format_float

      def validate(record)

        if respond_to? "validate_easy_custom_field_format_#{record.settings['easy_computed_token_format']}"
          send("validate_easy_custom_field_format_#{record.settings['easy_computed_token_format']}", record)
        end

        token_to_validate = record.easy_computed_token.to_s.dup

        EasyComputedCustomFields::FieldFormats::EasyComputedToken.available_symbols.each do |symbol|

          # calls validate method of each registered symbol, it should remove its symbols
          # to let know, that they are known
          symbol.validate_token( token_to_validate, record.errors[:easy_computed_token], record )

        end

        unknown_symbols = []
        token_to_validate.scan(/%{([^\}]*)}/) do
          unknown_symbols << $1
        end

        if unknown_symbols.count > 0
          record.errors[:easy_computed_token] << l(:error_computed_custom_field_unknown_symbols, :symbols => unknown_symbols.join(', '))
        end


      end

      private

      def is_valid_expr?(expr, regexp)
        expr = expr.dup
        parent = /\(([^\(\)]+)\)/
        while expr =~ parent
          expr.gsub!(parent) do |match|
            if $1 =~ regexp
              '1'
            else
              return false
            end
          end
        end
        return expr =~ regexp
      end

    end

  end
end
