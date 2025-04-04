class EasyThemeDesign < ActiveRecord::Base
  include Redmine::SafeAttributes
  include EasyThemeDesigner::Generator

  TEMPLATES = []

  serialize :extra_css_properties, Hash
  serialize :advanced_options, Hash

  belongs_to :author, class_name: 'User'
  acts_as_attachable
  acts_as_easy_translate(columns: [:title])

  validates :title, :primary_color, :secondary_color, presence: true

  safe_attributes 'primary_color', 'secondary_color', 'title', 'external_css_file', 'advanced_fields', 'images'

  scope :sorted, -> { order(:title) }

  after_save :ensure_in_use
  before_create :ensure_defaults

  def to_s
    title
  end

  # @note beware!! - this will create sass variables with "$#{attached_image_name.dasherize}-url" name
  def self.attached_image_names
    %w[logo logo_inverted logo_mark logo_mark_inverted login_bg favicon]
  end

  def self.in_use(user=User.current)
    user.individual_theme_enabled? && user.easy_theme_design || EasyThemeDesign.find_by(in_use: true)
  end

  def self.in_use_globally
    EasyThemeDesign.find_by(in_use: true)
  end

  def self.clear_cache
    Rails.cache.delete :easy_theme_designer_global
    begin
      Rails.cache.delete_matched(/^individual_easy_theme.*/)
    rescue NotImplementedError
      EasyThemeDesignEntity.all.each { |e| e.__send__(:clear_easy_theme_cache) }
    end
  end

  def external_css_file=(file)
    if file && file.content_type == 'text/css'
      self.css = file.read.strip
    end
  end

  def advanced_fields=(options)
    valid_options = Hash.new
    options.each do |opt_name, opt|
      if opt.present?
        valid_options[opt_name.to_sym] = opt
      end
    end
    self.advanced_options = valid_options
  end

  def advanced_fields
    EasyThemeDesigner.secondary_css_fields.map do |k, v|
      EasyThemeDesign::AdvancedField.new(k, advanced_options[k.to_sym] || v[:value], v[:type], v[:group])
    end
  end

  def set_in_use!
    EasyThemeDesign.update_all(in_use: false)
    update_column(:in_use, true)
    Rails.cache.delete(:easy_theme_designer_global)
  end

  def self.disable!
    EasyThemeDesign.update_all(in_use: false)
    Rails.cache.delete(:easy_theme_designer_global)
  end

  def get_image(image_name)
    attachments.find_by(description: image_name)
  end

  def remove_image!(image_name, compile = true)
    return unless image = get_image(image_name)

    delete_image_asset(image)
    image.destroy
    compile_all(true) unless compile == false
  end

  def images=(images)
    self.class.attached_image_names.each do |image_name|
      next unless (image = images[image_name])

      remove_image!(image_name, false)
      attachments.build(container: self,
                        file: image.tempfile,
                        filename: image.original_filename,
                        description: image_name,
                        author: User.current)
    end
  end

  def attached_images
    self.class.attached_image_names.map { |image_name| get_image(image_name) }.compact
  end

  def attachments_visible?(user = User.current)
    user.admin?
  end

  def image_asset_url(image_name)
    return unless (image = get_image(image_name))

    url = _image_asset_url(image)
    generate_image_asset(image) unless File.exist?(image_asset_public_path(image))
    url << "?#{updated_at.to_i}"

    url
  end

  private

  def _image_asset_url(image)
    EasyExtensions::EasyAssets.easy_images_options(self.class, "/#{id}/#{image.disk_filename}")[:url]
  end

  def image_asset_public_path(image)
    File.join(Rails.public_path, _image_asset_url(image))
  end

  def generate_image_asset(image)
    public_path = image_asset_public_path(image)
    FileUtils.mkdir_p(File.dirname(public_path))
    FileUtils.cp(image.diskfile, public_path)
  end

  def delete_image_asset(image)
    file_path = image_asset_public_path(image)

    File.delete(file_path) if File.exist?(file_path)
  end

  def ensure_in_use
    EasyThemeDesign.where.not(id: id).update_all(in_use: false) if in_use?
    self.class.clear_cache
  end

  def ensure_defaults
    self.author_id ||= User.current.id
  end

  def available_advanced_options
    EasyThemeDesigner.secondary_css_fields.keys
  end

  public

  class AdvancedField
    include Redmine::I18n
    attr_reader :name, :value, :type, :group

    def initialize(key, value, type = 'text', group = nil)
      @name = key.to_sym
      @value = value.presence
      @type = type
      @group = group
    end

    def present?
      !!@value
    end

    def to_s
      @name.to_s
    end

    def caption
      l(@name, scope: [:easy_theme_design_advanced_attributes, :names], default: @name.to_s.humanize)
    end

    def group
      l(@group.presence, scope: [:easy_theme_design_advanced_attributes, :groups], default: @group.to_s.humanize)
    end

    def hint
      l(@name, scope: [:easy_theme_design_advanced_attributes, :hints], default: '')
    end

    alias_method :description, :hint

  end

end
