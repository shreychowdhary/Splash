angular.module('splash')
.controller('profileCtrl', function($scope, $mdToast, profileDataService){
    $scope.updateProfileData = function(){
        profileDataService.getProfileData(function(response){
            var profile = response.data.profile;
            console.log(profile);
            $scope.profile =  profile;
        });
    }
    $scope.updateProfileData();

    $scope.eliminate = function(){
        profileDataService.eliminate($scope.eliminateCode,$scope.eliminateCallback);
    };

    $scope.eliminateCallback = function(response){
        $mdToast.show(
          $mdToast.simple()
            .textContent(response.data.message)
            .hideDelay(3000)
        );
        if(response.status == 200){
            $scope.updateProfileData();
        }
    }

})
