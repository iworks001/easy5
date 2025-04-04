$.extend(window.ERUI, {
  init: function () {
    ERUI.document = $(document);
    ERUI.html = $('html');
    ERUI.window = $(window);
    ERUI.body = $('body');
    ERUI.main = $('#main');
    ERUI.content = $('#content');
    ERUI.sidebar = $('#sidebar,#easy_grid_sidebar');
    ERUI.topMenu = $('#top-menu');
    ERUI.onboardingBar = $('.epm_onboarding');
    ERUI.header = $('#header');
    ERUI.pageTabs = $('#easy_page_tabs');
    ERUI.mainMenu = $('#main-menu');
    ERUI.scrollTop = $(window).scrollTop();
    ERUI.formActions = $(".form-actions").not('.wiki .form-actions, #filter_buttons');
    ERUI.tableScrolls = $(".autoscroll");
            
    document.querySelectorAll('.autoscroll').forEach(autoscroll => {
      new PerfectScrollbar(autoscroll, {
        includePadding: true,
        suppressScrollY: true,
        useSelectionScroll: true,
        overideTouchPropagation: true
      });
    });
    ERUI.tableHeads = $('' +
       'table.list:not(.no-table-head) > thead:first-child').not('' +
       '.easy-printable-template-page table.list > thead, ' +
       '#ajax-modal table.list > thead, ' +
       '.dmsf_list > thead' +
      '');
    ERUI.backToTop = $('#back_to_top');
    ERUI.serviceBarComponentBody = $('#easy_servicebar_component_body');
    ERUI.boxPadding = ERUI.content.css("paddingLeft").slice(0, -2);

    $(document).on("easy_pagemodule_new_dom", function (event) {
      $(event.target).trigger("erui_new_dom");
    });
  }
});

EASY.schedule.main(ERUI.init, 4);

