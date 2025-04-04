module EasyThemeDesigner
  require 'color'
  class Generator
    attr_reader :primary_color, :secondary_color

    def self.disable(filename=nil)
      @filename = filename || EasyThemeDesigner::Settings.default_easy_theme_design_filename
      File.open(File.join(Rails.public_path, 'stylesheets', EasyThemeDesigner::Settings.public_easy_themes_storage + '.css'), 'w') do |f|
        f.puts '/* Nothing here */'
      end
    end

    def self.disable!(filename=nil)
      disable(filename)
    end

    # Generate Easy Redmine theme based on two colors.
    #
    # *primary_color* : Color of top-menu, login page, primary buttons
    # *secondary_color*   : Color of secondary buttons, headings, hovers...
    # *options*   : Optionals
    #   +theme+::     Object of EasyThemeDesign
    #   +filename+::  Filename of output
    #   +logo+::      Path to logo if theme change logo
    #   +extra_css+:: Path to css file which will use for overwrite generated css's.
    #   +css_from_yaml_file+:: Path to yaml with serialized CSS.
    def initialize(primary_color, secondary_color, options={})
      @easy_theme = options.delete(:theme)
      @extra_css_from_yaml = {}

      @primary_color = Color::RGB.from_html(primary_color)
      @secondary_color = Color::RGB.from_html(secondary_color)

      @primary_color_gama = convert_to_brightness_value(primary_color)

      @filename         = options.delete(:filename) || EasyThemeDesigner::Settings.default_easy_theme_design_filename
      @logo_path        = options.delete(:logo)

      if @easy_theme && !@easy_theme.advanced_options.blank?
        @easy_theme.advanced_options.each do |opt_name, opt|
          self.instance_variable_set("@#{opt_name}", opt.present? && Color::RGB.from_html(opt) || nil)
        end
      end

      @links_color ||= @primary_color.darken_by(25).adjust_brightness(10)
      if @primary_color.brightness > 0.65
        @top_menu_links_color ||= @primary_color.adjust_brightness(-1* (@primary_color.brightness * 100)).darken_by(@primary_color.brightness * 100)
        @button1_color ||= @primary_color.darken_by(50)
        @button1_background ||= @primary_color
        @top_menu_sub_links_color ||= @links_color
      else
        @top_menu_links_color ||= @primary_color.adjust_brightness(@primary_color.brightness * 100).lighten_by(@primary_color.brightness * 100)
        @button1_color ||= Color::RGB.new(255,255,255)
        @button1_background ||= @primary_color
        @top_menu_links_color ||= @primary_color.darken_by(50)
        @top_menu_sub_links_color ||= @top_menu_links_color.darken_by(50)
      end

      if @secondary_color.brightness > 0.65
        @secondary_text_color = @secondary_color.darken_by(60)
        @button2_color ||= @secondary_color.darken_by(25)
      else
        @secondary_text_color = @secondary_color
        @button2_color ||= @secondary_color.lighten_by(25)
      end
      @button2_background ||= @secondary_color
      @button3_background ||= @secondary_color
      @button3_color ||= @button1_background.mix_with(Color::RGB.from_html('#FAC444'), 50)

      if css_file = (options[:extra_css] || @easy_theme && @easy_theme.css.presence)
        if File.exists?(css_file)
          @extra_css = File.read(css_file)
        else
          @extra_css = css_file
        end
      end

      if extra_css_properties = options.delete(:css_from_yaml_file)
        @extra_css_from_yaml = YAML::load(File.read(extra_css_properties)) if File.exists?(extra_css_properties)
      end
      begin
        if @easy_theme && @easy_theme.extra_css_properties.present?
          @extra_css_from_yaml.merge!(@easy_theme.extra_css_properties)
        end
      rescue
        false
      end
    end

    def generate
      css = ''
      css << "html body div#top-menu div#logo a { background-image: url(#{@logo_path})}" if @logo_path.present?

      unless @primary_color.html == '#52afe5' && @secondary_color.html == '#b3b3b3'
        css << "a, a:link, a:visited {color: #{@links_color.html};}" # all links
        css << "#top-menu #top-menu-container > ul > li > a, html .easy-top-menu-more-toggler i.icon-arrow {color: #{@top_menu_links_color.html}}" # togglers in top menu
        css << "html #main-menu li a.selected, html #main-menu li a:hover, html .box h3.icon:before {color: #{@top_menu_links_color.html};} " # secondary icons and top-menu links
        css << "div#top-menu #easy_top_menu_more .rich-menu-more-item > li ul.menu-children a {color: #{@top_menu_sub_links_color.html};}"
        css << "div#top-menu #easy_top_menu_more .rich-menu-more-item > li ul.menu-children a:hover:before {color: #{@primary_color.html}}" # menu  sub-link arrow

        css << "html div#top-menu #easy_top_menu_more .rich-menu-more-item > li > a, html div#top-menu .easy-menu-children > li a, html #login-form table td div, html div.menu-dashboard fieldset { border-color: #{@primary_color.html};}" # border of sub-menu-sub-link
        css << "html div#top-menu #easy_top_menu_more .rich-menu-more-item > li, div#top-menu .easy-menu-children li {background-color: #{@top_menu_sub_links_color.lighten_by(05).html}}"
        css << "html #top-menu, html #login-form table tr td:first-child div, html .box h3.icon:before, html #main-menu li a.selected, html #main-menu li a:hover, html #main-menu .ps-scrollbar-x-rail, html html #top-menu:after, html table.list tbody tr.group span.count, html span.count {background: #{@primary_color.html};}"
        css << "html #sidebar::-webkit-scrollbar-thumb, html #content::-webkit-scrollbar-thumb {background: #{@primary_color.html};}"
        css << "html #sidebar::-webkit-scrollbar-thumb:window-inactive, html #content::-webkit-scrollbar-thumb:window-inactive {background: #{contrasting_text_color(@primary_color.html, 0.25)};}"

        css << "div#issue-detail h2, h2, .wiki h1, div#top-menu #easy_top_menu_more .rich-menu-more-item > li > a.icon:before, div#top-menu .easy-menu-children > li a.icon:before, div.menu-dashboard li i.icon:hover:before, div.menu-more li:hover a.icon:before, html #admin-menu li a.icon:hover {color: #{@secondary_text_color.html};}"

        # button-1
        css << 'html a.button-1,html .button-1, input[type=submit], html .button-1.ui-button.ui-widget, #login-form #login_submit_field button[type="submit"] {'
        css << "color: #{@button1_color.html}; background: #{@button1_background.html};}"
        css << 'html a.button-1:hover, html .button-1:hover, input[type=submit]:hover, html .button-1.ui-button.ui-widget:hover, #login-form #login_submit_field button[type="submit"]:hover {'
        css << "background: #{(@button1_color.mix_with(@button1_background, 50)).html}; color: #{(@button1_background).html};}"
        # button-2
        css << "html a.button-2, html .button-2, html input[type=submit].button-2, html body .button-2.ui-button.ui-widget {background: #{(@button2_background).html}; color: #{@button2_color.html}}"
        # regular menu has button-2 style
        css << "html .menu ul.menu-manager li a, html .menu ul.menu-manager li ul.menu-children li a {background: #{(@button2_background).html}; color: #{@button2_color.html}}"
        css << "html .menu ul.menu-manager li:hover a, html .menu ul.menu-manager li ul.menu-children li:hover a {background: #{(@button1_color.mix_with(@button1_background, 50)).html};  color: #{(@button2_background).html}}"
        css << "html a.button-2:hover, html .button-2:hover, html input[type=submit].button-2:hover, html body .button-2.ui-button.ui-widget:hover {background: #{(@button1_color.mix_with(@button1_background, 50)).html};  color: #{(@button2_background).html}}"
        # button-3
        css << "html a.button-3, html .button-3, html input[type=submit].button-3, html body .button-3.ui-button.ui-widget {background: #{@button3_background.html}; color: #{@button3_color.html} !important}"

      # button-positive
      css << 'html a.button-positive,html .button-positive, input[type=submit], html .button-positive.ui-button.ui-widget, #login-form #login_submit_field button[type="submit"] {'
      css << "color: #{@button1_color.html}; background: #{@button1_background.html};}"
      css << 'html a.button-positive:hover, html .button-positive:hover, input[type=submit]:hover, html .button-positive.ui-button.ui-widget:hover, #login-form #login_submit_field button[type="submit"]:hover {'
      css << "background: #{(@button1_color.mix_with(@button1_background, 50)).html}; color: #{(@button1_background).html};}"
      # button
      css << "html a.button, html .button, html input[type=submit].button, html body .button.ui-button.ui-widget {background: #{(@button2_background).html}; color: #{@button2_color.html}}"
      # regular menu has button style
      css << "html .menu ul.menu-manager li a, html .menu ul.menu-manager li ul.menu-children li a {background: #{(@button2_background).html}; color: #{@button2_color.html}}"
      css << "html .menu ul.menu-manager li:hover a, html .menu ul.menu-manager li ul.menu-children li:hover a {background: #{(@button1_color.mix_with(@button1_background, 50)).html};  color: #{(@button2_background).html}}"
      css << "html a.button:hover, html .button:hover, html input[type=submit].button:hover, html body .button.ui-button.ui-widget:hover {background: #{(@button1_color.mix_with(@button1_background, 50)).html};  color: #{(@button2_background).html}}"
      # button-3
      css << "html a.button-3, html .button-3, html input[type=submit].button-3, html body .button-3.ui-button.ui-widget {background: #{@button3_color.html}; color: #{@button1_color.html}}"

        css << "table.progress td.closed { background: #{@secondary_color.html}; border-color: #{@secondary_color.html};}"
        css << "table.progress td.done { background: #{@secondary_color.lighten_by(50).html};border-color: #{@secondary_color.lighten_by(50).html};}"

        bright = lighten_color(@primary_color.html, 0.25)
        css << "
        html body.action-login #content {
          background: #{@primary_color.html}; /* Old browsers */
          background: -moz-radial-gradient(center, ellipse cover,  #{bright} 0%, #{@primary_color.html} 61%, #{@primary_color.html} 100%); /* FF3.6+ */
          background: -webkit-gradient(radial, center center, 0px, center center, 100%, color-stop(0%,#{bright}), color-stop(61%,#{@primary_color.html}), color-stop(100%,#{@primary_color.html})); /* Chrome,Safari4+ */
          background: -webkit-radial-gradient(center, ellipse cover,  #{bright} 0%,#{@primary_color.html} 61%,#{@primary_color.html} 100%); /* Chrome10+,Safari5.1+ */
          background: -o-radial-gradient(center, ellipse cover,  #{bright} 0%,#{@primary_color.html} 61%,#{@primary_color.html} 100%); /* Opera 12+ */
          background: -ms-radial-gradient(center, ellipse cover,  #{bright} 0%,#{@primary_color.html} 61%,#{@primary_color.html} 100%); /* IE10+ */
          background: radial-gradient(ellipse at center,  #{bright} 0%,#{@primary_color.html} 61%,#{@primary_color.html} 100%); /* W3C */
        }"
      end

      if @extra_css.present?
        css << @extra_css
      end

      if @extra_css_from_yaml.present?
        @extra_css_from_yaml.each do |css_key, css_properties|
          s = "\n" + css_key + " {"
          css_properties.each do |key,value|
            s << "#{key}: #{value};"
          end
          s << "}"
          css << s
        end
      end

      return css.html_safe
    end

    def generate!
      # begin
        css = generate
        File.open(File.join(Rails.public_path, 'stylesheets', EasyThemeDesigner::Settings.public_easy_themes_storage, @filename + '.css'), 'w') do |f|
          f.puts css
        end
      # rescue Exception => e
      #   raise "Could not generate Easy Theme #{@easy_theme.try(:id)}: " + e.message
      # end
    end

    def darken_color(hex_color, amount=0.4)
      hex_color = hex_color.delete('#')
      rgb = hex_color.scan(/../).map {|color| color.hex}
      rgb[0] = (rgb[0].to_i * amount).round
      rgb[1] = (rgb[1].to_i * amount).round
      rgb[2] = (rgb[2].to_i * amount).round
      "#%02x%02x%02x" % rgb
    end

    # Amount should be a decimal between 0 and 1. Higher means lighter
    def lighten_color(hex_color, amount=0.6)
      hex_color = hex_color.delete('#')
      rgb = hex_color.scan(/../).map {|color| color.hex}
      rgb[0] = [(rgb[0].to_i + 255 * amount).round, 255].min
      rgb[1] = [(rgb[1].to_i + 255 * amount).round, 255].min
      rgb[2] = [(rgb[2].to_i + 255 * amount).round, 255].min
      "#%02x%02x%02x" % rgb
    end

    def contrasting_text_color(hex_color, amount=0.65)
      color = hex_color.delete('#')
      convert_to_brightness_value(color) > 382.5 ? darken_color(color, amount) : lighten_color(color, amount)
    end

    def convert_to_brightness_value(hex_color)
       (hex_color.scan(/../).map {|color| color.hex}).sum
    end

    def hex_to_rgb(hex_color)
      hex_color = hex_color.delete('#')
      hex_color.scan(/../).map {|color| color.hex}
    end
  end
end
