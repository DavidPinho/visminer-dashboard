homeApp.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'app/technicaldebt/evolution/evolution.html',
        controller: 'TDEvolutionCtrl'
      }).
      when('/technicaldebt/evolution', {
        templateUrl: 'app/technicaldebt/evolution/evolution.html',
        controller: 'TDEvolutionCtrl'
      }).
      when('/technicaldebt/analyzer', {
        templateUrl: 'app/technicaldebt/analyzer/analyzer.html',
        controller: 'TDAnalyzerCtrl'
      }).
      when('/technicaldebt/manager', {
        templateUrl: 'app/technicaldebt/manager/manager.html',
        controller: 'TDManagerCtrl'
      }).
      when('/technicaldebt/contributors', {
        templateUrl: 'app/technicaldebt/contributors/contributors.html',
        controller: 'TDContributorsCtrl'
      }).
      when('/codesmells/perspectiveone', {
        templateUrl: 'app/codesmells/perspectiveone/perspectiveone.html',
        controller: 'CSPerspectiveOneCtrl'
      }).
      otherwise({ redirectTo: '/' });
    $locationProvider.html5Mode(true);
 }]);