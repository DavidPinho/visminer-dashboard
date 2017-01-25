angular.module('homeApp').component('tdItemModal', {
  controller: function ($scope, tdItemModalService) {
		$scope.tabTd = true;
		$scope.tabMetrics = false;
    var tdItemIndex = null;
		var tdItem;
		$(".modal").on('show.bs.modal', function(e) {
		  centerModals($(this));
		});
		$(window).on('resize', centerModals);
  	$scope.$on('tdItemModalLoadObj', function(event, data){
      $scope.activeTab('td');
      tdItem = data.tdItem;
  		tdItemIndex = data.i;
  		$scope.tdItemModalObj = JSON.parse(JSON.stringify(tdItem)); // clone the object
      $scope.tdItemModalObj.commit.date = moment($scope.tdItemModalObj.commit.date).format('l');
      console.log('tdItemModalObj', tdItemModalObj)
      // $scope.tdItemModalObj.file = $scope.getFileName($scope.tdItemModalObj.file);
  	});

  	$scope.activeTab = function(tabId) {
  		$scope.tabTd = false;
			$scope.tabMetrics = false;
  		switch(tabId) {
  			case 'metrics':
					$scope.tabMetrics = true;
  				break;
				default:
					$scope.tabTd = true;
  				break;
  		}
  	}

  	$scope.save = function() {
  		tdItem.type = $scope.tdItemModalObj.type;
  		tdItem.tdIndicator = $scope.tdItemModalObj.tdIndicator;
  		tdItem.notes = $scope.tdItemModalObj.notes;
      tdItem.isTdItem = $scope.tdItemModalObj.isTdItem;
  		tdItem.intentional = $scope.tdItemModalObj.intentional;
  		tdItem.principal = $scope.tdItemModalObj.principal;
  		tdItem.interestAmount = $scope.tdItemModalObj.interestAmount;
      tdItem.interestProbability = $scope.tdItemModalObj.interestProbability;
  		tdItem.estimates = $scope.tdItemModalObj.estimates;
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

  },
  templateUrl: 'app/components/td-item-modal/tdItemModal.html',
});
