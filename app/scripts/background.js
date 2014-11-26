'use strict';

/* Declare AngularJS app */
angular.module('SherlockeApp', ['truncate', 'DjangoAuth', 'ChromeMessaging', 'BakerStreet', 'SherlockeConfig']);

/* Callback for when all modules are loaded */
function run(ChromeMessaging, SherlockeService) {
  /* Publish and handle messages sent to 'SherlockeApp' */
  ChromeMessaging.publish(
    'getCurrentResearchSession',
    SherlockeService.getCurrentResearchSession,
    { canSubscribe: true }
  );

  ChromeMessaging.publish(
    'getCurrentUser',
    SherlockeService.getCurrentUser,
    { canSubscribe: true }
  );

  ChromeMessaging.publish(
    'getDocuments',
    SherlockeService.getDocuments,
    { canSubscribe: true }
  );

  ChromeMessaging.publish(
    'sendCurrentPage',
    SherlockeService.sendCurrentPage
  );

  ChromeMessaging.publish(
    'pinPage',
    SherlockeService.pinPage
  );

  /* Usage:
   *   ChromeMessaging.callMethod(
   *       'authenticate',
   *       {email: 'test@example.com', password: 'hunter2'}
   *   ).then(function (user) {
   *     console.log(user);
   *   });
   */
  ChromeMessaging.publish(
    'authenticate',
    SherlockeService.authenticate
  );

  ChromeMessaging.publish(
    'SherlockeApp',
    'blacklist',
    SherlockeService.authenticate
  );
}
run.$inject = ['ChromeMessaging', 'SherlockeService'];
angular
    .module('SherlockeApp')
    .run(run);

/*
 * Provider configuration
 */
function config(AuthProvider, ChromeMessagingProvider, BAKERSTREET_API) {
  // Configure Auth service with AuthProvider
  AuthProvider.loginPath(BAKERSTREET_API + '/users/login.json');
  AuthProvider.logoutPath(BAKERSTREET_API + '/users/logout.json');
  AuthProvider.resourceName(false);
  AuthProvider.interceptAuth(false);

  // Set module name used to publish methods
  ChromeMessagingProvider.setModuleName('SherlockeApp');
}
config.$inject = ['AuthProvider', 'ChromeMessagingProvider', 'BAKERSTREET_API'];
angular
    .module('SherlockeApp')
    .config(config);

/*
 * Services
 */
function SherlockeService($log, $q, Auth, BakerStreetService, Page /*Document*/) {
  var vm = this;

  vm.currentUser = null;
  vm.getCurrentUser = function () {
    return vm.currentUser;
  };

  vm.currentResearchSession = null;
  vm.getCurrentResearchSession = function () {
    return vm.currentResearchSession;
  };

  vm.getDocuments = function () {
    // TODO
  };

  vm.sendCurrentPage =  function (page) {
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

  vm.pinPage =  function (page, snippet) {
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
SherlockeService.$inject = ['$log', '$q', 'Auth', 'BakerStreetService', 'Page'];
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
