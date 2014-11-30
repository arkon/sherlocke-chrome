'use strict';

/* Declare AngularJS app */
angular.module('SherlockePopup', ['ngRoute', 'truncate', 'ChromeMessaging', 'BakerStreet']);


function config($routeProvider) {
  $routeProvider
    .when('/tab1', {
      controller:   'PinnedController',
      controllerAs: 'pinnedCtrl',
      templateUrl:  'templates/popup-pinned.html'
    })
    .when('/tab2', {
      controller:   'PriorityController',
      controllerAs: 'priorityCtrl',
      templateUrl:  'templates/popup-priority.html'
    })
    .when('/tab3', {
      controller:   'HistoryController',
      controllerAs: 'historyCtrl',
      templateUrl:  'templates/popup-history.html'
    })
    .when('/new', {
      controller:   'SessionsController',
      controllerAs: 'sessionsCtrl',
      templateUrl:  'templates/session-new-form.html'
    })
    .when('/delete', {
      controller:   'SessionsController',
      controllerAs: 'sessionsCtrl',
      templateUrl:  'templates/session-delete.html'
    })
    .otherwise({
      redirectTo:'/tab1'
    });
}
angular
  .module('SherlockePopup')
  .config(config);


/*
 * Controllers
 */
function PopupController($log, ChromeMessaging) {
  var vm = this;

  vm.user = null;
  ChromeMessaging.subscribe('SherlockeApp', 'getCurrentUser').then(null, function failure(reason) {
    $log.error('Failed to get current user', reason);
  }, function notified(user) {
    vm.user = user;
    vm.isAuthenticated = !!user;
  });
}
angular
  .module('SherlockePopup')
  .controller('PopupController', PopupController);

function PinnedController($log, ChromeMessaging) {
  var vm = this;

  // The list of pinned documents
  vm.pinnedDocuments = [];

  /**
   * Load pinned documents from BakerStreet
   */
  vm.getPinnedDocuments = function () {
    return ChromeMessaging.callMethod('SherlockeApp', 'getPinnedDocuments').then(function success(result) {
      $log.info('Got pinned documents:', result);
      vm.pinnedDocuments = result;
    }, function failure(reason) {
      $log.error('Failed to get pinned documents:', reason);
    });
  };

  /**
   * Pin a document via BakerStreet
   */
  vm.pinDocument = function (document) {
    return ChromeMessaging.callMethod('SherlockeApp', 'pinDocument').then(function success(result) {
      $log.info('Pinned document:', result);
      return vm.getPinnedDocuments();
    }, function failure(reason) {
      $log.error('Failed to pin document', document, reason);
    });
  };
}
angular
  .module('SherlockePopup')
  .controller('PinnedController', PinnedController);


function PriorityController() {
  var vm = this;

  vm.noPriority = true;

  vm.prioritized = [
    {'id': 0, 'name': 'Something'},
    {'id': 1, 'name': 'Lorem ipsum'}
  ];

  vm.noPriority = vm.prioritized.length === 0;
}
angular
  .module('SherlockePopup')
  .controller('PriorityController', PriorityController);


function HistoryController() {
  var vm = this;

  vm.noHistory = true;

  // TODO: call BakerStreet via ChromeMessaging
  //$http
  //  .get(configuration.bakerstreetApi + '/pages')
  //  .success(function (data) {
  //  vm.historyPages = data.results;
  //  vm.noHistory = vm.historyPages.length === 0;
  //});

  // To pin: POST to /documents with url (snippet: false)
}
angular
    .module('SherlockePopup')
    .controller('HistoryController', HistoryController);


function SessionsController($log, ChromeMessaging) {
  var vm = this;

  // The list of research sessions
  vm.sessions = [];

  // The current research session
  vm.currentSession = null;

  vm.getSessions = function () {
    return ChromeMessaging.callMethod('SherlockeApp', 'getResearchSessions').then(function success(researchSessions) {
      vm.sessions = researchSessions;
    }, function failure(reason) {
      $log.error(reason);
    });
  };

  vm.getCurrentSession = function () {
    return ChromeMessaging.subscribe('SherlockeApp', 'getCurrentResearchSession').then(null, function rejected(reason) {
      $log.error(reason);
    }, function notified(researchSession) {
      vm.currentSession = researchSession;
    });
  };

  vm.changeSession = function(session) {
    // TODO: remove this crap
    return ChromeMessaging.callMethod('SherlockeApp', 'changeResearchSession', {
      researchSession: session
    }).then(function success(result) {
      $log.info('Changed research session:', result);
      vm.currentSession = result;
    }, function failure(reason) {
      $log.error('Failed to change research session:', reason);
    });
  };

  vm.createSession = function(session) {
    return ChromeMessaging.callMethod('SherlockeApp', 'createResearchSession', {
      name: session.name
    }).then(function success(result) {
      $log.info('Created research session:', result);
      return vm.getSessions();
    }, function failure(reason) {
      $log.error('Failed to create research session:', reason);
    });
  };

  vm.deleteSession = function(session) {
    return ChromeMessaging.callMethod('SherlockeApp', 'deleteResearchSession', {
      researchSession: session
    }, function success(result) {
      $log.info('Deleted research session:', result);
      return vm.getSessions();
    }, function failure(reason) {
      $log.error('Failed to delete research session:', reason);
    });
  };
}
angular
  .module('SherlockePopup')
  .controller('SessionsController', SessionsController);

/**
 * Navigation tabs in the popup
 */
function skPopupTabs() {
  return {
    link: function ($scope, $element) {
      // Handle active tab's styling
      var $items = $element.find('li');
      $items.first().addClass('active');
      $items.on('click', function () {
        $items.removeClass('active');
        $(this).addClass('active');
      });
    }
  };
}
angular
    .module('SherlockePopup')
    .directive('skPopupTabs', skPopupTabs);
