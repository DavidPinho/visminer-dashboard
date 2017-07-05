angular.module('homeApp').component('alertModal', {
  controller: function ($scope, alertModalService) {
			$(".modal").on('show.bs.modal', function(e) {
			  centerModals($(this));
			});
			$(window).on('resize', centerModals);
	  	$scope.$on('updateModalMessage', function(event, message){
	  		$scope.alertMessage = message;
	  	}); 	
  },
  templateUrl: 'app/components/alert-modal/alertModal.html',
});
