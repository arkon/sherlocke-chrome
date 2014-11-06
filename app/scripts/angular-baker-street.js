'use strict';

var BAKERSTREET_API = 'http://api.sherlocke.me/api';


/* Declare AngularJS app */
angular.module('BakerStreet', ['restmod']);

/* Configure providers */
function config(restmodProvider) {
  restmodProvider.rebase({
    $config: {
      urlPrefix: BAKERSTREET_API,
      style: 'Style'  // Gets rid of a warning
    }
  });
}
config.$inject = ['restmodProvider'];
angular
    .module('BakerStreet')
    .config(config);

function run($http, BakerStreetService) {
  if (BakerStreetService.userToken) {
    $http.defaults.headers.common.Authorization = 'Token ' + BakerStreetService.userToken;
  }
}
run.$inject = ['$http', 'BakerStreetService'];
angular
    .module('BakerStreet')
    .run(run);

/*
 * Services
 */

function BakerStreetService($http) {
  this.userToken = null;

  this.getDocuments = function () {
    $http.get(BAKERSTREET_API + '/documents')
      .success(function(data) {
        return data;
      });
  };
}
BakerStreetService.$inject = ['$http'];
angular
    .module('BakerStreet')
    .service('BakerStreetService', BakerStreetService);


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
