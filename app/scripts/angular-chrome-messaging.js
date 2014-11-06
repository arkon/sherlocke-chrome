'use strict';

/*
 * angular-chrome-messaging uses `chrome.runtime.connect` to allow
 * content scripts, options pages, and popups to interface with a background script.
 */
angular.module('ChromeMessaging', []);

/**
 * A method published by a sandboxed Chrome script.
 *
 * @constructor
 */
function Publication(appName, methodName, method) {
  // Keep model reference
  var m = this;

  m.appName = appName;
  m.methodName = methodName;
  m.method = method;

  chrome.runtime.onConnect.addListener(function (port) {
    // Client is connecting through `port`
    if (port.name !== appName + '.' + methodName) {
      // Client isn't trying to subscribe to this method; abort
      return;
    }

    // Keep a port reference
    m.port = port;

    // When client calls the method, return the method result
    port.onMessage.addListener(function (params) {
      m.params = params;
      m.result = method(m.params);
      m.notifySubscribers(m.result);
    });
  });
}
Publication.prototype.updateResult = function () {
  this.result = this.method(this.params);
};
Publication.prototype.notifySubscribers = function (result) {
  this.port.postMessage(result || this.result);
};
Publication.prototype.updateAndNotify = function () {
  this.updateResult();
  this.notifySubscribers(this.result);
};

/**
 * Service that allows sandboxed Chrome scripts to publish and call each others
 * methods
 *
 * @constructor
 */
function ChromeMessaging($q) {
  /**
   * Publish a method to be accessible from any extension component.
   * Subscribers are updated when the result changes
   *
   * @param appName
   * @param methodName
   * @param method
   */
  this.publish = function (appName, methodName, method) {
    return new Publication(appName, methodName, method);
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

      // Send the method parameters
      port.postMessage(params);
      port.onMessage.addListener(function (result) {
        resolve(result);
      });
    });
  };

//  this.subscribe = function (appName, methodName, params, callback) {
//    return;
//  }
}
ChromeMessaging.$inject = ['$q'];
angular
    .module('ChromeMessaging')
    .service('ChromeMessaging', ChromeMessaging);
