angular.module('splash')
.controller('profileCtrl', function($scope, profileDataService){
    $scope.updateProfileData = function(){
        profileDataService.getProfileData(function(response){
            var profile = response.data.profile;
            console.log(profile);
            $scope.profile =  profile;
        });
    }
    $scope.updateProfileData();
    
    $scope.eliminate = function(){
        profileDataService.eliminate($scope.eliminateCode,$scope.updateProfileData);
    };
})
