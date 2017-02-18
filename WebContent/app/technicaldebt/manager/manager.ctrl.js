homeApp = angular.module('homeApp');

homeApp.controller('TDManagerCtrl', function($scope, $rootScope, $http, $route, 
	TDItem, Commit, Committer, DuplicatedCode, LongMethod, // Models
	progressbarService, sidebarService, tdItemModalService){

	var thisCtrl = this;
	$scope.committers = [];
	$scope.tdItems = [];
	$scope.tdItemsFiltered = [];

	thisCtrl.selectView = function(view) {
		$scope.currentPage = view;
		sidebarService.setCurrentPage(view);
	}

	thisCtrl.load = function(repositoryId, tagId){
		progressbarService.setTitle('Loading TD Items');
		$('#progressBarModal').modal('show');
		$http.get('rest/td-management/find?repositoryId='+repositoryId+'&tag='+tagId, {})
		.then(function successCallback(res) {
			var tdItemIndicators = res.data;
			toastr["success"]("Found "+tdItemIndicators.length+" td items indicators")
			$('#progressBarModal').modal('hide');
			for (i in tdItemIndicators) {
				var contributors = [];
				for (z in tdItemIndicators[i].contributors) {
					contributors.push(new Committer(
						tdItemIndicators[i].contributors[z].name,
						tdItemIndicators[i].contributors[z].email,
						null
					));
				}
				var package = tdItemIndicators[i].filename.split('/');
				package.pop();
				for (x in tdItemIndicators[i].indicators) {
					$scope.tdItems.push(new TDItem(
						tdItemIndicators[i]._id.$oid,
						tdItemIndicators[i].repository.$oid,
						new Commit(tdItemIndicators[i].commit, new Date(tdItemIndicators[i].commit_date.$date)),
						contributors,
						'Code',
						getIndicators(tdItemIndicators[i].indicators),
						tdItemIndicators[i].filename,
						tdItemIndicators[i].filehash.$numberLong,
						package.join('.'),
						(typeof tdItemIndicators[i].analyzed != 'undefined') ? tdItemIndicators[i].analyzed : false,
						tdItemIndicators[i].technical_debt,
						(typeof tdItemIndicators[i].details != 'undefined' && tdItemIndicators[i].details.intentional != 'undefined') ? tdItemIndicators[i].details.intentional : null,
						(typeof tdItemIndicators[i].details != 'undefined' && tdItemIndicators[i].details.principal != 'undefined') ? tdItemIndicators[i].details.principal : null,
						(typeof tdItemIndicators[i].details != 'undefined' && tdItemIndicators[i].details.interest_amount != 'undefined') ? tdItemIndicators[i].details.interest_amount : null,
						(typeof tdItemIndicators[i].details != 'undefined' && tdItemIndicators[i].details.interest_probability != 'undefined') ? tdItemIndicators[i].details.interest_probability : null,
						(typeof tdItemIndicators[i].details != 'undefined' && tdItemIndicators[i].details.estimates != 'undefined') ? tdItemIndicators[i].details.estimates : null,
						(typeof tdItemIndicators[i].details != 'undefined' && tdItemIndicators[i].details.notes != 'undefined') ? tdItemIndicators[i].details.notes : null
					));
				}
			}
			localStorage.setItem('tdItems', JSON.stringify($scope.tdItems));
			$scope.tdItemsFiltered = $scope.tdItems;
		}, function errorCallback(response) {
			toastr["error"]("Error on analyzer this project")
		});
	}

	$scope.tdIndicators = [
        
      ];

	$scope.filter = {
		type: ['Code', 'Design'],
		tdIndicator: [
			'Slow Algorithm',
			'Multithread Correctness',
			'Automatic Static Analysis Issues',
			// Code Smells
			'God Class',
			'Code Complexity',
			'Code Without Standards',
			'Dispersed Coupling',
			'Duplicated Code',
			'Brain Method',
			'Larger Class'
		],
		isTdItem: ['true', 'false'],
		isAnalyzed: ['true', 'false']
	}

	// Apply filter parameters
	$scope.filterApply = function() {
		var tdItemsFiltered = [];
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
			var foundIsAnalyzed = false;
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
			for (i in obj.tdIndicators) {
				if ($scope.filter.tdIndicator.indexOf(obj.tdIndicators[i].name) > -1) {
					foundTdIndicator = true;
				}
			}
			if ($scope.filter.isTdItem.indexOf(String(obj.isTdItem)) > -1) {
				foundIsTdItem = true;
			}
			if ($scope.filter.isAnalyzed.indexOf(String(obj.isAnalyzed)) > -1) {
				foundIsAnalyzed = true;
			}
			if (foundDate && foundType && foundTdIndicator && foundIsAnalyzed && foundIsTdItem) {
				tdItemsFiltered.push(obj);
			}
		}
		$scope.tdItemsFiltered = tdItemsFiltered;
	}
	
	$scope.tdItemFormatDate = function(date) {
	  return moment(date).format('l');
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
		i.committers = $scope.committers;
		tdItemModalService.loadObj(i, tdItem);
		$('#tdItemModal').modal('show');
	}

	function getIndicators(indicators) {
		var indicatorsNew = [];
		for (indicator in indicators) {
			indicatorsNew.push({name: getIndicatorName(indicator), qtty: indicators[indicator]});
		}
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
		thisCtrl.load(sidebarService.getRepository().id, $rootScope.tags[0].name);
		$('#filter-identificationdate').daterangepicker();
	}
});