angular.module('homeApp').component('typeSmells', {
	controller: function ($scope, $http) {
		var thisCtrl = this;

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
