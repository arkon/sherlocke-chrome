'use strict';

/*
 * angular-chrome-messaging uses `chrome.runtime.connect` to allow
 * content scripts, options pages, and popups to interface with a background script.
 */

/* Declare AngularJS app */
angular.module('ChromeMessaging', []);

/*
 * Services
 */

/**
 * Service that allows sandboxed Chrome scripts to publish and call each others
 * methods
 *
 * @constructor
 */
function ChromeMessaging($log, $q) {
  // Methods published in the app-local instance of ChromeMessaging
  var localPublished = {};

  /**
   * Publish a method to be accessible from any extension component
   *
   * @param appName    App identifier of the publisher
   * @param methodName Method identifier
   * @param callback   Callback to execute when a client calls the method.
   *                   May only take JSON-serializable parameters and return JSON-serializable responses
   */
  this.publishMethod = function (appName, methodName, callback) {
    if (appName && methodName && callback) {
      if (!(appName in localPublished)) {
        localPublished[appName] = {};
      }

      localPublished[appName][methodName] = callback;
    }

    chrome.runtime.onConnect.addListener(function (port) {
      // Client is connecting through `port`
      if (port.name !== appName + '.' + methodName) {
        // Client isn't trying to subscribe to this method; abort
        return;
      }

      // When client calls the method, return the callback result
      port.onMessage.addListener(function (message) {
        var result = callback(message);
        port.postMessage(result);
      });
    });
  };

  /**
   * Call a method on an external app.
   *
   * @param appName     App identifier which has published `methodName`
   * @param methodName  A published method
   * @param [params]    JSON-serializable parameters to pass to the method
   * @returns {Promise} Resolves with the result
   */
  this.callMethod = function (appName, methodName, params) {
    return $q(function (resolve/*, reject*/) {
      var port = chrome.runtime.connect({
        name: appName + '.' + methodName
      });

      // Ping the port to ensure it's published
      port.postMessage(params);
      port.onMessage.addListener(function (result) {
        resolve(result);
      });
    });
  };
}
ChromeMessaging.$inject = ['$log', '$q'];
angular
    .module('ChromeMessaging')
    .service('ChromeMessaging', ChromeMessaging);
