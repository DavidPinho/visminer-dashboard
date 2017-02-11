angular.module('homeApp').component('minerModal', {
	controller : function($scope, $rootScope, $http, progressbarService, sidebarService, Repository, TagTime) {

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
				toastr["error"]("Please fill out the form correctly");
			}
			else {
				$http.get('rest/mining/get-references', {
					params : {
						"path" : $scope.path,
						"scm" : $scope.scm,
					}
				}).then(function successCallback(response) {
					$("#minerModal1").modal("hide");
					$("#minerModal2").modal("show");

					$scope.referenceType = 'tags';
					$scope.references = {
						branches : [],
						tags : []
					};

					response.data.forEach(function(elem) {
						if (elem.type == 'BRANCH')
							$scope.references.branches.push(elem);
						else if (elem.type == 'TAG')
							$scope.references.tags.push(elem);
					});
				}, function errorCallback(response) {
					toastr["error"]("Please fill out the form correctly")
				});
			}
		};

		$scope.mine_next2 = function() {
			$("#minerModal2").modal("hide");
			$("#minerModal3").modal("show");
		};
		
		$scope.mine = function() {
			$("#minerModal2").modal("hide");
			$("#minerModal3").modal("hide");
			progressbarService.setTitle('Mining '+$scope.name+'...');
			$('#progressBarModal').modal('show');
			$http.put('rest/mining/mine', {
				"name" : $scope.name,
				"description" : $scope.description,
				"path" : $scope.path,
				"scm" : $scope.scm,
				"references" : $scope.tags.concat($scope.branches),
				"metrics" : $scope.selectedMetrics
			}).then(function successCallback(response) {    
				$http.get('rest/mining/get-references?scm='+$scope.scm+'&path='+$scope.path.split('/').join('%2F'))
				.then(function successCallback(response) {
					$('#progressBarModal').modal('hide');
					toastr["success"]("Found "+response.data.length+" tags")
					sidebarService.addRepository(new Repository('123abc', $scope.name, $scope.description, [], []));
					var data = response.data;
					for (i in data) {
						$rootScope.tags.push(new TagTime('x', data[i].name, data[i].alias, data[i].order, data[i].type, 'repository', []));
					}
				}, function errorCallback(response) {
					toastr["error"]("Error on load tags")
				});
			}, function errorCallback(response) {
				toastr["error"]("Please fill out the form correctly")
			});
		}
		
		$scope.mine_prev = function(hide, show) {
			$("#minerModal"+hide).modal("hide");
			$("#minerModal"+show).modal("show");
		};
		
$scope.branches = [];
$scope.path = '/Users/sandrosantos/Enviroments/java/repositories/retrofit';
$scope.scm = 'GIT';
$scope.name = 'retrofit';
$scope.description = 'retrofit proj';
$scope.tags = [];
$scope.selectedMetrics = [];
		
	},
	templateUrl : 'app/components/miner-modal/miner-modal.html',
});