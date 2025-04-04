require 'active_support/concern'

module EasyThemeDesigner
  module Generator
    extend ActiveSupport::Concern

    included do

      attr_accessor :uncompiled

      after_destroy :delete_asset, :invalidate_in_use
      # after_save :compile

      def filename(basename)
        "easy_theme_design_#{id}-#{updated_at.to_i}-#{basename}"
      end

      def compile_all(force = false)
        EasyThemeDesigner.theme_template_files.each do |basename, file_path|
          compile(file_path, force: force, basename: basename)
          return false if uncompiled
        end

        true
      end

      def compile(file_path, options = {})
        return true if !options[:force] && File.exist?(File.join(Rails.public_path, asset_path(options[:basename])))
        delete_asset(options[:basename])

        begin
          filename = filename(options[:basename])
          env = Rails.application.assets
          asset_source = Pathname.new File.join(self.class.themes_path, "#{filename}.scss")

          body = ERB.new(File.read(file_path)).result(get_binding)
          FileUtils.mkdir_p(asset_source.module_parent.to_s) unless asset_source.module_parent.exist?
          File.open(asset_source.to_s, 'wb') { |f| f.write(body) }
          asset = env.find_asset(filename)

          if asset.nil?
            env = Sprockets::Environment.new(Rails.root.to_s)
            env.config = Rails.application.assets.config

            env.context_class.class_eval do
              def asset_path(path, _options = {})
                if path.start_with?('/')
                  path
                else
                  "/assets/#{path}"
                end
              end
            end
            asset = env.find_asset(filename)
          end
          raise "asset not found in pipeline" if asset.nil?

          compressed_body = ::SassC::Engine.new(asset.source, { syntax: :scss, cache: false, read_cache: false, style: :compressed, digest: true, load_paths: env.paths }).render

          public_path = File.join(Rails.public_path, Rails.application.config.assets.prefix, 'easy_themes')
          FileUtils.mkdir_p(public_path) unless File.directory?(public_path)
          File.open(File.join(Rails.public_path, asset_path(options[:basename])), 'wb') { |f| f.write(compressed_body) }

        rescue SassC::SyntaxError => e
          Rails.logger.error("EasyThemeDesigner: SassError => #{e.to_s}")
          Rails.logger.error("EasyThemeDesigner: SassError => #{e.backtrace}")
          update_columns(in_use: false)
          self.uncompiled = options[:basename]
        rescue StandardError => e
          Rails.logger.error("EasyThemeDesigner: Error => #{e.to_s}")
          update_columns(in_use: false)
          self.uncompiled = options[:basename]
        end
      end

      def prefixed_path(path)
        "#{Redmine::Utils::relative_url_root}#{path}"
      end

      def get_binding
        binding
      end

      def asset_path(basename)
        File.join(Rails.application.config.assets.prefix, 'easy_themes', "#{filename(basename)}.css")
      end

      def asset_url(basename = 'theme')
        # "#{ActionController::Base.asset_host}/#{asset_path}"
        asset_path(basename)
      end

      def delete_asset(basename = '')
        pattern = "easy_theme_design_#{id}-*#{basename}"
        asset_files = Dir.glob(File.join(self.class.themes_path, "#{pattern}.scss"))
        asset_files.concat(Dir.glob(File.join(Rails.public_path, Rails.application.config.assets.prefix, 'easy_themes', "#{pattern}.css")))
        asset_files.each { |file| File.delete(file) if File.exist?(file) }
      end

      def invalidate_in_use
        Rails.cache.delete(:easy_theme_designer_global) if in_use?
      end

    end

    class_methods do

      def themes_path
        File.join(Attachment.storage_path, 'easy_images', 'easy_theme_designs')
      end

    end
  end

end
