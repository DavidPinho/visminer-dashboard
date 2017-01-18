homeApp = angular.module('homeApp');

homeApp.controller('TDManagerCtrl', function($scope, $http, $route, 
	TDItem, Commit, Committer, DuplicatedCode, LongMethod, // Models
	progressbarService, sidebarService, tdTimelineService){

	var thisCtrl = this;
	$scope.tdItems = [];
	$scope.tdItemsFiltered = [];

	thisCtrl.selectView = function(view) {
		$scope.currentPage = view;
		sidebarService.setCurrentPage(view);
	}

	this.load = function(tags){
		progressbarService.setTitle('Loading TD Items');
		$('#progressBarModal').modal('show');
		$http.get('http://private-1608d-visminer.apiary-mock.com/td/manager', {})
		.then(function successCallback(res) {
			console.log('res', res)
			toastr["success"]("Found "+res.data.length+" td items")
			$('#progressBarModal').modal('hide');
			for (i in res.data) {
				var committers = [];
				for (z in res.data[i].occurredBy) {
					committers.push(new Committer(
						res.data[i].occurredBy[z].name,
						res.data[i].occurredBy[z].email,
						null
					));
				}
				for (x in res.data[i].technical_debts) {
					$scope.tdItems.push(new TDItem(
						res.data[i].id,
						res.data[i].repository,
						new Commit(res.data[i].commit, new Date(res.data[i].commit_date)),
						committers,
						'Code',
						getIndicators(res.data[i].technical_debts[x].indicators),
						res.data[i].filename,
						'res.data[i].package',
						false,
						null,
						null,
						null,
						null,
						null
					));
				}
			}
			console.log('$scope.tdItems', $scope.tdItems)
			$scope.tdItemsFiltered = $scope.tdItems;
		}, function errorCallback(response) {
			toastr["error"]("Error on analyzer this project")
		});
	}

	function getIndicators(indicators) {
		var indicatorsNew = [];
		for (indicator in indicators) {
			indicatorsNew.push(getIndicatorName(indicator));
		}
		indicatorsNew.sort();
		return indicatorsNew;
	}

	function getIndicatorName(str) {
		var splitStr = str.toLowerCase().split('_');
		for (var i = 0; i < splitStr.length; i++) {
			splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
		}
		return splitStr.join(' '); 
	}

	if ($scope.currentPage == 'tdmanager') {
		this.load();
	}
});