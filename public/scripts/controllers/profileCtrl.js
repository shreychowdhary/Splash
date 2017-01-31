angular.module('splash')
.controller('profileCtrl', function($scope, profileDataService){

    profileDataService.getProfileData(function(response){
        var profile = response.data.profile;
        console.log(profile);
        $scope.profile =  profile;
    });
    $scope.eliminate = function(){
        profileDataService.eliminate($scope.eliminate,$scope.updateProfileData);
    };
})
