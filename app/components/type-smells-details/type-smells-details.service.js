homeApp.service('typeSmellsDetailsService', function($rootScope){
	
	this.setType = function(type){
		$rootScope.$broadcast("showTypeSmellsDetails", type);
	}

});