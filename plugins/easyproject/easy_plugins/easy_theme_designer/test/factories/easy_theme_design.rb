FactoryGirl.define do
  factory :easy_theme_design do
    sequence(:title) { |n| "Easy Theme #{n}" }

    primary_color {"#%02x%02x%02x" % [rand(255),rand(255),rand(255)]}
    secondary_color {"#%02x%02x%02x" % [rand(255),rand(255),rand(255)]}

  end
end
