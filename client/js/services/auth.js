angular.module('SimpleD3')
    .factory('Auth', function($http, $state, $q, User) {
        var currentUser = {};
        var token = localStorage.getItem('token');
        if (token) {
            currentUser = User.get();
        }

        return {
            /** Returns current user. */
            getCurrentUser: function() {
                return currentUser;
            },

            /**
             * Sends login request to server, if successful it saves token and updates currentUser
             * @param {object} user - user object
             * @param {function} cb - callback function
             */
            login: function(user, cb) {
                $http.post('/api/login', user).then(function(res) {
                    if (res.data.token) {
                        currentUser = res.data.user;
                        token = res.data.token;
                        localStorage.setItem('token', res.data.token);
                        cb();
                    }
                }).catch(function(err) {
                    cb(err);
                });
            },

            /** Logs out user, deletes token and redirects to '/' */
            logout: function() {
                currentUser = {};
                localStorage.removeItem('token');
                token = null;
                $state.go('/login');
            },

            /**
             * Sends signup request to server, if successful it saves token and updates currentUser
             * @param {object} user - user object
             * @param {function} cb - callback function
             */
            signup: function(user, cb) {
                console.log('here');
                $http.post('/api/signup', user).then(function(res) {
                    console.log(res);
                    if (res.data.token) {
                        currentUser = res.data.user;
                        token = res.data.token;
                        localStorage.setItem('token', res.data.token);
                        cb();
                    }
                }).catch(function(err) {
                    cb(err);
                });
            },

            /**
             * Returns token, checks localStore if it hasn't been retreived.
             * @returns {string}
             */
            getToken: function() {
                return token || localStorage.getItem('token');
            },

            /**
             * Checks user authorization
             * @param {function} cb - callback function, gets called with true if authorized, otherwise with false.
             */
            isAuthorized: function(cb) {
                if (currentUser.hasOwnProperty('$promise')) {
                    currentUser.$promise.then(function(res) {
                        currentUser = res.toJSON();
                        cb(true);
                    }).catch(function(err) {
                        cb(false);
                    });
                } else if (currentUser.hasOwnProperty('email')) {
                    cb(true);
                } else {
                    cb(false);
                }
            }
        };
    });
