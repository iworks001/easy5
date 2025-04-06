ActiveSupport.on_load(:after_initialize) do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'resource_reports', 'lib', 'resource_reports', 'hooks', 'view_hooks').to_s
end

