angular.module('splash')
.service('profileDataService', function($http) {
  this.getProfile = function(cb) {
    $http.get('/profiledata').then(cb);
  };
});
