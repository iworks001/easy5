require "#{File.dirname(__FILE__)}/easy_record_token_symbol"

module EasyComputedCustomFields

  class EasyTimeEntryTokenSymbol < EasyComputedCustomFields::EasyRecordTokenSymbol

    def model
      TimeEntry
    end

    def identifier
      'time_entry'
    end

    def available_fields
      ['hours']
    end

    def label_for_field_hours
      l(:field_hours)
    end

  end

end
