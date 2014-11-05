'use strict';

var BAKERSTREET_API = 'http://api.sherlocke.me/api';
// var BAKERSTREET_API = 'http://15cc08bf.ngrok.com/api';


/* Declare AngularJS app */
var app = angular.module('SherlockeApp', ['DjangoAuth', 'ngCookies']);

// app.config(['$httpProvider', function ($httpProvider) {
//   $httpProvider.defaults.useXDomain = true;
//   delete $httpProvider.defaults.headers.common['X-Requested-With'];

//   Reset headers to avoid OPTIONS request (aka preflight)
//   $httpProvider.defaults.headers.common = {};
//   $httpProvider.defaults.headers.post = {};
//   $httpProvider.defaults.headers.put = {};
//   $httpProvider.defaults.headers.patch = {};

  // $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  // $httpProvider.defaults.xsrfCookieName = 'csrftoken';
// }]);


/* Eagerly instantiate services once modules are loaded */
function run($http, $cookies, $log, SherlockeService) {
  if (!SherlockeService) {
    $log.warn('SherlockService not instantiated');
  }

  $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
}
run.$inject = ['$http', '$cookies', '$log', 'SherlockeService'];
app.run(run);

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
app.config(config);

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
app.service('SherlockeService', SherlockeService);


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


// chrome.runtime.onInstalled.addListener(function (details) {
//   console.log('previousVersion', details.previousVersion);
// });


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
