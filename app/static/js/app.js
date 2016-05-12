'use strict';

var app = angular.module('glavApp', ['ngRoute', 'ngCookies', 'mediaPlayer']);

var myapp = function() {};

myapp.prototype.checkUserFields = function(user) {
    return user
        ? user.city && user.email
        : false;
};

myapp.prototype.run  = function(data) {

    if(!data.user || this.checkUserFields(data.user)) {
        app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
            //$locationProvider.html5Mode(true);
            $routeProvider
                .when('/', {
                    templateUrl: 'partials/home.html',
                    controller: 'CoursesCtrl'
                })
                .when('/about',{
                    templateUrl:'/partials/about.html',
                    controller:'AboutCtrl'
                })
                .when('/contact', {
                    templateUrl:'partials/contact.html',
                    controller:'ContactCtrl'
                })
                //.when('/search/:q',{
                //    templateUrl:'partials/search.html',
                //    controller:'SearchCtrl'
                //})
                .when('/api/course_details/:course_id',{
                    templateUrl: 'partials/course_details.html',
                    controller: 'CourseDetailCtrl'
                })
                .when('/courses/:course_id/lessons',{
                    templateUrl: 'partials/course.html',
                    controller: 'LessonCtrl'
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
    }

    app.controller('CoursesCtrl', ['$scope', '$http', '$location', function($scope, $http, $location){
        console.log('CoursesCtrl (main) works');

        $http.get('/courses').success(function(data){
            $scope.courses=data;
            console.log('data - ', data);
        });

        $scope.show_popular = true;

        $scope.searchCourse = function (form) {
            $scope.res = [];

            //http://127.0.0.1/search
            $http.get("/search", {
                params: {q: $scope.query}
            })
                .then(
                function (response) {
                    console.log('success');
                    console.log(response.data);
                    $scope.res = response.data;
                    console.log($scope.res);
                    $scope.show_popular = false;
                },
                function (response) {
                    console.log("Err " + response.status + " " + response.statusText);
                }
            )
        }
    }]);

    app.controller('FormController', ['$scope', '$http', '$cookies', '$location',
        function($scope, $http, $cookies, $location){
            $scope.formInfo = {};
            $scope.uid = $cookies.get('user_id');
            $scope.saveData = function() {
                $scope.formInfo.id = $scope.uid;
                console.log($scope.formInfo);
                $http({
                    method: "POST",
                    url: '/api/create_profile',
                    headers: {'Content-Type': 'application/json' },
                    data: {"data": $scope.formInfo}
                }).success(function(data){
                    console.log(data);
                    $http.get('/courses').then(
                        function(){
                            console.log('works')
                        },
                        function(){
                            console.log('not works')
                        }
                    )
                });
            }

        }]);

    app.controller('CourseCtrl',[
        '$scope','$http', '$location',
        function($scope, $http, $location) {
            console.log('CourseCtrl works');
        }
    ]);

    app.controller('SearchCtrl', ['$scope', '$http', '$location', '$routeParams',
        function($scope, $http, $location, $routeParams){
            console.log('SearchCtrl works');
            $scope.submitFunc = function (form) {

                $scope.res = [];

                //http://127.0.0.1/search
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

        }]);

    app.controller('ViewProfCtrl', '$scope', '$http', '$cookies', function($scope, $http, $cookies){
        console.log('ViewProfCtrl works');
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

    app.controller('CourseDetailCtrl', ['$scope', '$http', '$cookies', '$location', '$routeParams',
        function($scope, $http, $cookies, $location, $routeParams){
            console.log('CourseDetailCtrl works');

            $scope.course_id=$routeParams.course_id;
            $scope.user_id = $cookies.get('user_id');
            $scope.cu_data = {};
            $scope.cu_data['user_id'] = $scope.user_id.toString();
            $scope.cu_data['course_id'] = $scope.course_id.toString();
            console.log($scope.cu_data);
            $http({
                method: "POST",
                url: 'api/course_details',
                headers: {'Content-Type': 'application/json' },
                data: {"data": $scope.cu_data}
            }).success(function(data){
                console.log(data);
                $scope.course = data["data"];
                if($scope.course["cost"] == null) {
                    $scope.course["cost"] = 'Free'
                }
                else {
                    $scope.course["cost"] = $scope.course["cost"] + ' p.'
                }
                if($scope.course["subscribed"]=='true'){
                    $scope.if_subscr = true;
                }
                else {
                    $scope.if_subscr = false;
                }
            });

            $scope.subscribe = function(id) {
                $scope.cid = id;
                console.log($scope.cid);
                $scope.uid = $cookies.get('user_id');
                console.log($scope.uid);
                $scope.uc_json = {};
                $scope.uc_json.user_id = parseInt($scope.uid);
                $scope.uc_json.course_id = parseInt($scope.cid);
                console.log($scope.uc_json);
                $http({
                    method: "POST",
                    url: '/subscribe',
                    headers: {'Content-Type': 'application/json' },
                    data: {"data": $scope.uc_json}
                }).then(
                    function(data){
                        console.log(data);
                        $scope.if_subscr = true;
                        console.log($scope.if_subscr);
                    });
            };

            $scope.seeDetails = function(id){
                console.log('works');
                $location.path('/courses/' + id.toString() + '/lessons');
                $scope.lesson = 1;
            }

        }]);

    app.controller('ProfileCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams){
        console.log($scope);

        $scope.user_id=$routeParams.user_id;

    }]);

    app.controller('LessonCtrl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams){
        console.log('LessonCtrl works');
        $scope.lesson_num = 1;
        //console.log($scope.lesson);
        //достать ид курса
        $scope.course_id=$routeParams.course_id;
        console.log($scope.course_id);
        $scope.course_data = {};
        $scope.course_data['course_id'] = $scope.course_id;
        $scope.course_data['lesson_num'] = $scope.lesson_num;
        console.log($scope.course_data);
        $http({
            method: "POST",
            url: 'api/lessons',
            headers: {'Content-Type': 'application/json' },
            data: {"data": $scope.course_data}
        }).then(
            function (data) {
                console.log(data['data']['data']);
                $scope.lesson = data['data']['data'][0];
                console.log($scope.lesson);
                //console.log($scope.lesson);
                $scope.link = $scope.lesson['videos']['link'];
                console.log($scope.link);
                $scope.name = $scope.lesson.name;
                $scope.description = $scope.lesson.description;
                //присваиваем ид урока = 1
                // при нажатии на кнопку "следующий" ид урока инкрементируется
                // посылаем этот ид на сервер, берем данные урока
            },
            function () {
                console.log('wrong')
            }
        );
        $scope.getIframeSrc = function() {
            return $scope.link;
        };
    }]);

    //app.controller('MyVideoPlayer', function($scope){
    //     access properties
    //console.log($scope.video1.network);
    //console.log($scope.video1.ended);
    //
    //$scope.mySpecialPlayButton = function () {
    //    $scope.customText = 'I started angular-media-player with a custom defined action!';
    //    $scope.video1.playPause();
    //};
    //});

    app.config(['$interpolateProvider', function($interpolateProvider) {
        $interpolateProvider.startSymbol('{[');
        $interpolateProvider.endSymbol(']}');
    }]);

    app.config(function($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            'https://www.youtube.com/**'
        ]);
    });

};

window.application = new myapp();