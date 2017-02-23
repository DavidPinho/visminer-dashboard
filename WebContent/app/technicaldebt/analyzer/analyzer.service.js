homeApp.service('tdAnalyzerService', function($http){
	this.analyzeIt = function(repositoryId, tagId, callback){
		$http.get('rest/mining/td?repositoryId='+repositoryId+'&tag='+tagId)
		.then(function successCallback(res) {
			toastr["success"]("Analyzed")
			callback();
		}, function errorCallback(response) {
			toastr["error"]("Error on analyzer this project")
		});
	}
});