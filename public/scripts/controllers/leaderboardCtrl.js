'use strict';

angular.module('splash')
.controller('leaderboardCtrl', function($scope, leaderboardDataService){

  leaderboardDataService.getLeaderboard(function(response){
    var leaderboard = response.data.leaderboard;
    console.log(response.data);
    $scope.leaderboard =  leaderboard;
    });
})
