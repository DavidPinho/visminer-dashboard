homeApp.controller('HomeCtrl', function ($scope, $timeout, $http,
 $sessionStorage, $location, $route, Repository, TagTime, Committer, sidebarService, alertModalService) {
  // This controller instance
  var thisCtrl = this;

  // Data collections
  $scope.commits = [];
  $scope.committers = [];
  $scope.repositories = [];
  $scope.tags = [];
  $scope.tagTypesSelect = sidebarService.getTagTypesSelect();
  $scope.tagTypeSelect = sidebarService.getTagTypeSelect();
  $scope.committerEvolution = [];
  $scope.currentPage = "tdanalyzer";
  $scope.durationProgress = 1000;

  $scope.filtered = {
  	repository: null,
  	commits: [],
  	committers: [],
  	tags: [],
  	debts: ["CODE", "DESIGN"],
  }
  
  // Load all repositories
	thisCtrl.repositoriesLoad = function() { 
		console.log('repositoriesLoad');
		$http.get('RepositoryServlet', {params:{"action": "getAll"}})
		.success(function(data) {
			console.log('found', data.length, 'repositories');
			var contributors = [];
			for (i in data) {
				for (x in data[i].contributors) {
					contributors.push(new Committer(data[i].contributors[x].name, data[i].contributors[x].email, null));
				}
				$scope.repositories.push(new Repository(data[i]._id, data[i].name, data[i].description, data[i].path, contributors));
			}
		});
	}

	thisCtrl.repositoriesLoad();

	thisCtrl.selectView = function(view) {
		$scope.currentPage = view;
		sidebarService.setCurrentPage(view);
	}

	thisCtrl.selectRepository = function(repository) {
		$scope.filtered.repository = repository;
		sidebarService.setRepository(repository);
		$route.reload();
		thisCtrl.tagsLoad(repository);
	}

	// Load all tags (versions)
	thisCtrl.tagsLoad = function(repository) { 
		console.log('tagsLoad=', repository.id);
		$http.get('ReferenceServlet', {params:{"action": "getCustomTagsByRepository", "repositoryId": repository.id}})
		.success(function(data) {
			console.log('found', data.length, 'tags');
			var tags = [];
			for(i in data) {
				var alias, type;
				var order = data[i].full_name.split('-');
				if (data[i].full_name.indexOf('MONTH') > -1) {
					alias = order[1]+'-'+(order[order.length-1].length == 1 ? '0'+order[order.length-1] : order[order.length-1]);
					order = order[1]+(order[order.length-1].length == 1 ? '0'+order[order.length-1] : order[order.length-1]);
					type = 'month';
				} else if (data[i].full_name.indexOf('TRIMESTER') > -1) {
					alias = order[1]+'-'+order[order.length-1];
					order = order[0]+order[order.length-1];
					type = 'trimester';
				} else if (data[i].full_name.indexOf('SEMESTER') > -1) {
					alias = order[1]+'-'+order[order.length-1];
					order = order[0]+order[order.length-1];
					type = 'semester';
				} else {
					alias = order[1];
					order = order[0];
					type = 'year';
				}
				tags.push(new TagTime(data[i]._id, data[i].name, alias, order, type, repository, data[i].commits));
			}
			$scope.tags = tags;
			sidebarService.setTags(tags);
			thisCtrl.commitsLoad(repository.id);
		});
	}

	thisCtrl.filterTagTypes = function(tagTypeSelect) {
		$scope.filtered.tags = [];
		$scope.tagTypeSelect = tagTypeSelect;
	}

	// Load all commits from all trees
	thisCtrl.commitsLoad = function(repositoryId) { 
		console.log('commitsLoad');
		$http.get('CommitServlet', {params:{"action": "getAllByRepository", "repositoryId": repositoryId}})
		.success(function(data) {
			console.log('found', data.length, 'commits');
			$scope.commits = data;
			sidebarService.setCommits(data);
			for (var i in data) {
				$scope.committerEvolution.push({
					commit: data[i]._id,
					committer: data[i].committer,
					date: new Date(data[i].commit_date.$date),
					diffs: data[i].diffs	
				})
				var index = $.inArray(data[i].committer, $scope.committers);
  			if (index == -1) {
  				$scope.committers.push(data[i].committer);
  				thisCtrl.commitsLoadAvatars(data[i].committer);
		  	}
			}
		});
  }

  // Try to catch avatar at github
  var commitsLoadAvatarsEmails = [];
	thisCtrl.commitsLoadAvatars = function(committer) {
		if (commitsLoadAvatarsEmails.indexOf(committer.email) == -1) {
			commitsLoadAvatarsEmails.push(committer.email);
			$http.get('https://api.github.com/search/users?q='+committer.email)
			.success(function(result) {
				committer.avatar = (result.total_count == 1) ? result.items[0].avatar_url : null;
				sidebarService.addCommitter(committer);
			});
		}
	}

  thisCtrl.selectDebt = function(debt) {
  	var index = $.inArray(debt, $scope.filtered.debts);
  	if (index > -1) {
      $scope.filtered.debts.splice(index, 1);
  	} else {
      $scope.filtered.debts.push(debt);
  	}
  	$route.reload();
  }

  thisCtrl.hasTagTypeSelected = function(tag){
    return ($scope.tagTypeSelect.toLowerCase() == tag.type);
	};

	thisCtrl.analyzeDebts = function() {
		var analyze = true;
		if ($scope.filtered.repository == null) {
		  alertModalService.setMessage("Please Select a Repository!");
		  analyze = false;
		} 
		else if ($scope.filtered.tags == null) {
		  alertModalService.setMessage("Please Select What Version Will be Analyzed!");
      analyze = false;
		} 
		else if ($scope.filtered.debts.length == 0) {
		  alertModalService.setMessage("Please Select What Technical Debts Will be Analyzed!");
		  analyze = false;
		}
		if (analyze) {
			$('#progressBarModal').modal('show');
			$('#progressBarModal').on('hidden.bs.modal', function(e) {
				thisCtrl.selectView('tdanalyzer');
  	   	$location.path("/tdanalyzer");
        $route.reload();
  		});
		} else {
			$('#alertModal').modal('show');
		}
	}
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
	var Commit = function (id, date, diffs) {
	  this.id = id;
	  this.date = date;
	  this.diffs = diffs;
	};
	return Commit;
})

homeApp.factory('Committer', function() {
	var Committer = function (name, email, avatar) {
	  this.name = name;
	  this.email = email;
	  this.avatar = avatar;
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
  var LongMethod = function(method, file, package) {
  	this.name = 'Long Method';
  	this.location = 'Method';
  	this.method = method;
  	this.file = file;
  	this.package = package;
  };
  return LongMethod;
})

homeApp.factory('TDItem', function(Commit, Committer) {
	var TDItem = function (repository, commit, committer, type, tdIndicator, isTdItem, principal, interestAmount, interestProbability, notes) {
		if (typeof repository != 'undefined') {
			if (!(commit instanceof Commit)) {
				throw new Error('commit need to be a instance of Commit class');
			}
			if (!(committer instanceof Committer)) {
				throw new Error('committer need to be a instance of Committer class');
			}
		}
	  this.repository = repository;
	  this.commit = commit;
	  this.committer = committer;
	  this.type = type;
	  this.tdIndicator = tdIndicator;
	  this.isTdItem = isTdItem;
	  this.principal = principal;
	  this.interestAmount = interestAmount;
	  this.interestProbability = interestProbability;
	  this.notes = notes;
	};
	return TDItem;
})