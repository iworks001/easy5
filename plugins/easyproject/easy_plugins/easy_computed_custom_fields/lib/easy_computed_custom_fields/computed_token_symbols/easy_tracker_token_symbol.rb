require "#{File.dirname(__FILE__)}/easy_record_token_symbol"

module EasyComputedCustomFields

  class EasyTrackerTokenSymbol < EasyComputedCustomFields::EasyRecordTokenSymbol

    def model
      Tracker
    end

    def identifier
      'tracker'
    end

    def available_fields
      ['id', 'name']
    end

  end

end