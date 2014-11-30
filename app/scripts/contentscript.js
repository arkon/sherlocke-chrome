'use strict';
/* jshint multistr: true */

(function () {
  /* Declare AngularJS app */
  angular.module('SherlockeContent', ['truncate', 'ChromeMessaging']);

  function run($q, $log, $location, $rootScope, $compile, ContentService) {
    ContentService.bindCurrentUser.then(function (user) {
      return ContentService.bindCurrentSession;
    }).then(function (/*researchSession*/) {
      return ContentService.getWhitelist();
    }).then(function success(whitelist) {
      $log.info('Fetched whitelist:', whitelist);

      // TODO: regex-based matching

      if (_.some(whitelist, { url: $location.host() })) {
        var $body = angular.element('body');

        // Wrap the actual page contents within a div for manipulating width
        $body.wrapInner('<div class="sherlocke-original-page" />');

        // Inject the main directive & controller onto the page and insert the side panel
        $body
          .attr('ng-controller', 'MainController as main')
          .attr('ng-class', 'main.bodyClass')
          .append('<div id="sherlocke"><div sk-side-panel ng-controller="SidePanelController as side"></div></div>');

        $compile($body)($rootScope);
      }
    }, function failure(reason) {
      $log.error('Failed to fetch whitelist:', reason);
    });
  }
  angular
    .module('SherlockeContent')
    .run(run);

  /*
   * Services
   */
  function ContentService($log, ChromeMessaging, ChromeBindings) {
    var s = this;

    // The current user
    s.currentUser = {};
    s.bindCurrentUser = ChromeBindings
      .bindVariable('SherlockeApp', 'currentUser')
      .to(s, 'currentUser');

    s.sessions = [];
    s.bindSessions = ChromeBindings
      .bindVariable('SherlockeApp', 'researchSessions')
      .to(s, 'sessions');

    s.currentSession = null;
    s.bindCurrentSession = ChromeBindings
      .bindVariable('SherlockeApp', 'currentResearchSession')
      .toAccessors(function getter() {
        return s.currentSession;
      }, function setter(newValue) {
        s.currentSession = newValue ? _.findWhere(s.sessions, { id: newValue.id }) : newValue;
      });

    s.getWhitelist = function () {
      return ChromeMessaging.callMethod('SherlockeApp', 'getWhitelist');
    };
  }
  angular
    .module('SherlockeContent')
    .service('ContentService', ContentService);

  /*
   * Controllers
   */
  function MainController($scope) {
    var vm = this;

    // Whether sidebar is hidden
    vm.isSidebarHidden = false;

    // ngClass to set on the body
    vm.bodyClass = '';
    $scope.$watch(function () {
      return vm.isSidebarHidden;
    }, function (value) {
      vm.bodyClass = value ? 'hide-sidebar' : '';
    });
  }
  angular
    .module('SherlockeContent')
    .controller('MainController', MainController);

  function SidePanelController($log, $scope, $window, $document, ChromeMessaging, ChromeBindings, ContentService) {
    var vm = this;

    // Whether sidebar is loading
    vm.isLoading = true;

    // Whether the current research session is paused
    vm.isPaused = true;
    ChromeBindings
      .bindVariable('SherlockeApp', 'isResearchSessionPaused')
      .to(vm, 'isPaused');

    // The list of documents
    vm.documents = [];

    // The current user
    vm.currentUser = null;
    $scope.$watch(function () {
      return ContentService.currentUser;
    }, function (value) {
      vm.currentUser = value;
    });

    vm.sendCurrentPage = function () {
      var url   = $window.location.href;
      var title = $document[0].title.replace(/^CanLII - /, '');

      var currentPage = {
        'page_url': url,
        'title': title,
        'content': angular.element('html').html()
      };

      $log.info('Sending current page:', currentPage);

      return ChromeMessaging.callMethod('SherlockeApp', 'sendCurrentPage', currentPage);
    };

    vm.getDocuments = function () {
      return ChromeMessaging.callMethod('SherlockeApp', 'getDocuments').then(function success(documents) {
        $log.info('Received documents:', documents);
        vm.documents = documents;
        vm.isLoading = false;
      }, function failure(reason) {
        $log.warn(reason);
        vm.isLoading = false;
      });
    };

    /* Dummy data to work with for now */
    vm.documents = [{ url: 'www.google.ca', source: 'CanLII', title: 'Employment Standards Act, 2000, SO 2000, c 41', text: 'If the employer has scheduled vacation for an employee and subsequently the employee goes on strike or is locked out during a time for which the vacation had been scheduled, the employer shall pay to the employee the vacation pay that would have been paid to him or her with respect to that vacation. 2000, c. 41, s. 37', pinned: false },
      { url: 'www.google.ca', source: 'CanLII', title: 'Labour Relations Act, 1995, SO 1995, c 1, Sch A', text: 'Every administrator shall file annually with the Minister not later than June 1 in each year or at such other time or times as the Minister may direct, a copy of the audited financial statement certified by a person licensed under the Public Accounting Act, 2004 or a firm whose partners are licensed under that Act of a vacation pay fund, or a welfare benefit or pension plan or fund setting out its financial condition for the preceding fiscal year and disclosing,', pinned: true },
      { url: 'www.google.ca', source: 'CanLII', title: 'Dean Potvin & Justin Potvin v Weston Bakeries Limited, 2012 CanLII 78433 (ON LRB)', text: 'Nothing in this Act authorizes any person to attempt at the place at which an employee works to persuade the employee during the employee’s working hours to become or refrain from becoming or continuing to be a member of a trade union.', pinned: true },
      { url: 'www.google.ca', source: 'CanLII', title: 'Cesaroni v. United Assn. of Journeymen and Apprentices of The Plumbing and Pipefitting Industry of the United States and Canada Local 46, 2000 CanLII 12021 (ON LRB)', text: 'No employer, employers\' organization or person acting on behalf of an employer or an employers\' organization, (a)  shall refuse to employ or to continue to employ a person, or discriminate against a person in regard to employment or any term or condition of employment because the person was or is a member of a trade union or was or is exercising any other rights under this Act;', pinned: true }];


    // Send the current page, then get the documents
    vm.sendCurrentPage().then(vm.getDocuments);
  }
  angular
    .module('SherlockeContent')
    .controller('SidePanelController', SidePanelController);


  function FilterSelectController() {
    var vm = this;

    // Whether filter selection menu is shown
    vm.showMenu = false;

    // Currently-selected filter
    vm.filter = {
      type: 'all',
      name: 'All related documents'
    };

    vm.toggle = function () {
      vm.showMenu = !vm.showMenu;
    };

    vm.click = function ($event) {
      var $target = angular.element($event.target);
      vm.filter = {
        type: $target.data('type'),
        name: $target.text()
      };
    };
  }
  angular
    .module('SherlockeContent')
    .controller('FilterSelectController', FilterSelectController);


  /*
   * Directives
   */
  var SidePanelDirective = function ($sce) {
    return {
      restrict: 'A',
      templateUrl: $sce.trustAsResourceUrl(chrome.extension.getURL('templates/side-panel.html')),
      link: function () {}
    };
  };
  angular
    .module('SherlockeContent')
    .directive('skSidePanel', SidePanelDirective);

  /*
   * Bootstrap AngularJS
   * https://docs.angularjs.org/guide/bootstrap
   */
  angular.element(document).ready(function () {
    angular.bootstrap(document, ['SherlockeContent']);
  });

}());
