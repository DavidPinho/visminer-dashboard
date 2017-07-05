homeApp.service('tdTimelineService', function($rootScope){
	this.setType = function(type){
		$rootScope.$broadcast("showTdTimeline", type);
	}
});