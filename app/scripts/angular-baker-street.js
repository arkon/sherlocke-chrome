'use strict';

var BAKERSTREET_API = 'http://api.sherlocke.me/api/';

/* Declare AngularJS app */
angular.module('BakerStreet', ['restmod']);

/* Define restmod models */
var Pages = ['restmod', function (restmod) {
  return restmod.model(BAKERSTREET_API + '/pages');
}];
angular
   .module('BakerStreet')
   .factory('Pages', Pages);

var Questions = ['restmod', function (restmod) {
  return restmod.model(BAKERSTREET_API + '/questions');
}];
angular
   .module('BakerStreet')
   .factory('Questions', Questions);

var Users = ['restmod', function (restmod) {
  return restmod.model(BAKERSTREET_API + '/users');
}];
angular
   .module('BakerStreet')
   .factory('Users', Users);

var Documents = ['restmod', function (restmod) {
  return restmod.model(BAKERSTREET_API + '/documents');
}];
angular
   .module('BakerStreet')
   .factory('Documents', Documents);
