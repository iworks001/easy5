class CreateEasyThemeDesignEntities < ActiveRecord::Migration[4.2]
  def up
    create_table :easy_theme_design_entities do |t|
      t.belongs_to :easy_theme_design
      t.belongs_to :entity, :polymorphic => true

      t.timestamps
    end

    add_index :easy_theme_design_entities, [:entity_id, :entity_type], :name => :design_entity_idx
  end

  def down
    drop_table :easy_theme_design_entities
  end

end
