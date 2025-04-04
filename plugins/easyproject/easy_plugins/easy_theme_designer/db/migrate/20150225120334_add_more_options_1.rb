class AddMoreOptions1 < ActiveRecord::Migration[4.2]
  def up
    change_table(:easy_theme_designs) do |t|
      t.text(:advanced_options, :null => true)
    end
  end

  def down
  end
end
