function centerModals($element) {
      var $modals;
      if ($element.length) {
          $modals = $element;
      } else {
          $modals = $('.modal' + ':visible');
      }
      $modals.each( function(i) {
          var $clone = $(this).clone().css('display', 'block').appendTo('body');
          var top = Math.round(($clone.height() - $clone.find('.modal-content').height()) / 2);
          top = top > 0 ? top : 0;
          $clone.remove();
          $(this).find('.modal-content').css("margin-top", top);
      });
    
}