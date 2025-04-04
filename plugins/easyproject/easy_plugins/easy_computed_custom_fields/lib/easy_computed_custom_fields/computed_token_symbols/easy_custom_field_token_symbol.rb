require "#{File.dirname(__FILE__)}/easy_computed_token_symbol"

module EasyComputedCustomFields

  class EasyCustomFieldTokenSymbol < EasyComputedCustomFields::EasyComputedTokenSymbol

    def regexp
      /^cf_(.*)(\d+)$/
    end

    def parent_custom_field_classes( customized_model )
      return [] unless customized_model
      customized_model.reflect_on_all_associations(:belongs_to).map{|ref| ref.class_name + 'CustomField'}
    end

    def parent_custom_field_classes_by_assoc( customized_model )
      return {} unless customized_model
      customized_model.reflect_on_all_associations(:belongs_to).inject({}) do |res, ref|
        res[ref.name] = ( ref.class_name == 'Principal' ? 'User' : ref.class_name ) + 'CustomField'
        res
      end
    end

    def parent_possible_custom_fields( custom_field )
      CustomField.where(:type => parent_custom_field_classes(custom_field.class.customized_class)).
        where( CustomField.arel_table[:type].not_eq( custom_field.class.name ) ) #cuz Issue belongs_to Issue and its field I do not wanna
    end

    def possible_custom_fields( custom_field_klass=nil, options={} )
      if custom_field_klass
        result = custom_field_klass.all
        result = result.where("(field_format NOT LIKE 'easy_computed_token' OR easy_computed_token NOT LIKE '%{cf%}%')") if options[:exclude_dependent]
      else
        result = CustomField.all
        result = result.where("type NOT LIKE '#{options[:exclude_class_dependence]}' OR (field_format NOT LIKE 'easy_computed_token' OR easy_computed_token NOT LIKE '%{cf%}%')") if options[:exclude_class_dependence]
      end

      result
    end

    def symbols_for_cf( custom_field )
      possible_custom_fields(custom_field.class).collect{|cf| "cf_#{cf.id}"}
    end

    def group_label_for_issue_priority( cf_klass )
      l(:label_easy_computed_token_group_issue_priority)
    end

    def group_label_for_time_entry_activity( cf_klass )
      l(:label_easy_computed_token_group_time_entry_activity)
    end

    def group_label_for_principal( cf_klass )
      if( cf_klass == IssueCustomField )
        l(:label_easy_computed_token_group_assigned_to)
      else
        l(:label_easy_computed_token_group_principal)
      end
    end

    def group_label_for_parent( cf_klass )
      if cf_klass == IssueCustomField
        l(:label_easy_computed_token_group_issue_parent)
      else
        l(:label_easy_computed_token_group_parent)
      end
    end

    def group_label( field, cf_klass = nil )
      if respond_to?("group_label_for_#{field}")
        send("group_label_for_#{field}", cf_klass)
      else
        l("field_#{field}")
      end
    end

    def symbols_for_cf_to_select( custom_field )
      grouped = {}
      klasses = parent_custom_field_classes_by_assoc( custom_field.class.customized_class )
      klasses[nil] = custom_field.class.name
      klasses.each do |assoc_name, klass_name|
        klass = begin; klass_name.constantize; rescue; nil; end
        next unless klass
        group_name = group_label(assoc_name || klass.customized_class.name.underscore, custom_field.class)+' '+l(:fields_for_computed_token_field)
        values = possible_custom_fields(klass, exclude_dependent: (custom_field.class == klass))
        values = values.where(CustomField.arel_table[:id].not_eq(custom_field.id)) if  klass_name == custom_field.class.name
        values = values.collect{|cf| [cf.name, "cf_#{assoc_name||'self'}_#{cf.id}"]}
        grouped[group_name] = values if values.any?
      end
      grouped
    end

    def assoc_string( custom_field_class )
      names = ['self'] + parent_custom_field_classes_by_assoc( custom_field_class.customized_class ).keys
      names.join('|')
    end

    def regex_string( custom_field_class )
      "cf_((#{assoc_string(custom_field_class)})_)?(\\d+)"
    end

    def validate_token( token, errors, record )

        custom_field_ids = Array.new

        token.scan(/%{#{regex_string(record.class)}}/) do |as, assoc, custom_field_id|
          custom_field_ids << custom_field_id
        end

        custom_field_ids.each do |id|
          if id.to_i == record.id
            errors << l(:error_computed_custom_field_self_dependency)
          elsif !possible_custom_fields(nil, exclude_class_dependence: record.class.name).exists?(id)
            errors << l(:error_computed_custom_field_cfexistence, :id => id)
          end
        end

        token.gsub!(/%{#{regex_string(record.class)}}/,'') #removes cf values - mark as ok
    end

    def set_dependencies( token, custom_field )
      custom_field_ids = []
      token.scan(/%{#{regex_string(custom_field.class)}}/) {|as, assoc, custom_field_id| custom_field_ids << custom_field_id }
      CustomField.where(:id => custom_field_ids ).where( CustomField.arel_table[:type].not_eq( custom_field.class.name ) ).each do |cf|
        custom_field.easy_dependent_custom_fields.find_or_create_by( dependency_id: cf.id, dependency_type: 'CustomField' )
      end
    end

    def compute( symbol, customized )
      if Object.const_defined?(customized.class.name+'CustomField')
        cf_class = (customized.class.name+'CustomField').constantize
      else
        return ''
      end

      symbol.match(/^#{regex_string(cf_class)}/) do |m|

        cf_entity = CustomField.find($3)
        assoc_name = $2
        raw_value = nil

        if (!assoc_name || assoc_name == 'self') && ( founded_value = customized.custom_field_values.detect { |val| val.custom_field_id == ($3).to_i } )
          raw_value = founded_value.value
        else
          raw_value = cf_entity.value_for_computed_token(customized, assoc_name)
        end
        format_compute_value(cf_entity.format.name, raw_value, cf_entity)
      end
    rescue ActiveRecord::RecordNotFound
      return ''
    end

    private

    def format_compute_value(format, raw_value, custom_field)
      case format
        when 'easy_percent'
          (raw_value.to_f / 100).to_s
        when 'date'
          parse_date(raw_value)
        when 'datetime'
          parse_time(raw_value)
        when 'easy_computed_from_query'
          format_compute_value(custom_field.settings['easy_computed_from_query_format'], raw_value, custom_field)
        else
          # case raw_value
          #   when /^\d+$/
          #     raw_value.to_i
          #   when /^\d+\.\d+$/
          #     raw_value.to_f
          #   when /^\d{4}-\d{2}-\d{2}$/
          #     parse_date(raw_value)
          #   when /^\d{4}-\d{2}-\d{2}\s[\s0-9:\w+\-]*$^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}(:\d{2})?\s?[\w+0-9]{0,5}$/
          #     parse_time(raw_value)
          #   else
          #     raw_value
          # end
          raw_value
      end
    end

    def parse_date(string)
      begin
        string.to_date
      rescue StandardError
        string
      end
    end

    def parse_time(string)
      begin
        string.to_time
      rescue StandardError
        string
      end
    end


  end

end
