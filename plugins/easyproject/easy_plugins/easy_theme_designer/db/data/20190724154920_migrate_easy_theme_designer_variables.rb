class MigrateEasyThemeDesignerVariables < EasyExtensions::EasyDataMigration
  def up
      EasyThemeDesign.all.each do |td|
        ao = td.advanced_options
        ao[:spacing] = ao.delete(:gap) if ao[:gap]
        ao[:"servicebar-color"] = ao.delete(:"color-service-text") if ao[:"color-service-text"]
        ao[:"servicebar-background"] = ao.delete(:"color-service-background") if ao[:"color-service-background"]
        ao[:"servicebar-border"] = ao.delete(:"color-service-border") if ao[:"color-service-border"]
        ao[:"form-background"] = ao.delete(:"color-form-background") if ao[:"color-form-background"]
        ao[:"form-field-background"] = ao.delete(:"color-form-field-background") if ao[:"color-form-field-background"]
        ao[:"form-field-border"] = ao.delete(:"color-form-field-border") if ao[:"color-form-field-border"]
        ao[:"color-main"] = td.primary_color
        ao[:"color-background"] = td.secondary_color
        td.advanced_options = ao
        td.save
      end
  end
end
