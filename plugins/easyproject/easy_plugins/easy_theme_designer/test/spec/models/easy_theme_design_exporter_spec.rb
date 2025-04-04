require 'easy_extensions/spec_helper'

describe EasyThemeDesigner::EasyXmlData::EasyThemeDesignExporter, admin: true do
  let(:easy_theme_design) { FactoryGirl.create(:easy_theme_design) }

  it 'exports and imports easy_theme_design' do
    exporter = described_class.new(easy_theme_design.id)
    exported_xml = ''
    builder = Builder::XmlMarkup.new(target: exported_xml, indent: 2)
    builder.instruct!
    exporter.build_xml(builder)

    importer = EasyXmlData::Importer.new
    xml = Nokogiri::XML(exported_xml, &:noblanks)
    importer.instance_variable_set(:@xml, xml)
    importer.send(:set_importables)

    expect { importer.import }.to change { EasyThemeDesign.count }.by(1)

    ignored_attributes = %w[id author_id created_at updated_at]
    imported_design_attributes = EasyThemeDesign.last.attributes.except(*ignored_attributes)
    expect(imported_design_attributes).to eq(easy_theme_design.attributes.except(*ignored_attributes))
  end

end
