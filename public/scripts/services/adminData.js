angular.module('splash')
.service('adminDataService', function($http) {
    this.getAdminData = function(cb) {
        $http.get('/adminData').then(cb);
    }
    this.register = function(email,cb) {
        console.log(email);
        $http.post("/register",{"email":email})
        .success(cb)
        .error(function (data, status, header, config) {
          console.log("registration failed");
        });
    }

    this.randomize = function(cb){
        $http.get("/randomize").then(cb);
    }

    this.clear = function(cb){
        $http.get("/cleartarget").then(cb);
    }

    this.insert = function(email,prevUser,cb){
        $http.post("/insertuser",{"email":email,"prevUser":prevUser}).then(cb,cb);
    }

    this.delete = function(user,cb){
        $http.post("/deleteuser",{"user":user}).then(cb,cb);
    }
});
