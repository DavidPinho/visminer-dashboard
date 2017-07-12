homeApp = angular.module('homeApp');

homeApp.controller('TDManagementCtrl', function ($scope, $http,
	$route, sidebarService, tdTimelineService) {
	var thisCtrl = this;
	var DebtStatus = Object.freeze({ UNEVALUATED: 0, TODO: 1, DOING: 2, DONE: 3 });

	$scope.currentPage = sidebarService.getCurrentPage();
	$scope.master = null;
	$scope.types = [];
	$scope.todoCode = [];
	$scope.todoDesign = [];
	$scope.todoDefect = [];
	$scope.todoTest = [];
	$scope.todoRequirement = [];
	$scope.doingCode = [];
	$scope.doingDesign = [];
	$scope.doneCode = [];
	$scope.doneDesign = [];
	$scope.filtered.repository = sidebarService.getRepository();
	$scope.filtered.debts = sidebarService.getDebts();

	thisCtrl.selectView = function (view) {
		$scope.currentPage = view;
		sidebarService.setCurrentPage(view);
	}

	thisCtrl.loadMaster = function () {
		if ($scope.filtered.repository) {
			var repositoryId = $scope.filtered.repository._id;
			$http.get('../../data/rm_references.json')
				.success(function (data) {
					console.log('Loading master');
					for (var i in data) {
						var tag = data[i];
						if (tag.repository === repositoryId && tag.path === "refs/heads/master") {
							$scope.master = tag;
							thisCtrl.loadTypes($scope.master.name);
							break;
						}
					}
				});
		}
	}

	thisCtrl.loadMaster();

	thisCtrl.loadTypes = function (tagName) {
		$http.get('../../data/rm_technical_code_debt.json')
			.success(function (data) {
				for (var i = 0; i < data.length; i++) {
					if (data[i].reference_name === tagName && data[i].debts.length > 0) {
						thisCtrl.loadCards(data[i]);
						$scope.types.push(data[i]);
					}
				}
			});
	}

	thisCtrl.loadCards = function (type) {
		console.log("load cards");
		var debtsList = type.debts;
		if (debtsList.length > 0) {
			for (var j = 0; j < debtsList.length; j++) {
				if (debtsList[j] === 'CODE_DEBT') {
					$scope.todoCode.push(type);
				}
				if (debtsList[j] === 'DESIGN_DEBT') {
					$scope.todoDesign.push(type);
				}
				if (debtsList[j] === 'TEST_DEBT') {
					$scope.todoTest.push(type);
				}
				if (debtsList[j] === 'DEFECT_DEBT') {
					$scope.todoDefect.push(type);
				}
				if (debtsList[j] === 'REQUIREMENT_DEBT') {
					$scope.todoRequirement.push(type);
				}
			}
		}
	}

	$scope.updateDebtStatus = function (type, debt, status) {
		$http.get('TypeServlet', {
			params: {
				"action": "updateDebtStatus",
				"commitId": type.commit, "fileId": type.file_hash, "debt": debt, "status": status
			}
		})
			.success(function () {
				$route.reload();
			});
	}

	$scope.convertDate = function (commitDate) {
		return moment(new Date(commitDate.substring(0,10))).format('DD/MM/YYYY');
	}

	$scope.showTdTimeline = function (type) {
		tdTimelineService.setType(type);
		$('#tdTimelineModal').modal('show');
	}

	$scope.substringFileName = function (fileName) {
		return fileName.substring(fileName.lastIndexOf("/") + 1, fileName.lastIndexOf(".java"));
	}
});