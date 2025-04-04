require 'easy_extensions/spec_helper'

describe DependentFieldsUpdator, type: :job do
  describe '#perform_now' do
    include_context 'computed_dependent_fields_support'

    it 'should update dependent fields when dependency entity changed' do
      expect(issue.custom_value_for(issue_custom_field)).to be_nil

      described_class.perform_now(customized: project, custom_field: nil, precomputed: {})

      issue.reload
      expected = 100 + project.id
      expect(issue.custom_value_for(issue_custom_field).value).to eq(expected.to_f.to_s)
    end

    it 'should update dependent fields when custom value of dependency entity changed' do
      value = 200
      cv = project.custom_value_for(project_custom_field)
      cv.value = value
      cv.save

      expect(issue.custom_value_for(issue_custom_field)).to be_nil

      described_class.perform_now(customized: project, custom_field: project_custom_field, precomputed: { "cf_#{project_custom_field.id}" => value.to_s })

      issue.reload
      expected = value + project.id
      expect(issue.custom_value_for(issue_custom_field).value).to eq(expected.to_f.to_s)
    end
  end
end