'use strict';

var app = angular.module('glavApp', ['ngRoute', 'ngCookies']);



var myapp = function() {};

myapp.prototype.checkUserFields = function(user) {
    return user
        ? user.city && user.email
        : false;
};
myapp.prototype.run  = function(data) {

        if(!data.user || this.checkUserFields(data.user)) {
            app.config(['$routeProvider', '$locationProvider', function($routeProvide, locationProvider){
            $routeProvide
                .when('/', {
                    templateUrl: 'partials/home.html',
                    controller: 'CoursesCtrl'
                })
                .when('/about',{
                  templateUrl:'partials/profile_form.html',
                  controller:'AboutCtrl'
                })
                .when('/contact', {
                  templateUrl:'partials/contact.html',
                  controller:'ContactCtrl'
                })
                .when('/search',{
                    templateUrl:'partials/search.html',
                    controller:'SearchCtrl'
                })
                .when('/courses/:course_id',{
                    templateUrl: 'partials/courses-detail.html',
                    controller: 'CourseDetailCtrl'
                })
                .when('/subscribe',{
                    templateUrl: 'partials/courses-detail.html',
                    controller: 'CourseDetailCtrl'
                })
                .otherwise({
                    redirectTo:'/'
                });
        }]);
        } else {
            app.config(['$routeProvider', function($routeProvide){
            $routeProvide
                .when('/', {
                    templateUrl: 'partials/profile_form.html',
                    controller: 'FormController',
                    resolve : {
                        user: function(){
                            return data.user; // or primitive, or promise or something else
                        }
                    } 
            });
            
        }]);
        }
 
        app.controller('CookieCtrl', ['$cookies', '$scope', function($cookies, $scope){

            var myCookie = $cookies.get('user_id');
            $scope.vivod=myCookie;    

        }]);
    
        app.controller('FormController', ['$scope', '$http', '$cookies', function($scope, $http, $cookies){
            $scope.formInfo = {};
            var myCookie = $cookies.get('user_id');
            $scope.uid = myCookie;
            $scope.saveData = function() {
                $scope.formInfo.id = $scope.uid;
                console.log($scope.formInfo);
                $http({
                    method: "POST",
                    url: '/create_profile',
                    headers: {'Content-Type': 'application/json' },
                    data: {"data": $scope.formInfo}
                }).success(function(data){
                    console.log(data);
                    console.log(headers)
                });
                //$http.post('/create_profile/', data).success(function(data){
                    //что-то делаем с полученными в ответ данными.обработка ответа сервера
                //})
                
};
            console.log(data)
}]);

        app.controller('SearchCtrl', function($scope, $http, $location){
            $scope.submitFunc = function (form) {

                $http.get('/courses').success(function(data){
                    $scope.courses=data;
                });

                $scope.res = [];

                // http://127.0.0.1/search
                $http.get("/search", {
                    params: {q: $scope.query}
                })
                .then(
                function (response) {
                    console.log('success');
                    console.log(response.data);
                    $scope.res = response.data;
                    console.log($scope.res)
                },
                function (response) {
                    console.log("Err " + response.status + " " + response.statusText);
                }
            )
            }

        });

        app.controller('ViewProfCtrl', '$scope', '$http', '$cookies', function($scope, $http, $cookies){
            $scope.subscribe = function(){
                $scope.uid = $cookies.get('user_id');
                $http({
                    method: "POST",
                    url: '/api/view_profile',
                    headers: {'Content-Type': 'application/json' },
                    data: {"data": $scope.uid}
                }).success(function(data){
                    console.log(data);
                });
            }
        });

        app.controller('CourseDetailCtrl', ['$scope', '$http', '$location', '$routeParams', '$cookies',
            function($scope, $http, $location, $routeParams, $cookies){
            console.log($scope);

                $scope.course_id=$routeParams.course_id;
                $http.get('/courses').success(function(data){
                    $scope.courses=data;
                    console.log(data);
                    $scope.filterId = $scope.courses['data'][$scope.course_id - 1];
                    console.log($scope.filterId);
                    if($scope.filterId.cost == null) {
                        $scope.filterId.cost = 'Free';
                        console.log($scope.filterId.cost)
                    }
                    else {
                        $scope.filterId.cost = $scope.filterId.cost + ' p.'
                    }
                });
                //$scope.subscr = element(by.id('subscr'));
                //expect($scope.subscr.isDisplayed()).toBeTruthy();
            $scope.subscribe = function(id) {
                $scope.cid = id;
                console.log($scope.cid);
                $scope.uid = $cookies.get('user_id');
                console.log($scope.uid);
                $scope.uc_json = {};
                $scope.uc_json.user_id = $scope.uid;
                $scope.uc_json.course_id = $scope.cid;
                console.log($scope.uc_json);
                $http({
                    method: "POST",
                    url: '/subscribe',
                    headers: {'Content-Type': 'application/json' },
                    data: {"data": $scope.uc_json}
                }).success(function(data){
                    console.log(data);
                    console.log(headers);
                    //element(by.model('subscribed')).click();
                    //expect($scope.subscr.isDisplayed()).toBeFalsy();

                });
            }

        }]);

        app.config(['$interpolateProvider', function($interpolateProvider) {
          $interpolateProvider.startSymbol('{[');
          $interpolateProvider.endSymbol(']}');
        }]);

        app.controller('CoursesCtrl', function($scope, $http, $location){

            $http.get('/courses').success(function(data){
                $scope.courses=data;

            });


            $scope.goToFunc = function(cid) {

                $scope.id = cid;
                console.log($scope.id);

                $http.get('/course_details', {
                    params: {q: $scope.id}
                }).then(
                    function(response){
                        console.log('success')
                    },
                    function(response){
                        console.log("Err " + response.status + " " + response.statusText)
                    }
                )
            }
        });
    };

window.application = new myapp();