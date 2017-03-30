'use strict';

angular.module('splash')
.controller('indexCtrl', function($scope, $mdToast, indexDataService, $mdDialog){

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

    // implement the alert button needed to show the user's code
    $scope.showCode = function(event) {
        $mdDialog.show(
            $mdDialog.alert()
            .parent(angular.element(document.querySelector('#popupContainer')))
            .clickOutsideToClose(true)
            .title("Your splash code is " + $scope.profile.code)
            .textContent("This is the code you will give if you are splashed. Do not show this to anyone.")
            .ariaLabel('Show Code')
            .ok("Close")
            .targetEvent(event)
        );
    };
});
