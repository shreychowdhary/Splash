angular.module('splash')
.service('profileDataService', function($http) {
    this.getProfileData = function(cb) {
        $http.get('/profiledata').then(cb);
    };
    this.eliminate = function(eliminateCode, cb){
        $http.post("/eliminate",{"eliminateCode":eliminateCode})
        .success(cb)
        .error(function (data, status, header, config) {
            console.log("elimination failed");
        });
    }
});
