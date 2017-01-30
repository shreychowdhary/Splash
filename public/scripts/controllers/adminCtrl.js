angular.module('splash')
.controller('adminCtrl', function($scope, adminDataService){
    $scope.email = "";
    $scope.updateAdminData = function(response){
        var adminData;
        if(response.data != null){
             adminData = response.data.adminData;
        }
        else{
            adminData = response.adminData;
        }
        console.log(adminData);
        $scope.adminData =  adminData;
    }
    adminDataService.getAdminData($scope.updateAdminData);
    $scope.register = function(){
        adminDataService.register($scope.email,$scope.updateAdminData);
    };

    $scope.randomize = function(){
        console.log("randomize");
        admindata.randomize($scope.updateAdminData);
    }
})
