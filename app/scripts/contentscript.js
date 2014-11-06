'use strict';
/* jshint multistr: true */

/* Declare AngularJS app */
angular.module('SherlockeContent', ['ChromeMessaging']);

function SidePanelController($window, $http, $log, ChromeMessaging) {
  var vm = this;

  // Loading
  vm.isLoading = true;

  /*
   * If the user has an active research session, then send the current page
   * and fetch relevant documents.
   */
  ChromeMessaging.callMethod('SherlockeApp', 'getActiveResearchSession').then(function success(researchSession) {
    // GET the evidence document list given the current page
    ChromeMessaging.callMethod('SherlockeApp', 'getDocuments', {
      'page_url': $window.location.href,
      'title': document.title,
      'content': ''
    }).then(function success(documents) {
      debugger;
      vm.documents = documents;

      vm.loading = false;
    }, function failure(reason) {
      debugger;
      $log.warn(reason);

      vm.loading = false;
    });
  }, function failure(reason) {
    // Failed to get research session; mostly likely none is active
    $log.warn('Failed to get active research session', reason);
  });


//
//
//
//
//  $http.get(BAKERSTREET_API + '/documents')
//      .success(function(data) {
//        $scope.evidence = data;
//
//        $window.clearInterval(crunch);
//        $scope.isLoading = false;
//      });
}
SidePanelController.$inject = ['$window', '$http', '$log', 'ChromeMessaging'];
angular
    .module('SherlockeContent')
    .controller('SidePanelController', SidePanelController);


/*
 * Directives
 */
var MainDirective = [function () {
  return {
    restrict: 'A',
    scope: {
      isSidebarHidden: '=isSidebarHidden'
    },
    link: function (scope) {
      scope.$watch('isSidebarHidden', function (value) {
        angular.element('body').toggleClass('hide-sidebar', value);
      });
    },
    controllerAs: 'main',
    controller: function () {
      var vm = this;

      // Settings
      chrome.storage.sync.get(['opt-hide-sidebar', 'opt-show-menu'], function (items) {
        if ('opt-hide-sidebar' in items) {
          vm.isSidebarHidden = items['opt-hide-sidebar'];
        } else {
          chrome.storage.sync.set({ 'opt-hide-sidebar': false });
          vm.isSidebarHidden = false;
        }

        if ('opt-show-menu' in items) {
          vm.showMenu = items['opt-show-menu'];
        } else {
          chrome.storage.sync.set({ 'opt-show-menu': true });
          vm.showMenu = true;
        }
      });
    }
  };
}];
angular
    .module('SherlockeContent')
    .directive('skMain', MainDirective);

var SidePanelDirective = ['$sce', function ($sce) {
  return {
    restrict: 'A',
    scope: {},
    templateUrl: $sce.trustAsResourceUrl(chrome.extension.getURL('templates/side-panel.html')),
    link: function (scope, element) {
      // Handle sidebar toggle
      element.find('#sherlocke-toggle').click(function () {
        var body = angular.element('body');
        body.toggleClass('hide-sidebar');

        scope.isSidebarHidden = body.hasClass('hide-sidebar');

        // Sync setting
        chrome.storage.sync.set({
          'opt-hide-sidebar': scope.isSidebarHidden
        });
      });
    }
  };
}];
angular
    .module('SherlockeContent')
    .directive('skSidePanel', SidePanelDirective);

var SelectDirective = [function () {
  return {
    link: function (scope, element) {
      // Handle showing/hiding of filters menu
      var $filters   = element;
      var $sherlocke = element.closest('#sherlocke');

      $sherlocke.toggleClass('show-menu', scope.showMenu);

      $filters.click(function(e) {
        $sherlocke.toggleClass('show-menu');

        if (scope.showMenu) {
          chrome.storage.sync.set({ 'opt-show-menu': false });
        }

        e.stopPropagation();
      });

      angular.element('body').click(function () {
        if ($sherlocke.hasClass('show-menu')) {
          $sherlocke.removeClass('show-menu');

          if (scope.showMenu) {
            chrome.storage.sync.set({ 'opt-show-menu': false });
          }
        }
      });

      // Handle the filters
      $('#sherlocke-filters li').click(function() {
        $('#sherlocke-filter').html(this.innerHTML);
      });
    }
  };
}];
angular
    .module('SherlockeContent')
    .directive('skSelect', SelectDirective);


/*
 * Bootstrap AngularJS
 * https://docs.angularjs.org/guide/bootstrap
 */
angular.element(document).ready(function () {
  var documentHeader = angular.element('#documentHeader');
  if (documentHeader && documentHeader.length) {

    // Wrap the actial page contents within a div for manipulating width
    $('body').wrapInner('<div class="sherlocke-original-page" />');

    // Inject the main directive & controller onto CanLII's #wrap div and insert the side panel
    // angular.element('#wrap')
    angular.element('body')
        .attr('sk-main', true)
        .append('<div id="sherlocke"><div sk-side-panel ng-controller="SidePanelController as side"></div></div>');

    angular.bootstrap(document, ['SherlockeContent']);
  }
});
