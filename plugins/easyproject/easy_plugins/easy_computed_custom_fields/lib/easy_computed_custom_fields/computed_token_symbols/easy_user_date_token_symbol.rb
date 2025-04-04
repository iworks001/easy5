require "#{File.dirname(__FILE__)}/easy_date_token_symbol"

module EasyComputedCustomFields

  class EasyUserDateTokenSymbol < EasyComputedCustomFields::EasyDateTokenSymbol

    def regexp
      /user_dates_(.*)/
    end

    def identifier
      'user_dates'
    end

    def available_for?(custom_field)
      # format = custom_field.settings['easy_computed_token_format']

      custom_field.class.customized_class == Principal
    end

    # Overwrite original method. DateToken has no dependencies
    def set_dependencies(token, custom_field)
    end
  end
end
