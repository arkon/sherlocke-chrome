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
PopupController.$inject = ['$log', 'ChromeMessaging'];
angular
  .module('SherlockePopup')
  .controller('PopupController', PopupController);

function PinnedController() {
  var vm = this;

  vm.noPinned = true;

  // TODO: call BakerStreet via ChromeMessaging
  //$http
  //  .get(BAKERSTREET_API + '/documents/pinned')
  //  .success(function (data) {
  //  vm.pinned = data;
  //
  //  vm.noPinned = vm.pinned.length === 0;
  //});
}
PinnedController.$inject = [];
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
PriorityController.$inject = ['$http'];
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
HistoryController.$inject = [];
angular
  .module('SherlockePopup')
  .controller('HistoryController', HistoryController);


function SessionsController($location, $log, ChromeMessaging) {
  var vm = this;

  vm.sessions = [];
  ChromeMessaging.callMethod('SherlockeApp', 'getResearchSessions').then(function success(researchSessions) {
    vm.sessions = researchSessions;
  }, function failure(reason) {
    $log.error(reason);
  });

  vm.currentSession = null;
  ChromeMessaging.subscribe('SherlockeApp', 'getCurrentResearchSession').then(null, function rejected(reason) {
    $log.error(reason);
  }, function notified(researchSession) {
    vm.currentSession = researchSession;
  });

  vm.changeSession = function(session) {
    // POST the current session
    // TODO: call BakerStreet via ChromeMessaging
    //$http.post(BAKERSTREET_API + '/research_session', { id: session });

    vm.currentSession = session;
  };

  // TODO: call BakerStreet via ChromeMessaging
  //$http
  //  .get(BAKERSTREET_API + '/research_session')
  //  .success(function (data) {
  //  vm.sessions = data.results;
  //
  //  // Select a valid item so that Angular doesn't show an empty option
  //  vm.currentSession = vm.sessions[0].id;
  //
  //  vm.noSessions = vm.sessions.length === 0;
  //});

  vm.createSession = function(session) {
    // TODO: move this to BakerStreet
    //ResearchSession
    //  .$create({ name: vm.session.name })
    //  .$then(function (_session) {
    //  vm.session = _session.$response.data;
    //  vm.currentSession = _session.$response.data.id;
    //
    //  vm.sessions.$add(_session).then(function() {
    //    $location.path('/');
    //  });
    //});

    ChromeMessaging.callMethod('SherlockeApp', 'createResearchSession', session.name).then(function success(result) {
      vm.sessions.push(result);
      vm.session = result;
    }, function failure(reason) {
      $log.error(reason);
    });
  };

  vm.destroy = function() {
    // TODO: call BakerStreet via ChromeMessaging
    //$http.delete(BAKERSTREET_API + '/research_session/' + vm.sessionID)
    //.success(function(data) {
    //  vm.sessions.$remove(vm.session).then(function () {
    //    $location.path('/');
    //  });
    //  if (vm.sessions.length) {
    //
    //    vm.sessionId = data[0].id;
    //  }
    //});
  };
}
SessionsController.$inject = ['$location', '$log', 'ChromeMessaging'];
angular
  .module('SherlockePopup')
  .controller('SessionsController', SessionsController);


/*
 * Directives
 */

/**
 * Research session selector and controls
 */
function skSession($sce) {
  return {
    templateUrl: $sce.trustAsResourceUrl(chrome.extension.getURL('templates/session-list.html')),
    link: function ($scope, $element) {
      // Handle pause button
      $element.find('#session-pause').click(function() {
        angular.element(this).toggleClass('paused');
      });
    }
  };
}
skSession.$inject= ['$sce'];
angular
  .module('SherlockePopup')
  .directive('skSession', skSession);

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
