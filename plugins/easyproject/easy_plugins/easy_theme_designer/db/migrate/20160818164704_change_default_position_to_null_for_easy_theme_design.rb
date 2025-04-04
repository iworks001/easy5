class ChangeDefaultPositionToNullForEasyThemeDesign < ActiveRecord::Migration[4.2]
  def up
    change_column :easy_theme_designs, :position, :integer, { :null => true, :default => nil }
  end

  def down
  end
end
