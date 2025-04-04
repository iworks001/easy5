class AddVersionToEasyThemeDesigns < ActiveRecord::Migration[5.2]

  def up
    add_column :easy_theme_designs, :version, :integer, null: false, default: 0
  end

  def down
    remove_column :easy_theme_designs, :version
  end

end
