homeApp = angular.module('homeApp');

homeApp.controller('TDCommittersCtrl', function ($scope, $rootScope, $http, $q, progressbarService, sidebarService) {

  var thisCtrl = this;
  
  $scope.currentPage = sidebarService.getCurrentPage();
  $scope.filtered.repository = sidebarService.getRepository();
  
  thisCtrl.load = function(repositoryId, tagId){
    progressbarService.setTitle('Loading TD Items');
    $('#progressBarModal').modal('show');
    $http.get('rest/td-management/find?repositoryId='+repositoryId+'&tag='+tagId+'&is_analyzed=True&is_td=True', {})
    .then(function successCallback(res) {
      $scope.tdItems = res.data;
      toastr["success"]("Found "+$scope.tdItems.length+" td items indicators")
      $('#progressBarModal').modal('hide');
      generateGraph();
    }, function errorCallback(response) {
      toastr["error"]("Error on analyzer this project")
    });
  }
  
  
  var byIndicatorChart =   Highcharts.chart('graphByIndicator', {
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
          name: 'Indicator',
          colorByPoint: true,
          data: []
      }]
  });
  
  Highcharts.chart('graphByIntention', {
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
          name: 'Brands',
          colorByPoint: true,
          data: [{
              name: 'Microsoft Internet Explorer',
              y: 56.33
          }, {
              name: 'Chrome',
              y: 24.03,
              sliced: true,
              selected: true
          }]
      }]
  });
  
  
  $scope.tdItems = [];
  $scope.tdIndicators = [];
  $scope.byIndicators = [{
    contributor: 'Richard Simpson',
    indicators: [ 
      {
        name: 'Duplicated code',
        qtty: 2,
        perc: 30,
      },
      {
        name: 'God class',
        qtty: 2,
        perc: 30,
      }
    ]
  },{
    contributor: 'Alan Josh',
    indicators: [ 
      {
        name: 'God class',
        qtty: 1,
        perc: 20,
      }
    ]
  }];
  var updateSetTimeout;

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
          updateTimeout(Math.floor(brushExtent.extent[0]), Math.floor(brushExtent.extent[1]));
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
  function updateTimeout(dateIni, dateEnd) {
    clearTimeout(updateSetTimeout);
    updateSetTimeout = setTimeout(function(){ 
      updateDependentData(dateIni, dateEnd);
    }, 100);
  }


  function updateDependentData(dateIni, dateEnd) {
    console.log('updateDependentData', dateIni, dateEnd)
    var tdItemsInRange = [];
    for (i in $scope.tdItems) {
      if (dateIni <= $scope.tdItems[i].commit_date.$date && $scope.tdItems[i].commit_date.$date <= dateEnd) {
        tdItemsInRange.push($scope.tdItems[i]);
      }
    }

    var contributorsInRange = [];
        
    updateByIndicator(tdItemsInRange);
    // updateByIntention(tdItemsInRange);
  }

  function updateByIndicator(tdItemsInRange) {
    $scope.byIndicators = [];
    var indicatorsGlobal = [];
    var graphByIndicatorData = [];
    for (var i in tdItemsInRange) {
      for (var c in tdItemsInRange[i].contributors) {
        byIndicatorAddContributorIfNotExist(tdItemsInRange[i].contributors[c]);
      }
      for (var indicatorName in tdItemsInRange[i].indicators) {
        byIndicatorAddIndicatorIfNotExist(tdItemsInRange[i].contributors, indicatorName, tdItemsInRange[i].indicators[indicatorName]);
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

  function byIndicatorAddContributorIfNotExist(contributor) {
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

  function byIndicatorAddIndicatorIfNotExist(contributors, indicatorName, indicatorQtty) {
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

  function updateByIntention(tdItemsInRange) {
    console.log('updateByIntention');

  }



  // $scope.graphOptions = {
  //   chart: {
  //     type: 'lineWithFocusChart',
  //     height: 300,
  //     margin : {
  //       top: 20,
  //       right: 20,
  //       bottom: 60,
  //       left: 40
  //     },
  //     duration: 300,
  //     title: {
  //       enable: true,
  //       text: 'Technical Debt Total'
  //     },
  //     xAxis: {
  //       axisLabel: 'Date',
  //       tickFormat: function(d) {
  //         return d3.time.format('%d-%b-%y')(new Date(d))
  //       },
  //       showMaxMin: false
  //     },
  //     x2Axis: {
  //       tickFormat: function(d) {
  //         return d3.time.format('%b-%y')(new Date(d))
  //       },
  //       showMaxMin: false
  //     },
  //     yAxis: {
  //      axisLabel: '',
  //       tickFormat: function(d){
  //           return d3.format(',f')(d);
  //       },
  //       axisLabelDistance: 12
  //     },
  //     y2Axis: {
  //       axisLabel: '',
  //       tickFormat: function(d) {
  //         return '$' + d3.format(',.2f')(d)
  //       }
  //     },
  //     callback: function(chart){
  //       chart.dispatch.on('brush', function (brushExtent) {
  //         graphCommitterUpdateTimeout(Math.floor(brushExtent.extent[0]), Math.floor(brushExtent.extent[1]))
  //       });
  //     }
  //   }
  // };
  
  $scope.graphData = [];

  function generateGraph() {
    $scope.graphData = [];
    console.log('$scope.tdItems', $scope.tdItems)
    var datesAndIndicators = getGraphDateAndIndicators();
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
    updateDependentData($scope.graphData[0].values[0].x.getTime(), $scope.graphData[0].values[$scope.graphData[0].values.length-1].x.getTime());
  }

  function getGraphDateAndIndicators() {
    var data = [];
    for (i in $scope.tdItems) {
      var found = false;
      for (x in data) {
        if (data[x].date == $scope.tdItems[i].commit_date.$date) {
          data[x].qtty += getIndicatorsQtty($scope.tdItems[i].indicators);
          found = true;
          break;
        }
      }
      if (found == false) {
        data.push({
          'date': $scope.tdItems[i].commit_date.$date,
          'qtty': getIndicatorsQtty($scope.tdItems[i].indicators)
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
  function getIndicatorsQtty(indicators) {
    var total = 0;
    for (i in indicators) {
      total += indicators[i];
    }
    return total;
  }
  

  












  
  

  $scope.getGraphData = function(dateIni, dateEnd) {
    var data = [],
        dates = [];
    data.push({
      "key": 'a',
      "values": [new Date()]
    })
    return stream_layers(3,128,.1).map(function(data, i) {
    return { 
      key: 'Stream' + i,
      values: data
    };
  });
  }

  function getGraphDataDate(tdItems, committersEmails, dateIni, dateEnd) {
    var date = null;
    tdItems.commit.date = new Date(tdItems.commit.date);
    if (dateIni instanceof Date || dateEnd instanceof Date) {
      if (dateIni instanceof Date && dateEnd instanceof Date) { 
        if (tdItems.commit.date >= dateIni && dateIni instanceof Date && tdItems.commit.date <= dateEnd) {
          date = tdItems.commit.date.getTime();
        }
      } else if (dateIni instanceof Date && tdItems.commit.date >= dateIni) {
        date = tdItems.commit.date.getTime();
      } else if (dateEnd instanceof Date && tdItems.commit.date <= dateEnd) {
        date = tdItems.commit.date.getTime();
      }
    } else {
      date = tdItems.commit.date.getTime();
    }
    return date;
  }


  

  $scope.getGraphGlobalData = function(dateIni, dateEnd) {
    // var graphData = $scope.getGraphData([], dateIni, dateEnd);
    var graphData = [];
    //graphData.push({'a', 'b'});
    $scope.graphGlobalData = graphData.map(function(series) {
      series.values = series.values.map(function(d) { 
        return {x: d[0], y: d[1] } 
      });
      return series;
    });
  }


  $scope.getGraphTDPrincipalData = function(dateIni, dateEnd) {
    var data = [],
        dates = [];
    data.push({
      "key": 'All',
      "values": []
    })
    // Get data & dates
    for (i in $scope.tdItems) {
      if ($scope.tdItems[i].isTdItem) {
        // var commitDate = new Date($scope.tdItems[i].commit.date);
        // if (dates.indexOf($scope.tdItems[i].commit.date) === -1) {
          // var date = getGraphDataDate($scope.tdItems[i], [], dateIni, dateEnd);
          // if (date != null) {
          //   dates.push(date);
          // }
        // }
      }
    }
    // dates.sort();
    // Get values
    for (z in dates) {
      var total = 0;
      for (x in $scope.tdItems) {
        // if (new Date($scope.tdItems[x].commit.date).getTime() == dates[z]) {
          total += $scope.tdItems[x].principal;
        // }
      }
      data[0].values.push([dates[z], total]);
    }
    
    data[0].values.push(['a', 'b']);

    return data.map(function(series) {
      series.values = series.values.map(function(d) { 
        return {x: d[0], y: d[1] } 
      });
      return series;
    });
  }

  $scope.getGraphCommitterTDPrincipalData = function(committersEmails, dateIni, dateEnd) {
    var data = [],
        dates = [];
    // Get data & dates
    for (i in $scope.tdItems) {
      if ($scope.tdItems[i].isTdItem) {
        var commitDate = new Date($scope.tdItems[i].commit.date);
        var dataExists = false;
        for (x in data) {
          if (data[x].key == $scope.tdItems[i].committer.email) {
            dataExists = true;
          }
        }
        if (dataExists == false) {
          data.push({
            "key": $scope.tdItems[i].committer.email,
            "values": []
          })
        }
        if (dates.indexOf($scope.tdItems[i].commit.date) === -1) {
          if (committersEmails.length > 0) {
            if (committersEmails.indexOf(commitDate.getTime()) > -1) {
              var date = getGraphDataDate($scope.tdItems[i], committersEmails, dateIni, dateEnd);
              if (date != null) {
                dates.push(date);
              }
            }
          } else {
            var date = getGraphDataDate($scope.tdItems[i], committersEmails, dateIni, dateEnd);
            if (date != null) {
              dates.push(date);
            }
          }
        }
      }
    }
    dates.sort();
    // Get values
    for (i in data) {
      for (z in dates) {
        var total = 0;
        for (x in $scope.tdItems) {
          if ($scope.tdItems[x].committer.email == data[i].key && new Date($scope.tdItems[x].commit.date).getTime() == dates[z]) {
            if (committersEmails.length > 0) {
              if (committersEmails.indexOf($scope.tdItems[x].committer.email) > -1) {
                total += $scope.tdItems[x].principal;
              }
            } else {
              total += $scope.tdItems[x].principal;
            }
          }
        }
        data[i].values.push([dates[z], total]);
      }
    }
    return data.map(function(series) {
      series.values = series.values.map(function(d) { 
        return {x: d[0], y: d[1] } 
      });
      return series;
    });
  }

  function graphCommitterUpdateTimeout(dateIni, dateEnd) {
    console.log('graphCommitterUpdateTimeout');
    clearTimeout(graphCommitterUpdate);
    // graphCommitterUpdate = setTimeout(function(){ 
    //   $scope.graphCommitterData = $scope.getGraphCommitterData(dateIni, dateEnd);
    //   $scope.graphTDPrincipalData = $scope.getGraphTDPrincipalData(dateIni, dateEnd);
    //   $scope.graphCommitterTDPrincipalData = $scope.getGraphCommitterTDPrincipalData(dateIni, dateEnd);
    //   $scope.$apply();
    // }, 500);
  }

  $scope.selectView = function(view) {
    console.log('selectView', view)
    $scope.currentPage = view;
    sidebarService.setCurrentPage(view);
  }

  if ($scope.currentPage == 'tdcommiters') {
  console.log("$scope.currentPage == 'tdcommiters'")
  thisCtrl.load(sidebarService.getRepository().id, $rootScope.tags[0].name);
    var tdItems = JSON.parse(localStorage.getItem('tdItems'));
    $scope.tdItems = (tdItems == undefined) ? [] : tdItems;
    $scope.getGraphGlobalData(new Date('2000-01-01'), new Date('2100-01-01 00:00:00'));
    // $scope.updateCommittersTotal();
    // $scope.graphCommitterData = $scope.getGraphCommitterData(new Date('2000-01-01'), new Date('2100-01-01 00:00:00'));
  }
});