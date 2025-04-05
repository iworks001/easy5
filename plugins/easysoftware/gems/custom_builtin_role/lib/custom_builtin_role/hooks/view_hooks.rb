module CustomBuiltinRole
  class Hooks < ::Redmine::Hook::ViewListener
    render_on :easy_user_type_options_top,
      partial: 'easy_user_types/custom_builtin_role/easy_user_type_options_top'
  end
end

