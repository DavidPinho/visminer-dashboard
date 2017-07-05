homeApp.service('tdIndicatorsService', function($rootScope){
	this.setType = function(type, timelineList){
		$rootScope.$broadcast("showIndicatorsChart", type, timelineList);
	}
});