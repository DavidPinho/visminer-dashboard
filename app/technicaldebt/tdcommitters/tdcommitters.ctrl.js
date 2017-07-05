homeApp = angular.module('homeApp');

homeApp.controller('TDCommittersCtrl', function ($scope, $timeout, $http, $sessionStorage, modalService, sidebarService) {
	$scope.currentPage = sidebarService.getCurrentPage();
	$scope.filtered.repository = sidebarService.getRepository();
	$scope.filtered.tags = sidebarService.getTags();
	$scope.filtered.committers = sidebarService.getCommitters();
	$scope.filtered.debts = sidebarService.getDebts();
	
	$scope.dateMin = new Date();
	$scope.dateMax = new Date();
	$scope.dateMinSelected = new Date();
	$scope.dateMaxSelected = new Date();

	$scope.filtered.classes = [];
	$scope.filtered.technicalDebts = [];
	$scope.filtered.lines = 0;

	// Because the commits are loaded after this
	$scope.$watch('commits', function () { 
		if ($scope.filtered.commits.length > 0) {
			commitsFilter($scope.dateMinSelected, $scope.dateMaxSelected);
		}
	});

	initialize = function () {
  	if ($scope.commits.length > 0) {
  		// $sessionStorage.period = '';
		  if (typeof $sessionStorage.period == 'undefined' || $sessionStorage.period == '') {
		  	var dateMin = '';
		  	var dateMax = '';
		  	for (i in $scope.commits) {
		  		var date = new Date($scope.commits[i].date.$date);
		  		if (dateMin == '') {
		  			dateMin = date;
		  		}
		  		if (dateMax == '') {
		  			dateMax = date;
		  		}
		  		if (date < dateMin) {
		  			dateMin = date;
		  		}
		  		else if (date > dateMax) {
		  			dateMax = date;
		  		}
		  	}
		    $sessionStorage.period = {
		      min: dateMin,
		      minSelected: dateMin,
		      max: dateMax,
		      maxSelected: dateMax
		    }
		  } else {
		  	$sessionStorage.period.min = new Date($sessionStorage.period.min);
		  	$sessionStorage.period.minSelected = new Date($sessionStorage.period.minSelected);
		  	$sessionStorage.period.max = new Date($sessionStorage.period.max);
		  	$sessionStorage.period.maxSelected = new Date($sessionStorage.period.maxSelected);
		  }
		  $scope.dateMin = new Date($sessionStorage.period.min);
			$scope.dateMax = new Date($sessionStorage.period.max);
			$scope.dateMinSelected = new Date($sessionStorage.period.minSelected);
			$scope.dateMaxSelected = new Date($sessionStorage.period.maxSelected);
			initSlider();
			commitsFilter($scope.dateMinSelected, $scope.dateMaxSelected);
  	}
	}

	// =========================================================================
	// FILTERS
	// =========================================================================
	commitsFilter = function(dateIni, dateEnd) {
		$scope.filtered.commits = [];
		$scope.filtered.committers = [];
		for (i in $scope.commits) {
			var commitDate = new Date($scope.commits[i].date.$date);
			if (commitDate >= dateIni && commitDate <= dateEnd) {
				$scope.filtered.commits.push($scope.commits[i]);
				var committerFound = false;
				for (x in $scope.filtered.committers) {
					if ($scope.filtered.committers[x].email == $scope.commits[i].committer.email) {
						committerFound = true;
						continue;
					}
				}
				if (committerFound == false) {
					$scope.filtered.committers.push($scope.commits[i].committer);
				}
			}
		}
		$scope.filtered.commits = $scope.filtered.commits;
		committersFilter();
  }

	committersFilter = function() {
		var committers = [];
		for (i in $scope.filtered.commits) {
			var memberExist = false;
			for (x in committers) {
				if (committers[x].email == $scope.filtered.commits[i].committer.email) {
					memberExist = true;
				}
			}
			if (memberExist == false) {
				committers.push({
					email: $scope.filtered.commits[i].committer.email,
					name: $scope.filtered.commits[i].committer.message
				});
			}
		}
		$scope.filtered.committers = committers;
		classesFilter();
	}

	classesFilter = function() {
		var classes = [];
		for (i in $scope.types) {
			for (x in $scope.filtered.commits) {
				if ($scope.types[i].commit == $scope.filtered.commits[x].name) {
					classes.push($scope.types[i]);
					continue;
				}
			}
		}
		$scope.filtered.classes = classes;
		linesFilter();
	}

	linesFilter = function() {
		var lines = 0;
		for (i in $scope.filtered.commits) {
			for (j in $scope.filtered.commits[i].files) {
				lines += $scope.filtered.commits[i].files[j].linesAdded + $scope.filtered.commits[i].files[j].linesRemoved;
			}
		}
		$scope.filtered.lines = lines;
	}

	technicalDebtsFilter = function() {
		$scope.codeSmells = [];
		$scope.codeSmellsQtty = 0;
		for (i in $scope.commits) {
			for (x in $scope.commits[i].classes) {
				for (z in $scope.commits[i].classes[x].codeSmells) {
					var codeSmells = $scope.commits[i].classes[x].codeSmells[z];
					var codeSmellExist = false;
					for (c in $scope.codeSmells) {
						if ($scope.codeSmells[c].name == codeSmells.name) {
							codeSmellExist = true;
							break;
						}
					}
					if (codeSmellExist == false) {
						$scope.codeSmells.push(codeSmells);
					}
				}
			}
		}
		for (i in $scope.codeSmells) {
			$scope.codeSmellsQtty += $scope.codeSmells[i].qtty;
		}
	}

	// =========================================================================
	// SLIDER
	// =========================================================================
	initSlider = function() {
		if (typeof $scope.sliderLoaded == 'undefined' || $scope.sliderLoaded == false) {
			$("#slider").dateRangeSlider({
				symmetricPositionning: true,
				bounds: {
					min: $scope.dateMin,
					max: $scope.dateMax
				},
				defaultValues:{
					min: $scope.dateMinSelected,
					max: $scope.dateMaxSelected
				},
				range: {
				//min: {days: 1}
				},
				formatter:function(val){
					var days = val.getDate(),
						month = val.getMonth() + 1,
						year = val.getFullYear();
					return month + "/" + days + "/" + year;
				}
			}).bind("valuesChanging", function(e, data){
				$timeout(function(){ 
					$scope.sliderValueChanged(data); 
				});
			});
		}
		$scope.sliderLoaded = true;
	};

	$scope.sliderValueChanged = function(data) {
    $sessionStorage.period.minSelected = data.values.min;
    $sessionStorage.period.maxSelected = data.values.max;
		$scope.dateMinSelected = data.values.min;
		$scope.dateMaxSelected = data.values.max;
		commitsFilter($scope.dateMinSelected, $scope.dateMaxSelected);
	};

	$scope.changeSliderValues = function(min, max){
		$("#slider").dateRangeSlider("values", min, max);
	};

	$scope.changeSliderBounds = function(min, max){
		$("#slider").dateRangeSlider("bounds", min, max);
	};

	// =========================================================================
	// COMMITTERS
	// =========================================================================
	$scope.getCommitterAvatar = function(name) {
		console.log('name', name);
		console.log('name', name);
	}

	loadTypes = function(tagId) {
		$http.get('TypeServlet', {params:{"action": "getAllByTree", "treeId": tagId}})
		.success(function(data) {
			console.log('found', data.length, 'types'); 
			$scope.types = data;
			initialize();
		});
	}

	loadTypes('3f5ff60cb266caf8a92182372696d0a741e059f4');
});