'use strict';


var app = angular.module('glavApp', []);

app.controller('CoursCtrl', function($scope, $http){
        $http.get('/courses').success(function(data){
            $scope.courses=data;
        })
});

app.config(['$interpolateProvider', function($interpolateProvider) {
  $interpolateProvider.startSymbol('{[');
  $interpolateProvider.endSymbol(']}');
}]);