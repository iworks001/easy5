Redmine::Plugin.register :easy_theme_designer do
  name :easy_theme_designer_plugin_name
  author :easy_theme_designer_plugin_author
  author_url :easy_theme_designer_plugin_author_url
  description :easy_theme_designer_plugin_description
  version '2019'
  visible false
  should_be_disabled false
  migration_order 300
  categories [:advanced]
  requires_redmine_plugin :easy_extensions, version_or_higher: '2019'

  plugin_in_relative_subdirectory File.join('easyproject', 'easy_plugins')

  settings default: {}, partial: 'settings/easy_theme_designs'
end

# No more lines here!
