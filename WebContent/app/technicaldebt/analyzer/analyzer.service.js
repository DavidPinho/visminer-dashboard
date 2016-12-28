homeApp.service('tdAnalyzerService', function($http, Committer, TDItem){

	this.tdItems = [];

	this.getTdItems = function(tags, callback){
		localStorage.setItem('tdItems', JSON.stringify([]));
		var tagsIds = [];
		var tagsNames = [];
		for (i in tags) {
			tagsIds.push("'"+tags[i].id+"'");
			tagsNames.push(tags[i].name);
		}

		$http.get('https://private-anon-1c43e3196a-visminer.apiary-mock.com/td/analyzer', {})
		.then(function successCallback(res) {
			console.log('res', res)
			toastr["success"]("Found "+res.data.length+" td items")
			var tdItems = [];
			for (i in res.data) {
				tdItems.push(
					new TDItem(
						null,
						null,
						new Committer(res.data[i].occuredBy.name, res.data[i].occuredBy.email, null),
						res.data[i].type,
						res.data[i].indicator,
						res.data[i].className,
						res.data[i].package,
						res.data[i].tdItem,
						res.data[i].principal,
						res.data[i].interestAmount,
						res.data[i].interestProbability,
						res.data[i].estimates,
						res.data[i].notes
					)
				);
			}
			localStorage.setItem('tdItems', JSON.stringify(tdItems));
			console.log('getTdItems tdItems', tdItems)
			callback();
		}, function errorCallback(response) {
			toastr["error"]("Error on analyzer this project")
		});
	}

	this.getTdItemsStorage = function(){
		return JSON.parse(localStorage.getItem('tdItems'));
	}

});