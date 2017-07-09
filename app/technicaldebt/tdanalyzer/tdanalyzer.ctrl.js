homeApp = angular.module('homeApp');

homeApp.controller('TDAnalyzerCtrl', function ($scope, $http, $location, $route,
	sidebarService, alertModalService, typeSmellsDetailsService) {
	var thisCtrl = this;

	$scope.currentPage = sidebarService.getCurrentPage();
	$scope.filtered.repository = sidebarService.getRepository();
	$scope.filtered.tags = sidebarService.getTags();
	$scope.filtered.committers = sidebarService.getCommitters();
	$scope.filtered.debts = sidebarService.getDebts();
	$scope.selectedTag = $scope.filtered.tags[0];
	$scope.types = [];
	$scope.currentDesignDebt = null;
	$scope.currentCodeDebt = null;

	thisCtrl.selectView = function (view) {
		$scope.currentPage = view;
		sidebarService.setCurrentPage(view);
	}

	thisCtrl.loadTypes = function () {
		if ($scope.selectedTag) {
			// TODO We have to use the tag id instead of the tag name here
			var tagName = $scope.selectedTag.name;
			$http.get('../../data/rm_technical_code_debt.json')
				.success(function (data) {
					for (var i = 0; i < data.length; i++) {
						if (data[i].reference_name === tagName && data[i].debts.length > 0) {
							$scope.types.push(data[i]);
						}
					}
				});
		}
	}

	thisCtrl.loadTypes();

	$scope.loadCurrentDebts = function (type) {
		$scope.currentCodeDebt = null;
		$scope.currentDesignDebt = null;
		var tdList = type.debts;
		for (var i = 0; i < tdList.length; i++) {
			if (tdList[i] == 'CODE_DEBT') {
				$scope.currentCodeDebt = tdList[i];
			}
			if (tdList[i] == 'DESIGN_DEBT') {
				$scope.currentDesignDebt = tdList[i];
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

	$scope.confirmAllDebtsByTag = function (treeId) {
		$scope.showSuccessModal();
		// FIXME This part depends on each debt be an object instead of just a string
		/*
		$http.get('TypeServlet', { params: { "action": "confirmAllDebtsByTag", "treeId": treeId } })
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

	$scope.updateViewByTag = function () {
		$scope.types = [];
		thisCtrl.loadTypes();
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