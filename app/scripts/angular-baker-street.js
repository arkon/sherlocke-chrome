'use strict';

var BAKERSTREET_RESEARCH_API = 'http://api.sherlocke.me/api';


/* Declare AngularJS app */
angular.module('BakerStreet', ['restmod']);

angular
  .module('BakerStreet')
  .config(function (restmodProvider) {
  restmodProvider.rebase({
    $config: {
      urlPrefix: BAKERSTREET_RESEARCH_API,
      style: 'MyStyle'
    }
  });
});

function run($http) {
  chrome.storage.sync.get(['sherlocke-token'], function (items) {
    if ('sherlocke-token' in items) {
      $http.defaults.headers.common.Authorization = 'Token ' + items['sherlocke-token'];
    }
  });
}
run.$inject = ['$http'];
angular
  .module('BakerStreet')
  .run(run);


/* Define restmod models */

var ResearchSession = ['restmod', function (restmod) {
  return restmod.model('/research_session');
}];
angular
  .module('BakerStreet')
  .factory('ResearchSession', ResearchSession);

// POST to make a new one (name) -> response with name/id
// POST with parameter id
// GET: all research sessions


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
