homeApp = angular.module('homeApp');

homeApp.controller('TDAnalyzerCtrl', function ($scope, $http, $location, $route,
	sidebarService, alertModalService, typeSmellsDetailsService) {
	var thisCtrl = this;

	$scope.currentPage = sidebarService.getCurrentPage();
	$scope.filtered.repository = sidebarService.getRepository();
	$scope.filtered.references = sidebarService.getReferences();
	$scope.filtered.debts = sidebarService.getDebts();
	$scope.selectedReference = $scope.filtered.references[0];
	$scope.files = [];

	$scope.currentDesignDebt = null;
	$scope.currentCodeDebt = null;
	$scope.currentDefectDebt = null;
	$scope.currentTestDebt = null;
	$scope.currentRequirementDebt = null;

	thisCtrl.selectView = function (view) {
		$scope.currentPage = view;
		sidebarService.setCurrentPage(view);
	}

	thisCtrl.loadFiles = function () {
		if ($scope.selectedReference) {
			$scope.files = $scope.selectedReference.files;
		}
	}

	thisCtrl.loadFiles();


	$scope.loadCurrentDebts = function (file) {
		$scope.currentCodeDebt = null;
		$scope.currentDesignDebt = null;
		$scope.currentDefectDebt = null;
		$scope.currentTestDebt = null;
		$scope.currentRequirementDebt = null;

		var tdList = file.debts;
		for (var i = 0; i < tdList.length; i++) {
			var name = tdList[i].name;
			var value = tdList[i].value;
			if (name == 'CODE_DEBT' && value != -1) {
				$scope.currentCodeDebt = tdList[i];
			} else if (name == 'DESIGN_DEBT' && value != -1) {
				$scope.currentDesignDebt = tdList[i];
			} else if (name == 'DEFECT_DEBT' && value != -1) {
				$scope.currentDefectDebt = tdList[i];
			} else if (name == 'REQUIREMENT_DEBT' && value != -1) {
				$scope.currentRequirementDebt = tdList[i];
			} else if (name == 'TEST_DEBT' && value != -1) {
				$scope.currentTestDebt = tdList[i];
			}
		}
	}

	$scope.confirmSingleDebt = function (commitId, fileId, debt) {
		$http.get('TypeServlet', {
			params: {
				"action": "confirmSingleDebt",
				"commitId": commitId, "fileId": fileId, "debt": debt
			}
		})
			.success(function () {
				console.log('Debt Confirmed: ', debt);
			});
	}

	$scope.removeSingleDebt = function (commitId, fileId, debt) {
		$http.get('TypeServlet', {
			params: {
				"action": "removeSingleDebt",
				"commitId": commitId, "fileId": fileId, "debt": debt
			}
		})
			.success(function () {
				console.log('Debt Confirmed: ', debt);
			});
	}

	$scope.confirmAllDebtsByReference = function (treeId) {
		$scope.showSuccessModal();
		// FIXME This part depends on each debt be an object instead of just a string
		/*
		$http.get('TypeServlet', { params: { "action": "confirmAllDebtsByReference", "treeId": treeId } })
			.success(function () {
				$route.reload();
				$scope.showSuccessModal();
				console.log('All debts from tree ', treeId, ' have been Confirmed.');
			});
		*/
	}

	$scope.confirmAllDebtsByRepository = function (repositoryId) {
		$scope.showSuccessModal();
		// FIXME This part depends on each debt be an object instead of just a string
		/*
		$http.get('TypeServlet', { params: { "action": "confirmAllDebtsByRepository", "repositoryId": repositoryId } })
			.success(function () {
				$route.reload();
				$scope.showSuccessModal();
				console.log('All debts from repository ', repositoryId, ' have been Confirmed.');
			});
		*/
	}

	$scope.showSuccessModal = function () {
		alertModalService.setMessage("All the Debts Were Confirmed Sucessfully!");
		$('#alertModal').modal('show');
	}

	$scope.updateViewByReference = function () {
		$scope.files = [];
		thisCtrl.loadFiles();
	}

	$scope.showTypeSmellsDetails = function (type) {
		$http.get('../../data/rm_direct_code_analysis.json')
			.success(function (types) {
				for (var j = 0; j < types.length; j++) {
					if (types[j].commit === type.filestate && types[j].filename === type.filename) {
						type.metrics = types[j].classes[0].metrics;
						break;
					}
				}
				console.log("Setando o type");
				thisCtrl.loadMetrics(type);
				typeSmellsDetailsService.setType(type);
				$('#typeSmellsDetails').modal('show');
			});
	}

	thisCtrl.loadMetrics = function (type) {
		console.log("Entrou no load metrivs");
		if (type) {
			console.log("É TYPE")
			var metrics = type.metrics;
			console.log(metrics);
			for (var i = 0; i < metrics.length; i++) {
				switch (metrics[i].metric) {
					case "ATFD":
						type.ATFD = metrics[i].value;
						break;
					case "TCC":
						type.TCC = metrics[i].value;
						break;
					case "WMC":
						type.WMC = metrics[i].value;
						break;
				}
				switch (metrics[i].name) {
					case "LAA":
						var methods = metrics[i].methods;
						for (var j = 0; j < methods.length; j++) {
							if (methods[j].value < 0.33) {
								type.LAA = methods[j].value;
								type.LAAMethodName = methods[j].method;
								break;
							}
						}
						break;
					case "FDP":
						var methods = metrics[i].methods;
						console.log(metrics[i]);
						for (var j = 0; j < methods.length; j++) {
							console.log(methods[j]);
							if (methods[j].value < 7) {
								type.FDP = methods[j].value;
								type.FDPMethodName = methods[j].method;
								break;
							}
						}
						break;
				}
			}
		}
	}

	$scope.substringFileName = function (fileName) {
		return fileName.substring(fileName.lastIndexOf("/") + 1, fileName.lastIndexOf(".java"));
	}
});