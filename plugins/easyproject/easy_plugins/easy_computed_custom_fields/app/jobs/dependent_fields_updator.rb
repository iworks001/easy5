class DependentFieldsUpdator < Rorys.task
  def perform(options = {})
    customized = options[:customized]
    return unless customized.present?

    custom_field = options[:custom_field]
    precomputed = options[:precomputed] || {}

    if custom_field
      easy_dependent_custom_fields = custom_field.inverted_easy_dependent_custom_fields.preload(:custom_field)
    else
      easy_dependent_custom_fields = customized.easy_dependent_custom_fields
    end

    easy_dependent_custom_fields.each do |dependent_custom_field|
      dependent_custom_field.dependent_values(customized).each do |dependent_custom_value|
        value = customized.compute_token_value(dependent_custom_value, precomputed)
        dependent_custom_value.value = value
        dependent_custom_value.save
      end
    end

    return true
  end
end