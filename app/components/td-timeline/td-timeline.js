angular.module('homeApp').component('tdTimeline', {
  controller: function($scope, $http, sidebarService, tdIndicatorsService) {

    $scope.$on('showTdTimeline', function(event, type){
      $scope.type = type;
      $http.get('TypeServlet', {params:{"action": "getTypeTimeline", 
                 "idRepository": $scope.type.repository, "fileHash": $scope.type.file_hash}})
       .success(function(data) {
          $scope.dataList = data.sort(function(item1, item2) {
                      return item1.tag.commits.length - item2.tag.commits.length;
                    });;         
          buildTimelineList();
       });
    }); 

    function buildTimelineList() {
      $scope.timelineList = [];
      for (var i = 0; i < $scope.dataList.length; i++) {
        var item = $scope.dataList[i];
        $scope.timeline = {
          tag: item.tag,
          type: item.type,
          tagName: item.tag.name,
        }
        var s = item.type.name;
        var debtsList = item.type.abstract_types[0].technicaldebts;  
        $scope.timeline.codeDebt = hasDebt(debtsList, 'Code Debt');
        $scope.timeline.designDebt = hasDebt(debtsList, 'Design Debt');
        $scope.timeline.noDebt = !$scope.timeline.codeDebt && !$scope.timeline.designDebt;
        $scope.timeline.state = identifyState($scope.timeline, i);

        $scope.timelineList.push($scope.timeline);
      }
    }

     function hasDebt(debtsList, debt) {
      var hasDebt = false;
      if (debtsList.length > 0) {
        for (var j = 0; j < debtsList.length; j++) {
          if (debtsList[j].name == debt && debtsList[j].value) {
            hasDebt = true;
          }
        }       
      }
      return hasDebt;
     }

     function identifyState(timelineObject, index) {
       if (!index) {
         if (timelineObject.codeDebt || timelineObject.designDebt) {
          return "ADD";
         }
         return "NONE";
       }

       var previousTimelineObject = $scope.timelineList[index - 1];
       if ((previousTimelineObject.codeDebt && !timelineObject.codeDebt) 
           || (previousTimelineObject.designDebt && !timelineObject.designDebt)) {
        return "REMOVE";
       } 

       if ((!previousTimelineObject.codeDebt && timelineObject.codeDebt) 
           || (!previousTimelineObject.designDebt && timelineObject.designDebt)) {
        return "ADD";
       } 

       return "NONE";
     }

     $scope.showTdIndicators = function() {
      $('#tdTimelineModal').modal('hide');
      tdIndicatorsService.setType($scope.type, $scope.timelineList);
      $('#tdIndicatorsModal').modal('show');
     }

   },
  templateUrl: 'app/components/td-timeline/td-timeline.html',
});