angular.module('splash')
.controller('adminCtrl', function($scope, $mdToast, adminDataService){
    $scope.email = "";
    $scope.updateAdminData = function(response){
        var adminData;
        if(response.data != null){
             adminData = response.data.adminData;
        }
        else{
            adminData = response.adminData;
        }
        $scope.adminData = adminData;
    }

    adminDataService.getAdminData($scope.updateAdminData);
    $scope.register = function(){
        adminDataService.register($scope.email,$scope.updateAdminData);
        $scope.email="";
    };

    $scope.randomize = function(){
        var res = confirm("Are you sure you want to randomize?");
        if (res == true) {
            adminDataService.randomize($scope.updateAdminData);
        }
    }

    $scope.clear = function(){
        var res = confirm("Are you sure you want to clear targets?");
        if (res == true) {
            adminDataService.clear($scope.updateAdminData);
        }
    }

    $scope.insert = function(prevUser){
        var email = prompt("Enter email of inserted player");
        if(email != null){
            adminDataService.insert(email,prevUser,$scope.editCallback);
        }
    }

    $scope.delete = function(user){
        var res = confirm("Are you sure you want to delete " + user.email);
        if(res == true){
            adminDataService.delete(user,$scope.editCallback);
        }
    }

    $scope.editCallback = function(res){
        $mdToast.show(
          $mdToast.simple()
            .textContent(res.data.message)
            .hideDelay(3000)
        );
        if(res.status == 200){
            adminDataService.getAdminData($scope.updateAdminData);
        }
    }
});
