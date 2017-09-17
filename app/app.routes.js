homeApp.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider.
    when('/', {
        templateUrl: 'technicaldebt/tdevolution/tdevolution.html',
        controller: 'TDEvolutionCtrl'
      }).
			when('/tdevolution', {
		    templateUrl: 'technicaldebt/tdevolution/tdevolution.html',
		    controller: 'TDEvolutionCtrl'
		      }).
			when('/tdanalyzer', {
		    templateUrl: 'technicaldebt/tdanalyzer/tdanalyzer.html',
		    controller: 'TDAnalyzerCtrl'
		      }).
			when('/tdmanagement', {
		    templateUrl: 'technicaldebt/tdmanagement/tdmanagement.html',
		    controller: 'TDManagementCtrl'
		      }).
			otherwise({ redirectTo: '/tdevolution' });
			$locationProvider.html5Mode(true);
 }]);