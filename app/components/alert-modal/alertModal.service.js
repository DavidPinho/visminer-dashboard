homeApp.service('alertModalService', function($rootScope){
	
	this.setMessage = function(message){
		$rootScope.$broadcast("updateModalMessage", message);
	}

});