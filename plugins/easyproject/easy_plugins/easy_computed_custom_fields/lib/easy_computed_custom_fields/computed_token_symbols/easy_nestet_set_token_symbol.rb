require "#{File.dirname(__FILE__)}/easy_record_token_symbol"

module EasyComputedCustomFields

  class DescendantsCombinedToken

    def initialize( model_string )
      @model_token = "EasyComputedCustomFields::Easy#{model_string}TokenSymbol".constantize.new
      @cf_token = EasyCustomFieldTokenSymbol.new
      @cf_klass = "#{model_string}CustomField"
    end

    def cf_klass
      @cf_klass.constantize
    end

    def model
      @model_token.model
    end

    def identifier
      @model_token.identifier
    end

    def available_cf_formats
      ['int', 'float', 'amount']
    end

    def available_fields
      @cf_fields = @cf_token.possible_custom_fields( cf_klass ).where(CustomField.arel_table[:field_format].in(available_cf_formats + ['easy_computed_token'])).
        select{|cf| available_cf_formats.include?(cf.settings[:easy_computed_token_format].to_s) }.collect{|cf| "cf_#{cf.id}"}
      @available_fields = @cf_fields + @model_token.sumable_available_fields
    end

    def token_for_field( field )
      if @cf_token.regexp.match?(field)
        @cf_token
      elsif @model_token.available_fields.include?( field )
        @model_token
      end
    end

    def compute( symbol, customized )
      if @cf_token.regexp.match?(symbol)
        @cf_token.compute( symbol, customized )
      elsif @model_token.available_fields.include?( symbol )
        @model_token.compute( identifier + '_' + symbol, customized )
      end
    end

    def label_for_field( field )
      if field =~ /cf_(\d+)/
        CustomField.find($1).translated_name
      else
        @model_token.label_for_field( field )
      end
    end

  end

  class EasyNestedSetTokenSymbol < EasyComputedCustomFields::EasyRecordTokenSymbol

    def initialize( model_string )
      @_descendants_token = DescendantsCombinedToken.new(model_string)
    end

    def model
      _descendants_token.model
    end

    def regexp
      /nested_(.*)/
    end

    def identifier
      'nested'
    end

    def tree_options
      ['descendants', 'children']
    end

    def available_for?( custom_field )
      # format = custom_field.settings['easy_computed_token_format']

      custom_field.class.customized_class == model
    end

    def available_fields
      @available_fields = tree_options.inject([]){|memo,option| memo + _descendants_sumable_fields.map{|field| "#{option}_#{field}" } }
    end

    def label_for_field( field )
      field = field.gsub(/(#{tree_options.join('|')})_/, '')
      if respond_to? "label_for_field_#{field}"
        send("label_for_field_#{field}")
      else
        _descendants_token.label_for_field(field)
      end
    end

    def symbols_for_cf_to_select( custom_field )
      return {} unless available_for?(custom_field)

      tree_options.inject({}) do |memo, option|
        fields_ary = _descendants_sumable_fields.collect{|field| [label_for_field( field ), "#{identifier}_#{option}_#{field}"] }

        memo[l('label_easy_' + identifier + '.' + option)] = fields_ary

        memo
      end
    end

    def validate_token( token, errors, record )
      customized_class = record.class.customized_class
      if available_for?( record )
        token.gsub!(/%{#{regexp_string}}/, '')
      else
        token
      end
    end

    def compute( symbol, customized )
      return ''  unless customized.class == model
      symbol.match( regexp ) do
        $1.match(/(#{tree_options.join('|')})_(.*)/) do
          return customized.send( $1 ).collect{|child| _descendants_token.compute( $2, child ).to_f }.sum.to_s
        end
      end
      ''
    end

    def set_dependencies( token, custom_field )
      if regexp.match?(token)
        params = { :dependency_type => model.name, :relation => EasyDependentCustomField::RELATIONS[EasyDependentCustomField::PARENT_RELATION] }
        custom_field.easy_dependent_custom_fields.create( params ) if custom_field.easy_dependent_custom_fields.where( params ).empty?
      end
    end

    protected
      def _descendants_token
        @_descendants_token
      end

      def _descendants_sumable_fields
        @_descendants_token.available_fields
      end

  end

end
