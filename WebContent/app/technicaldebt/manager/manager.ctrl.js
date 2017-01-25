homeApp = angular.module('homeApp');

homeApp.controller('TDManagerCtrl', function($scope, $http, $route, 
	TDItem, Commit, Committer, DuplicatedCode, LongMethod, // Models
	progressbarService, sidebarService, tdItemModalService){

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

	$scope.filter = {
		type: ['Code Debt', 'Design Debt'],
		tdIndicator: ['Duplicated Code', 'Long Method'],
		isTdItem: ['true', 'false']
	}

	// Apply filter parameters
	$scope.filterApply = function() {
		var tdItemFiltered = [];
		if (typeof $scope.filter.identificationDate != 'undefined' && $scope.filter.identificationDate != "") {
			var dates = $scope.filter.identificationDate.split(' - ');
			var identificationDateIni = new Date(dates[0]);
			var identificationDateEnd = new Date(dates[1]);
		}
		for (i in $scope.tdItems) {
			var obj = $scope.tdItems[i];
			var accept = 0;
			var foundDate = false;
			var foundType = false;
			var foundTdIndicator = false;
			var foundIsTdItem = false;
			if (typeof $scope.filter.identificationDate != 'undefined' && identificationDateIni) {
				if (identificationDateIni <= obj.commit.date && obj.commit.date <= identificationDateEnd) {
					foundDate = true;
				}
			} else {
				foundDate = true;
			}
			if ($scope.filter.type.indexOf(obj.type) > -1) {
				foundType = true;
			}
			if ($scope.filter.tdIndicator.indexOf(obj.tdIndicator.name) > -1) {
				foundTdIndicator = true;
			}
			if ($scope.filter.isTdItem.indexOf(String(obj.isTdItem)) > -1) {
				foundIsTdItem = true;
			}
			if (foundDate && foundType && foundTdIndicator && foundIsTdItem) {
				tdItemFiltered.push(obj);
			}
		}
		$scope.tdItemFiltered = tdItemFiltered;
	}
	
	$scope.tdItemFormatDate = function(date) {
	  return moment(date).format('l')+" "+moment(date).format('LT');
	}

	// Return the file name
	$scope.tdItemFormatFile = function(location) {
		var loc = location.split('/');
	  return loc[loc.length-1];
	}

	$scope.tdItemFormatNotes = function(notes) {
	  return (notes.length > 20) ? notes.substring(0,17)+'...' : notes;
	}

	$scope.tdItemEdit = function(i, tdItem) {
		tdItemModalService.loadObj(i, tdItem);
		$('#tdItemModal').modal('show');
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