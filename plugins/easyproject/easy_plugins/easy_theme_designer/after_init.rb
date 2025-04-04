ActiveSupport.on_load(:easyproject, yield: true) do
  require 'easy_theme_designer/generator'
  require 'easy_theme_designer/internals'
  require 'easy_theme_designer/hooks'
end

EasyExtensions::AfterInstallScripts.add do
  EasyThemeDesigner.prepare_themes
end

Rails.application.configure do
  config.after_initialize do
    EasyThemeDesign.clear_cache
  end
end

RedmineExtensions::Reloader.to_prepare do
  FileUtils.mkdir_p(File.join(Attachment.storage_path, 'easy_images', 'easy_theme_designs'))
  Rails.application.configure do
    config.assets.paths << EasyThemeDesign.themes_path
    # config.assets.precompile.concat EasyThemeDesigner.prepare_themes
  end
end
