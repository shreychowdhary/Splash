'use strict';

angular.module('splash')
.controller('indexCtrl', function($scope, indexDataService){

    indexDataService.getLeaderboard(function(response){
        var leaderboard = response.data.leaderboard;
        console.log(response.data);
        $scope.leaderboard =  leaderboard;
    });
});
