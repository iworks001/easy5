class CreateEasyThemeDesigns < ActiveRecord::Migration[4.2]
  def change
    create_table :easy_theme_designs do |t|
      t.string  :title, :null => true
      t.text    :description, :null => true

      t.integer :position, {:null => false, :default => 1}

      t.string :primary_color, :null => false
      t.string :secondary_color, :null => false

      t.text    :css, :limit => 999.megabytes
      t.text    :extra_css_properties, :limit => 999.megabytes

      t.attachment :logo

      t.boolean :in_use, :default => false, :null => false

      t.belongs_to :author

      t.timestamps
    end
  end
end
