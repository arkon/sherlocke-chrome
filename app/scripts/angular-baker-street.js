'use strict';

var BAKERSTREET_API = 'http://api.sherlocke.me/api/research_session';

/* Declare AngularJS app */
angular.module('BakerStreet', ['restmod']);

/* Define restmod models */
var User = ['restmod', function (restmod) {
  return restmod.model(BAKERSTREET_API + '/users').mix({
    researchSessions: { hasMany : 'ResearchSession'}
  });
}];
angular
   .module('BakerStreet')
   .factory('User', User);

var ResearchSession = ['restmod', function (restmod) {
  return restmod.model('/research_session').mix({
    user:      { hasOne: 'User' },
    questions: { hasMany: 'Question' },
    pages:     { hasMany: 'Pages' },
    documents: { hasMany: 'Documents' }
  });
}];
angular
   .module('BakerStreet')
   .factory('ResearchSession', ResearchSession);

var Questions = ['restmod', function (restmod) {
  return restmod.model('/questions');
}];
angular
   .module('BakerStreet')
   .factory('Questions', Questions);


var Pages = ['restmod', function (restmod) {
  return restmod.model('/pages');
}];
angular
   .module('BakerStreet')
   .factory('Pages', Pages);

var Documents = ['restmod', function (restmod) {
  return restmod.model('/documents');
}];
angular
   .module('BakerStreet')
   .factory('Documents', Documents);
