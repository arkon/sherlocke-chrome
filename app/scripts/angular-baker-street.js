'use strict';

var BAKERSTREET_API = 'https://23a0283b.ngrok.com/api';


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

function run($http) {
  $http.defaults.headers.common.Authorization = 'Token f93a41e52a7cad34b0078c5995ba635201abccb7';
}
run.$inject = ['$http', 'BakerStreetService'];
angular
    .module('BakerStreet')
    .run(run);

/*
 * Services
 */

function BakerStreetService($http, Page) {
  this.userToken = null;

  this.getDocuments = function (data) {
    // Send current page first
    Page.$build({
      /* jshint camelcase: false */
      page_url: data.page_url,
      title: data.title,
      content: data.content
    }).$save();

    // Fetch relevant documents
    $http.get(BAKERSTREET_API + '/documents').success(function (evidence) {
      return evidence;
    });
  };
}
BakerStreetService.$inject = ['$http', 'Page'];
angular
    .module('BakerStreet')
    .service('BakerStreetService', BakerStreetService);


//var AuthenticatedModel = ['restmod', function (restmod) {
//  return restmod.mixin({
//    $hooks: {
//      'before-request': function (/*request*/) {
//        // authenticate
//      }
//    }
//  });
//}];
//angular
//    .module('BakerStreet')
//    .factory('AuthenticatedModel', AuthenticatedModel);

var ResearchSession = ['restmod', function (restmod) {
  return restmod.model('/research_session');
}];
angular
    .module('BakerStreet')
    .factory('ResearchSession', ResearchSession);

// POST to make a new one (name) -> response with name/id
// POST with parameter id
// GET: all research sessions

var Question = ['restmod', function (restmod) {
  return restmod.model('/questions');
}];
angular
    .module('BakerStreet')
    .factory('Question', Question);


var Page = ['restmod', function (restmod) {
  return restmod.model('/pages');
}];
angular
    .module('BakerStreet')
    .factory('Page', Page);


var Document = ['restmod', function (restmod) {
  return restmod.model('/documents');
}];
angular
    .module('BakerStreet')
    .factory('Document', Document);
