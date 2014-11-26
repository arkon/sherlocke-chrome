'use strict';

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
config.$inject = [/*'restmodProvider', 'configuration'*/];
angular
    .module('BakerStreet')
    .config(config);

/*
 * Services
 */

function BakerStreetService() {

}
BakerStreetService.$inject = [];
angular
    .module('BakerStreet')
    .service('BakerStreetService', BakerStreetService);

var ResearchSession = ['restmod', function (restmod) {
  return restmod.model('/research_session');
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
