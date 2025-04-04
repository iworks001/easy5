class EasyThemeDesignsController < ApplicationController

  before_action :require_admin
  before_action :find_easy_theme, only: [:edit, :update, :destroy, :generate, :assign_easy_theme, :preview, :remove_image]

  include EasySettingHelper

  def index
    @easy_themes = EasyThemeDesign.sorted
    respond_to do |format|
      format.html { render(action: 'index') }
    end
  end

  def new
    @easy_theme = EasyThemeDesign.new(primary_color: '#009ee0', secondary_color: '#f5efe6')
    @easy_theme.safe_attributes = params[:easy_theme_design]
    respond_to do |format|
      format.html
    end
  end

  def create
    @easy_theme = EasyThemeDesign.new
    @easy_theme.safe_attributes = params[:easy_theme_design]
    @easy_theme.in_use = true if params[:continue]

    respond_to do |format|
      if @easy_theme.save
        if @easy_theme.compile_all(true)
          flash[:notice] = l(:notice_successful_create)
        else
          flash[:warning] = l(:warning_failed_to_compile, name: @easy_theme.uncompiled)
        end
        format.html { redirect_to easy_theme_designs_path }
      else
        format.html { render(action: 'new') }
      end
    end
  end

  def edit
    respond_to do |format|
      format.html
    end
  end

  def update
    @easy_theme.safe_attributes = params[:easy_theme_design]
    @easy_theme.in_use = true if params[:continue]

    respond_to do |format|
      if @easy_theme.save
        if @easy_theme.compile_all(true)
          flash[:notice] = l(:notice_successful_update)
        else
          flash[:warning] = l(:warning_failed_to_compile, name: @easy_theme.uncompiled)
        end
        format.html { redirect_to easy_theme_designs_path }
      else
        format.html { render(action: 'edit') }
      end
    end
  end

  def destroy
    if @easy_theme.destroy
      flash[:notice] = l(:notice_successful_delete)
    else
      flash[:error] = l(:error_easy_theme_design_is_internal)
    end
    respond_to do |format|
      format.html { redirect_to(easy_theme_designs_path) }
    end
  end

  def generate
    @easy_theme.set_in_use!
    # @easy_theme.compile
    respond_to do |format|
      # @easy_theme.generate_css!(EasyThemeDesigner::Settings.default_easy_theme_design_filename)
      format.html { redirect_to easy_theme_designs_path }
    end
  end

  def disable
    EasyThemeDesign.disable!
    respond_to do |format|
      format.html { redirect_to(easy_theme_designs_path, notice: l(:notice_successful_update)) }
    end
  end

  def assign_easy_theme
    @entity = params[:entity_type].classify.constantize.find(params[:entity_id])
    @entity.easy_theme_design = @easy_thenme
    respond_to do |format|
      format.js
      format.html { redirect_back_or_default(root_path) }
    end
  end

  def save_settings
    Setting.set_from_params 'plugin_easy_theme_designer', Setting.plugin_easy_theme_designer.merge(params[:settings].permit!).to_hash if params[:settings]
    respond_to do |format|
      format.js { head :ok }
      format.html { redirect_to(easy_theme_designs_path, notice: l(:notice_successful_update)) }
    end
  end

  def preview
    @easy_theme_entity = OpenStruct.new(easy_theme_design: @easy_theme, easy_theme_design_entity: nil)
    index
  end

  def remove_image
    @easy_theme.remove_image!(params[:image_name])
    respond_to do |format|
      format.js
    end
  end

  private

  def find_easy_theme
    @easy_theme = EasyThemeDesign.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_404
  end

end
