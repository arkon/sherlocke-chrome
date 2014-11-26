'use strict';

/*
 * angular-chrome-messaging uses `chrome.runtime.connect` to allow
 * separate sandboxed scripts to pass data between each other.
 */
angular.module('ChromeMessaging', []);

var PublicationFactory = ['$rootScope', '$q', function ($rootScope, $q) {
  /**
   * A method published by a sandboxed Chrome script.
   *
   * @constructor
   */
  function Publication(moduleName, methodName, method, options) {
    // Keep model reference
    var m = this;

    // Set default parameter values
    options = options || {};

    m.moduleName = moduleName;
    m.methodName = methodName;
    m.method = method;

    /*
     * If the publication can be subscribed to,
     * keep a list of subscriber ports and notify them via $rootScope.$watch
     *
     * Note: `method` must not take any parameters
     */
    if (options.canSubscribe) {
      m.subscribers = [];
      $rootScope.$watch(m.method, function (newValue) {
        m.notifySubscribers(m.subscribers, newValue);
      });
    }

    /*
     * Upon client connection, call `method` and return the result to the client.
     */
    chrome.runtime.onConnect.addListener(function (port) {
      // Client is connecting through `port`
      if (port.name !== moduleName + '.' + methodName) {
        // Client isn't trying to call this publication's method; abort
        return;
      }

      // When client calls the method, return the method result
      port.onMessage.addListener(function (internalRequest) {
        // Keep a port reference if the method can be subscribed to
        if (options.canSubscribe && internalRequest.watch) {
          // Add the port to the list of subscribers if it doesn't already exist
          if (m.subscribers.indexOf(port) === -1) {
            m.subscribers.push(port);
          }
        }

        // Call `method` and immediately notify the client
        var result =  m.method(internalRequest.params);
        m.notifyClient(port, result);
      });
    });
  }

  /**
   * Notify the given client port of the result.
   *
   * @param clientPort
   * @param result
   */
  Publication.prototype.notifyClient = function (clientPort, result) {
    $q.when(result).then(function success(result) {
      clientPort.postMessage({
        status: 'resolved',
        data: result
      });
    }, function failure(reason) {
      clientPort.postMessage({
        status: 'rejected',
        data: reason
      });
    });
  };

  /**
   * Notify subscribers of the new result.
   */
  Publication.prototype.notifySubscribers = function (subscribers, result) {
    var m = this;
    angular.forEach(subscribers, function (subscriberPort) {
      m.notifyClient(subscriberPort, result);
    });
  };

  return Publication;
}];
//PublicationFactory.$inject = ['$scope', '$q'];
angular
    .module('ChromeMessaging')
    .factory('Publication', PublicationFactory);


function ChromeMessaging($q, Publication, moduleName) {
  /**
   * Publish a method to be accessible from any script.
   * Subscribers are updated when the result changes.
   *
   * Usage:
   *
   *   ChromeMessaging.publish(
   *     'getDocuments',
   *     SherlockeService.getDocuments
   *   );
   *
   * @param methodName
   * @param method
   * @param [options]
   */
  this.publish = function (methodName, method, options) {
    return new Publication(moduleName, methodName, method, options).method;
  };

  /**
   * Call a method on an external script. The returned promise is resolved if
   * the remote method returns a value or a resolved promise, or rejected if
   * the remote method returns a rejected promise.
   *
   * If `watch == true`, then notify the promise every time someone calls the same method.
   * The returned promise is never resolved, only notified or rejected.
   * If the promise is rejected, no additional notifications are made.
   *
   * @param moduleName  App identifier which has published `methodName`
   * @param methodName  A published method
   * @param [params]    JSON-serializable parameters to pass to the method
   * @param watch       true if the returned promise should be notified when the value changes
   * @returns {Promise} Resolves with the result
   */
  var _callMethod = function (moduleName, methodName, params, watch) {
    var deferred = $q.defer();

    var port = chrome.runtime.connect({
      name: moduleName + '.' + methodName
    });

    // Send the method parameters, and don't watch the result
    port.postMessage({
      watch: watch,
      params: params
    });
    port.onMessage.addListener(function (internalResult) {
      if (internalResult.status === 'resolved') {
        if (watch) {
          deferred.notify(internalResult.data);
        } else {
          deferred.resolve(internalResult.data);
        }
      } else {
        deferred.reject(internalResult.data);
      }
    });

    return deferred.promise;
  };

  /**
   * Call a method on an external script.
   *
   * @param moduleName  App identifier which has published `methodName`
   * @param methodName  A published method
   * @param [params]    JSON-serializable parameters to pass to the method
   * @returns {Promise} Resolves with the result
   */
  this.callMethod = function (moduleName, methodName, params) {
    return _callMethod(moduleName, methodName, params, false);
  };

  /**
   * Call a method on an external script, and notify the promise every time
   * someone calls the same method.
   *
   * The returned promise is never resolved, only notified or rejected.
   * If the promise is rejected, no additional notifications are made.
   *
   * @param moduleName  App identifier which has published `methodName`
   * @param methodName  A published method
   * @param [params]    JSON-serializable parameters to pass to the method
   * @returns {Promise} Resolves with the result
   */
  this.subscribe = function (moduleName, methodName, params) {
    return _callMethod(moduleName, methodName, params, true);
  };
}

/**
 * Service that allows sandboxed Chrome scripts to publish and call each others
 * methods
 *
 * Internal message schema:
 *   Request:
 *     {
 *       watch: true|false,
 *       params: <any>
 *     }
 *
 *   Response:
 *     {
 *       type: "data"|"promise",
 *       status: null|"resolved"|"rejected",
 *       data: <any>
 *     }
 *
 * @constructor
 */
function ChromeMessagingProvider() {
  var moduleName;

  this.setModuleName = function (name) {
    moduleName = name;
  };

  this.$get = ['$q', 'Publication', function ($q, Publication) {
    return new ChromeMessaging($q, Publication, moduleName);
  }];
}
angular
    .module('ChromeMessaging')
    .provider('ChromeMessaging', ChromeMessagingProvider);
