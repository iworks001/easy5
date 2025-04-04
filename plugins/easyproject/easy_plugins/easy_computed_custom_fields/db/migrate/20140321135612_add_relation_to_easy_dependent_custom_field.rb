class AddRelationToEasyDependentCustomField < ActiveRecord::Migration[4.2]
  def change
    add_column :easy_dependent_custom_fields, :relation, :integer
  end
end
