angular.module('homeApp').component('tdItemModal', {
  controller: function ($scope, $rootScope, $http, progressbarService, tdItemModalService) {
    var tdItem;
    var tdItemIndex = null;
    $(".modal").on('show.bs.modal', function(e) {
      centerModals($(this));
    });
    $(window).on('resize', centerModals);
    $scope.$on('tdItemModalLoadObj', function(event, data){
      $scope.committers = [];
      $scope.selectedContributors = [];
      $scope.selectedTdIndicators = [];
      $scope.tabTd = true;
      $scope.tabMetrics = false;
      $scope.tabHistory = false;
      $scope.tdIndicators = [];
      var tdIndicatorsName = [
	      'Code Without Standards',
	      'Slow Algorithm',
	      'Multithread Correctness',
	      'Automatic Static Analysis Issues',
	      // Code Smells
	      'God Class',
	      'Code Complexity',
	      'Dispersed Coupling',
	      'Duplicated Code',
	      'Brain Method',
	      'Larger Class',
      ];
      tdIndicatorsName.sort();
      
      $scope.activeTab('td');
      tdItem = data.tdItem;
      $scope.committers = $rootScope.filtered.repository.contributors;
      tdItemIndex = data.i;
      $scope.tdItemModalObj = JSON.parse(JSON.stringify(tdItem)); // clone the object
      var fileName = $scope.tdItemModalObj.fileName.split('/');
      $scope.tdItemModalObj.fileName = fileName[fileName.length-1];
      $scope.tdItemModalObj.commit.date = moment($scope.tdItemModalObj.commit.date).format('l')+" "+moment($scope.tdItemModalObj.commit.date).format('LT')
      
      // Set tdIndicators name and qtty
      for (i in tdIndicatorsName) {
    	  var qtty = 0;
    	  for (x in $scope.tdItemModalObj.tdIndicators) {
    		  if (tdIndicatorsName[i] == $scope.tdItemModalObj.tdIndicators[x].name) {
    			  qtty = $scope.tdItemModalObj.tdIndicators[x].qtty;
    			  break;
	          }
    	  }
    	  $scope.tdIndicators.push({name:tdIndicatorsName[i], qtty:qtty});
      }
      
      // Set the selected contributors
      for (i in $scope.committers) {
        for (x in $scope.tdItemModalObj.contributors) {
          if ($scope.committers[i].email == $scope.tdItemModalObj.contributors[x].email) {
            $scope.selectedContributors.push($scope.committers[i]);
          }
        }
      }
    });

    $scope.activeTab = function(tabId) {
      $scope.tabTd = false;
      $scope.tabMetrics = false;
      $scope.tabHistory = false;
      switch(tabId) {
        case 'metrics':
          $scope.tabMetrics = true;
          $scope.loadMetrics($scope.tdItemModalObj.fileHash, $scope.tdItemModalObj.commit.id);
          break;
        case 'history':
          $scope.tabHistory = true;
          break;
        default:
          $scope.tabTd = true;
          break;
      }
    }

    $scope.save = function() {
      var tdIndicatorsSelected = [];
      for (i in $scope.tdIndicators) {
    	  if ($scope.tdIndicators[i].qtty > 0) {
    		  tdIndicatorsSelected.push($scope.tdIndicators[i]);
    	  }
      }
      tdItem.estimates = $scope.tdItemModalObj.estimates;
      tdItem.interestAmount = $scope.tdItemModalObj.interestAmount;
      tdItem.interestProbability = $scope.tdItemModalObj.interestProbability;
      tdItem.isAnalyzed = $scope.tdItemModalObj.isAnalyzed;
      tdItem.isIntentional = $scope.tdItemModalObj.isIntentional;
      tdItem.isTdItem = $scope.tdItemModalObj.isTdItem;
      tdItem.notes = $scope.tdItemModalObj.notes;
      tdItem.contributors = $scope.selectedContributors;
      tdItem.principal = $scope.tdItemModalObj.principal;
      tdItem.tdIndicators = tdIndicatorsSelected;
      tdItem.type = $scope.tdItemModalObj.type;
      // update tdItems
      var tdItems = JSON.parse(localStorage.getItem('tdItems'));
      tdItems[tdItemIndex] = tdItem;
      localStorage.setItem('tdItems', JSON.stringify(tdItems));
      $('#tdItemModal').modal('hide');
    }

    $scope.checkIsTdItemValues = function() {
      if ($scope.tdItemModalObj.isTdItem == false) {
        $scope.tdItemModalObj.principal = null;
        $scope.tdItemModalObj.interestAmount = null;
        $scope.tdItemModalObj.interestProbability = null;
      }
    }

    $scope.getFileName = function(location) {
      var loc = location.split('/');
      return loc[loc.length-1];
    }
    
    $scope.loadMetrics = function(filehash, commitId) {
    	$scope.metrics = {
			'direct': [],
			'indirect': []
		};
    	progressbarService.setTitle('Loading Metrics');
		$('#progressBarModal').modal('show');
		
		$http.get('rest/directcode/get-metrics?fileHash='+filehash+'&commit='+commitId)
		.then(function successCallback(resDirectMetrics) {
			$http.get('rest/indirectcode/get-metrics?fileHash='+filehash+'&commit='+commitId)
			.then(function successCallback(resIndirectMetrics) {
				$('#progressBarModal').modal('hide');
				if (typeof resDirectMetrics.data[0] != 'undefined' && typeof resDirectMetrics.data[0].classes != 'undefined') {
					$scope.metrics.direct = resDirectMetrics.data[0].classes.metrics;
				}
				if (typeof resIndirectMetrics.data[0] != 'undefined' && typeof resIndirectMetrics.data[0].codesmells_threshholds != 'undefined') {
					$scope.metrics.indirect = resIndirectMetrics.data[0].codesmells_threshholds;
				} 
				setTimeout(function(){ 
					$('#progressBarModal').modal('hide');
					toastr["success"]("Found "+(resDirectMetrics.data.length+resIndirectMetrics.data.length)+" metrics");
				}, 1000);
			}, function errorCallback(response) {
				$('#progressBarModal').modal('hide');
				toastr["error"]("Error on load indirect metrics");
			});
		}, function errorCallback(response) {
			$('#progressBarModal').modal('hide');
			toastr["error"]("Error on load direct metrics");
		});
		
    }

  },
  templateUrl: 'app/components/td-item-modal/tdItemModal.html',
});
