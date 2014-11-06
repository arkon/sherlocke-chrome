'use strict';

var BAKERSTREET_RESEARCH_API = 'http://api.sherlocke.me/api';


/* Declare AngularJS app */
var bakerStreet = angular.module('BakerStreet', ['restmod']);

bakerStreet.config(function (restmodProvider) {
  restmodProvider.rebase({
    $hooks: {
      'before-request': function(_req) {
        /*jshint sub:true*/
        _req.headers['Authorization'] = 'Token 123';

        // chrome.storage.sync.get(['sherlocke-token'], function (items) {
        //   if ('sherlocke-token' in items) {
        //     _req.headers.Authorization = 'Token ' + items['sherlocke-token'];
        //   }
        // });
      }
    },
    $config: {
      urlPrefix: BAKERSTREET_RESEARCH_API,
      style: 'MyStyle'
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
