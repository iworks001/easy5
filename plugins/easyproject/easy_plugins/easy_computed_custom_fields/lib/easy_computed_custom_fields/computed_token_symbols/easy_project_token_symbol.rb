require "#{File.dirname(__FILE__)}/easy_record_token_symbol"

module EasyComputedCustomFields

  class EasyProjectTokenSymbol < EasyComputedCustomFields::EasyRecordTokenSymbol

    def model
      Project
    end

    def identifier
      'project'
    end

    def available_fields
      fields = ['id', 'name', 'sum_time_entries', 'remaining_timeentries', 'created_on', 'sum_estimated_hours', 'identifier', 'start_date', 'due_date']

      if Redmine::Plugin.installed?(:easy_helpdesk)
        fields << 'easy_helpdesk_project_spent_time_current_month'
        fields << 'easy_helpdesk_project_spent_time_last_month'
        fields << 'easy_helpdesk_project_monthly_hours'
        fields << 'easy_helpdesk_project_remaining_hours'
      end
      fields
    end

    def label_for_field_sum_time_entries
      l(:label_spent_time)
    end

    def label_for_field_easy_helpdesk_project_remaining_hours
      l(:field_aggregated_hours_remaining)
    end

    def label_for_field_sum_estimated_hours
      l(:field_estimated_hours)
    end

    def set_dependencies( token, custom_field )
      super( token, custom_field )

      if /%\{#{identifier}_sum_estimated_hours.*\}/.match?(token)
        custom_field.easy_dependent_custom_fields.find_or_create_by( dependency_type: 'Issue' )
      end
      if /%\{#{identifier}_easy_helpdesk.*\}/.match?(token)
        custom_field.easy_dependent_custom_fields.find_or_create_by( dependency_type: 'EasyHelpdeskProject' )
      end
      if /%\{#{identifier}_sum_time_entries.*\}/.match?(token) ||
         /%\{#{identifier}_easy_helpdesk_project_spent.*\}/.match?(token) ||
         /%\{#{identifier}_easy_helpdesk_project_remaining.*\}/.match?(token) ||
         /%\{#{identifier}_remaining_timeentries.*\}/.match?(token) ||
         /%\{#{identifier}_sum_timeentries.*\}/.match?(token)
        custom_field.easy_dependent_custom_fields.find_or_create_by( dependency_type: 'TimeEntry' )
      end
    end

  end

end
