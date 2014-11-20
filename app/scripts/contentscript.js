'use strict';
/* jshint multistr: true */

/* Declare AngularJS app */
angular.module('SherlockeContent', ['ChromeMessaging']);

/*
 * Controllers
 */
function SidePanelController($window, $document, $log, ChromeMessaging) {
  var vm = this;

  // Whether sidebar is loading
  vm.isLoading = true;

  // The active research session
  vm.activeResearchSession = null;

  /*
   * TODO: If the user has an active research session, then send the current page
   * and fetch relevant documents.
   *
   * For now, just send the current page
   */
  var url = $window.location.href;
  var title = $document[0].title.replace(/^CanLII - /, '');

  ChromeMessaging.callMethod('SherlockeApp', 'sendCurrentPage', {
    url: url,
    title: title
  }).then(function success(/*_page*/) {
    // var page = _page.$response.data;
    return ChromeMessaging.callMethod('SherlockeApp', 'getDocuments');
  }).then(function success(documents) {
    vm.evidence = documents;
    vm.isLoading = false;
  }, function failure(reason) {
    $log.warn(reason);
    vm.isLoading = false;
  });
}
SidePanelController.$inject = ['$window', '$document', '$log', 'ChromeMessaging'];
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
    link: function (/*scope*/) {
      //scope.$watch('isSidebarHidden', function (value) {
      //  angular.element('body').toggleClass('hide-sidebar', value);
      //});
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

    // Wrap the actual page contents within a div for manipulating width
    $('body').wrapInner('<div class="sherlocke-original-page" />');

    // Inject the main directive & controller onto CanLII's #wrap div and insert the side panel
    // angular.element('#wrap')
    angular.element('body')
        .attr('sk-main', true)
        .append('<div id="sherlocke"><div sk-side-panel ng-controller="SidePanelController as side"></div></div>');

    angular.bootstrap(document, ['SherlockeContent']);
  }
});
