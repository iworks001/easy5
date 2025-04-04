require 'easy_extensions/spec_helper'

describe 'epm generic gauge', :logged => :admin do

  let(:settings) { { "query_type"                  => "2",
                     "query_name"                  => "xxx",
                     "name"                        => "xxx",
                     "needle_easy_query_klass"     => "easy_issue_query",
                     "needle_query_sumable_column" => "estimated_hours",
                     "action_range"                => "dynamic_range",
                     "range_easy_query_klass"      => "easy_issue_query",
                     "tags"                        =>
                         { "0" =>
                               { "easy_query_settings"        => { "set_filter" => "1" },
                                 "name"                       => "Tag 1",
                                 "plan"                       => "",
                                 "needle_easy_query_settings" => { "fields" => ["updated_on"], "values" => { "updated_on" => { "period" => "all", "period_days2" => "", "period_days" => "", "from" => "2017-08-03", "to" => "2017-08-04" } }, "operators" => { "updated_on" => "date_period_2" } },
                                 "range_easy_query_settings"  =>
                                     { "fields" => ["updated_on"], "operators" => { "updated_on" => "date_period_1" }, "values" => { "updated_on" => { "period" => "yesterday", "period_days2" => "", "period_days" => "", "from" => "2017-08-31", "to" => "2017-09-01" } } } },
                           "1" =>
                               { "easy_query_settings"        => { "set_filter" => "1" },
                                 "name"                       => "Tag 2",
                                 "plan"                       => "",
                                 "needle_easy_query_settings" => { "fields" => ["updated_on"], "values" => { "updated_on" => { "period" => "all", "period_days2" => "", "period_days" => "", "from" => "2017-08-03", "to" => "2017-08-04" } }, "operators" => { "updated_on" => "date_period_2" } },
                                 "range_easy_query_settings"  =>
                                     { "fields" => ["updated_on"], "operators" => { "updated_on" => "date_period_1" }, "values" => { "updated_on" => { "period" => "last_month", "period_days2" => "", "period_days" => "", "from" => "2017-08-31", "to" => "2017-09-01" } } } },
                           "2" =>
                               { "easy_query_settings"        => { "set_filter" => "1" },
                                 "name"                       => "Tag 3",
                                 "plan"                       => "",
                                 "needle_easy_query_settings" => { "fields" => ["updated_on"], "values" => { "updated_on" => { "period" => "all", "period_days2" => "", "period_days" => "", "from" => "2017-08-03", "to" => "2017-08-04" } }, "operators" => { "updated_on" => "date_period_2" } },
                                 "range_easy_query_settings"  =>
                                     { "fields" => ["updated_on"], "operators" => { "updated_on" => "date_period_1" }, "values" => { "updated_on" => { "period" => "last_week", "period_days2" => "", "period_days" => "", "from" => "2017-08-31", "to" => "2017-09-01" } } } } },
                     "range_query_sumable_column"  => "estimated_hours" } }


  it 'edit' do
    edit_data = EpmGenericGauge.new.get_edit_data(settings, User.current)
    periods   = edit_data[:range_queries].values.map { |queries| queries.filters }.map { |filters| filters['updated_on'][:values]['period'] }
    expect(periods).to eq ['yesterday', 'last_month', 'last_week']
  end
end
