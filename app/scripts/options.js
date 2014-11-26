'use strict';
/* jshint sub:true */

/* Declare AngularJS app */
angular.module('SherlockeOptions', ['truncate', 'ChromeMessaging']);

/*
 * Controllers
 */
function AuthController($log, ChromeMessaging) {
  var vm = this;

  vm.isAuthenticated = false;
  vm.email = '';
  vm.password = '';

  vm.authenticate = function () {
    // Send a message to background.js with the email and password
    ChromeMessaging.callMethod('SherlockeApp', 'authenticate', {
      email: vm.email,
      password: vm.password
    }).then(function (result) {
      $log.info('Auth result: ', result);
    }, function failure(reason) {
      vm.alerts = reason.data['non_field_errors'];
      $log.warn('Auth failure: ', reason);
    });
  };
}
AuthController.$inject = ['$log', 'ChromeMessaging'];
angular
    .module('SherlockeOptions')
    .controller('AuthController', AuthController);


function BlacklistController($log, ChromeMessaging) {
  var vm = this;

  vm.domains = ['facebook.com', 'google.com'];

  // POST to /blacklist (domain)
  vm.blacklist = function () {
    // Send a message to background.js with the email and password
    ChromeMessaging.callMethod('SherlockeApp', 'blacklist', {
      domain: vm.domain
    }).then(function (result) {
      $log.info('Blacklist result: ', result);
    }, function failure(reason) {
      vm.alerts = reason.data['non_field_errors'];
      $log.warn('Blacklist failure: ', reason);
    });
  };
}
BlacklistController.$inject = ['$log', 'ChromeMessaging'];
angular
    .module('SherlockeOptions')
    .controller('BlacklistController', BlacklistController);

