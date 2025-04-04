class SetDependenciesToComputedCustomFields < EasyExtensions::EasyDataMigration

  def up
    CustomField.where(field_format: 'easy_computed_token').find_each(:batch_size => 50) do |custom_field|
      EasyComputedCustomFields::FieldFormats::EasyComputedToken.available_symbols.each do |symbol|
        symbol.set_dependencies( custom_field.easy_computed_token, custom_field )
      end
    end
  end

  def down
  end

end
