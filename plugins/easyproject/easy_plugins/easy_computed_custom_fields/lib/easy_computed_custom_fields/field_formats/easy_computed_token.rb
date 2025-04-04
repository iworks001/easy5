module EasyComputedCustomFields
  module FieldFormats

    class EasyComputedToken < Redmine::FieldFormat::StringFormat
      include EasyExtensions::EasyAttributeFormatter

      add 'easy_computed_token'

      self.multiple_supported = false
      self.form_partial = 'custom_fields/formats/easy_computed_token'

      def self.available_symbols
        @available_symbols ||= []
      end

      def self.register_symbol( symbol )
        raise ArgumentError, 'EasyComputedCustomFields::FieldFormats::EasyComputedToken->register_symbol has to be a EasyComputedTokenSymbol' unless symbol.is_a?(EasyComputedCustomFields::EasyComputedTokenSymbol)
        available_symbols << symbol
      end

      def self.register_symbols( *symbols )
        raise ArgumentError, 'EasyComputedCustomFields::FieldFormats::EasyComputedToken->register_symbols expects array of symbols!' unless symbols.is_a?(Array)
        symbols.each {|symbol| register_symbol(symbol) }
      end

      def self.symbols_for_cf( custom_field )
        result = []
        available_symbols.each do |symbol|
          result.concat(symbol.symbols_for_cf( custom_field ))
        end
        result
      end

      def self.symbols_for_cf_to_select( custom_field )
        result = Hash.new
        available_symbols.each do |symbol|
          result.merge!( symbol.symbols_for_cf_to_select( custom_field ) )
        end
        result
      end

      def label
        :label_easy_computed_token
      end

      def before_custom_field_save(custom_field)
        super

        custom_field.editable = false
        true
      end

      def group_statement(custom_field)
        order_statement(custom_field)
      end

      def formatted_value(view, custom_field, value, customized=nil, html=false)
        case custom_field.settings['easy_computed_token_format']
        when 'float'
          value = format_locale_number(value)
        when 'int'
          value = format_locale_number(value.to_f.round, strip_insignificant_zeros: true)
        else
          if custom_field.settings['easy_computed_token_format'] && (format = Redmine::FieldFormat.all[custom_field.settings['easy_computed_token_format']]) && format.respond_to?(:formatted_value)
            format.formatted_value(view, custom_field, value, customized, html)
          else
            super
          end
        end
      end

      def numeric(custom_field)
        @numeric.nil? ? custom_field.summable? : @numeric
      end

      def query_filter_options(custom_field, query)
        options = {:attr_reader => true, :attr_writer => true}
        options[:type] = case custom_field.settings['easy_computed_token_format']
        when 'float', 'amount'
          :float
        when 'int'
          :integer
        else
          :string
        end
        options
      end

    end
  end
end
