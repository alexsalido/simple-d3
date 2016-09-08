angular.module('SimpleD3')
    .controller('LoginCtrl', function($scope, $location, $http, Auth) {
        $scope.user = {};

        /**
         * Validates and submits login form
         * @param {Object} form - Login form element
         */
        $scope.submit = function(form) {
            $scope.error = {}; //reset errors
            Auth.login($scope.user, function(err) {
                if (err) {
                    $scope.error = err.data.error;
                    if ($scope.error) {
                        form[$scope.error.type].$error.dbError = true;
                    }
                } else {
                    $location.url('/main');
                }
            });
        };
    });
