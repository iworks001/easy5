require 'rys'

module AdvancedImporter
  class Engine < ::Rails::Engine
    include Rys::EngineExtensions

    rys_id 'advanced_importer'

    initializer 'advanced_importer.setup' do
      # Custom initializer
    end

    # Rails 6+ 호환성 확보: module_parent 제공
    unless respond_to?(:module_parent)
      def self.module_parent
        name.deconstantize.constantize
      end
    end
  end
end
