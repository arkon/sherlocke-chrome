'use strict';

(function () {
  /* Declare AngularJS app */
  angular.module('SherlockeApp', ['truncate', 'ChromeMessaging', 'BakerStreet', 'SherlockeConfig']);

  /* Callback for when all modules are loaded */
  function run(ChromeMessaging, SherlockeService) {
    /* Publish and handle messages sent to 'SherlockeApp' */

    /**********************
     * Users
     **********************/

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

    /**********************
     * Research sessions
     **********************/

    ChromeMessaging.publish(
      'getResearchSessions',
      SherlockeService.getResearchSessions,
      { canSubscribe: true }
    );

    ChromeMessaging.publish(
      'getCurrentResearchSession',
      SherlockeService.getCurrentResearchSession,
      { canSubscribe: true }
    );

    //ChromeMessaging.publish(
    //  'getIsResearchSessionPaused',
    //  SherlockeService.getIsResearchSessionPaused,
    //  { canSubscribe: true }
    //);

    ChromeMessaging.publish(
      'updateResearchSessions',
      SherlockeService.updateResearchSessions
    );

    ChromeMessaging.publish(
      'updateCurrentResearchSession',
      SherlockeService.updateCurrentResearchSession
    );

    ChromeMessaging.publish(
      'changeResearchSession',
      SherlockeService.changeResearchSession
    );

    ChromeMessaging.publish(
      'createResearchSession',
      SherlockeService.createResearchSession
    );

    ChromeMessaging.publish(
      'deleteResearchSession',
      SherlockeService.deleteResearchSession
    );

    /**********************
     * Documents
     **********************/

    ChromeMessaging.publish(
      'getDocuments',
      SherlockeService.getDocuments,
      { canSubscribe: true }
    );

    ChromeMessaging.publish(
      'pinDocument',
      SherlockeService.pinDocument
    );

    /**********************
     * Pages
     **********************/

    ChromeMessaging.publish(
      'sendCurrentPage',
      SherlockeService.sendCurrentPage
    );



    /**********************
     * Whitelist
     **********************/

    ChromeMessaging.publish(
      'getWhitelist',
      SherlockeService.getWhitelist
    );

    ChromeMessaging.publish(
      'addToWhitelist',
      SherlockeService.addToWhitelist
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
    ChromeMessagingProvider.moduleName = 'SherlockeApp';
  }
  angular
    .module('SherlockeApp')
    .config(config);

  /*
   * Services
   */
  function SherlockeService($q, $http, BAKERSTREET_API, ChromeMessaging, ChromeBindings) {
    var vm = this;

    vm.currentUser = null;
    ChromeBindings.publishVariable(vm, 'currentUser');

    /*
     * Research sessions
     */

    // User's research sessions
    vm.researchSessions = [];
    ChromeBindings.publishVariable(vm, 'researchSessions');

    // Keep a reference to the current research session
    vm.currentResearchSession = null;
    ChromeBindings.publishVariable(vm, 'currentResearchSession');

    vm.getCurrentResearchSession = function () {
      return vm.currentResearchSession;
    };

    // Whether the research session is paused
    vm.isResearchSessionPaused = true;
    ChromeBindings.publishVariable(vm, 'isResearchSessionPaused');

    // List of allowed sites for the current research session
    vm.whitelist = [];
    ChromeBindings.publishVariable(vm, 'whitelist');

    var downloadUserData = function () {
      vm.updateResearchSessions().then(function () {
        return vm.updateCurrentResearchSession();
      }).then(function () {
        return vm.updateWhitelist();
      });
    };

    /**
     * Fetches the research sessions from the network
     */
    vm.updateResearchSessions = function () {
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
            var sessions = response.data.results;
            vm.researchSessions = sessions;
            resolve(sessions);
          }, function failure(response) {
            reject(response);
          });
        }
      });
    };

    /**
     * Fetches the current research session from the network
     */
    vm.updateCurrentResearchSession = function () {
      // TODO: use restmod

      return $q(function (resolve, reject) {
        if (!vm.currentUser.accessToken) {
          reject('No access token set');
        } else {
          $http.get(BAKERSTREET_API + '/research_session/current.json', {
            headers: {
              'Authorization': 'Bearer ' + vm.currentUser.accessToken
            }
          }).then(function success(response) {
            var session = response.data;
            vm.currentResearchSession = session;
            resolve(session);
          }, function failure(response) {
            reject(response);
          });
        }
      });
    };

    /**
     * Change the current research session to the given session.
     *
     * TODO: remove this method. current research session should be tracked locally.
     */
    vm.changeResearchSession = function (researchSession) {
      return $q(function (resolve, reject) {
        if (!vm.currentUser.accessToken) {
          reject('No access token set');
        } else {
          $http.post(BAKERSTREET_API + '/research_session.json', researchSession, {
            headers: {
              'Authorization': 'Bearer ' + vm.currentUser.accessToken
            }
          }).then(function success(response) {
            resolve(response.data);
          }, function failure(response) {
            reject(response);
          });
        }
      }).then(downloadUserData);
    };

    /**
     * Create a research session
     *
     * @param session The session parameters
     */
    vm.createResearchSession = function (session) {
      // TODO: use restmod

      return $q(function (resolve, reject) {
        if (!vm.currentUser.accessToken) {
          reject('No access token set');
        } else {
          $http.post(BAKERSTREET_API + '/research_session.json', {
            'name': session.name
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
      // TODO: use restmod
      //Page.$create({
      //  'page_url': page.url,
      //  'title': page.title,
      //  'content': page.content,
      //  'snippet': false
      //}).$then(function (_page) {
      //  resolve(_page);
      //});

      return $q(function (resolve, reject) {
        if (!vm.currentUser.accessToken) {
          reject('No access token set');
        } else {
          $http.post(BAKERSTREET_API + '/pages.json', page, {
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

    vm.pinPage =  function (/*page, snippet*/) {
      //return $q(function (resolve) {
      //  Page.$create({
      //    'page_url': page.url,
      //    'title': page.title,
      //    'content': page.content,
      //    'snippet': snippet
      //  }).$then(function (_page) {
      //    resolve(_page);
      //  });
      //});
    };

    vm.accessToken = null;
    vm.authenticate = function () {
      return $q(function (resolve, reject) {
        chrome.identity.launchWebAuthFlow({
          url: BAKERSTREET_API + '/o/authorize/?client_id=sherlocke-chrome-dev&response_type=token',
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
      }).then(downloadUserData);
    };

    vm.getWhitelist = function () {
      return vm.whitelist;
    };

    vm.updateWhitelist = function (/*domain*/) {
      // TODO
      //return $q(function (resolve) {
      //  $http.get(BAKERSTREET_API + '/blacklist').
      //    success(function(data/*, status, headers, config*/) {
      //      resolve(data);
      //    });
      //});

      return $q(function (resolve, reject) {
        if (!vm.currentUser.accessToken) {
          reject('No access token set');
        } else {
          $http.get(BAKERSTREET_API + '/research_session/sitelist.json', {
            headers: {
              'Authorization': 'Bearer ' + vm.currentUser.accessToken
            }
          }).then(function success(response) {
            resolve(response.data);
          }, function failure(response) {
            reject(response);
          });
        }
      }).then(function (whitelist) {
        vm.whitelist = whitelist;
      });
    };

    vm.addToWhitelist = function (urlPattern) {
      // TODO: use restmod
      return $q(function (resolve, reject) {
        if (!vm.currentUser.accessToken) {
          reject('No access token set');
        } else {
          $http.post(BAKERSTREET_API + '/research_session/sitelist.json', {
            url: urlPattern
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
      }).then(vm.updateWhitelist);
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

}());
