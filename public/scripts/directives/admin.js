'use strict';

angular.module('splash')
.directive('admin', function(){
  return {
    templateUrl: 'templates/admin.html',
    replace: true
  }
});
