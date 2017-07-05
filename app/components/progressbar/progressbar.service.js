homeApp.service('progressbarService', function($rootScope){

	this.setDuration = function(duration){
		$rootScope.$broadcast("setProgressbarDuration", duration);
	}
	
});