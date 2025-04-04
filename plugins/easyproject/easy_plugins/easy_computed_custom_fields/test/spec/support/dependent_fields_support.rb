RSpec.shared_context 'computed_dependent_fields_support' do
  let(:project) { FactoryBot.create(:project, enabled_module_names: %w(issue_tracking), custom_field_values: { project_custom_field.id => '100'}) }
  let!(:issue) { FactoryBot.create(:issue, project: project) }
  let!(:project_custom_field) { FactoryBot.create(:project_custom_field, field_format: 'int') }
  let!(:issue_custom_field) { FactoryBot.create(:computed_issue_custom_field, computed_token: "(%{cf_project_#{project_custom_field.id}} + %{project_id})", trackers: [issue.tracker]) }  
end