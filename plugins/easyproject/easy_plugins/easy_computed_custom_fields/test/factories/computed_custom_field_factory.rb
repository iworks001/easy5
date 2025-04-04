FactoryBot.define do

  factory :computed_issue_custom_field, parent: :issue_custom_field, class: 'IssueCustomField' do
    transient do
      computed_format { 'int' }
      computed_token { '%{issue_id}' }
    end

    field_format { 'easy_computed_token' }

    after(:build) do |custom_field, evaluator|
      custom_field.easy_computed_token_format = evaluator.computed_format
      custom_field.easy_computed_token = evaluator.computed_token
    end
  end

  factory :computed_time_entry_custom_field, parent: :time_entry_custom_field, class: 'TimeEntryCustomField' do
    transient do
      computed_format { 'string' }
      computed_token { '%{issue_id}' }
    end

    field_format { 'easy_computed_token' }

    after(:build) do |custom_field, evaluator|
      custom_field.easy_computed_token_format = evaluator.computed_format
      custom_field.easy_computed_token = evaluator.computed_token
    end
  end

  factory :computed_version_custom_field, parent: :version_custom_field, class: 'VersionCustomField' do
    transient do
      computed_format { 'string' }
      computed_token { '(%{version_name})' }
    end

    field_format { 'easy_computed_token' }

    after(:build) do |custom_field, evaluator|
      custom_field.easy_computed_token_format = evaluator.computed_format
      custom_field.easy_computed_token = evaluator.computed_token
    end
  end

end
