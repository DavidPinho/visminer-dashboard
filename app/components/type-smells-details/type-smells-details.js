angular.module('homeApp').component('typeSmells', {
	controller: function ($scope, $http) {
		$scope.hasGodClass = function (type) {
			if (type) {
				console.log("Tem type");
				if (type.indicators.GOD_CLASS && type.metrics) {
					console.log("Tem metrics");
					var metrics = type.metrics;
					for (var i = 0; i < metrics.length; i++) {
						switch (metrics[i].metric) {
							case "ATFD":
								$scope.ATFD = metrics[i].value;
								break;
							case "TCC":
								$scope.TCC = metrics[i].value;
								break;
							case "WMC":
								$scope.WMC = metrics[i].value;
								break;
						}
					}
					return true;
				}
			}
		}

		//loadMetricsGodClass(type);


		function loadMetricsGodClass(type) {
			$http.get('../../data/rm_references.json')
				.success(function (types) {
					console.log("aa");
					//for (var j = 0; j < types.length; j++) {
					/*
					if (types[j].commit === type.filestate && types[j].filename === type.filename) {
						var metrics = types[j].classes[0].metrics;
						for (var i = 0; i < metrics.length; i++) {
							switch (metrics[i].metric) {
								case "ATFD":
									$scope.ATFD = metrics[i].value;
									break;
								case "TCC":
									$scope.TCC = metrics[i].value;
									break;
								case "WMC":
									$scope.WMC = metrics[i].value;
									break;
							}
						}
					}
					*/
					//}
					console.log("bb");
				});
		}

		/*
		$scope.hasLongMethod = function (type) {
			if (type) {
				var codeSmellList = type.abstract_types[0].codesmells;
				for (var i = 0; i < codeSmellList.length; i++) {
					if (codeSmellList[i].name == "Long Method") {
						$scope.longMethods = [];
						var methods = codeSmellList[i].methods;
						for (var j = 0; j < methods.length; j++) {
							if (methods[j].value) {
								$scope.longMethods.push(methods[j].method);
							}
						}
					}
				}
			}
			return $scope.longMethods;
		}*/

		$scope.substringFileName = function (fileName) {
			if (fileName)
				return fileName.substring(fileName.lastIndexOf("/") + 1, fileName.lastIndexOf(".java"));
		}

		var modalVerticalCenterClass = ".modal";
		$(".modal").on('show.bs.modal', function (e) {
			centerModals($(this));
		});
		$(window).on('resize', centerModals);

		$scope.$on('showTypeSmellsDetails', function (event, type) {
			$scope.type = type;
		});
	},
	templateUrl: 'components/type-smells-details/type-smells-details.html',
});
