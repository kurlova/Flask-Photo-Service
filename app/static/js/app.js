'use strict';

var app = angular.module('glavApp', ['ngRoute', 'ngCookies', 'mediaPlayer']); 

var myapp = function() {}

myapp.prototype.checkUserFields = function(user) {
    return user
        ? user.city && user.email
        : false;
}
myapp.prototype.run  = function(data) {

        if(!data.user || this.checkUserFields(data.user)) {
            app.config(['$routeProvider', '$locationProvider', function($routeProvide, locationProvider){
                      
            $routeProvide
                .when('/', {
                    templateUrl: 'partials/home.html',
                    controller: 'CoursesCtrl',
                })
                .when('/about',{
                  templateUrl:'partials/about.html',
                  controller:'AboutCtrl'
                })
                .when('/contact', {
                  templateUrl:'partials/contact.html',
                  controller:'ContactCtrl'
                })
                .when('/search/:q',{
                    templateUrl:'partials/search.html',
                    controller:'SearchCtrl'
                })
                .when('/coursesS/:course_id',{
                    templateUrl: 'partials/courses-detail.html',
                    controller: 'CourseDetailCtrl'
                })
                .when('/courses/:course_id/home',{
                    templateUrl: 'partials/course.html',
                    controller: 'CourseCtrl'
                })
                .when('/subscribe',{
                    templateUrl: 'partials/courses-detail.html',
                    controller: 'CourseDetailCtrl'
                })
                .when('/users/:user_id', {
                    templateUrl: 'partials/profile.html',
                    controller: 'ProfileCtrl'
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
        };
 
     
   
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
                
};console.log(data)
        
}]);

        app.controller('CoursesCtrl', function($scope, $http, $location){

            console.log($scope);
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
    
    
       
        
    
        /*phonecatApp.controller('AboutCtrl',[
          '$scope','$http', '$location',
          function($scope) {

          }
        ]);
        
        phonecatApp.controller('ContactCtrl',[
          '$scope','$http', '$location',
          function($scope, $http, $location) {

          }
        ]);*/
    
    app.controller('CourseCtrl',[
          '$scope','$http', '$location',
          function($scope, $http, $location) {

          }
        ])

        app.controller('SearchCtrl', function($scope, $http, $location){
            $scope.submitFunc = function (form) {

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
    
        app.controller('ProfileCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams){
            console.log($scope);
            
                $scope.user_id=$routeParams.user_id;
           
        }]);
    
    
        
        app.controller('MyVideoPlayer', function($scope){
            // access properties
            console.log($scope.video1.network);
            console.log($scope.video1.ended);

            $scope.mySpecialPlayButton = function () {
                $scope.customText = 'I started angular-media-player with a custom defined action!';
                $scope.video1.playPause();
            };
        })
        


    };

window.application = new myapp();


