homeApp.controller('HomeCtrl', function ($scope, $timeout, $http,
 $sessionStorage, $location, $route, sidebarService, alertModalService) {
  // This controller instance
  var thisCtrl = this;
  // Data collections
  $scope.commits = [];
  $scope.committers = [];
  $scope.repositories = [];
  $scope.tags = [];
  $scope.committerEvolution = [];
  $scope.currentPage = "tdevolution";
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
			$scope.repositories = data;
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
		thisCtrl.tagsLoad(repository._id);
	}

	// Load all tags (versions)
	thisCtrl.tagsLoad = function(repositoryId) { 
		console.log('tagsLoad=', repositoryId);

		$http.get('TreeServlet', {params:{"action": "getAllTagsAndMaster", "repositoryId": repositoryId}})
		.success(function(data) {
			console.log('found', data.length, 'tags');
			if (data) {
				$scope.tags = data.sort(function(tag1, tag2) {
												return tag1.commits.length - tag2.commits.length;
											});
			}	
				thisCtrl.commitsLoad(repositoryId);
		});
	}

	// Load all commits from all trees
	thisCtrl.commitsLoad = function(repositoryId) { 
		console.log('commitsLoad');

		$http.get('CommitServlet', {params:{"action": "getAllByRepository", "repositoryId": repositoryId}})
		.success(function(data) {
			console.log('found', data.length, 'commits');
			$scope.commits = data;
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
  				sidebarService.addCommitter(data[i].committer);
		  	}
			}
		});
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

	thisCtrl.analyzeDebts = function() {
		var analyze = true;
		if ($scope.filtered.repository == null) {
		  alertModalService.setMessage("Please Select a Repository!");
		  analyze = false;
		} 
		else if ($scope.filtered.tags.length == 0) {
		  alertModalService.setMessage("Please Select What Versions Will be Analyzed!");
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