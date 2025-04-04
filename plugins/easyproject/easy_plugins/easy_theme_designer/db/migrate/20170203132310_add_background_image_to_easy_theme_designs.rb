class AddBackgroundImageToEasyThemeDesigns < ActiveRecord::Migration[4.2]
  def change
    change_table :easy_theme_designs do |t|
      t.attachment :background_image
    end
  end
end
