angular.module('splash')
.service('indexDataService', function($http) {
  this.getLeaderboard = function(cb) {
    $http.get('/leaderboard').then(cb);
  };
});
