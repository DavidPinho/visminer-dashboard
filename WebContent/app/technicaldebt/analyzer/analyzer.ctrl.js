homeApp = angular.module('homeApp');

homeApp.controller('TDAnalyzerCtrl', function($scope, $http, $location, $route, $timeout,
 TDItem, Commit, Committer, DuplicatedCode, LongMethod, // Models
 sidebarService, alertModalService, progressbarService, tdAnalyzerService, typeSmellsDetailsService){
	var thisCtrl = this;
	
	$scope.currentPage = sidebarService.getCurrentPage();
	$scope.filtered.repository = sidebarService.getRepository();
	$scope.filtered.commits = sidebarService.getCommits();
	$scope.filtered.committers = sidebarService.getCommitters();
	$scope.filtered.debts = sidebarService.getDebts();
	
	$scope.tagTypesSelect = sidebarService.getTagTypesSelect();
	$scope.tagTypeSelect = sidebarService.getTagTypeSelect();
	$scope.types = [];
	$scope.typesAnalized = 0;
	$scope.currentDesignDebt = null;
	$scope.currentCodeDebt = null;

	$scope.tdItems = JSON.parse(localStorage.getItem('tdItems'));

	thisCtrl.selectView = function(view) {
		$scope.currentPage = view;
		sidebarService.setCurrentPage(view);
	}

	thisCtrl.processTdItems = function() {
		// $scope.tdItems = tdAnalyzerService.getTdItemsStorage();
		// $scope.tdItemFiltered = $scope.tdItems;
	}

	function getLongMethodMetrics(method, metrics) {
		var metricsNew = [];
		for (k in metrics) {
			for (h in metrics[k].methods) {
				if (metrics[k].methods[h].method == method && metrics[k].methods[h].value > 0) {
					metricsNew.push({name: metrics[k].name, value: metrics[k].methods[h].value})
				}
			}
		}
		return metricsNew;
	}

	/**
	 * Format date to yyyy-mm-dd 00:00:00
	 * @param  date
	 * @return date object
	 */
	function formatDate(date) {
		var d = new Date(date),
				month = '' + (d.getMonth() + 1),
				day = '' + d.getDate(),
				year = d.getFullYear();
		if (month.length < 2) 
			month = '0' + month;
		if (day.length < 2) 
			day = '0' + day;
		return new Date([year, month, day].join('-')+' 00:00:00');
	}

	$scope.getDuplicatedCodeDebts = function(callback) {
		var tagsNames = [];
		for (c in $scope.filtered.tags) {
			tagsNames.push($scope.filtered.tags[c].name);
		}
		$http.get('TagAnalysisServlet', {params:{"action": "getAllByTagsName", "tagsName": '['+tagsNames.join(',')+']'}})
		.success(function(data) {
			callback(data);
		})
	}
	
	thisCtrl.getDebts = function(list) {
		var debts = [];
		if (typeof list.abstract_types != 'undefined' && list.abstract_types.length > 0) {
			// looking for long methods
			if (list.abstract_types[0].codesmells) {
				for (i in list.abstract_types[0].codesmells) {
					var codesmells = list.abstract_types[0].codesmells[i];
					if (codesmells.name == 'LONG_METHOD') { 
						for (j in codesmells.methods) {
							if (codesmells.methods[j].value == true) {
								debts.push({
									type: 'Code Debt',
									name: codesmells.name,
									method: codesmells.methods[j].method
								});
							}
						}
					}
				}
			}
		}
		return debts;
	}

	$scope.loadCurrentDebts = function(type) {
		var tdList = type.abstract_types[0].technicaldebts;
		for (var i = 0; i < tdList.length; i++) {
			if (tdList[i].name == 'Code Debt') {
				$scope.currentCodeDebt = tdList[i];
			}
			if (tdList[i].name == 'Design Debt') {
				$scope.currentDesignDebt = tdList[i];
			}
		}
	}

	$scope.getDiffs = function(commitRef) {
		var added = 0,
				removed = 0;
		for (i in $scope.filtered.commits) {
			if ($scope.filtered.commits[i]._id == commitRef.commit) {
				var commit = $scope.filtered.commits[i];
				for (y in commit.diffs) {
					var diffs = commit.diffs[y];
					if (diffs.path == commitRef.file) {
						added += commit.diffs[y].lines_added;
						removed += commit.diffs[y].lines_removed;
						break;
					}
				}
				break;
			}
		}
		return {
			"added": added,
			"removed": removed
		}
	}

	$scope.getCommitAndCommitter = function(commitId) {
		var commit = null;
		var committer = null;
		for (x in $scope.filtered.commits) {
			if ($scope.filtered.commits[x]._id == commitId) {
				commit = $scope.filtered.commits[x];
				for (y in $scope.filtered.committers) {
					if (commit.committer.email == $scope.filtered.committers[y].email) {
						committer = $scope.filtered.committers[y];
						break;
					}
				}
				break;
			}
		}
		return {commit: commit, committer: committer}
	}

	$scope.showSuccessModal = function() {
		alertModalService.setMessage("All the Debts Were Confirmed Sucessfully!");
		$('#alertModal').modal('show');
	}

	$scope.updateViewByTag = function() {
		$scope.types = [];
		thisCtrl.processTdItems();
	}

	$scope.showTypeSmellsDetails = function(type) {
		typeSmellsDetailsService.setType(type);
		$('#typeSmellsDetails').modal('show');
	}

	$scope.analyzeDebts = function() {
		var analyze = true;
		if ($scope.filtered.repository == null) {
		  alertModalService.setMessage("Please Select a Project!");
		  analyze = false;
		} 
		else if ($scope.filtered.tags == null) {
		  alertModalService.setMessage("Please Select What Tags Will be Analyzed!");
      analyze = false;
		} 
		if (analyze) {
			progressbarService.setTitle('Analyzing Repository');
			$('#progressBarModal').modal('show');
			tdAnalyzerService.analyzeIt($scope.filtered.tags, function() {
				$('#progressBarModal').modal('hide');

				 // JSON.parse(localStorage.getItem('typeData'));
				thisCtrl.processTdItems();
			})
		} else {
			$('#alertModal').modal('show');
		}
	}

	if ($scope.currentPage == 'tdanalyzer') {
		if ($scope.filtered.tags.length > 0 && localStorage.getItem('tdItems') != null) {
			thisCtrl.processTdItems();
		}
		$('#filter-identificationdate').daterangepicker();
	}
});