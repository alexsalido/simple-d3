angular.module('SimpleD3')
    .controller('SignupCtrl', function($scope, $location, $http, Auth) {
        $scope.user = {};

        /**
         * Validates and submits signup form
         * @param {Object} form - Signup form element
         */
        $scope.submit = function(form) {
            $scope.error = {}; //reset errors
            var user = $scope.user;
            if (user.password !== user.confirmation) {
                form.confirmation.$error.invalid = true;
            } else {
                Auth.signup({
                    email: user.email,
                    password: user.password
                }, function(err) {
                    if (err) {
                        $scope.error = err.data.error;
                        if ($scope.error) {
                            form[$scope.error.type].$error.dbError = true;
                        }
                    } else {
                        $location.url('/');
                    }
                });
            }
        };
    });
