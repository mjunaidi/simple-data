(function() {
  'use strict';

  angular.module('app').config([ '$routeProvider', '$locationProvider', configureRoutes ]);

  function configureRoutes($routeProvider, $locationProvider) {
    $routeProvider.when("/", {
      templateUrl : 'app/ui/html/process.html'
    }).when("/home", {
      templateUrl : 'app/ui/html/home.html'
    }).when("/blog", {
      templateUrl : 'app/ui/html/blog.html'
    }).otherwise({
      redirectTo : '/'
    });
    // use the HTML5 History API
    //$locationProvider.html5Mode(true);
  }
})();
