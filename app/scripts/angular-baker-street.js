'use strict';

var BAKERSTREET_RESEARCH_API = 'http://api.sherlocke.me/api';


/* Declare AngularJS app */
angular.module('BakerStreet', ['restmod']);

/* Configure providers */
function config(restmodProvider) {
  restmodProvider.rebase({
    $config: {
      urlPrefix: BAKERSTREET_RESEARCH_API,
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

function BakerStreetService() {
  this.userToken = null;
  this.getDocuments = function () {};
}
angular
    .module('BakerStreet')
    .service('BakerStreetService', BakerStreetService);

/* Define restmod models */
// function BaseModel(restmod/*, BakerStreetService*/) {
//   return restmod.mixin({
//     $hooks: {
//       'before-request': function(_req) {
//         if (BakerStreetService.userToken !== null) {
//           _req.headers = angular.extend(_req.headers, {'Authorization': 'Token ' + BakerStreetService.userToken});
//         }
//       }
//     }
//   });
// }
// BaseModel.$inject = ['restmod', 'BakerStreetService'];
// angular
//     .module('BakerStreet')
//     .factory('BaseModel', BaseModel);

var ResearchSession = ['restmod', function (restmod) {
  return restmod.model('/research_session');
  // return restmod.model('/research_session').mix('BaseModel');
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
