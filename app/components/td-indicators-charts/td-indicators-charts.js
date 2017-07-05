angular.module('homeApp').component('tdIndicators', {
  controller: TdIndicatorsController,
  templateUrl: 'app/components/td-indicators-charts/td-indicators-charts.html',
});


function TdIndicatorsController($scope) {
  var thisCtrl = this;
  $scope.timelineList = [];

  $('#tdIndicatorsModal').on('show.bs.modal', function(e) {
        centerModals($(this));
  }); 
  $(window).on('resize', centerModals);
     
  $scope.$on('showIndicatorsChart', function(event, type, timelineList){
    $scope.type = type;
    $scope.timelineList = timelineList;
    thisCtrl.loadTagNames();
    thisCtrl.loadChartsSeries();
    thisCtrl.loadGodClassChart();  
    thisCtrl.loadLongMethodChart();
  }); 

  thisCtrl.loadTagNames = function() {
    $scope.tagsNames = [];
    for (var i = 0; i < $scope.timelineList.length; i++) {
      $scope.tagsNames.push($scope.timelineList[i].tagName);
    }
  }

  thisCtrl.loadChartsSeries = function() {
    $scope.ccSeries = [];
    $scope.mlocSeries = [];
    $scope.parSeries = [];
    $scope.lvarSeries = [];
    $scope.atfdSeries = [];
    $scope.wmcSeries = [];
    $scope.tccSeries = [];
    for (var j = 0; j < $scope.timelineList.length; j++) {
      var metrics = $scope.timelineList[j].type.abstract_types[0].metrics;
      for (var i = 0; i < metrics.length; i++) {
        switch(metrics[i].name) {
          case "ATFD":
            $scope.atfdSeries.push(metrics[i].accumulated);
            break;
          case "TCC":
            $scope.tccSeries.push(metrics[i].accumulated);
            break;
          case "WMC":
            $scope.wmcSeries.push(metrics[i].accumulated);
            break; 
          case "CC":
            $scope.ccSeries.push(metrics[i].accumulated);
            break; 
          case "MLOC":
            $scope.mlocSeries.push(metrics[i].accumulated);
            break; 
          case "PAR":
            $scope.parSeries.push(metrics[i].accumulated);
            break; 
          case "LVAR":
            $scope.lvarSeries.push(metrics[i].accumulated);
            break;            
        }
      }
    }
  }

  thisCtrl.loadGodClassChart = function() {
    var seriesArray = [];
    seriesArray.push({name: 'ATFD', data: $scope.atfdSeries });
    seriesArray.push({name: 'WMC', data: $scope.wmcSeries });
    seriesArray.push({name: 'TCC', data: $scope.tccSeries });

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
  }

}