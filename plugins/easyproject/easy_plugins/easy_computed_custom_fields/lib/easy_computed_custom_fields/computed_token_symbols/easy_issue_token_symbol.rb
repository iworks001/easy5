require "#{File.dirname(__FILE__)}/easy_record_token_symbol"

module EasyComputedCustomFields

  class EasyIssueTokenSymbol < EasyComputedCustomFields::EasyRecordTokenSymbol

    def model
      Issue
    end

    def identifier
      'issue'
    end

    def available_fields
      fields = ['id', 'subject', 'estimated_hours', 'total_estimated_hours',
        'done_ratio', 'spent_hours', 'total_spent_hours', 'easy_due_date_time',
        'created_on', 'updated_on', 'closed_on', 'due_date', 'start_date', 'remaining_timeentries', 'total_remaining_timeentries'
        ]
      if Redmine::Plugin.installed?(:easy_helpdesk)
        fields << 'easy_response_date_time'
        fields << 'easy_helpdesk_project_monthly_hours'
      end
      fields
    end

    def nonsumable_fields
      fields = ['id', 'subject', 'done_ratio', 'easy_due_date_time',
        'created_on', 'updated_on', 'closed_on', 'due_date', 'start_date'
        ]
      if Redmine::Plugin.installed?(:easy_helpdesk)
        fields << 'easy_response_date_time'
        fields << 'easy_helpdesk_project_monthly_hours'
      end
      fields
    end

    def label_for_field_easy_due_date_time
      l(:field_hours_to_solve)
    end

    def label_for_field_easy_response_date_time
      l(:field_hours_to_response)
    end

    def label_for_field_spent_hours
      l(:label_spent_time)
    end

    def set_dependencies( token, custom_field )
      super( token, custom_field )

      if /%\{#{identifier}_total_spent_hours\}/.match?(token) ||
         /%\{#{identifier}_spent_hours\}/.match?(token) ||
         /%\{#{identifier}_remaining_timeentries\}/.match?(token) ||
         /%\{#{identifier}_total_remaining_timeentries\}/.match?(token)
        custom_field.easy_dependent_custom_fields.find_or_create_by( dependency_type: 'TimeEntry' )
      end

      if /%\{#{identifier}_easy_helpdesk_project_monthly_hours\}/.match?(token)
        custom_field.easy_dependent_custom_fields.find_or_create_by( dependency_type: 'EasyHelpdeskProject' )
      end
    end

  end

end