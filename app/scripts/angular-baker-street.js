'use strict';

var BAKERSTREET_API = 'http://api.sherlocke.me/api';


/* Declare AngularJS app */
var bakerStreet = angular.module('BakerStreet', ['restmod']);


/* Define restmod models */
bakerStreet.factory('User', function (restmod) {
  return restmod.model(BAKERSTREET_API + '/users').mix({
    researchSessions: { hasMany : 'ResearchSession'}
  });
});

bakerStreet.factory('ResearchSession', function (restmod) {
  return restmod.model('/research_session').mix({
    user:      { hasOne: 'User' },
    questions: { hasMany: 'Question' },
    pages:     { hasMany: 'Pages' },
    documents: { hasMany: 'Documents' }
  });
});

bakerStreet.factory('Questions', function (restmod) {
  return restmod.model('/questions');
});

bakerStreet.factory('Pages', function (restmod) {
  return restmod.model('/pages');
});

bakerStreet.factory('Documents', function (restmod) {
  return restmod.model('/documents');
});
