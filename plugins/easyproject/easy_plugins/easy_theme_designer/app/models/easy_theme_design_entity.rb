class EasyThemeDesignEntity < ActiveRecord::Base
  belongs_to :entity, :polymorphic => true
  belongs_to :easy_theme_design


  after_save :clear_easy_theme_cache

  private

  def clear_easy_theme_cache
    Rails.cache.delete("#{entity_type.underscore}_#{entity_id}_individual_easy_theme")
  end

end
