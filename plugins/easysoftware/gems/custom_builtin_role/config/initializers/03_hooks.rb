Rails.application.config.to_prepare do
  require_dependency Rails.root.join('plugins', 'easysoftware', 'gems', 'custom_builtin_role', 'lib', 'custom_builtin_role', 'hooks', 'view_hooks').to_s
end

# Hooks definitions
# http://www.redmine.org/projects/redmine/wiki/Hooks
Rails.application.config.to_prepare do
module CustomBuiltinRole
  class Hooks < ::Redmine::Hook::ViewListener
    render_on :easy_user_type_options_top, partial: 'easy_user_types/custom_builtin_role/easy_user_type_options_top'

    # To avoid patching whole partial
    # Just call different partial with some content and then call original
    def helper_project_settings_tabs(context = {})
      tab_members = context[:tabs].find {|t| t[:name] == 'members' }

      if tab_members
        tab_members[:partial] = 'projects/settings/custom_builtin_role/members'
      end
    end

  end
end
end
