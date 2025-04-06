ActiveSupport.on_load(:after_initialize) do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'easy_calculoid', 'lib', 'easy_calculoid', 'hooks', 'view_hooks').to_s
end

