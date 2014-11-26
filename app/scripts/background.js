'use strict';

var BAKERSTREET_API = 'https://23a0283b.ngrok.com/api';


/* Declare AngularJS app */
angular.module('SherlockeApp', ['truncate', 'DjangoAuth', 'ChromeMessaging', 'BakerStreet']);

/* Callback for when all modules are loaded */
function run(Auth, ChromeMessaging, SherlockeService, $http, BakerStreetService) {
  if (BakerStreetService.userToken) {
    $http.defaults.headers.common.Authorization = 'Token ' + BakerStreetService.userToken;
  }

  // Publish and handle messages sent to 'SherlockeApp'
  ChromeMessaging.publish(
    'SherlockeApp',
    'createResearchSession',
    SherlockeService.createResearchSession
  );

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

  ChromeMessaging.publish(
    'SherlockeApp',
    'sendCurrentPage',
    SherlockeService.sendCurrentPage
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

  ChromeMessaging.publish(
    'SherlockeApp',
    'blacklist',
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
function SherlockeService($http, $log, $q, Auth, BakerStreetService, Page /*Document*/) {
  var vm = this;

  vm.currentResearchSession = null;

  vm.getActiveResearchSession = function () {
    return vm.currentResearchSession;
  };
  vm.getDocuments = function () {
    return $q(function (resolve) {
      $http.get(BAKERSTREET_API + '/documents').
        success(function(data/*, status, headers, config*/) {
          resolve(data);
        });
    });
  };
  vm.sendCurrentPage = function (page) {
    return $q(function (resolve) {
      Page.$create({
        'page_url': page.url,
        'title': page.title,
        'content': page.content,
        'snippet': false
      }).$then(function (_page) {
        resolve(_page);
      });
    });
  };
  vm.pinPage = function (page, snippet) {
    return $q(function (resolve) {
      Page.$create({
        'page_url': page.url,
        'title': page.title,
        'content': page.content,
        'snippet': snippet
      }).$then(function (_page) {
        resolve(_page);
      });
    });
  };
  vm.authenticate = function (creds) {
    return Auth.login(creds).then(function success(user) {
      BakerStreetService.userToken = user.token;
      return user;
    }, function failure(reason) {
      $log.warn('Failed to authenticate: ', reason);
      return $q.reject(reason);
    });
  };
  vm.getBlacklist = function (domain) {
    return $q(function (resolve) {
      $http.get(BAKERSTREET_API + '/blacklist').
        success(function(data/*, status, headers, config*/) {
          resolve(data);
        });
    });
  };
  vm.blacklist = function (domain) {
    return $q(function (resolve) {
      $http.post(BAKERSTREET_API + '/blacklist', domain).
        success(function(data/*, status, headers, config*/) {
          resolve(data);
        });
    });
  };
}
SherlockeService.$inject = ['$http', '$log', '$q', 'Auth', 'BakerStreetService', 'Page', 'Document'];
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


/* Prioritize context menu item */

function menuItemClicked(ChromeMessaging, info) {
  ChromeMessaging.callMethod('SherlockeApp', 'pinPage', {
    title: info.selectionText,
    snippet: true
  });
}
menuItemClicked.$inject = ['ChromeMessaging'];

chrome.contextMenus.create({
  title: 'Prioritize this',
  contexts: ['selection', 'link', 'editable'],
  onclick: menuItemClicked
});


/* Bootstrap the app onto the generated background page */
angular.element(document).ready(function() {
  angular.bootstrap(document, ['SherlockeApp']);
});
