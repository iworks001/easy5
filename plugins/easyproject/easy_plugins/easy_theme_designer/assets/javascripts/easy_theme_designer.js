EASY.schedule.late(function(event){
  function colorizeInput(target) {
    if (target) {
      var color = target.val().replace("#", "");
      target.css({border: "2px solid #" + color});
    }
  }

  $(document).on('change', '.easy-theme-design-form .color input', function(event){colorizeInput($(event.target))})
  $(document).on('click', '.reverse-button a', function(event) {
    var link = $(event.target);
    var container = link.closest('.color-pickers');
    var firstI = container.find('.color input').first();
    var lastI = container.find('.color input').last();

    var firstC = firstI.val();
    var lastC = lastI.val();

    firstI.val(lastC);
    lastI.val(firstC);
    colorizeInput(firstI);
    colorizeInput(lastI);
  });

  $('.easy-theme-design-form .color input').each(function(index, item) {
    colorizeInput($(this))
  });
  $(document).on('change', '.easy-advanced-attribute-toggle', function(event){
      var colorField = $(event.target).next();
      colorField.prop("disabled", !colorField.is(":disabled"));
      colorField.click();
  });
});
