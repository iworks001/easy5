# frozen_string_literal: true

require 'fileutils'

module EasyUtils
  module EasyThemeDesigner
    extend self

    store                        = File.join(EasyExtensions::EASYPROJECT_EASY_PLUGINS_DIR, 'easy_theme_designer/assets/xml_data_store')
    easy_dark_theme_data_file    = File.join(store, 'easy_dark_theme.zip')
    easy_compact_theme_data_file = File.join(store, 'easy_compact_theme.zip')

    EASY_THEMES = [
      {
        internal_name: :easy_dark_theme,
        data_file: easy_dark_theme_data_file,
        version: 1
      },
      {
        internal_name: :easy_compact_theme,
        data_file: easy_compact_theme_data_file,
        version: 1
      },
    ]

    def update_internal_designs
      EASY_THEMES.each do |theme|
        internal_name = theme[:internal_name]
        version = theme[:version]

        current_theme = ::EasyThemeDesign.find_by(internal_name: internal_name)

        if current_theme.nil?
          ::EasyThemeDesign.transaction do
            import_easy_theme_design!(theme)
          end
        elsif current_theme.version < version
          ::EasyThemeDesign.transaction do
            update_easy_theme_design!(theme)
          end
        end
      end
    end

    def update_easy_theme_design!(internal_name:, data_file:, version:)
      if !File.exist?(data_file)
        raise ArgumentError, 'data_file does not exist'
      end

      importer = EasyXmlData::Importer.new_with_archived_file(data_file)
      advanced_options_text = importer.xml.xpath('//easy_xml_data/easy-theme-designs').children.first&.xpath('advanced_options')&.text

      if (advanced_options = advanced_options_text && YAML::load(advanced_options_text))
        easy_theme = EasyThemeDesign.find_by(internal_name: internal_name)

        easy_theme.advanced_options = advanced_options
        easy_theme.version = version
        easy_theme.save!
      end
    ensure
      importer && importer.clear_import_dir
    end

    def import_easy_theme_design!(internal_name:, data_file:, version:)
      if !File.exist?(data_file)
        raise ArgumentError, 'data_file does not exist'
      end

      importer = EasyXmlData::Importer.new_with_archived_file(data_file)
      importer.xml # Just touch importables
      importer.auto_mapping

      importer.import

      if importer.validation_errors.any?
        error! "Import failed: #{importer.validation_errors.join(', ')}"
      end

      easy_theme_design_importable = importer.imported.dig('easy_theme_design', :importable)

      if easy_theme_design_importable.nil?
        error! 'No EasyThemeDesign imported'
      end

      if easy_theme_design_importable.processed_entities.size != 1
        error! 'Number of imported themes should be 1'
      else
        _, imported_easy_theme = easy_theme_design_importable.processed_entities.first
      end

      imported_easy_theme.internal_name = internal_name
      imported_easy_theme.version = version
      imported_easy_theme.save!

    ensure
      importer && importer.clear_import_dir
    end

    def error!(message)
      raise EasyXmlData::Importer::CancelImportException, message
    end

  end
end
