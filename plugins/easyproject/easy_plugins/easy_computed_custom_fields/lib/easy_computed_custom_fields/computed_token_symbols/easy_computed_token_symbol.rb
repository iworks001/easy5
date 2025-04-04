module EasyComputedCustomFields
  class EasyComputedTokenSymbol
    include Redmine::I18n

    def regexp; raise 'This method needs override' end

    # DEPRECATED for now
    def symbols_for_cf( custom_field ); raise 'This method needs override' end

    def symbols_for_cf_to_select( custom_field ); raise 'This method needs override' end

    def validate( symbol ); raise 'This method needs override' end

    def validate_token( token, errors ); raise 'This method needs override' end

    def set_dependencies( token, custom_field ); raise 'This method needs override' end

    def compute( symbol, customized ); raise 'This method needs override' end

  end
end
