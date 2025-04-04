require "#{File.dirname(__FILE__)}/easy_record_token_symbol"
require "#{File.dirname(__FILE__)}/easy_nestet_set_token_symbol"

module EasyComputedCustomFields

  class DateToken < EasyComputedCustomFields::DescendantsCombinedToken

    def available_fields
      @available_fields = ['today']
    end

  end

  class EasyDateTokenSymbol < EasyComputedCustomFields::EasyNestedSetTokenSymbol

    def initialize( model_string )
      @_dates_token = DateToken.new(model_string)
    end

    def model
      _dates_token.model
    end

    def regexp
      /issue_dates_(.*)/
    end

    def identifier
      'issue_dates'
    end

    def tree_options
      ['date']
    end

    def available_fields
      @available_fields = tree_options.inject([]){|memo,option| memo + _dates_sumable_fields.map{|field| "#{option}_#{field}" } }
    end

    def label_for_field( field )
      field = field.gsub(/(#{tree_options.join('|')})_/, '')
      if respond_to? "label_for_field_#{field}"
        send("label_for_field_#{field}")
      else
        _dates_token.label_for_field(field)
      end
    end

    def symbols_for_cf_to_select( custom_field )
      return {} unless available_for?(custom_field)

      tree_options.inject({}) do |memo, option|
        fields_ary = _dates_sumable_fields.collect{|field| [label_for_field( field ), "#{identifier}_#{option}_#{field}"] }

        memo[l('label_easy_' + identifier + '.' + option)] = fields_ary

        memo
      end
    end

    def compute( symbol, customized )
      return ''  unless customized.class == model
      symbol.match( regexp ) do
        $1.match(/(#{tree_options.join('|')})_(.*)/) do
          case $2
          when 'today'
            return Date.today
          end
        end
      end
      ''
    end

    protected
    def _dates_token
      @_dates_token
    end

    def _dates_sumable_fields
      @_dates_token.available_fields
    end

  end

end
