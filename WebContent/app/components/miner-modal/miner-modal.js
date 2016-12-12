angular.module('homeApp').component('minerModal', {
	controller : function($scope, $http) {

		$("#minerModal1").on('show.bs.modal', function(e) {
			centerModals($(this));
		});

		$(window).on('resize', centerModals);

		$scope.branches = [];
		$scope.path = '';
		$scope.scm = '';
		$scope.tags = [];
		$scope.selectedMetrics = [];
		
		$scope.metrics = ['ATFD', 'CYCLO', 'LVAR', 'MAXNESTING', 'MLOC', 'NOM', 'NOA', 'NOAV', 'PAR', 'LOC', 'TCC', 'WMC'];
		
		$scope.mine_next1 = function() {
			if ($scope.path == '' || $scope.scm == '') {
				toastr["error"]("Please fill out the form correctly")
			}
			else {
				$http.get('rest/mining/get-references', {
					params : {
						"path" : $scope.path,
						"scm" : $scope.scm,
					}
				}).success(function(data) {
					$("#minerModal1").modal("hide");
					$("#minerModal2").modal("show");

					$scope.referenceType = 'tags';
					$scope.references = {
						branches : [],
						tags : []
					};

					data.forEach(function(elem) {
						if (elem.type == 'BRANCH')
							$scope.references.branches.push(elem);
						else if (elem.type == 'TAG')
							$scope.references.tags.push(elem);
					});
				});
			}
		};

		$scope.mine_next2 = function() {
			$("#minerModal2").modal("hide");
			$("#minerModal3").modal("show");
		};
		
		$scope.mine = function() {
			$("#minerModal3").modal("hide");
			console.log($scope.selectedMetrics);
			
			$http.put('rest/mining/mine', {
				"name" : $scope.name,
				"description" : $scope.description,
				"path" : $scope.path,
				"scm" : $scope.scm,
				"references" : $scope.tags.concat($scope.branches),
				"metrics" : $scope.selectedMetrics
			});
		}
		
		$scope.mine_prev = function(hide, show) {
			$("#minerModal"+hide).modal("hide");
			$("#minerModal"+show).modal("show");
		};
		
	},
	templateUrl : 'app/components/miner-modal/miner-modal.html',
});