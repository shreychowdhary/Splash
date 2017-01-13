angular.module('splash')
.service('leaderboardDataService', function($http) {
  this.getLeaderboard = function(cb) {
    $http.get('/leaderboard').then(cb);
  };
});
