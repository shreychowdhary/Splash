angular.module('splash')
.service('profileDataService', function($http) {
  this.getProfileData = function(cb) {
    $http.get('/profiledata').then(cb);
  };
  this.eliminate = function(eliminateCode, cb){
    console.log(eliminateCode);
    $http.post("/eliminate",{"eliminateCode":eliminateCode}).then(cb,cb);
}
});
