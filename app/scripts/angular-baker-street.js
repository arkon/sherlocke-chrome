'use strict';

var BAKERSTREET_RESEARCH_API = 'http://api.sherlocke.me/api';
// var BAKERSTREET_RESEARCH_API = 'http://15cc08bf.ngrok.com/api';


/* Declare AngularJS app */
var bakerStreet = angular.module('BakerStreet', ['restmod', 'ngCookies']);

// var SherlockeService = angular.element(document.body).injector().get('SherlockeService');


bakerStreet.config(function (restmodProvider) {
  restmodProvider.rebase({
    $config: {
      urlPrefix: BAKERSTREET_RESEARCH_API
    }
  });
});

// function run($http, $cookies) {
//   $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
// }
// run.$inject = ['$http', '$cookies'];
// bakerStreet.run(run);


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
