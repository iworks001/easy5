class MigrateEasyThemeLogos < EasyExtensions::EasyDataMigration

  require 'fileutils'

  def self.up
    old_path = File.join(Rails.root, 'public', 'images', 'easy_theme_logos')
    new_path_base = File.join(Attachment.storage_path, 'easy_images')
    new_path = File.join(new_path_base, 'easy_theme_logos')
    if File.exists? old_path
      FileUtils.rm_rf new_path
      FileUtils.mkdir_p(new_path_base)
      FileUtils.cp_r(old_path, new_path)
      FileUtils.rm_rf old_path
    end
  end

  def self.down
  end

end

