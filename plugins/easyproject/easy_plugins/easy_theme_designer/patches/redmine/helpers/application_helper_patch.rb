module EasyThemeDesigner
  module ApplicationHelperPatch

    def self.included(base)
      base.extend(ClassMethods)
      base.include(InstanceMethods)

      base.class_eval do

        alias_method_chain :easy_theme_tag, :easy_theme_designer
        alias_method_chain :easy_favicon_tag, :easy_theme_designer

      end
    end

    module InstanceMethods

      def easy_theme_tag_with_easy_theme_designer(options={})
        path = Rails.cache.fetch([:individual_easy_theme, User.current.easy_theme_design_entity], force: User.current.easy_theme_design_entity.nil?) do
          User.current.easy_theme_design.try(:asset_url, 'theme')
        end if EasyThemeDesigner::Settings.enable_user_theming?
        path ||= Rails.cache.fetch(:easy_theme_designer_global) { EasyThemeDesign.in_use.try(:asset_url, 'theme') }

        if path
          stylesheet_link_tag(path, options)
        else
          easy_theme_tag_without_easy_theme_designer(options)
        end
      end

      def easy_favicon_tag_with_easy_theme_designer
        options = {}
        if (theme = EasyThemeDesign.in_use) && (favicon_url = theme.image_asset_url('favicon'))
          options[:href] = theme.prefixed_path(favicon_url)
        end

        easy_favicon_tag_without_easy_theme_designer(options)
      end
    end

    module ClassMethods

    end

  end

end
EasyExtensions::PatchManager.register_helper_patch 'ApplicationHelper', 'EasyThemeDesigner::ApplicationHelperPatch'
