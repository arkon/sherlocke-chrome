'use strict';

var BAKERSTREET_API = 'https://api.sherlocke.me/api';


/* Declare AngularJS app */
angular.module('SherlockeApp', ['DjangoAuth', 'ChromeMessaging', 'BakerStreet']);

/* Callback for when all modules are loaded */
function run(Auth, ChromeMessaging, SherlockeService, $http, BakerStreetService) {
  if (BakerStreetService.userToken) {
    $http.defaults.headers.common.Authorization = 'Token ' + BakerStreetService.userToken;
  }

  // Publish and handle messages sent to 'SherlockeApp'
  ChromeMessaging.publish(
      'SherlockeApp',
      'getActiveResearchSession',
      SherlockeService.getActiveResearchSession
  );

  ChromeMessaging.publish(
      'SherlockeApp',
      'getDocuments',
      SherlockeService.getDocuments
  );

  /*
   * Usage:
   *   ChromeMessaging.callMethod(
   *       'SherlockeApp',
   *       'authenticate',
   *       {email: 'test@example.com', password: 'hunter2'}
   *   ).then(function (user) {
   *     var token = user.token;
   *   });
   */
  ChromeMessaging.publish(
      'SherlockeApp',
      'authenticate',
      SherlockeService.authenticate
  );
}
run.$inject = ['Auth', 'ChromeMessaging', 'SherlockeService', '$http', 'BakerStreetService'];
angular
    .module('SherlockeApp')
    .run(run);


/*
 * Provider configuration
 */
function config(AuthProvider) {
  // Configure Auth service with AuthProvider
  AuthProvider.loginPath(BAKERSTREET_API + '/users/sign_in.json');
  AuthProvider.logoutPath(BAKERSTREET_API + '/users/sign_out.json');
  AuthProvider.resourceName(false);
  AuthProvider.ignoreAuth(true);
}
config.$inject = ['AuthProvider'];
angular
    .module('SherlockeApp')
    .config(config);

/*
 * Services
 */
function SherlockeService($log, $q, Auth, BakerStreetService) {
  var vm = this;

  vm.currentResearchSession = null;

  vm.getActiveResearchSession = function () {
    return vm.currentResearchSession;
  };
  vm.getDocuments = BakerStreetService.getDocuments;
  vm.authenticate = function (creds) {
    return Auth.login(creds).then(function success(user) {
      BakerStreetService.userToken = user.token;
      return user;
    }, function failure(reason) {
      $log.warn('Failed to authenticate: ', reason);
      return $q.reject(reason);
    });
  };
}
SherlockeService.$inject = ['$log', '$q', 'Auth', 'BakerStreetService'];
angular
    .module('SherlockeApp')
    .service('SherlockeService', SherlockeService);

/**
 * Service to store and persist preferences.
 *
 * @constructor
 */
function PreferencesService() {

}
angular
    .module('SherlockeApp')
    .service('PreferencesService', PreferencesService);

/*
 * Listen for incoming messages
 */
//chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
//  if (!('origin' in message) || !('type' in message)) {
//    sendResponse({error: 'Must specify \'origin\' and \'type\''});
//    return;
//  }
//
//  if (message.origin === 'options') {
//    // Message from options.html
//    if (message.type === 'authenticate') {
//      // User is logging in
//      if (!('data' in message)) {
//        sendResponse({error: 'Expected \'data\', but none provided'});
//        return;
//      }
//
//      // Get email and password
//      var email = message.data.email;
//      var password = message.data.password;
//
//      // Authenticate using SherlockeService
//      var SherlockeService = angular.element(document.body).injector().get('SherlockeService');
//      SherlockeService.authenticate(email, password);
//    }
//  } else {
//    sendResponse({error: 'Invalid origin \'' + message.origin + '\''});
//  }
//});


/* Context menu item */
function menuItemClicked(/*info, tab*/) {
  // launchPopup(function (newWindow) {
  //   // called once newWindow is created
  //   setTimeout(function () {
  //     chrome.tabs.sendMessage(newWindow.tabs[0].id, {
  //       type: "selectionText",
  //       text: info.selectionText || info.linkUrl
  //     });
  //   }, 200);
  // });
}

chrome.contextMenus.create({
  title: 'Prioritize this',
  contexts: ['selection', 'link', 'editable'],
  onclick: menuItemClicked
});


/* Bootstrap the app onto the generated background page */
angular.element(document).ready(function() {
  angular.bootstrap(document, ['SherlockeApp']);
});
