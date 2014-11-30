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
   * Services
   */
  function OptionsService($log, ChromeMessaging) {
    var s = this;

    s.authenticate = function () {
      // Send a message to background.js to authenticate
      return ChromeMessaging.callMethod('SherlockeApp', 'authenticate');
    };
  }
  angular
    .module('SherlockeOptions')
    .service('OptionsService', OptionsService);

  /*
   * Controllers
   */
  function AuthController($log, OptionsService) {
    var vm = this;

    vm.isAuthenticated = false;

    vm.authenticate = function () {
      OptionsService.authenticate().then(function (result) {
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


  function WhitelistController($log, ChromeMessaging, ChromeBindings) {
    var vm = this;

    vm.whitelist = [];
    ChromeBindings
      .bindVariable('SherlockeApp', 'whitelist')
      .to(vm, 'whitelist');

    vm.addToWhitelist = function (urlPattern) {
      ChromeMessaging.callMethod('SherlockeApp', 'addToWhitelist', urlPattern);
    };
  }
  angular
    .module('SherlockeOptions')
    .controller('WhitelistController', WhitelistController);

}());
