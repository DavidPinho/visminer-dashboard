homeApp.service('tdManagerService', function($http){

	this.manageIt = function(tags, callback){
		var tagsIds = [];
		var tagsNames = [];
		for (i in tags) {
			tagsIds.push("'"+tags[i].id+"'");
			tagsNames.push(tags[i].name);
		}

		$http.post('http://private-1608d-visminer.apiary-mock.com/td/analyzer', {})
		.then(function successCallback(res) {
			console.log('res', res)
			toastr["success"]("Analyzed")
			callback();
		}, function errorCallback(response) {
			toastr["error"]("Error on analyzer this project")
		});
	}

});