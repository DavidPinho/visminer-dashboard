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
			when('/tdcommitters', {
		    templateUrl: 'technicaldebt/tdcommitters/tdcommitters.html',
		    controller: 'TDCommittersCtrl'
		      }).
			otherwise({ redirectTo: '/tdevolution' });
			$locationProvider.html5Mode(true);
 }]);