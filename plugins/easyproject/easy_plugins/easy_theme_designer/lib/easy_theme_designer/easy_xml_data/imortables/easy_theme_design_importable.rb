module EasyThemeDesigner
  module EasyXmlData
    class EasyThemeDesignImportable < ::EasyXmlData::Importable

      def self.klass
        EasyThemeDesign
      end

      def update_attribute(record, name, value, map, xml)
        if name == 'author_id'
          map['user'] ||= {}
          map['user'][value] = User.current.id
        end

        super
      end

      def after_record_save(record, _xml, _map)
        record.compile(true) # no attached images present atm, you still have to compile again :(
      end

    end
  end
end
