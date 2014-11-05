'use strict';

var BAKERSTREET_API = 'http://api.sherlocke.me/api';

/* Declare AngularJS app */
angular.module('SherlockeApp', ['DjangoAuth']);

/* Eagerly instantiate services once modules are loaded */
function run($log, SherlockeService) {
  if (!SherlockeService) {
    $log.warn('SherlockService not instantiated');
  }
}
run.$inject = ['$log', 'SherlockeService'];
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
    });
  };
}
SherlockeService.$inject = ['$q', 'Auth'];
angular
    .module('SherlockeApp')
    .service('SherlockeService', SherlockeService);


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

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});


/* Context menu item */
chrome.contextMenus.create({
  title: 'Prioritize this',
  contexts: ['selection', 'link', 'editable'],
  onclick: menuItemClicked
});

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


/* Bootstrap the app onto the generated background page */
angular.element(document).ready(function() {
  angular.bootstrap(document, ['SherlockeApp']);
});
