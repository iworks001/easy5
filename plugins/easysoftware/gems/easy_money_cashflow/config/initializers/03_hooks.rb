ActiveSupport.on_load(:after_initialize) do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'easy_money_cashflow', 'lib', 'easy_money_cashflow', 'hooks', 'view_hooks').to_s
end

# Hooks definitions
# http://www.redmine.org/projects/redmine/wiki/Hooks

