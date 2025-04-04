require "#{File.dirname(__FILE__)}/easy_computed_token_symbol"

module EasyComputedCustomFields

  class EasyRecordTokenSymbol < EasyComputedCustomFields::EasyComputedTokenSymbol

    def regexp
      @regexp ||= /#{regexp_string}/
    end

    def regexp_symbol
      @regexp_symbol ||= /^#{regexp_string}$/
    end

    def regexp_string
      @regexp_string = "#{identifier}_(#{available_fields.join('|')})"
    end

    def model
      raise 'This method needs override'
    end

    def identifier
      raise 'This method needs override'
    end

    def available_fields
      raise 'This method needs override'
    end

    def sumable_available_fields
      available_fields - nonsumable_fields
    end

    def nonsumable_fields
      []
    end

    def is_parent( klass )
      !!model.reflections.keys.detect{ |key| key == klass.name.underscore.to_sym }
    end

    def is_parent_of( klass )
      !!klass.reflect_on_all_associations(:belongs_to).detect{ |assoc| assoc.name == model.name.underscore.to_sym }
    end

    def label_for_field_id
      'ID'
    end

    def label_for_field( field )
      if respond_to? "label_for_field_#{field}"
        send( "label_for_field_#{field}" )
      else
        l("field_#{field}", :default => field)
      end
    end

    def symbols_for_cf( custom_field )
      result = []
      return result unless ( custom_field.class.customized_class == model || is_parent( custom_field.class.customized_class ) )
      available_fields.each do |field|
        result << "#{identifier}_#{field}"
      end
    end

    def symbols_for_cf_to_select( custom_field )
      result_ary = []
      if custom_field.class.customized_class == model || is_parent_of( custom_field.class.customized_class )
        result = { l('field_' + identifier) => result_ary }
      else
        return {}
      end
      available_fields.each do |field|
        result_ary << [ label_for_field( field ), "#{identifier}_#{field}" ]
      end
      result
    end

    def validate_token( token, errors, record )
      customized_class = record.class.customized_class
      if ( customized_class == model ) || ( is_parent_of( customized_class ) )
        token.gsub!(/%{#{regexp_string}}/, '') #removes cf values - mark as ok
      else
        token
      end
    end

    def set_dependencies( token, custom_field )
      if regexp.match?(token) && is_parent_of( custom_field.class.customized_class )
        custom_field.easy_dependent_custom_fields.find_or_create_by( dependency_type: model.name )
      end
    end

    def compute( symbol, customized )
      symbol.match( regexp_symbol ) do
        if customized.class == model
          return customized.send( $1 )
        elsif is_parent_of( customized.class )
          parent_customized = customized.send( model.name.underscore.to_sym )
          return parent_customized.send( $1 ) if parent_customized
        end
      end
      ''
    end

  end

end
