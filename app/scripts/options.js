'use strict';

/* Declare AngularJS app */
var options = angular.module('SherlockeOptions', []);

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
      //   var SherlockeService = angular.element(document.body).injector().get('SherlockeService');
      //   vm.authToken = SherlockeService.authToken;

      //   $scope.currentUser = 'wow';
      // }
    });
  };
}
AuthController.$inject = ['$log'];
options.controller('AuthController', AuthController);
