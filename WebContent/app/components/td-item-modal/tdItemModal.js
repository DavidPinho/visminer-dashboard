angular.module('homeApp').component('tdItemModal', {
  controller: function ($scope, tdItemModalService) {
    var tdItem;
    var tdItemIndex = null;
    $(".modal").on('show.bs.modal', function(e) {
      centerModals($(this));
    });
    $(window).on('resize', centerModals);
    $scope.$on('tdItemModalLoadObj', function(event, data){
      $scope.committers = [];
      $scope.selectedOccurredBy = [];
      $scope.selectedTdIndicators = [];
      $scope.tabTd = true;
      $scope.tabMetrics = false;
      $scope.tabHistory = false;
      $scope.tdIndicators = [
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
      $scope.tdIndicators.sort();
      
      $scope.activeTab('td');
      tdItem = data.tdItem;
      $scope.committers = JSON.parse(JSON.stringify(data.committers));
      tdItemIndex = data.i;
      $scope.tdItemModalObj = JSON.parse(JSON.stringify(tdItem)); // clone the object
      var fileName = $scope.tdItemModalObj.fileName.split('/');
      $scope.tdItemModalObj.fileName = fileName[fileName.length-1];
      $scope.tdItemModalObj.commit.date = moment($scope.tdItemModalObj.commit.date).format('l')+" "+moment($scope.tdItemModalObj.commit.date).format('LT')
      // Set the selected tdIndicatores
      for (i in $scope.tdIndicators) {
        for (x in $scope.tdItemModalObj.tdIndicators) {
          if ($scope.tdIndicators[i] == $scope.tdItemModalObj.tdIndicators[x]) {
            $scope.selectedTdIndicators.push($scope.tdIndicators[i]);
          }
        }
      }
      // Set the selected occurredBy
      for (i in $scope.committers) {
        for (x in $scope.tdItemModalObj.occurredBy) {
          if ($scope.committers[i].email == $scope.tdItemModalObj.occurredBy[x].email) {
            $scope.selectedOccurredBy.push($scope.committers[i]);
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
      tdItem.estimates = $scope.tdItemModalObj.estimates;
      tdItem.intentional = $scope.tdItemModalObj.intentional;
      tdItem.interestAmount = $scope.tdItemModalObj.interestAmount;
      tdItem.interestProbability = $scope.tdItemModalObj.interestProbability;
      tdItem.isTdItem = $scope.tdItemModalObj.isTdItem;
      tdItem.notes = $scope.tdItemModalObj.notes;
      console.log('$scope.selectedOccurredBy', $scope.selectedOccurredBy)
      tdItem.occurredBy = $scope.selectedOccurredBy;
      tdItem.principal = $scope.tdItemModalObj.principal;
      tdItem.tdIndicators = $scope.selectedTdIndicators;
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

  },
  templateUrl: 'app/components/td-item-modal/tdItemModal.html',
});
