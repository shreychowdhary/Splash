angular.module('splash')
.service('indexDataService', function($http) {
  this.getLeaderboard = function(cb) {
    $http.get('/leaderboard').then(cb);
  }
  this.getProfileData = function(cb) {
      $http.get("/profiledata").then(cb);
  }
  this.eliminate = function(eliminateCode, cb){
      console.log(eliminateCode);
      $http.post("/eliminate",{"eliminateCode":eliminateCode}).then(cb,cb);
  }
  this.getAliveCount = function(cb) {
      $http.get("/alivecount").then(cb);
  }
});
