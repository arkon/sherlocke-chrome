'use strict';

(function () {
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
  function PopupController(ChromeBindings) {
    var vm = this;

    vm.user = null;
    ChromeBindings
      .bindVariable('SherlockeApp', 'currentUser')
      .to(vm, 'user');
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


  function SessionsController($log, $location, ChromeMessaging, ChromeBindings) {
    var vm = this;

    // The list of research sessions
    vm.sessions = [];
    //ChromeMessaging
    //  .bindVariable('SherlockeApp', 'researchSessions')
    //  .to(vm, 'sessions');

    // The current research session
    vm.currentSession = null;

    // Whether the current research session is paused
    vm.isPaused = true;
    ChromeBindings
      .bindVariable('SherlockeApp', 'isResearchSessionPaused')
      .to(vm, 'isPaused');

    /* Update local references when SherlockeApp changes */
    ChromeMessaging.subscribe('SherlockeApp', 'getResearchSessions').then(null, function failure(reason) {
      $log.error('Failed to fetch research sessions:', reason);
    }, function notified(researchSessions) {
      $log.info('Fetched research sessions:', researchSessions);
      vm.sessions = researchSessions;
    });
    ChromeMessaging.subscribe('SherlockeApp', 'getCurrentResearchSession').then(null, function rejected(reason) {
      $log.error(reason);
    }, function notified(researchSession) {
      $log.info('Fetched current research session:', researchSession);
      if (researchSession) {
        vm.currentSession = _.findWhere(vm.sessions, { id: researchSession.id });
      }
    });

    vm.updateSessions = function () {
      return ChromeMessaging.callMethod('SherlockeApp', 'updateResearchSessions');
    };

    vm.updateCurrentSession = function () {
      return ChromeMessaging.callMethod('SherlockeApp', 'updateCurrentResearchSession');
    };

    vm.changeSession = function(session) {
      // TODO: remove this crap
      return ChromeMessaging.callMethod('SherlockeApp', 'changeResearchSession', session).then(function success(result) {
        $log.info('Changed research session:', result);
        vm.currentSession = result;
      }, function failure(reason) {
        $log.error('Failed to change research session:', reason);
      });
    };

    /**
     * Create a research session and set it as the current session
     */
    vm.createSession = function(session) {
      return ChromeMessaging.callMethod('SherlockeApp', 'createResearchSession', {
        name: session.name
      }).then(function success(result) {
        $log.info('Created research session:', result);
        return vm.changeSession(result);
      }, function failure(reason) {
        $log.error('Failed to create research session:', reason);
      }).then(function () {
        return vm.updateSessions();
      }).then(function () {
        $location.path('#/tab1');
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

    vm.resumeSession = function () {
      return ChromeMessaging.callMethod('SherlockeApp', 'resumeResearchSession');
    };

    vm.pauseSession = function () {
      return ChromeMessaging.callMethod('SherlockeApp', 'pauseResearchSession');
    };

    /* Initialize by getting research sessions */
    vm.updateSessions().then(vm.updateCurrentSession);
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

}());
