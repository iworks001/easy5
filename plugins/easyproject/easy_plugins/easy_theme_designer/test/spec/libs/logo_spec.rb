require 'easy_extensions/spec_helper'

describe EasyExtensions::Logo, admin: true do
  let(:logo) { fixture_file_upload('logo.png', 'image/png', true) }
  let(:easy_theme_design) { FactoryBot.create(:easy_theme_design, in_use: true, images: {'logo' => logo}) }

  it 'get logo path' do
    easy_theme_design
    expect(EasyExtensions::Logo.logo).to match(/files.*logo.png/)
  end
end
