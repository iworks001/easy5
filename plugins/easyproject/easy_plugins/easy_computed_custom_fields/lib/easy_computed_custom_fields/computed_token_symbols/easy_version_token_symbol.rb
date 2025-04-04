require "#{File.dirname(__FILE__)}/easy_record_token_symbol"

module EasyComputedCustomFields

  class EasyVersionTokenSymbol < EasyComputedCustomFields::EasyRecordTokenSymbol

    def model
      Version
    end

    def identifier
      'version'
    end

    def available_fields
      ['id', 'name']
    end

  end

end