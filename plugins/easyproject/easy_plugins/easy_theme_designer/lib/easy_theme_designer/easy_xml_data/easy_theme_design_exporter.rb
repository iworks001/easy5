module EasyThemeDesigner
  module EasyXmlData
    class EasyThemeDesignExporter < ::EasyXmlData::Exporter
      require 'zip'

      def initialize(easy_theme_design_ids)
        @easy_theme_design_ids = Array(easy_theme_design_ids)

        collect_entities
        set_default_metadata
      end

      def self.exportables
        @exportables ||= []
      end

      def self.exportable_labels
        @exportable_labels ||= {}
      end

      def build_xml(bob)
        fake_user_id = 0
        bob.easy_xml_data do
          @easy_theme_designs.to_xml(
            builder: bob,
            skip_instruct: true,
            except: %i[author_id extra_css_properties advanced_options in_use],
            procs: [
              proc do |options, record|
                options[:builder].tag!('extra_css_properties', record.extra_css_properties.to_yaml, type: 'yaml')
                options[:builder].tag!('advanced_options', record.advanced_options.to_yaml, type: 'yaml')
                options[:builder].tag!('author_id', fake_user_id)
              end
            ]
          )
          @attachments.present? && @attachments.to_xml(
            builder: bob,
            skip_instruct: true,
            except: %i[author_id],
            procs: [proc { |options, _record| options[:builder].tag!('author_id', fake_user_id) }]
          )
          @attachment_versions.present? && @attachment_versions.to_xml(
            builder: bob,
            skip_instruct: true,
            except: %i[author_id],
            procs: [proc { |options, _record| options[:builder].tag!('author_id', fake_user_id) }]
          )
        end
      end

      private

      def collect_entities
        @easy_theme_designs = EasyThemeDesign.where(id: @easy_theme_design_ids)

        # attachments
        @attachments = Attachment.where(container: @easy_theme_designs)
        @attachment_versions = @attachments.collect(&:versions).flatten

      end

      def set_default_metadata
        @metadata = { entity_type: EasyThemeDesign.to_s }
        easy_theme_design = @easy_theme_designs.first
        @metadata.merge!(name: easy_theme_design.title) if easy_theme_design
      end

    end
  end
end
