class EasyRakeTaskComputedToday < EasyRakeTask

  def execute
    CustomField.where(field_format: 'easy_computed_token').where("easy_computed_token LIKE '%dates_date_today%'").each do |custom_field|
      custom_field.ensure_custom_field_values
      custom_field.recompute_computed_token_values
    end

    true
  end
end
