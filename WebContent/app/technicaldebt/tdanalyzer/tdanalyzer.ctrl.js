homeApp = angular.module('homeApp');

homeApp.controller('TDAnalyzerCtrl', function($scope, $http, $location, $route,
 TDItem, Commit, Committer, DuplicatedCode, LongMethod, // Models
 sidebarService, alertModalService, tdAnalyzerService, tdItemModalService, typeSmellsDetailsService){
	var thisCtrl = this;
	
	$scope.currentPage = sidebarService.getCurrentPage();
	$scope.filtered.repository = sidebarService.getRepository();
	$scope.filtered.commits = sidebarService.getCommits();
	$scope.filtered.committers = sidebarService.getCommitters();
	$scope.filtered.debts = sidebarService.getDebts();
	sidebarService.setTdItems([]);
	$scope.tagTypesSelect = sidebarService.getTagTypesSelect();
  $scope.tagTypeSelect = sidebarService.getTagTypeSelect();
  $scope.tdItems = sidebarService.getTdItems();
	$scope.tdItemFiltered = $scope.tdItems;
	$scope.types = [];
	$scope.typesAnalized = 0;
	$scope.currentDesignDebt = null;
	$scope.currentCodeDebt = null;

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

	$scope.tdItemEdit = function(tdItem) {
		tdItemModalService.loadObj(tdItem);
		$('#tdItemModal').modal('show');
	}

	thisCtrl.selectView = function(view) {
		$scope.currentPage = view;
		sidebarService.setCurrentPage(view);
	}

	thisCtrl.loadTypes = function() {
		var typeData = tdAnalyzerService.getTypeData();
		var duplicatedCodeData = tdAnalyzerService.getDuplicatedCodeData();
		for (a in typeData) {
			var diffs = [];
			var info = $scope.getCommitAndCommitter(typeData[a].commit);
			var commit = info.commit;
			var committer = info.committer;
			var debts = thisCtrl.getDebts(typeData[a]);
			for (x in debts) {
				$scope.tdItems.push(
					new TDItem(
						typeData[a].repository, 
						new Commit(commit._id, formatDate(commit.commit_date.$date), {linesAdded: commit.diffs[0].lines_added, linesRemoved: commit.diffs[0].lines_removed, type: commit.diffs[0].type}), 
						(typeof committer != 'undefined') ? new Committer(committer.name, committer.email, committer.avatar) : new Committer(),
						'Code Debt',
						new LongMethod(debts[x].method, getLongMethodMetrics(debts[x].method, typeData[a].abstract_types[0].metrics), typeData[a].filename, typeData[a].package),
						true,
						null,
						null,
						null,
						null
					)
				);
			}
			$scope.typesAnalized++;
		}
		for (b in duplicatedCodeData) {
			if (duplicatedCodeData[b].code_smells.length > 0 && duplicatedCodeData[b].code_smells[0].occurrences.length > 0) {
				var info = $scope.getCommitAndCommitter(duplicatedCodeData[b].commit);
				var commit = info.commit;
				var committer = info.committer;
				var files = [];
				for (z in duplicatedCodeData[b].code_smells[0].occurrences) {
					files.push({
			  		one: {
			  			name: duplicatedCodeData[b].code_smells[0].occurrences[z].files[0].file_name,
			  			line: duplicatedCodeData[b].code_smells[0].occurrences[z].files[0].begin_line+' ~ '+duplicatedCodeData[b].code_smells[0].occurrences[z].files[0].end_line,
			  		},
			  		two: {
			  			name: duplicatedCodeData[b].code_smells[0].occurrences[z].files[1].file_name,
			  			line: duplicatedCodeData[b].code_smells[0].occurrences[z].files[1].begin_line+' ~ '+duplicatedCodeData[b].code_smells[0].occurrences[z].files[1].end_line,
			  		},
			  		code: duplicatedCodeData[b].code_smells[0].occurrences[z].source_code_slice
					})
				}
				$scope.tdItems.push(
					new TDItem(
						duplicatedCodeData[b].repository, 
						new Commit(commit._id, formatDate(commit.commit_date.$date), {linesAdded: commit.diffs[0].lines_added, linesRemoved: commit.diffs[0].lines_removed, type: commit.diffs[0].type}), 
						(typeof committer != 'undefined') ? new Committer(committer.name, committer.email, committer.avatar) : new Committer(),
						'Code Debt',
						new DuplicatedCode(files),
						true,
						null,
						null,
						null,
						null
					)
				);
			}
		}
		sidebarService.setTdItems($scope.tdItems);
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
		thisCtrl.loadTypes();
	}

	$scope.showTypeSmellsDetails = function(type) {
		typeSmellsDetailsService.setType(type);
		$('#typeSmellsDetails').modal('show');
	}

	if ($scope.currentPage == 'tdanalyzer') {
		thisCtrl.loadTypes();
		// $('.sidebar-toggle').click();
		$('#filter-identificationdate').daterangepicker();
		// $("#tditem-datatable").DataTable({
		// 	"ordering": false
		// });
	}
});