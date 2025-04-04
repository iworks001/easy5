class AddInternalNameToEasyThemeDesigner < ActiveRecord::Migration[4.2]
  def change
    add_column(:easy_theme_designs, :internal_name, :string, :deafult => nil, :null => true)
  end
end
