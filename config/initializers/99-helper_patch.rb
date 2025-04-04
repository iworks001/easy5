module Redmine
  module Helpers
    autoload :Calendar,   Rails.root.join('lib', 'redmine', 'helpers', 'calendar').to_s
    autoload :Diff,       Rails.root.join('lib', 'redmine', 'helpers', 'diff').to_s
    autoload :Gantt,      Rails.root.join('lib', 'redmine', 'helpers', 'gantt').to_s
    autoload :TimeReport, Rails.root.join('lib', 'redmine', 'helpers', 'time_report').to_s
    autoload :URL,        Rails.root.join('lib', 'redmine', 'helpers', 'url').to_s
  end
end

