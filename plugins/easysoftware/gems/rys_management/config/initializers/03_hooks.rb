ActiveSupport.on_load(:after_initialize) do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'rys_management', 'lib', 'rys_management', 'hooks', 'view_hooks').to_s
end

