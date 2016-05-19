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
                .when('/profile', {
                    templateUrl:'partials/profile.html',
                    controller:'ViewProfCtrl'
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

    app.controller('ViewProfCtrl', ['$scope', '$http', '$cookies', function($scope, $http, $cookies){
        console.log('ViewProfCtrl works');

        $scope.uid = $cookies.get('user_id');
        console.log($scope.uid);
        $scope.u_data = {};
        $scope.u_data.uid = $scope.uid;
        $http({
            method: "POST",
            url: '/api/view_profile',
            headers: {'Content-Type': 'application/json' },
            data: {"data": $scope.u_data}
        }).then(
            function(response){
                $scope.user_data = response.data.data;
                $scope.name = $scope.user_data.username;
                $scope.email = $scope.user_data.email;
                $scope.city = $scope.user_data.city;
                $scope.country = $scope.user_data.country;
                $scope.subscriptions = $scope.user_data.subscriptions;
            }
        );

        $scope.showCreated = function () {
            console.log('shc w');
            console.log($scope.u_data);
            $http({
                method: "POST",
                url: '/api/created',
                headers: {'Content-Type': 'application/json' },
                data: {"data": $scope.u_data}
            }).then(
                function (response) {
                    $scope.data = response.data.data;
                    console.log($scope.data);
                    $scope.owned = $scope.data;
                }
            )
        }

    }]);

    app.controller('CourseDetailCtrl', ['$scope', '$http', '$cookies', '$location', '$routeParams',
        function($scope, $http, $cookies, $location, $routeParams){
            console.log('CourseDetailCtrl works');

            $scope.course_id=$routeParams.course_id;
            $scope.user_id = $cookies.get('user_id');
            if ($scope.user_id == undefined){
                $scope.user_id = 'undefined'
            }
            console.log($scope.user_id);
            $scope.cu_data = {};
            $scope.cu_data['user_id'] = $scope.user_id.toString();
            $scope.cu_data['course_id'] = $scope.course_id.toString();
            console.log($scope.cu_data);
            $http({
                method: "POST",
                url: 'api/course_details',
                headers: {'Content-Type': 'application/json' },
                data: {"data": $scope.cu_data}
            }).then(
                function(data){
                    $scope.course = data.data.data;
                    console.log($scope.course);
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
                $scope.uid = $cookies.get('user_id');
                if ($scope.uid != undefined){
                    console.log($scope.uid);
                    $scope.cid = id;
                    console.log($scope.cid);
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
                }
                else {
                    alert( "Please, log in into your account." );
                }

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


    app.controller('LessonCtrl', ['$scope', '$http', '$cookies', '$routeParams', function($scope, $http, $cookies, $routeParams){
        console.log('LessonCtrl works');

        $scope.lessonChange = function () {
            //console.log($scope.lesson_num);
            $scope.course_data = {};
            $scope.course_data['course_id'] = $scope.course_id;
            $scope.course_data['lesson_num'] = $scope.lesson_num;
            $http({
                method: "POST",
                url: 'api/lessons',
                headers: {'Content-Type': 'application/json' },
                data: {"data": $scope.course_data}
            }).then(
                function (response) {
                    console.log(response.data['data']);
                    $scope.lesson = response.data['data'][0];
                    console.log($scope.lesson);
                    $scope.link = $scope.lesson['videos']['link'];
                    console.log($scope.link);
                    $scope.name = $scope.lesson.name;
                    $scope.description = $scope.lesson.description;
                    $scope.lessons_amount = $scope.lesson.lessons_amount
                },
                function () {
                    console.log('wrong')
                }
            );
        };

        $scope.course_id=$routeParams.course_id;
        $scope.first_lesson = true;
        $scope.last_lesson = false;
        $scope.lesson_num = 1;
        $scope.result = $scope.lessonChange();
        console.log($scope.result);

        $scope.user_id = $cookies.get('user_id');
        if ($scope.user_id == undefined){
            $scope.user_id = 'undefined'
        }

        $scope.goToNextLesson = function () {
            $scope.lesson_num += 1;
            $scope.result = $scope.lessonChange();
            console.log($scope.result);
            $scope.first_lesson = false;
            console.log($scope.lessons_amount, $scope.lesson_num);
            if ($scope.lessons_amount == $scope.lesson_num) {
                console.log('equal'); $scope.last_lesson=true
            }
        };

        $scope.goToPreviousLesson = function () {
            $scope.lesson_num -= 1;
            if ($scope.lesson_num <= 1) {
                $scope.lesson_num = 1;
                $scope.first_lesson = true
            }
            $scope.result = $scope.lessonChange();
            console.log($scope.result);
            console.log('equal'); $scope.last_lesson=false
        };

        $scope.comment_data = {};

        $scope.sendComment = function () {
            console.log($scope.user_id);
            $scope.comment_data.user_id = $scope.user_id;
            $scope.comment_data.vid_id = $scope.lesson_num; //да костыль лессон ид потому что пока 1 урок = 1 видео
            console.log($scope.comment_data);
            $http({
                method: "POST",
                url: 'api/create_comment',
                headers: {'Content-Type': 'application/json'},
                data: {"data": $scope.comment_data}
            }).then(
                function () {
                    console.log('success!')
                }
            )
        };


        $scope.all_comments = {};
        $scope.all_comments.video_id = $scope.lesson_num; //да костыль лессон ид потому что пока 1 урок = 1 видео
        console.log($scope.all_comments);
        $http({
            method: "POST",
            url: 'api/show_comments',
            headers: {'Content-Type': 'application/json'},
            data: {"data": $scope.all_comments}
        }).then(
            function (response) {
                $scope.show_comments = response.data.data;
                console.log($scope.show_comments)
            },
            function () {
                console.log('wrong!')
            }
        );

        $scope.getIframeSrc = function() {
            return $scope.link;
        };
    }]);

    app.controller('PlanCtrl', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {
        console.log('PlanCtrl works');

        $scope.course_id=$routeParams.course_id;
        console.log($scope.course_id);
        $scope.c_data = {};
        $scope.c_data['id'] = $scope.course_id;
        $http({
            method: "POST",
            url: 'api/plan',
            headers: {'Content-Type': 'application/json' },
            data: {"data": $scope.c_data}
        }).then(
            function(response){
                console.log(response.data['data']);
                console.log(response.data['data'].length);
                $scope.plan = response.data
            }
        )
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