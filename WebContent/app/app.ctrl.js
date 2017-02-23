homeApp.controller('HomeCtrl', function ($rootScope, $scope, $timeout, $http,
 $sessionStorage, $location, $route, Repository, TagTime, Committer, progressbarService, sidebarService, alertModalService) {
  // This controller instance
  var thisCtrl = this;

  // Data collections
  $scope.commits = [];
  $scope.committers = [];
  $rootScope.repositories = [];
  $rootScope.tags = [];
  $scope.tagTypesSelect = sidebarService.getTagTypesSelect();
  $scope.tagTypeSelect = sidebarService.getTagTypeSelect();
  $scope.committerEvolution = [];
  $scope.currentPage = "dashboard";
  $scope.durationProgress = 1000;

  $rootScope.filtered = {
  	repository: null,
  	commits: [],
  	committers: [],
  	tags: [],
  	debts: ["CODE", "DESIGN"],
  }
  
  // Load all repositories
	thisCtrl.repositoriesLoad = function() {
	  progressbarService.setTitle('Loading repositories');
	  $('#progressBarModal').modal('show');
		$http.get('rest/repository/get-repositories')
		.then(function successCallback(res) {
			var contributors = [];
			for (i in res.data) {
				for (x in res.data[i].contributors) {
					contributors.push(new Committer(res.data[i].contributors[x].name, res.data[i].contributors[x].email, null));
				}
				contributors.sort(dynamicSort("name"));
				$rootScope.repositories.push(new Repository(res.data[i]._id.$oid, res.data[i].name, res.data[i].description, res.data[i].path, contributors));
			}
			$('#progressBarModal').modal('hide');
			toastr["success"]("Found "+res.data.length+" repositories")
		}, function errorCallback(response) {
			$('#progressBarModal').modal('hide');
			toastr["error"]("Error on load repositories");
		});
	}
  
  	// Load references by repository
	thisCtrl.referenceLoad = function(repositoryId) { 
		$rootScope.tags = [];
		$rootScope.filtered.tags = [];
		progressbarService.setTitle('Loading references');
		$('#progressBarModal').modal('show');
		$http.get('rest/repository/get-references?repositoryId='+repositoryId)
		.then(function successCallback(res) {
			for (i in res.data) {
				$rootScope.tags.push({'name': res.data[i].name});
			}
			$('#progressBarModal').modal('hide');
			toastr["success"]("Found "+res.data.length+" references")
		}, function errorCallback(response) {
			$('#progressBarModal').modal('hide');
			toastr["error"]("Error on load references");
		});
		
	}

	thisCtrl.selectView = function(view) {
		$scope.currentPage = view;
		sidebarService.setCurrentPage(view);
	}

	thisCtrl.selectRepository = function(repository) {
		$rootScope.filtered.repository = repository;
		sidebarService.setRepository(repository);
		$route.reload();
		thisCtrl.referenceLoad(repository.id);
	}

	thisCtrl.refreshRepositories = function(repositories) {
		$rootScope.repositories = repositories;
	}

	thisCtrl.filterTagTypes = function(tagTypeSelect) {
		$rootScope.filtered.tags = [];
		$scope.tagTypeSelect = tagTypeSelect;
	}

	
  // Try to catch avatar at github
  var commitsLoadAvatarsEmails = [];
	thisCtrl.commitsLoadAvatars = function(committer) {
		if (commitsLoadAvatarsEmails.indexOf(committer.email) == -1) {
			commitsLoadAvatarsEmails.push(committer.email);
			$http.get('https://api.github.com/search/users?q='+committer.email, {
				// headers: {'username': '025f0b75918bad0724eac4fb4e7472593ec4b103'}
			})
			.success(function(result) {
				committer.avatar = (result.total_count == 1) ? result.items[0].avatar_url : null;
				sidebarService.addCommitter(committer);
			})
			.error(function() {
				committer.avatar = 'assets/imgs/nophoto.jpg';
				sidebarService.addCommitter(committer);
			});
		}
	}

  thisCtrl.selectDebt = function(debt) {
  	var index = $.inArray(debt, $rootScope.filtered.debts);
  	if (index > -1) {
  		$rootScope.filtered.debts.splice(index, 1);
  	} else {
  		$rootScope.filtered.debts.push(debt);
  	}
  	$route.reload();
  }

  thisCtrl.hasTagTypeSelected = function(tag){
    return ($scope.tagTypeSelect.toLowerCase() == tag.type);
  };
  
  thisCtrl.repositoriesLoad();

});
// Models
homeApp.factory('Repository', function() {
	var Repository = function (id, name, description, path, contributors) {
	  this.id = id;
	  this.name = name;
	  this.description = description;
	  this.path = path;
	  this.contributors = contributors;
	};
	return Repository;
})

homeApp.factory('TagTime', function() {
	var TagTime = function (id, name, alias, order, type, repository, commits) {
	  this.id = id;
	  this.name = name;
	  this.alias = alias;
	  this.order = order;
	  this.type = type;
	  this.commits = commits;
	  this.repository = repository;
	};
	return TagTime;
})

homeApp.factory('Commit', function() {
	var Commit = function (id, date) {
	  this.id = id;
	  this.date = date;
	};
	return Commit;
})

homeApp.factory('Committer', function() {
	var Committer = function (name, email) {
	  this.name = name;
	  this.email = email;
	};
	return Committer;
})

homeApp.factory('DuplicatedCode', function() {
  var DuplicatedCode = function(files) {
  	this.name = 'Duplicated Code';
  	this.location = 'File';
  	this.files = files;
  };
  return DuplicatedCode;
})

homeApp.factory('LongMethod', function() {
  var LongMethod = function(method, metrics, file, package) {
  	this.name = 'Long Method';
  	this.location = 'Method';
  	this.method = method;
  	this.metrics = metrics;
  	this.file = file;
  	this.package = package;
  };
  return LongMethod;
})

homeApp.factory('TDItem', function(Commit, Committer) {
	var TDItem = function (id, repository, commit, contributors, type, tdIndicators, fileName, fileHash, package, isChecked, isTdItem, isIntentional, principal, interestAmount, interestProbability, estimates, notes) {
	  this.id = id;
	  this.repository = repository;
	  this.commit = commit;
	  this.contributors = contributors;
	  this.type = type;
	  this.tdIndicators = tdIndicators;
	  this.fileName = fileName;
	  this.fileHash = fileHash;
	  this.package = package;
	  this.isChecked = isChecked;
	  this.isTdItem = isTdItem;
	  this.isIntentional = isIntentional;
	  this.principal = principal;
	  this.interestAmount = interestAmount;
	  this.interestProbability = interestProbability;
	  this.estimates = estimates;
	  this.notes = notes;
	};
	return TDItem;
})

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-bottom-right",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}