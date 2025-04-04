require "#{File.dirname(__FILE__)}/easy_record_token_symbol"

module EasyComputedCustomFields

  class EasyDocumentTokenSymbol < EasyComputedCustomFields::EasyRecordTokenSymbol

    def model
      Document
    end

    def identifier
      'document'
    end

    def available_fields
      ['id', 'title']
    end

  end

end