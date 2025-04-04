class CreateEasyDependentCustomFields < ActiveRecord::Migration[4.2]
  def up
    create_table :easy_dependent_custom_fields do |t|
      t.references :custom_field
      t.references :dependency, :polymorphic => {:default => 'CustomField'}
      t.integer :order, :limit => 2, :default => 0
    end
    add_index :easy_dependent_custom_fields, :dependency_id
    add_index :easy_dependent_custom_fields, :dependency_type
    add_index :easy_dependent_custom_fields, [ :custom_field_id, :dependency_type, :dependency_id ], :unique => true, :name => 'idx_easy_dependent_custom_fields_3'
  end

  def down
    drop_table :easy_dependent_custom_fields
  end
end
