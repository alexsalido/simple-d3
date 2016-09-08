var app = angular.module('SimpleD3', ['ui.router', 'ngMessages', 'ngResource'])
    .controller('MainCtrl', function($rootScope, $state, Auth) {
        $rootScope.$on('$stateChangeStart', function(event, toState) {
            Auth.isAuthorized(function(authorized) {
                if ((toState.name === 'login' || toState.name === 'signup') && authorized) {
                    event.preventDefault();
                    $state.go('dashboard');
                } else if (toState.name === 'dashboard' && !authorized) {
                    event.preventDefault();
                    $state.go('login');
                }
            });
        });
    })
    .config(function($stateProvider, $locationProvider, $urlRouterProvider) {

        $urlRouterProvider.when('', '/login').otherwise('/login');

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

        var loginState = {
            name: 'login',
            url: '/login',
            templateUrl: '/views/login.html',
            controller: 'LoginCtrl'
        };

        var signupState = {
            name: 'signup',
            url: '/signup',
            templateUrl: '/views/signup.html',
            controller: 'SignupCtrl'
        };

        var dashboardState = {
            name: 'dashboard',
            url: '/dashboard',
            templateUrl: '/views/dashboard.html'
        };

        $stateProvider.state(loginState);
        $stateProvider.state(signupState);
        $stateProvider.state(dashboardState);
    });
