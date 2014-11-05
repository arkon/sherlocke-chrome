'use strict';

var BAKERSTREET_API = 'http://api.sherlocke.me/api/research_session';

/* Declare AngularJS app */
angular.module('BakerStreet', ['restmod']);

/* Define restmod models */
var ResearchSession = ['restmod', function (restmod) {
  return restmod.model(BAKERSTREET_API);
}];
angular
   .module('BakerStreet')
   .factory('ResearchSession', ResearchSession);

var Pages = ['restmod', function (restmod) {
  return restmod.model(BAKERSTREET_API + '/<id>/pages');
}];
angular
   .module('BakerStreet')
   .factory('Pages', Pages);

var Documents = ['restmod', function (restmod) {
  return restmod.model(BAKERSTREET_API + '/<id>/documents');
}];
angular
   .module('BakerStreet')
   .factory('Documents', Documents);

// var Questions = ['restmod', function (restmod) {
//   return restmod.model(BAKERSTREET_API + '/questions');
// }];
// angular
//    .module('BakerStreet')
//    .factory('Questions', Questions);

// var Users = ['restmod', function (restmod) {
//   return restmod.model(BAKERSTREET_API + '/users');
// }];
// angular
//    .module('BakerStreet')
//    .factory('Users', Users);
