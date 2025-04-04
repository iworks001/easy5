Rails.application.config.to_prepare do
module EasyThemeDesigner
  class Hooks < Redmine::Hook::ViewListener

    render_on(:view_my_account_custom_theme, partial: 'hooks/theme_selector')
    render_on(:view_settings_display_top, partial: 'hooks/admin_settings_theme_selector')

    # def view_layouts_base_html_head(context={})
    #   # stylesheet_link_tag('easy_theme_designer')
    #
    #   css_file = context[:controller].send('ensure_easy_theme_file')
    #   return context[:controller].view_context.stylesheet_link_tag(css_file) if css_file.present?
    # end

    def easy_xml_data_import_importer_set_importable(context = {})
      require 'easy_theme_designer/easy_xml_data/imortables/easy_theme_design_importable'
      importable_class = EasyThemeDesigner::EasyXmlData::EasyThemeDesignImportable
      xpath = importable_class.xpath
      if (importable_xml = context[:xml].xpath(xpath)).present?
        context[:importables].send(:unshift, importable_class.new(xml: importable_xml))
      end
    end

  end
end
end
