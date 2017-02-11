homeApp = angular.module('homeApp');

homeApp.controller('TDManagerCtrl', function($scope, $http, $route, 
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

	this.load = function(repositoryId, tagId){
		progressbarService.setTitle('Loading TD Items');
		$('#progressBarModal').modal('show');
		$http.get('rest/td-management/find?repositoryId='+repositoryId+'&tag='+tagId, {})
		.then(function successCallback(res) {
			$http.get('http://private-1608d-visminer.apiary-mock.com/committer', {})
					.then(function successCallback(resCommitter) {
						$scope.committers = resCommitter.data;
						toastr["success"]("Found "+res.data.length+" td items")
						$('#progressBarModal').modal('hide');
						for (i in res.data) {
							var occurredBy = [];
							for (z in res.data[i].occurredBy) {
								occurredBy.push(new Committer(
									res.data[i].occurredBy[z].name,
									res.data[i].occurredBy[z].email,
									null
								));
							}
							var package = res.data[i].filename.split('/');
				      package.pop();
							for (x in res.data[i].technical_debts) {
								$scope.tdItems.push(new TDItem(
									res.data[i].id,
									res.data[i].repository,
									new Commit(res.data[i].commit, new Date(res.data[i].commit_date)),
									occurredBy,
									'Code',
									getIndicators(res.data[i].technical_debts[x].indicators),
									res.data[i].filename,
									package.join('.'),
									false,
									null,
									null,
									null,
									null,
									null
								));
							}
						}
						localStorage.setItem('tdItems', JSON.stringify($scope.tdItems));
						$scope.tdItemsFiltered = $scope.tdItems;
					}, function errorCallback(response) {
				toastr["error"]("Error on analyzer this project")
			})
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
      'Dispersed Coupling',
      'Duplicated Code',
      'Brain Method',
      'Larger Class'
    ],
		isTdItem: ['true', 'false']
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
				if ($scope.filter.tdIndicator.indexOf(obj.tdIndicators[i]) > -1) {
					foundTdIndicator = true;
				}
			}
			if ($scope.filter.isTdItem.indexOf(String(obj.isTdItem)) > -1) {
				foundIsTdItem = true;
			}
			if (foundDate && foundType && foundTdIndicator && foundIsTdItem) {
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
		this.load(sidebarService.getRepository().id, $scope.filtered.tags[0].ids);
		$('#filter-identificationdate').daterangepicker();
	}
});