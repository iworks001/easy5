class CreateEasyRakeTaskComputedToday < RedmineExtensions::Migration
  def self.up
    EasyRakeTaskComputedToday.create!(active: true, settings: {}, period: :daily, next_run_at: Time.now.end_of_day + 1.hour, interval: 1, builtin: 1)
  end

  def self.down
    EasyRakeTaskComputedToday.destroy_all
  end
end
