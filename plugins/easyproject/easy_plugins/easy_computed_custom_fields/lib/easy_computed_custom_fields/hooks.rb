module EasyComputedCustomFields
  class Hooks < Redmine::Hook::ViewListener

    def controller_custom_fields_edit_after_save(context={})
      cf = context[:custom_field]
      controller = context[:controller]
      if controller && cf.is_a?(CustomField) && cf.field_format == 'easy_computed_token'
        controller.flash[:notice] = "#{controller.flash[:notice]}<br>#{l(:notice_delayed_update)}".html_safe
      end
    end

    def controller_custom_fields_new_after_save(context={})
      self.controller_custom_fields_edit_after_save(context)
    end

  end
end
