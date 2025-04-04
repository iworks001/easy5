Dir[File.dirname(__FILE__) + '/lib/easy_computed_custom_fields/computed_token_symbols/*.rb'].each {|file| require_dependency file }

RedmineExtensions::Reloader.to_prepare do

  Dir[File.dirname(__FILE__) + '/lib/easy_computed_custom_fields/field_formats/*.rb'].each {|file| require_dependency file }

  EasyComputedCustomFields::FieldFormats::EasyComputedToken.register_symbols(
    EasyComputedCustomFields::EasyCustomFieldTokenSymbol.new,
    EasyComputedCustomFields::EasyIssueTokenSymbol.new,
    EasyComputedCustomFields::EasyProjectTokenSymbol.new,
    EasyComputedCustomFields::EasyTrackerTokenSymbol.new,
    EasyComputedCustomFields::EasyVersionTokenSymbol.new,
    EasyComputedCustomFields::EasyDocumentTokenSymbol.new,
    EasyComputedCustomFields::EasyUserTokenSymbol.new,
    EasyComputedCustomFields::EasyNestedSetTokenSymbol.new('Issue'),
    EasyComputedCustomFields::EasyNestedSetTokenSymbol.new('Project'),
    EasyComputedCustomFields::EasyTimeEntryTokenSymbol.new,
    EasyComputedCustomFields::EasyDateTokenSymbol.new('Issue'),
    EasyComputedCustomFields::EasyUserDateTokenSymbol.new('User'),
    EasyComputedCustomFields::EasyProjectDateTokenSymbol.new('Project')
  )

end

ActiveSupport.on_load(:easyproject, yield: true) do
  require 'easy_computed_custom_fields/hooks'
end