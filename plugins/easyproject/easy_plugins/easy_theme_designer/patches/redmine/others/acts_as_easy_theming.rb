module EasyThemeDesigner
  module Acts
    module EasyTheming
      def self.included(base)
        base.extend ClassMethods
      end

      module ClassMethods

        def acts_as_easy_theming(options = {})

          has_one :easy_theme_design_entity, :as => :entity, :dependent => :destroy

          has_one :easy_theme_design, :through => :easy_theme_design_entity

          send :include, EasyThemeDesigner::Acts::EasyTheming::InstanceMethods

          after_update :expire_easy_theme_css_file, :individual_theme_enabled?
        end

      end

      module InstanceMethods
        def self.included(base)
          base.extend ClassMethods
        end

        def easy_theme_design
          (easy_theme_design_entity || EasyThemeDesignEntity.find_by(entity_type: self.class.base_class.name, entity_id: nil)).try(:easy_theme_design)
        end

        def easy_theme_design_id
          easy_theme_design.try(:id)
        end

        def easy_theme_design_id=(arg)
          build_easy_theme_design_entity(easy_theme_design_id: arg)
        end

        def easy_theme_css_file
          Rails.cache.fetch([:individual_easy_theme, self]) do
            self.easy_theme_design.try(:css_filename)
          end
        end

        def individual_theme_enabled?
          EasyThemeDesigner::Settings.send("enable_#{self.class.name.underscore}_theming?")
        end


        private

        def expire_easy_theme_css_file
          Rails.cache.delete([:individual_easy_theme, self])
        end

        module ClassMethods

        end
      end

    end
  end
end
EasyExtensions::PatchManager.register_rails_patch 'ActiveRecord::Base', 'EasyThemeDesigner::Acts::EasyTheming'
