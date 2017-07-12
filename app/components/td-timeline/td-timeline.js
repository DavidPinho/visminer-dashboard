angular.module('homeApp').component('tdTimeline', {
  controller: function ($scope, $http, sidebarService, tdIndicatorsService) {
    $scope.$on('showTdTimeline', function (event, type) {
      $scope.type = type;
      $scope.dataList = [];
      $scope.tags = [];

      $http.get('../../data/rm_references.json')
        .success(function (data) {
          $scope.tags = data.sort(function (tag1, tag2) {
            return tag1.commits.length - tag2.commits.length;
          });

          $http.get('../../data/rm_technical_code_debt.json')
            .success(function (data) {
              for (var j = 0; j < $scope.tags.length; j++) {
                for (var i = 0; i < data.length; i++) {
                  if (data[i].filename === $scope.type.filename && data[i].reference_name === $scope.tags[j].name) {
                    item = {
                      'type': data[i],
                      'tag': $scope.tags[j]
                    };
                    $scope.dataList.push(item);
                  }
                }
              }
              buildTimelineList();
            });
        });
    });

    function buildTimelineList() {
      console.log($scope.dataList);
      $scope.timelineList = [];
      for (var i = 0; i < $scope.dataList.length; i++) {
        var item = $scope.dataList[i];
        $scope.timeline = {
          tag: item.tag,
          type: item.type,
          tagName: item.tag.name,
        }
        var debtsList = item.type.debts;
        $scope.timeline.codeDebt = hasDebt(debtsList, 'CODE_DEBT');
        $scope.timeline.designDebt = hasDebt(debtsList, 'DESIGN_DEBT');
        $scope.timeline.defectDebt = hasDebt(debtsList, 'DEFECT_DEBT');
        $scope.timeline.testDebt = hasDebt(debtsList, 'TEST_DEBT');
        $scope.timeline.requirementDebt = hasDebt(debtsList, 'REQUIREMENT_DEBT');
        $scope.timeline.noDebt = !$scope.timeline.codeDebt && !$scope.timeline.designDebt && !$scope.timeline.testDebt && !$scope.timeline.defectDebt && !$scope.timeline.requirementDebt;
        $scope.timeline.state = identifyState($scope.timeline, i);

        $scope.timelineList.push($scope.timeline);
      }
    }

    function hasDebt(debtsList, debt) {
      return debtsList.indexOf(debt) > -1;
    }

    function identifyState(timelineObject, index) {
      if (!index) {
        if (timelineObject.codeDebt || timelineObject.designDebt || timelineObject.defectDebt || timelineObject.testDebt || timelineObject.requirementDebt) {
          return "ADD";
        }
        return "NONE";
      }

      var previousTimelineObject = $scope.timelineList[index - 1];
      if ((previousTimelineObject.codeDebt && !timelineObject.codeDebt)
        || (previousTimelineObject.designDebt && !timelineObject.designDebt)
        || (previousTimelineObject.defectDebt && !timelineObject.defectDebt)
        || (previousTimelineObject.testDebt && !timelineObject.testDebt)
        || (previousTimelineObject.requirementDebt && !timelineObject.requirementDebt)) {
        return "REMOVE";
      }

      if ((!previousTimelineObject.codeDebt && timelineObject.codeDebt)
        || (!previousTimelineObject.designDebt && timelineObject.designDebt)
        || (!previousTimelineObject.defectDebt && timelineObject.defectDebt)
        || (!previousTimelineObject.testDebt && timelineObject.testDebt)
        || (!previousTimelineObject.requirementDebt && timelineObject.requirementDebt)) {
        return "ADD";
      }

      return "NONE";
    }

    $scope.showTdIndicators = function () {
      $('#tdTimelineModal').modal('hide');
      tdIndicatorsService.setType($scope.type, $scope.timelineList);
      $('#tdIndicatorsModal').modal('show');
    }

    $scope.substringFileName = function (fileName) {
      if (fileName)
        return fileName.substring(fileName.lastIndexOf("/") + 1, fileName.lastIndexOf(".java"));
    }

  },
  templateUrl: 'components/td-timeline/td-timeline.html',
});