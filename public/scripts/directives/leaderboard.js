'use strict';

angular.module('splash')
.directive('leaderboard', function(){
  return {
    templateUrl: 'templates/leaderboard.html',
    replace: true
  }
});
