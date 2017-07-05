angular.module('homeApp').component('minerModal', {
  controller: function ($scope) {
			$("#minerModal").on('show.bs.modal', function(e) {
			  centerModals($(this));
			});
			$(window).on('resize', centerModals);	

			$scope.mineRepository = function() {
				$("#minerModal").modal("hide");
				$("#progressBarModal").modal("show");

			}
  },
  templateUrl: 'app/components/miner-modal/miner-modal.html',
});