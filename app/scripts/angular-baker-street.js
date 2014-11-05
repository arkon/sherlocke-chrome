'use strict';

var BAKERSTREET_RESEARCH_API = 'http://api.sherlocke.me/api/research_session';


/* Declare AngularJS app */
var bakerStreet = angular.module('BakerStreet', ['restmod']);


/* Define restmod models */
bakerStreet.factory('ResearchSession', function (restmod) {
  return restmod.model(BAKERSTREET_RESEARCH_API).mix({
    questions: { hasMany: 'Questions' },
    pages:     { hasMany: 'Pages' },
    documents: { hasMany: 'Documents' }
  });
});

bakerStreet.factory('Questions', function (restmod) {
  return restmod.model('/questions').mix({
    researchSession: { hasOne: 'ResearchSession' }
  });
});

bakerStreet.factory('Pages', function (restmod) {
  return restmod.model('/pages').mix({
    researchSession: { hasOne: 'ResearchSession' }
  });
});

bakerStreet.factory('Documents', function (restmod) {
  return restmod.model('/documents').mix({
    researchSession: { hasOne: 'ResearchSession' }
  });
});
