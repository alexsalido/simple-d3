angular.module('SimpleD3')
    .factory('User', function($resource) {
        return $resource('/api/user', {}, {
            get: {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('token')
                }
            }
        });
    });
