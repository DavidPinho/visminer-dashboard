angular.module('homeApp').component('typeSmells', {
  controller: function ($scope) {
			$scope.hasGodClass = function(type) {
				if (type) {
					var codeSmellList = type.abstract_types[0].codesmells;
					for (var i = 0; i < codeSmellList.length; i++) {
						if (codeSmellList[i].name == "God Class" && codeSmellList[i].value) {
							loadMetricsGodClass(type);
							return true;
						}
					}
				}
			}

			function loadMetricsGodClass(type) {
				var metrics = type.abstract_types[0].metrics;
				for (var i = 0; i < metrics.length; i++) {
					switch(metrics[i].name) {
						case "ATFD":
							$scope.ATFD = metrics[i].accumulated;
							break;
						case "TCC":
							$scope.TCC = metrics[i].accumulated;
							break;
						case "WMC":
							$scope.WMC = metrics[i].accumulated;
							break;						
					}
				}
			}

			$scope.hasLongMethod = function(type) {
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
			}

  		var modalVerticalCenterClass = ".modal";
			$(".modal").on('show.bs.modal', function(e) {
			  centerModals($(this));
			});
			$(window).on('resize', centerModals);
			
			$scope.$on('showTypeSmellsDetails', function(event, type){
	  		$scope.type = type;
	  	}); 
  },
  templateUrl: 'app/components/type-smells-details/type-smells-details.html',
});
