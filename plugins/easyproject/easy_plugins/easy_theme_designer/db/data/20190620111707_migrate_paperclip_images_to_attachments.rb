class MigratePaperclipImagesToAttachments < EasyExtensions::EasyDataMigration
  def up
    EasyThemeDesign.all.each do |theme|
      { 'logo' => 'logo', 'background_image' => 'login_bg' }.each do |attachment_name, variable_name|
        filename = theme.send("#{attachment_name}_file_name")
        basename = File.basename(filename.to_s, '.*')
        file_path = EasyExtensions::EasyAssets.easy_images_options(theme.class, "/#{theme.id}/original/#{basename}.jpg")[:path]
        next unless File.exist? file_path

        Attachment.create!(container: theme,
                           file: File.new(file_path),
                           filename: filename,
                           description: variable_name,
                           author: theme.author || AnonymousUser.first)
      end
    end
  end
end
