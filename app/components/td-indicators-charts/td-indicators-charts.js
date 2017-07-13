angular.module('homeApp').component('tdIndicators', {
  controller: TdIndicatorsController,
  templateUrl: 'components/td-indicators-charts/td-indicators-charts.html',
});


function TdIndicatorsController($scope, $http) {
  var thisCtrl = this;
  $scope.timelineList = [];

  $('#tdIndicatorsModal').on('show.bs.modal', function (e) {
    centerModals($(this));
  });
  $(window).on('resize', centerModals);

  $scope.$on('showIndicatorsChart', function (event, type, timelineList) {
    $scope.type = type;
    $scope.timelineList = timelineList;
    thisCtrl.loadTagNames();
    thisCtrl.loadCharts();
  });

  thisCtrl.loadTagNames = function () {
    $scope.tagsNames = [];
    for (var i = 0; i < $scope.timelineList.length; i++) {
      $scope.tagsNames.push($scope.timelineList[i].tagName);
    }
  }

  thisCtrl.loadCharts = function () {
    $scope.atfdSeries = [];
    $scope.tccSeries = [];
    $scope.wmcSeries = [];
    $scope.locSeries = [];
    $scope.parSeries = [];
    $scope.lvarSeries = [];
    $scope.fdpSeries = [];
    $scope.wocSeries = [];
    var seriesArray = [];
    $scope.configGodClassChart = {
      title: {
        text: 'Metrics Evolution'
      },
      xAxis: {
        categories: $scope.tagsNames
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Metrics Values'
        },
        stackLabels: {
          enabled: true,
          style: {
            fontWeight: 'bold',
            color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
          }
        }
      },
      credits: {
        enabled: false
      },
      options: {
        chart: {
          type: 'line',
          zoomType: 'x'
        }
      },
      series: seriesArray
    }
    $http.get('../../data/rm_direct_code_analysis.json')
      .success(function (typeWithMetrics) {
        for (var i = 0; i < $scope.timelineList.length; i++) {
          var typeTimeline = $scope.timelineList[i].type;
          for (var z = 0; z < typeWithMetrics.length; z++) {
            if (typeWithMetrics[z].commit === typeTimeline.filestate && typeTimeline.filename.indexOf(typeWithMetrics[z].filename) !== -1) {
              var metrics = typeWithMetrics[z].classes[0].metrics;
              for (var k = 0; k < metrics.length; k++) {
                switch (metrics[k].metric) {
                  case "ATFD":
                    $scope.atfdSeries.push(metrics[k].value);
                    break;
                  case "TCC":
                    $scope.tccSeries.push(metrics[k].value);
                    break;
                  case "WMC":
                    $scope.wmcSeries.push(metrics[k].value);
                    break;
                  case "LOC":
                    $scope.locSeries.push(metrics[k].value);
                    break;
                  case "PAR":
                    $scope.parSeries.push(metrics[k].value);
                    break;
                  case "LVAR":
                    $scope.lvarSeries.push(metrics[k].value);
                    break;
                  case "FDP":
                    var cont = 0;
                    for (var l = 0; l < metrics[k].methods.length; l++) {
                      cont = cont + metrics[k].methods[l].value;
                    }
                    $scope.fdpSeries.push(cont);
                    break;
                  case "WOC":
                    $scope.wocSeries.push(metrics[k].value);
                    break;
                }
              }
              break;
            }
          }
        }
        thisCtrl.loadMetricsChart();
        //thisCtrl.loadGodClassChart();
        //thisCtrl.loadLongMethodChart();
      });
  }

  thisCtrl.loadMetricsChart = function () {
    var seriesArray = [];
    seriesArray.push({ name: 'ATFD', data: $scope.atfdSeries });
    seriesArray.push({ name: 'FDP', data: $scope.fdpSeries });
    seriesArray.push({ name: 'LOC', data: $scope.locSeries });
    seriesArray.push({ name: 'LVAR', data: $scope.lvarSeries });
    seriesArray.push({ name: 'PAR', data: $scope.parSeries });
    seriesArray.push({ name: 'TCC', data: $scope.tccSeries });
    seriesArray.push({ name: 'WMC', data: $scope.wmcSeries });
    seriesArray.push({ name: 'WOC', data: $scope.wocSeries });

    $scope.configGodClassChart = {
      title: {
        text: 'Metrics Evolution'
      },
      xAxis: {
        categories: $scope.tagsNames
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Metrics Values'
        },
        stackLabels: {
          enabled: true,
          style: {
            fontWeight: 'bold',
            color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
          }
        }
      },
      credits: {
        enabled: false
      },
      options: {
        chart: {
          type: 'line',
          zoomType: 'x'
        }
      },
      series: seriesArray
    }
  }

  $scope.substringFileName = function (fileName) {
    if (fileName)
      return fileName.substring(fileName.lastIndexOf("/") + 1, fileName.lastIndexOf(".java"));
  }

}

/*thisCtrl.loadGodClassChart = function () {
  var seriesArray = [];
  seriesArray.push({ name: 'ATFD', data: $scope.atfdSeries });
  seriesArray.push({ name: 'WMC', data: $scope.wmcSeries });
  seriesArray.push({ name: 'TCC', data: $scope.tccSeries });

  $scope.configGodClassChart = {
    title: {
      text: 'God Class metrics'
    },
    xAxis: {
      categories: $scope.tagsNames
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Metrics Values'
      },
      stackLabels: {
        enabled: true,
        style: {
          fontWeight: 'bold',
          color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
        }
      }
    },
    credits: {
      enabled: false
    },
    options: {
      chart: {
        type: 'line',
        zoomType: 'x'
      }
    },
    series: seriesArray
  }
}

  thisCtrl.loadLongMethodChart = function() {
    var seriesArray = [];
    seriesArray.push({name: 'CC', data: $scope.ccSeries });
    seriesArray.push({name: 'MLOC', data: $scope.mlocSeries });
    seriesArray.push({name: 'PAR', data: $scope.parSeries });
    seriesArray.push({name: 'LVAR', data: $scope.lvarSeries });

    $scope.configLongMethodChart = {
      title: {
         text: 'Long Method metrics'
      },
      xAxis: {
        categories: $scope.tagsNames
      },
      yAxis: {
        min: 0,
        title: {
            text: 'Metrics Values'
        },
        stackLabels: {
            enabled: true,
            style: {
                fontWeight: 'bold',
                color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
            }
        }
      },
      credits: {
        enabled: false
      },
      options: {
        chart: {
          type: 'line',
          zoomType: 'x' 
        }  
      },       
      series: seriesArray
    }
  }*/