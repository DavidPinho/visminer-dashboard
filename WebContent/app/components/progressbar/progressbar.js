angular.module('homeApp').component('progressBar', {
  controller: function($scope) {
  	 var progressBarModal = "#progressBarModal";
     $scope.$on('setProgressbarDuration', function(event, duration){
        $scope.duration = duration;
      });
     $scope.$on('setProgressbarTitle', function(event, title){
        $scope.title = title;
      }); 
     $('.modal').on('show.bs.modal', function(e) {
        centerModals($(this));
     }); 
  	 $(progressBarModal).on('show.bs.modal', function(e) {
  	    loadBar();
  	 });
     $(window).on('resize', centerModals);
   },
  templateUrl: 'app/components/progressbar/progressbar.html',
});

function loadBar(){
  var $bar = $('.progress-bar');
  $bar.width(0);
  var widthMax = 600;
  var widthPerc = 0;
  var widthPercIncrement = 0.75;
  var progress = setInterval(function() {
    if ($bar.width()>=widthMax || $('.progress').is(':visible') == false) {
      $bar.width(0);
      $('.progress').removeClass('active');
      $(progressBarModal).modal("hide");
      clearInterval(progress);
    } else {
      widthPerc += (widthMax * widthPercIncrement / 100);
      if (widthPerc < 100) {
        $bar.width(widthMax*widthPerc/100);
        $bar.text(parseInt(widthPerc) + "%");
      }
      widthPercIncrement -= (widthPercIncrement/21);
    }
  }, 500);
}
