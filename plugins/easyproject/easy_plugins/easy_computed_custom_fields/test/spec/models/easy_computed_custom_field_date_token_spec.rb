RSpec.describe 'Model test', logged: :admin do

  context 'computed custom field date tokens value computing' do
    let(:issue) { FactoryBot.create(:issue, due_date: Date.today + 5.days, estimated_hours: 0.0) }
    let(:custom_field) { FactoryBot.create(:computed_issue_custom_field, computed_token: '%{issue_due_date} -  %{issue_dates_date_today} ', trackers: [issue.tracker]) }
    let(:values) { issue.custom_values.where(custom_field_id: custom_field.id)}

    it 'should have custom value' do
      with_time_travel(0, now: Date.new(2015, 2, 4).to_time) do
        custom_field
        issue.reload; issue.save
        expect( values.size ).to eq(1)
        expect( values.first.value.to_i ).to eq( 5 )
      end
    end

    context 'Nan, Infinity' do
      let!(:custom_field) { FactoryBot.create(:computed_issue_custom_field, computed_token: "(%{issue_spent_hours}/%{issue_estimated_hours})", trackers: [issue.tracker]) }

      it 'should save 0 if Infinity' do
        FactoryBot.create(:time_entry, issue: issue, hours: 5.0)
        issue.reload; issue.save
        expect( values.first.value ).to eq( '0.0' )
      end

      it 'should save 0 if Nan' do
        issue.reload; issue.save
        expect( values.first.value ).to eq( '0.0' )
      end
    end
  end
end
