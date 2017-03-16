'use strict';

angular.module('splash')
.controller('indexCtrl', function($scope, $mdToast, indexDataService){

    indexDataService.getLeaderboard(function(response){
        var leaderboard = response.data.leaderboard;
        console.log(response.data);
        $scope.leaderboard =  leaderboard;
    });

    $scope.eliminateCode;
    $scope.updateProfileData = function(){
        indexDataService.getProfileData(function(response){
            var profile = response.data.profile;
            console.log(profile);
            $scope.profile =  profile;
        });
    }
    $scope.updateProfileData();

    $scope.eliminate = function(){
        console.log($scope);
        indexDataService.eliminate($scope.eliminateCode,$scope.eliminateCallback);
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
});
