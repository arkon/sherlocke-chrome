'use strict';

(function () {
  /* Declare AngularJS app */
  angular.module('BakerStreet', ['restmod']);

  /* Configure providers */
  function config(/*restmodProvider, configuration*/) {
    // TODO: make BakerStreetService a provider and configure the url in background.js
    //restmodProvider.rebase({
    //  $config: {
    //    urlPrefix: configuration.bakerstreetApi
    //  }
    //});
  }
  angular
    .module('BakerStreet')
    .config(config);

  /*
   * Services
   */

  function BakerStreetService() {

  }
  angular
    .module('BakerStreet')
    .service('BakerStreetService', BakerStreetService);

//var AuthenticatedModel = ['restmod', function (restmod) {
//  return restmod.mixin({
//    hooks: {
//      'before-request': function (request) {
//        debugger;
//      }
//    }
//  });
//}];
//angular
//    .module('BakerStreet')
//    .factory('AuthenticatedModel', AuthenticatedModel);

  var ResearchSession = ['restmod', function (restmod) {
    return restmod.model('/research_sessions'); //.mix('AuthenticatedModel');
  }];
  angular
    .module('BakerStreet')
    .factory('ResearchSession', ResearchSession);

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

}());
