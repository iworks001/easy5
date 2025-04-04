require "#{File.dirname(__FILE__)}/easy_record_token_symbol"

module EasyComputedCustomFields

  class EasyUserTokenSymbol < EasyComputedCustomFields::EasyRecordTokenSymbol

    def model
      User
    end

    def identifier
      'user'
    end

    def available_fields
      ['id', 'firstname', 'lastname', 'mail']
    end

  end

end