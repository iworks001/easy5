require_dependency Rails.root.join('lib', 'redmine', 'hook').to_s
require_dependency Rails.root.join('lib', 'redmine', 'hook', 'listener').to_s
require_dependency Rails.root.join('lib', 'redmine', 'hook', 'view_listener').to_s
# Hooks definitions
# http://www.redmine.org/projects/redmine/wiki/Hooks

module ProjectFlags
  class Hooks < ::Redmine::Hook::ViewListener

    def easy_extensions_stylesheets_hook(context={})
      context[:template].require_asset('project_flags/project_flags')
    end

    def easy_extensions_javascripts_hook(context={})
      context[:template].require_asset('project_flags')
    end

  end
end
