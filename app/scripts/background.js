'use strict';

/* Declare AngularJS app */
angular.module('SherlockeApp', ['truncate', 'DjangoAuth', 'ChromeMessaging', 'BakerStreet', 'SherlockeConfig']);

/* Callback for when all modules are loaded */
function run(ChromeMessaging, SherlockeService) {
  /* Publish and handle messages sent to 'SherlockeApp' */

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
    'getCurrentUser',
    SherlockeService.getCurrentUser,
    { canSubscribe: true }
  );

  ChromeMessaging.publish(
    'getCurrentResearchSession',
    SherlockeService.getCurrentResearchSession,
    { canSubscribe: true }
  );

  ChromeMessaging.publish(
    'getResearchSessions',
    SherlockeService.getResearchSessions
  );

  ChromeMessaging.publish(
    'createResearchSession',
    SherlockeService.createResearchSession
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

  ChromeMessaging.publish(
    'SherlockeApp',
    'getWhitelist',
    SherlockeService.getWhitelist
  );
}
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
angular
    .module('SherlockeApp')
    .config(config);

/*
 * Services
 */
function SherlockeService($location, $log, $q, $http, Auth, BAKERSTREET_API, BakerStreetService, ResearchSession, Page /*Document*/) {
  var vm = this;

  vm.currentUser = null;
  vm.getCurrentUser = function () {
    return vm.currentUser;
  };

  /*
   * Research sessions
   */
  // Keep a reference to the current research session
  vm.currentResearchSession = null;
  vm.getCurrentResearchSession = function () {
    return vm.currentResearchSession;
  };

  /**
   * Get the list of research sessions from Baker Street
   */
  vm.getResearchSessions = function () {
    // TODO: use restmod
    //var researchSessions = ResearchSession.$collection({});
    //var v = researchSessions.$refresh({ page: 1 });

    return $q(function (resolve, reject) {
      if (!vm.currentUser.accessToken) {
        reject('No access token set');
      } else {
        $http.get(BAKERSTREET_API + '/research_session.json', {
          headers: {
            'Authorization': 'Bearer ' + vm.currentUser.accessToken
          }
        }).then(function success(response) {
          resolve(response.data.results);
        }, function failure(response) {
          reject(response);
        });
      }
    });
  };

  /**
   * Create a research session
   *
   * @param name The name of the new research session
   */
  vm.createResearchSession = function (name) {
    // TODO: use restmod

    return $q(function (resolve, reject) {
      if (!vm.currentUser.accessToken) {
        reject('No access token set');
      } else {
        $http.post(BAKERSTREET_API + '/research_session.json', {
          'name': name
        }, {
          headers: {
            'Authorization': 'Bearer ' + vm.currentUser.accessToken
          }
        }).then(function success(response) {
          resolve(response.data);
        }, function failure(response) {
          reject(response);
        });
      }
    });
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

  vm.accessToken = null;
  vm.authenticate = function () {
    return $q(function (resolve, reject) {
      chrome.identity.launchWebAuthFlow({
        url: BAKERSTREET_API + '/o/authorize/?client_id=JK1B-RcY6jrlAb%3Fxxu.1RcLObMmv-E0lrUYVQoKS&response_type=token',
        interactive: true
      }, function(redirectUrl) {
        if (typeof(redirectUrl) !== 'string') {
          reject('Did not receive a valid redirectUrl', redirectUrl);
        }

        var matches = redirectUrl.match(/access_token=(.*?)(&.*)?$/);
        if (matches.length >= 2) {
          vm.currentUser = {
            accessToken: matches[1]
          };
          resolve(vm.currentUser);
        } else {
          reject('Failed to parse redirectUrl', redirectUrl);
        }
      });
    });
  };

  vm.getWhitelist = function (/*domain*/) {
    // TODO
    //return $q(function (resolve) {
    //  $http.get(BAKERSTREET_API + '/blacklist').
    //    success(function(data/*, status, headers, config*/) {
    //      resolve(data);
    //    });
    //});
  };
}
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
