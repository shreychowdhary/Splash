angular.module('splash')
.service('adminDataService', function($http) {
  this.getAdminData = function(cb) {
    $http.get('/adminData').then(cb);
  };
  this.register = function(email,cb) {
      console.log(email);
      $http.post("/register",{"email":email})
      .success(cb)
      .error(function (data, status, header, config) {
          console.log("registration failed");
      });
  }
});
