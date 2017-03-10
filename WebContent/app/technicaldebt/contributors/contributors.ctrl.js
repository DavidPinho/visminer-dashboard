homeApp = angular.module('homeApp');

homeApp.controller('TDContributorsCtrl', function ($scope, $rootScope, $http, $q, progressbarService, sidebarService) {

  $scope.currentPage = sidebarService.getCurrentPage();
  $scope.filtered.repository = sidebarService.getRepository();
  
  $scope.load = function(repositoryId, tagId){
    progressbarService.setTitle('Loading TD Items');
    $('#progressBarModal').modal('show');
    $http.get('rest/td-management/find?repositoryId='+repositoryId+'&tag='+tagId+'&is_checked=True&is_td=True', {})
    .then(function successCallback(res) {
      $scope.tdItems = res.data;
      toastr["success"]("Found "+$scope.tdItems.length+" td items indicators")
      $('#progressBarModal').modal('hide');
      $scope.generateGraph();
    }, function errorCallback(response) {
      toastr["error"]("Error on load this project")
    });
  }

  $scope.graphData = [];
  $scope.tdItems = [];
  $scope.tdIndicators = [];
  $scope.byIntentions = [];
  $scope.byPrincipal = [];
  var tdItemsInRange = [];
  var updateSetTimeout;

  var byPrincipalChart = Highcharts.chart('graphByPrincipal', {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Principal by contributors'
    },
    xAxis: {
      type: 'category',
      labels: {
        rotation: -45,
        style: {
          fontSize: '13px',
          fontFamily: 'Verdana, sans-serif'
        }
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Value of principal'
      }
    },
    legend: {
        enabled: false
    },
    tooltip: {
        pointFormat: 'Total of principal: <b>{point.y}</b>'
    },
    series: [{
      name: 'Population',
      data: [],
      dataLabels: {
        enabled: true,
        rotation: -90,
        color: '#FFFFFF',
        align: 'right',
        format: '{point.y}',
        y: 10, // 10 pixels down from the top
        style: {
          fontSize: '13px',
          fontFamily: 'Verdana, sans-serif'
        }
      }
    }]
  });

  var byIndicatorChart = Highcharts.chart('graphByIndicator', {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    title: {
      text: 'Global'
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          style: {
            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
          }
        }
      }
    },
    series: [{
      name: 'TD Items',
      colorByPoint: true,
      data: []
    }]
  });
  
  var byIntentionChart = Highcharts.chart('graphByIntention', {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    title: {
      text: 'Global'
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          style: {
            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
          }
        }
      }
    },
    series: [{
      name: 'TD Items',
      colorByPoint: true,
      data: []
    }]
  });

  $scope.graphOptions = {
    chart: {
      type: 'lineWithFocusChart',
      height: 300,
      margin : {
        top: 20,
        right: 20,
        bottom: 60,
        left: 40
      },
      duration: 50,
      xAxis: {
        axisLabel: 'Period',
        tickFormat: function(d){
          return d3.time.format('%d-%b-%y')(new Date(d))
        }
      },
      x2Axis: {
        tickFormat: function(d){
          return d3.time.format('%b-%y')(new Date(d))
        }
      },
      yAxis: {
        axisLabel: 'Qtty',
        tickFormat: function(d){
          return d3.format(',f')(d);
        },
        rotateYLabel: false
      },
      y2Axis: {
        tickFormat: function(d){
          return '$' + d3.format(',.2f')(d)
        }
      },
      callback: function(chart){
        chart.dispatch.on('brush', function (brushExtent) {
          $scope.updateTimeout(Math.floor(brushExtent.extent[0]), Math.floor(brushExtent.extent[1]));
        });
      }
    }
  };

  /**
   * Timeout to call the update function
   * @param  {[type]} dateIni [description]
   * @param  {[type]} dateEnd [description]
   * @return {[type]}         [description]
   */
  $scope.updateTimeout = function(dateIni, dateEnd) {
    clearTimeout(updateSetTimeout);
    updateSetTimeout = setTimeout(function(){ 
      $scope.updateDependentData(dateIni, dateEnd);
      $scope.$apply();
    }, 500);
  }

  $scope.updateDependentData = function(dateIni, dateEnd) {
    tdItemsInRange = [];
    for (i in $scope.tdItems) {
      if (dateIni <= $scope.tdItems[i].commit_date.$date && $scope.tdItems[i].commit_date.$date <= dateEnd) {
        tdItemsInRange.push($scope.tdItems[i]);
      }
    }
    $scope.updateByPrincipal(tdItemsInRange);
    $scope.updateByIndicator(tdItemsInRange);
    $scope.updateByIntention(tdItemsInRange);
  }

  $scope.updateByIndicator = function(tdItemsInRange) {
    $scope.byIndicators = [];
    var indicatorsGlobal = [];
    var graphByIndicatorData = [];
    for (var i in tdItemsInRange) {
      for (var c in tdItemsInRange[i].contributors) {
        $scope.byIndicatorAddContributorIfNotExist(tdItemsInRange[i].contributors[c]);
      }
      for (var indicatorName in tdItemsInRange[i].indicators) {
        $scope.byIndicatorAddIndicatorIfNotExist(tdItemsInRange[i].contributors, indicatorName, tdItemsInRange[i].indicators[indicatorName]);
        var iGlobalExists = false;
        for (var iGlobal in indicatorsGlobal) {
          if (indicatorsGlobal[iGlobal].name == indicatorName) {
            indicatorsGlobal[iGlobal].qtty += tdItemsInRange[i].indicators[indicatorName];
            iGlobalExists = true;
          }
        }
        if (iGlobalExists == false) {
          indicatorsGlobal.push({
            name: indicatorName,
            qtty: tdItemsInRange[i].indicators[indicatorName]
          });
        }
      }
    }
    for (var i in indicatorsGlobal) {
      graphByIndicatorData.push({
        name: indicatorsGlobal[i].name,
        y: indicatorsGlobal[i].qtty
      })
    }
    byIndicatorChart.series[0].setData(graphByIndicatorData,true);
  }

  $scope.updateByPrincipal = function(tdItemsInRange) {
    $scope.byPrincipal = [];
    var graphByPrincipalData = [];
    for (var i in tdItemsInRange) {
      for (var c in tdItemsInRange[i].contributors) {
        $scope.byPrincipalAddContributorIfNotExist(tdItemsInRange[i].contributors[c]);
      }
    }

    for (var i in tdItemsInRange) {
      for (var c in tdItemsInRange[i].contributors) {
        for (var bp in $scope.byPrincipal) {
          if (tdItemsInRange[i].contributors[c].email == $scope.byPrincipal[bp].contributor.email) {
            $scope.byPrincipal[bp].qtty += tdItemsInRange[i].details.principal;
          }
        }
      }
    }
    for (var i in $scope.byPrincipal) {
      graphByPrincipalData.push([$scope.byPrincipal[i].contributor.name, $scope.byPrincipal[i].qtty]);
    }
    byPrincipalChart.series[0].setData(graphByPrincipalData,true);
  }

  $scope.byPrincipalAddContributorIfNotExist = function(contributor) {
    var contributorExists = false;
    for (var i in $scope.byPrincipal) {
      if ($scope.byPrincipal[i].contributor.email == contributor.email) {
        contributorExists = true;
      }
    }
    if (contributorExists == false) {
      $scope.byPrincipal.push({
        contributor: {
          name: contributor.name,
          email: contributor.email
        },
        qtty: 0
      });
    }
  }

  $scope.byIndicatorAddContributorIfNotExist = function(contributor) {
    var contributorExists = false;
    for (var i in $scope.byIndicators) {
      if ($scope.byIndicators[i].contributor.email == contributor.email) {
        contributorExists = true;
      }
    }
    if (contributorExists == false) {
      $scope.byIndicators.push({
        contributor: {
          name: contributor.name,
          email: contributor.email
        },
        indicators: []
      });
    }
  }

  $scope.byIndicatorAddIndicatorIfNotExist = function(contributors, indicatorName, indicatorQtty) {
    var indicatorExists = false;
    for (var i in $scope.byIndicators) {
      for (var c  in contributors) {
        for (var i2 in $scope.byIndicators[i].indicators) {
          if ($scope.byIndicators[i].contributor.email == contributors[c].email && $scope.byIndicators[i].indicators[i2].name == indicatorName) {
            indicatorExists = true;
            $scope.byIndicators[i].indicators[i2].qtty += indicatorQtty;
          }
        }
      }
    }
    if (indicatorExists == false) {
      for (var i in $scope.byIndicators) {
        for (var c  in contributors) {
          if ($scope.byIndicators[i].contributor.email == contributors[c].email) {
            $scope.byIndicators[i].indicators.push({
              name: indicatorName,
              qtty: indicatorQtty,
              perc: 0
            });
          }
        }
      }
    }
  }

  $scope.updateByIntention = function(tdItemsInRange) {
    $scope.byIntentions = [];
    var intentionGlobal = {
      intentional: 0,
      notIntentional: 0
    };
    var graphByIntentionData = [];
    for (var i in tdItemsInRange) {
      for (var c in tdItemsInRange[i].contributors) {
        $scope.byIntentionAddContributorIfNotExist(tdItemsInRange[i].contributors[c]);
      }
    }
    for (var i in tdItemsInRange) {
      for (var c in tdItemsInRange[i].contributors) {
        for (var bi in $scope.byIntentions) {
          if (tdItemsInRange[i].contributors[c].email == $scope.byIntentions[bi].contributor.email) {
            if (tdItemsInRange[i].details.intentional == true) {
              $scope.byIntentions[bi].intentional++;
            }
            else {
              $scope.byIntentions[bi].notIntentional++;
            }
          }
        }
      }
     if (tdItemsInRange[i].details.intentional == true) {
        intentionGlobal.intentional++;
      }
      else {
        intentionGlobal.notIntentional++;
      }
    }
    graphByIntentionData.push({
      name: 'Intentional',
      y: intentionGlobal.intentional
    })
    graphByIntentionData.push({
      name: 'Not Intentional',
      y: intentionGlobal.notIntentional
    })
    byIntentionChart.series[0].setData(graphByIntentionData,true);
  }

  $scope.byIntentionAddContributorIfNotExist = function(contributor) {
    var contributorExists = false;
    for (var i in $scope.byIntentions) {
      if ($scope.byIntentions[i].contributor.email == contributor.email) {
        contributorExists = true;
      }
    }
    if (contributorExists == false) {
      $scope.byIntentions.push({
        contributor: {
          name: contributor.name,
          email: contributor.email
        },
        intentional: 0,
        notIntentional: 0
      });
    }
  }

  $scope.byIntentionAddIndicatorIfNotExist = function(contributors, indicatorName, indicatorQtty) {
    var indicatorExists = false;
    for (var i in $scope.byIndicators) {
      for (var c  in contributors) {
        for (var i2 in $scope.byIndicators[i].indicators) {
          if ($scope.byIndicators[i].contributor.email == contributors[c].email && $scope.byIndicators[i].indicators[i2].name == indicatorName) {
            indicatorExists = true;
            $scope.byIndicators[i].indicators[i2].qtty += indicatorQtty;
          }
        }
      }
    }
    if (indicatorExists == false) {
      for (var i in $scope.byIndicators) {
        for (var c  in contributors) {
          if ($scope.byIndicators[i].contributor.email == contributors[c].email) {
            $scope.byIndicators[i].indicators.push({
              name: indicatorName,
              qtty: indicatorQtty,
              perc: 0
            });
          }
        }
      }
    }
  }

  $scope.generateGraph = function() {
    $scope.graphData = [];
    var datesAndIndicators = $scope.getGraphDateAndIndicators();
    $scope.graphData = [{
      key: 'Indicators',
      values: []
    }];

    for (i in datesAndIndicators) {
      $scope.graphData[0].values.push({
        x: datesAndIndicators[i].date,
        y: datesAndIndicators[i].qtty
      });
    }
    $scope.updateDependentData($scope.graphData[0].values[0].x.getTime(), $scope.graphData[0].values[$scope.graphData[0].values.length-1].x.getTime());
  }

  $scope.getGraphDateAndIndicators = function() {
    var data = [];
    for (i in $scope.tdItems) {
      var found = false;
      for (x in data) {
        if (data[x].date == $scope.tdItems[i].commit_date.$date) {
          data[x].qtty += $scope.getIndicatorsQtty($scope.tdItems[i].indicators);
          found = true;
          break;
        }
      }
      if (found == false) {
        data.push({
          'date': $scope.tdItems[i].commit_date.$date,
          'qtty': $scope.getIndicatorsQtty($scope.tdItems[i].indicators)
        });
      }
    }
    for (i in data) {
      data[i].date = new Date(data[i].date);
    }
    return data;
  }

  /**
   * Return the qtty total of indicators
   * @param  array of indicators
   * @return int
   */
  $scope.getIndicatorsQtty = function(indicators) {
    var total = 0;
    for (i in indicators) {
      total += indicators[i];
    }
    return total;
  }

  $scope.selectView = function(view) {
    $scope.currentPage = view;
    sidebarService.setCurrentPage(view);
  }

  if ($scope.currentPage == 'tdcontributors') {
    $scope.load(sidebarService.getRepository().id, $rootScope.tags[0].name);
  }
});