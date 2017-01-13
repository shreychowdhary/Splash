angular.module('splash')
.controller('profileCtrl', function($scope, profileDataService){

  profileDataService.getProfile(function(response){
    var profile = response.data.profile;
    console.log(profile);
    $scope.profile =  profile;
    });
})
