class RenameEasyThemeColumnIfNeeded < ActiveRecord::Migration[4.2]
  def up
    if column_exists?(:easy_theme_designs, :extend)
      rename_column(:easy_theme_designs, :extend, :extra_css_properties)
    end
  end

  def down
  end
end
