'use strict';


var app = angular.module('glavApp', ['ngRoute', 'ngCookies']);

app.config(['$routeProvider', function($routeProvide){
    $routeProvide
        .when('/', {
            templateUrl: 'partials/home.html',
            controller: 'CoursesCtrl'
    })
        .when('/about',{
          templateUrl:'partials/about.html',
          controller:'AboutCtrl'
        })
        .when('/contact',{
          templateUrl:'partials/contact.html',
          controller:'ContactCtrl'
        })
        .when('/search',{
            templateUrl:'partials/search.html',
            controller:'SearchCtrl'
        })
        .when('/courses/:courseid',{
            templateUrl: 'partials/courses-detail.html',
            controller: 'CourseDetailCtrl'
    })
        .otherwise({
            redirectTo:'/'
    });
}]);

app.controller('CookieCtrl', ['$cookies', '$scope', function($cookies, $scope) {
  var myCookie = $cookies.get('user_id');
    $scope.vivod = myCookie
}]);

app.controller('CoursesCtrl', function($scope, $http, $location){
    console.log('$location.url() - ', $location.url());
    console.log('$location.path() - ', $location.path());
    console.log('$location.search() - ', $location.search());
    console.log('$location.hash() - ', $location.hash());
    
    $http.get('/courses').success(function(data){
            $scope.courses=data;
        })
});

app.config(['$interpolateProvider', function($interpolateProvider) {
  $interpolateProvider.startSymbol('{[');
  $interpolateProvider.endSymbol(']}');
}]);


/* About Controller */
phonecatApp.controller('AboutCtrl',[
  '$scope','$http', '$location',
  function($scope, $http, $location) {

  }
]);

/* Contact Controller */
phonecatApp.controller('ContactCtrl',[
  '$scope','$http', '$location',
  function($scope, $http, $location) {

  }
]);

app.controller('SearchCtrl', function($scope, $http, $location){
    console.log('$location.url() - ', $location.url());
    console.log('$location.path() - ', $location.path());
    console.log('$location.search() - ', $location.search());
    console.log('$location.hash() - ', $location.hash());
    
    $http.get('/courses').success(function(data){
            $scope.courses=data;
        })   
})