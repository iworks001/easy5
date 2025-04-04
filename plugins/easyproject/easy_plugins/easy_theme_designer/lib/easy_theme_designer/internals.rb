module EasyThemeDesigner

  ASSETS_FILENAMES = %w[theme theme_typography mailer_inline mailer_non_inline]

  class << self

    def theme_template_files
      files = {}
      ASSETS_FILENAMES.each do |filename|
        files[filename] = File.join(Redmine::Plugin.find('easy_theme_designer').directory, 'assets', 'stylesheets', 'easy_theme_designer', "#{filename}.scss.erb")
      end
      files
    end

    def theme_source_variables_file
      File.join(EasyExtensions::EASY_EXTENSIONS_DIR, 'assets', 'stylesheets', 'easy_extensions', '_variables_primary.scss')
    end

    def prepare_themes
      begin
        #   FileUtils.mkdir_p(File.join(Rails.public_path, 'stylesheets', EasyThemeDesigner::Settings.public_easy_themes_storage))
        # rescue Exception => e
        #   raise 'Could not create Easy themes directory: ' + e.message
        # end
        if EasyThemeDesign.table_exists? # && EasyUtils::EnvironmentUtils.running_in_regular_process?
          require 'easy_theme_designer/utils'

          EasyUtils::EasyThemeDesigner.update_internal_designs
          begin
            EasyThemeDesign.all.select { |e| puts "Compiling EasyTheme #{e}..."; !e.compile_all(true) }.each { |n| puts "EasyTheme##{n.id} error" }
          rescue Exception => e
            puts "Easy Theme Designer fail: #{e.message}"
          end
        end
      end
    end

    def secondary_css_fields
      group = ''
      File.open(theme_source_variables_file) do |file|
        file.each_with_object({}) do |l, fields|
          # example
          # $color-positive: #4ebf67; // color

          l.strip!

          if l.start_with?('/')
            l = l.delete('/')
            group = l.strip
            next
          end
          next if l.empty? || !l.start_with?('$')

          style, type = l.split(';')
          variable, value = style.split(':')

          variable = variable[1..-1]
          value = value.gsub('!default', '').strip
          type = type.delete('/').strip

          fields[variable] = { value: value, type: type, group: group }
        end
      end
    end

  end

  class Settings
    mattr_writer :enable_issue_theming, :enable_project_theming, :enable_user_theming
    mattr_writer :default_easy_theme_design_filename
    mattr_writer :public_easy_themes_storage

    class << self

      def enable_issue_theming?
        Setting.plugin_easy_theme_designer['enable_issue_theming'].to_s.to_boolean
      end

      def enable_project_theming?
        Setting.plugin_easy_theme_designer['enable_project_theming'].to_s.to_boolean
      end

      def enable_user_theming?
        Setting.plugin_easy_theme_designer['enable_user_theming'].to_s.to_boolean
      end

      alias_method :enable_anonymous_user_theming?, :enable_user_theming?
      alias_method :enable_easy_demo_user_theming?, :enable_user_theming?

      def default_easy_theme_design_filename
        'easy_theme_design'
      end

      def public_easy_themes_storage
        File.join('easy_theme_designer', 'themes')
      end

    end

  end
end
