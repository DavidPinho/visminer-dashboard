homeApp = angular.module('homeApp');

homeApp.controller('TDManagementCtrl', function($scope, $http,
 $route, sidebarService, tdTimelineService){
	var thisCtrl = this;
	var DebtStatus = Object.freeze({UNEVALUATED: 0, TODO: 1, DOING: 2, DONE: 3});

	$scope.currentPage = sidebarService.getCurrentPage();
	$scope.master = null;
	$scope.types = [];
	$scope.todoCode = [];
	$scope.todoDesign = [];
	$scope.doingCode = [];
	$scope.doingDesign = [];
	$scope.doneCode = [];
	$scope.doneDesign = [];
	$scope.filtered.repository = sidebarService.getRepository();
	$scope.filtered.debts = sidebarService.getDebts();

	thisCtrl.selectView = function(view) {
		$scope.currentPage = view;
		sidebarService.setCurrentPage(view);
	}

	thisCtrl.loadMaster = function() {
		if ($scope.filtered.repository) {
			var repositoryId = $scope.filtered.repository._id;
			$http.get('TreeServlet', {params:{"action": "getMaster", "repositoryId": repositoryId}})
			.success(function(data) {
				console.log('loading master: ', data);	 
				$scope.master = data;
				thisCtrl.loadTypes($scope.master._id);
			});
		}	
	}

	thisCtrl.loadMaster();

	thisCtrl.loadTypes = function(tagId) {
		$http.get('TypeServlet', {params:{"action": "getAllByTree", "treeId": tagId}})
		.success(function(data) {
			console.log('found', data.length, ' types'); 
			for (var i = 0; i < data.length; i++) {
				var hasDebt = thisCtrl.loadCards(data[i]);
				if (hasDebt) {
					$scope.types.push(data[i]);				
				}				
			}
		});
	}

	thisCtrl.loadCards = function(type) {
		var hasDebt = false;
		if (type.abstract_types[0]) {
			var debtsList = type.abstract_types[0].technicaldebts;
			if (debtsList.length > 0) {
				for (var j = 0; j < debtsList.length; j++) {
					if (debtsList[j].name == 'Code Debt' && $.inArray('CODE', $scope.filtered.debts) > -1 && debtsList[j].value && debtsList[j].status > 0) {
						hasDebt = true;
						switch (debtsList[j].status) {
							case DebtStatus.TODO: 
								$scope.todoCode.push(type);
								break;
							case DebtStatus.DOING: 
								$scope.doingCode.push(type);
								break;
							case DebtStatus.DONE: 
								$scope.doneCode.push(type);
								break;	
						}
					}
					if (debtsList[j].name == 'Design Debt'  && $.inArray('DESIGN', $scope.filtered.debts) > -1 && debtsList[j].value && debtsList[j].status > 0) {
						hasDebt = true;
						switch (debtsList[j].status) {
							case DebtStatus.TODO: 
								$scope.todoDesign.push(type);
								break;
							case DebtStatus.DOING: 
								$scope.doingDesign.push(type);
								break;
							case DebtStatus.DONE: 
								$scope.doneDesign.push(type);
								break;	
						}
					}
				}			
			}
		}	
		return hasDebt;
	}

	$scope.updateDebtStatus = function(type, debt, status) {
		$http.get('TypeServlet', {params:{"action": "updateDebtStatus",
		 "commitId": type.commit, "fileId": type.file_hash, "debt": debt, "status": status}})
		.success(function() {
			$route.reload();					
		});
	}

	$scope.convertDate = function(commitDate) {
		return moment(new Date(commitDate.$date)).format('DD/MM/YYYY');
	}

	$scope.showTdTimeline = function(type) {
		tdTimelineService.setType(type);
		$('#tdTimelineModal').modal('show');
	}
});