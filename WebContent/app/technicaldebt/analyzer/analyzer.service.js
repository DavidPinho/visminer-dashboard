homeApp.service('tdAnalyzerService', function($http){
	this.analyzeIt = function(repositoryId, tagId, callback){
		console.log('repositoryId', repositoryId)
		console.log('tagId', tagId)
		$http.get('rest/mining/td?repositoryId='+repositoryId+'&tag='+tagId)
		.then(function successCallback(res) {
			console.log('res', res)
			toastr["success"]("Analyzed")
			callback();
		}, function errorCallback(response) {
			toastr["error"]("Error on analyzer this project")
		});
	}
});