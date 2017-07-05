homeApp.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider.
    when('/', {
        templateUrl: 'app/technicaldebt/tdevolution/tdevolution.html',
        controller: 'TDEvolutionCtrl'
      }).
			when('/tdevolution', {
		    templateUrl: 'app/technicaldebt/tdevolution/tdevolution.html',
		    controller: 'TDEvolutionCtrl'
		      }).
			when('/tdanalyzer', {
		    templateUrl: 'app/technicaldebt/tdanalyzer/tdanalyzer.html',
		    controller: 'TDAnalyzerCtrl'
		      }).
			when('/tdmanagement', {
		    templateUrl: 'app/technicaldebt/tdmanagement/tdmanagement.html',
		    controller: 'TDManagementCtrl'
		      }).
			when('/tdcommitters', {
		    templateUrl: 'app/technicaldebt/tdcommitters/tdcommitters.html',
		    controller: 'TDCommittersCtrl'
		      }).
			otherwise({ redirectTo: '/tdevolution' });
			$locationProvider.html5Mode(true);
 }]);