'use strict';

var BAKERSTREET_RESEARCH_API = 'http://api.sherlocke.me/api';
// var BAKERSTREET_RESEARCH_API = 'http://15cc08bf.ngrok.com/api';


/* Declare AngularJS app */
var bakerStreet = angular.module('BakerStreet', ['restmod']);

// bakerStreet.config(['$httpProvider', function ($httpProvider) {
//   $httpProvider.defaults.useXDomain = true;
//   delete $httpProvider.defaults.headers.common['X-Requested-With'];

//   // Reset headers to avoid OPTIONS request (aka preflight)
//   $httpProvider.defaults.headers.common = {};
//   $httpProvider.defaults.headers.post = {};
//   $httpProvider.defaults.headers.put = {};
//   $httpProvider.defaults.headers.patch = {};
// }]);

bakerStreet.config(function(restmodProvider) {
  restmodProvider.rebase({
    $config: {
      urlPrefix: BAKERSTREET_RESEARCH_API
    }
  });
});


/* Define restmod models */
var ResearchSession = ['restmod', function (restmod) {
  return restmod.model('/research_session');
}];
bakerStreet.factory('ResearchSession', ResearchSession);

// POST to make a new one (name) -> response with name/id
// POST with parameter id
// GET: all research sessions

var Questions = ['restmod', function (restmod) {
  return restmod.model('/questions');
}];
bakerStreet.factory('Questions', Questions);

var Pages = ['restmod', function (restmod) {
  return restmod.model('/pages');
}];
bakerStreet.factory('Pages', Pages);

var Documents = ['restmod', function (restmod) {
  return restmod.model('/documents');
}];
bakerStreet.factory('Documents', Documents);
