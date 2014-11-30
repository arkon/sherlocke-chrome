'use strict';
/* jshint sub:true */

(function () {
  /* Declare AngularJS app */
  angular.module('SherlockeOptions', ['ngRoute', 'truncate', 'ChromeMessaging']);

  /* Module configuration */
  function config ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        resolve: {

        }
      });
  }
  angular
    .module('SherlockeOptions')
    .config(config);

  /*
   * Controllers
   */
  function AuthController($log, ChromeMessaging) {
    var vm = this;

    vm.isAuthenticated = false;

    vm.authenticate = function () {
      // Send a message to background.js to authenticate
      ChromeMessaging.callMethod('SherlockeApp', 'authenticate').then(function (result) {
        vm.isAuthenticated = true;
        $log.info('Auth result: ', result);
      }, function failure(reason) {
        if (reason.data) {
          vm.alerts = reason.data['non_field_errors'];
        }
        $log.warn('Auth failure: ', reason);
      });
    };

    // Subscribe to the current user
    //ChromeMessaging.subscribe('SherlockeApp', '')
  }
  angular
    .module('SherlockeOptions')
    .controller('AuthController', AuthController);


  function WhitelistController($log, ChromeMessaging) {
    var vm = this;

    vm.whitelist = ['facebook.com', 'google.com'];

    vm.getWhitelist = function () {
      return ChromeMessaging.callMethod('SherlockeApp', 'getWhitelist').then(function (result) {
        $log.info('Whitelist result: ', result);
        vm.whitelist = result;
      }, function failure(reason) {
        vm.alerts = reason.data['non_field_errors'];
        $log.warn('Whitelist failure: ', reason);
      });
    };

    vm.addToWhitelist = function (urlPattern) {
      ChromeMessaging.callMethod('SherlockeApp', 'addToWhitelist', {
        urlPattern: urlPattern
      }).then(function success() {
        // Successfully added urlPattern to whitelist
        return vm.getWhitelist();
      }, function failure(reason) {
        $log.error('Failed to add ' + urlPattern + ' to whitelist:', reason);
      });
    };
  }
  angular
    .module('SherlockeOptions')
    .controller('WhitelistController', WhitelistController);

}());
