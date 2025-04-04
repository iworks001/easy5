require "#{File.dirname(__FILE__)}/easy_date_token_symbol"

module EasyComputedCustomFields
  class EasyProjectDateTokenSymbol < EasyComputedCustomFields::EasyDateTokenSymbol

    def regexp
      /project_dates_(.*)/
    end

    def identifier
      'project_dates'
    end
  end
end
