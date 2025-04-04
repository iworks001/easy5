module EasyComputedCustomFields
  module ProjectCustomFieldPatch

    def self.included(base)

       base.class_eval do

        def record_for_computed_value_search( customizable, assoc_name=nil )

          return nil unless project = super( customizable )

          # just for speed things up, if the cf is on this project
          if self.is_for_all? || project.all_issue_custom_fields.detect{|cf| cf.id == self.id }
            return project
          else
            pr_arel = Project.arel_table
            Project.joins(:project_custom_fields).where("#{CustomField.table_name}" => {:id => self.id}).
              where( pr_arel[:lft].lteq(project.lft).and(pr_arel[:rgt].gteq(project.rgt)) ).order("#{Project.table_name}.lft DESC").first
          end

        end

      end
    end

  end
end
EasyExtensions::PatchManager.register_model_patch('ProjectCustomField', 'EasyComputedCustomFields::ProjectCustomFieldPatch', :after => 'CustomField')
