class EasyXmlEasyThemeDesignsController < EasyXmlDataController

  private

  def create_exporter
    @exporter = EasyThemeDesigner::EasyXmlData::EasyThemeDesignExporter.new(params[:ids])
  end

  def get_filename
    title = EasyThemeDesign.where(id: params[:ids]).pluck(:title).first if params[:ids]

    "#{title || 'export'}_#{Time.now}.zip"
  end

end
