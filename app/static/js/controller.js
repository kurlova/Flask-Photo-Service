'use strict';


var app = angular.module('glavApp', []);

app.controller('CoursCtrl', function($scope){
        $scope.title= "hello";
});

app.config(['$interpolateProvider', function($interpolateProvider) {
  $interpolateProvider.startSymbol('{[');
  $interpolateProvider.endSymbol(']}');
}]);