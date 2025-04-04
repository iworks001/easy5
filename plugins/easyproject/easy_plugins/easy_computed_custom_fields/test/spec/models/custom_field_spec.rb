require 'easy_extensions/spec_helper'

describe CustomField do

  context 'computed custom field validations' do

    let(:custom_field) { FactoryGirl.build(:issue_custom_field, field_format: 'easy_computed_token')}

    ['int', 'float', 'amount'].each do |format|
      it "should be invalid with invalid token [#{format}]" do
        custom_field.easy_computed_token_format = format
        custom_field.easy_computed_token = '%{project_sum_time_entries} %{project_sum_time_entries} %{issue_done_ratio}'
        expect(custom_field).not_to be_valid
      end

      it "should be invalid without right closed expresion [#{format}]" do
        custom_field.easy_computed_token_format = format
        custom_field.easy_computed_token = '%{project_sum_time_entries} * '
        expect(custom_field).not_to be_valid
      end

      it "should be invalid without left closed expresion [#{format}]" do
        custom_field.easy_computed_token_format = format
        custom_field.easy_computed_token = ' * %{project_sum_time_entries}'
        expect(custom_field).not_to be_valid
      end

      it "should be valid with valid token [#{format}]" do
        custom_field.easy_computed_token_format = format
        custom_field.easy_computed_token = '(%{project_sum_time_entries} + %{project_sum_time_entries}) +( ( 12 / 8 ) + ( 1 + 2 ) )'
        expect(custom_field).to be_valid
      end
    end

    # context 'nested custom field symbols' do
    #   let(:dependent_custom_field) { FactoryGirl.create(:issue_custom_field, field_format: 'int') }
    #   # let(:project) { p = FactoryGirl.create(:project); p.issue_custom_fields |= [dependent_custom_field]; p }
    #   let(:child_issue) { FactoryGirl.create(:issue, :child_issue) }

    #   it 'should work' do
    #     project = child_issue.project;
    #     project.issue_custom_fields |= [dependent_custom_field]
    #     project.save

    #     custom_field.settings['easy_computed_token_format'] = 'int'
    #     custom_field.easy_computed_token = "(%{nested_descendants_cf_#{dependent_custom_field.id}} + 5)"

    #     assert custom_field.save
    #   end
    # end

  end

  context 'computed custom field value computing' do

    let(:issue) { FactoryGirl.create(:issue, estimated_hours: 4) }
    let!(:custom_field) { FactoryGirl.create(:computed_issue_custom_field, computed_token: '(%{issue_estimated_hours} * 2)', trackers: [issue.tracker]) }
    let(:values) { issue.custom_values.where(:custom_field_id => custom_field.id) }

    let(:user_custom_field) { FactoryGirl.create(:user_custom_field) }
    let(:user) { FactoryGirl.create(:user, :custom_field_values => {user_custom_field.id => '12'}) }
    let(:time_entry_cf) { FactoryGirl.create(:computed_time_entry_custom_field, computed_token: "%{cf_#{user_custom_field.id}}") }
    let(:time_entry) { time_entry_cf; FactoryGirl.create(:time_entry, user: user )}

    it 'should have custom value' do
      issue.reload; issue.save
      expect( values.size ).to eq(1)
      expect( values.first.value.to_i ).to eq( 8 )
    end

    it 'should compute custom value even if parent cf is on parent class' do
      values = time_entry.custom_values.where(:custom_field_id => time_entry_cf.id)
      expect( values.size ).to eq(1)
      expect( values.first.value ).to eq( '12' )
    end

    it 'should have custom value without save' do
      custom_field.recompute_computed_custom_field_values
      expect( values.size ).to eq( 1 )
      expect( values.first.value.to_i ).to eq( 8 )
    end

    it 'should change custom value after cf update' do
      custom_field.recompute_computed_custom_field_values
      custom_field.easy_computed_token = '(%{issue_estimated_hours} * 3)'
      custom_field.save
      custom_field.recompute_computed_custom_field_values
      expect( values.size ).to eq( 1 )
      expect( values.first.value.to_i ).to eq( 12 )
    end

    it 'precision' do
      custom_field.easy_computed_token = '(%{issue_estimated_hours} / 8)'
      custom_field.easy_computed_token_format = 'float'
      expect(custom_field.save).to eq(true)
      custom_field.recompute_computed_custom_field_values
      expect( values.first.value.to_s ).to eq( '0.5' )
    end

    it 'identifier' do
      with_easy_settings(:project_display_identifiers => true) do
        issue.project.update_column(:identifier, 'testidentifier')
        custom_field.easy_computed_token = '%{project_identifier}'
        custom_field.easy_computed_token_format = 'string'
        expect(custom_field.save).to eq(true)
        custom_field.recompute_computed_custom_field_values
        expect( values.first.value.to_s ).to eq( 'testidentifier' )
      end
    end

    context '#update_dependent_fields' do
      include_context 'computed_dependent_fields_support'
      
      it 'should call async job when dependency changed' do
        expect {
          project.name = 'New project name'
          project.save
        }.to have_enqueued_job(DependentFieldsUpdator).with(customized: project, custom_field: nil, precomputed: {})
      end

      it 'should call async job when dependency custom value changed' do
        value = 200
        expect {
          cv = project.custom_value_for(project_custom_field)
          cv.value = value
          cv.save
        }.to have_enqueued_job(DependentFieldsUpdator).with(customized: project, custom_field: project_custom_field, precomputed: { "cf_#{project_custom_field.id}" => value.to_s })
      end

      it 'should call async job when dependency and its custom value changed' do
        value = 200
        expect {
          project.custom_field_values = { project_custom_field.id => value.to_s}
          project.save
        }.to have_enqueued_job(DependentFieldsUpdator).with(customized: project, custom_field: project_custom_field, precomputed: { "cf_#{project_custom_field.id}" => value.to_s })
        .and have_enqueued_job(DependentFieldsUpdator).with(customized: project, custom_field: nil, precomputed: {})
      end
    end
  end

  context 'computed custom field date fields', logged: :admin do
    let(:issue) { FactoryGirl.create(:issue, start_date: Date.today, due_date: Date.today + 1.day) }
    let(:version) { FactoryBot.create(:version) }
    let(:project_custom_field) { FactoryGirl.create(:project_custom_field, field_format: 'date') }
    let(:issue_custom_field1) { FactoryGirl.create(:issue_custom_field, field_format: 'date', trackers: [issue.tracker]) }
    let(:issue_custom_field2) { FactoryGirl.create(:issue_custom_field, field_format: 'date', trackers: [issue.tracker]) }
    let(:custom_field_with_date_columns) { FactoryGirl.create(:computed_issue_custom_field, computed_token: "(%{issue_due_date} - %{issue_start_date})", trackers: [issue.tracker]) }
    let(:custom_field_with_date_custom_fields) { FactoryGirl.create(:computed_issue_custom_field, computed_token: "(%{cf_self_#{issue_custom_field2.id}} - %{cf_self_#{issue_custom_field1.id}})", trackers: [issue.tracker]) }
    let(:custom_field_with_project_cf) { FactoryGirl.create(:computed_issue_custom_field, computed_token: "(%{cf_project_#{project_custom_field.id}} - %{issue_start_date})", trackers: [issue.tracker]) }
    let(:computed_version_custom_field) { FactoryBot.create(:computed_version_custom_field, computed_token: "%{version_name}", max_length: 50) }
    let(:date_values) { issue.custom_values.where(:custom_field_id => custom_field_with_date_columns.id) }
    let(:cf_values) { issue.custom_values.where(:custom_field_id => custom_field_with_date_custom_fields.id) }

    it 'should compute day difference' do
      custom_field_with_date_columns.recompute_computed_custom_field_values
      expect(date_values.size).to eq(1)
      expect(date_values.first.value.to_i).to eq(1)
    end

    it 'project custom field' do
      project_custom_field
      p = issue.project
      p.safe_attributes = {'custom_field_values' => { project_custom_field.id.to_s => (Date.today + 1.day).to_s }}
      p.save
      custom_field_with_project_cf.recompute_computed_custom_field_values
      expect(issue.custom_values.where(:custom_field_id => custom_field_with_project_cf.id).first.value.to_s).to eq( '1.0' )
    end

    it 'version custom field' do
      computed_version_custom_field
      version.safe_attributes = {'name' => 'milestone 123'}
      version.save
      expect(version.reload.custom_values.where(custom_field_id: computed_version_custom_field.id).first.value.to_s).to eq( 'milestone 123' )
    end

    it 'should compute day difference with custom fields' do
      issue.reload
      issue.safe_attributes = {'custom_field_values' => {issue_custom_field1.id.to_s => Date.today.to_s, issue_custom_field2.id.to_s => (Date.today + 1.day).to_s}}
      custom_field_with_date_custom_fields
      issue.save
      custom_field_with_date_custom_fields.recompute_computed_custom_field_values
      expect(cf_values.size).to eq(1)
      expect(cf_values.first.value.to_i).to eq(1)
    end

    it 'ensure values' do
      custom_field_with_date_columns.ensure_custom_field_values
      expect(issue.reload.custom_values.where(custom_field_id: custom_field_with_date_columns.id).any?).to eq(true)
    end
  end

end
