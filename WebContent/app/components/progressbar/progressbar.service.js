homeApp.service('progressbarService', function($rootScope){
	this.setDuration = function(duration){
		$rootScope.$broadcast("setProgressbarDuration", duration);
	}
	this.setTitle = function(title){
		$rootScope.$broadcast("setProgressbarTitle", title);
	}
});