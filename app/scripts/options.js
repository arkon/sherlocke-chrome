'use strict';

/* Declare AngularJS app */
angular.module('SherlockeOptions', ['ChromeMessaging']);

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
    });
  };
}
AuthController.$inject = ['$log', 'ChromeMessaging'];
angular
    .module('SherlockeOptions')
    .controller('AuthController', AuthController);
