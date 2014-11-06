'use strict';

var BAKERSTREET_API = 'http://api.sherlocke.me/api';


/* Declare AngularJS app */
angular.module('SherlockeApp', ['DjangoAuth', 'ChromeMessaging']);

/* Callback for when all modules are loaded */
function run($log, ChromeMessaging) {
  // Subscribe to and handle messages sent to 'SherlockeApp'
  ChromeMessaging.publishMethod('SherlockeApp', 'getActiveResearchSession', function () {
    return 'rs';
  });

  ChromeMessaging.publishMethod('SherlockeApp', 'getDocuments', function () {
    return ['some', 'documents'];
  });
}
run.$inject = ['$log', 'ChromeMessaging'];
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
}
config.$inject = ['AuthProvider'];
angular
    .module('SherlockeApp')
    .config(config);

/*
 * Services
 */
function SherlockeService($q, Auth) {
  var vm = this;

  vm.authenticate = function (email, password) {
    return Auth.login({
      email: email,
      password: password
    }).then(function (response) {
      vm.authToken = response.token;

      chrome.storage.sync.set({
        'sherlocke-token': response.token
      });
    });
  };
}
SherlockeService.$inject = ['$q', 'Auth'];
angular
    .module('SherlockeApp')
    .service('SherlockeService', SherlockeService);

/*
 * Listen for incoming messages using ChromeMessaging
 */



/*
 * Listen for incoming messages
 */
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (!('origin' in message) || !('type' in message)) {
    sendResponse({error: 'Must specify \'origin\' and \'type\''});
    return;
  }

  if (message.origin === 'options') {
    // Message from options.html
    if (message.type === 'authenticate') {
      // User is logging in
      if (!('data' in message)) {
        sendResponse({error: 'Expected \'data\', but none provided'});
        return;
      }

      // Get email and password
      var email = message.data.email;
      var password = message.data.password;

      // Authenticate using SherlockeService
      var SherlockeService = angular.element(document.body).injector().get('SherlockeService');
      SherlockeService.authenticate(email, password);
    }
  } else {
    sendResponse({error: 'Invalid origin \'' + message.origin + '\''});
  }
});


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
