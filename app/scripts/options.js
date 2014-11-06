'use strict';

/* Declare AngularJS app */
angular.module('SherlockeOptions', []);

/*
 * Controllers
 */
function AuthController($log) {
  var vm = this;

  vm.isAuthenticated = false;
  vm.email = '';
  vm.password = '';

  vm.authenticate = function () {
    // Send a message to background.js with the email and password
    chrome.runtime.sendMessage({
      origin: 'options',
      type: 'authenticate',
      data: {
        email: this.email,
        password: this.password
      }
    }, function (success) {
      if (success === undefined) {
        // Messaging error
        $log.error(chrome.runtime.lastError);
      }

      // `success` indicates whether authentication was successful
      vm.isAuthenticated = success;

      // if (vm.isAuthenticated === true) {
      //   vm.currentUser = vm.email;
      // }
    });
  };
}
AuthController.$inject = ['$log'];
angular
  .module('SherlockeOptions')
  .controller('AuthController', AuthController);
