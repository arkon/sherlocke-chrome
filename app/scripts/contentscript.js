'use strict';
/* jshint multistr: true */


/* Declare AngularJS app */
var contentModule = angular.module('SherlockeContent', ['BakerStreet']);


/*
 * Controllers
 */
var MainController = ['$scope', function ($scope) {
  // Settings
  chrome.storage.sync.get(['opt-hide-sidebar', 'opt-show-menu'], function (items) {
    if ('opt-hide-sidebar' in items) {
      $scope.isSidebarHidden = items['opt-hide-sidebar'];
    } else {
      chrome.storage.sync.set({ 'opt-hide-sidebar': false });
      $scope.isSidebarHidden = false;
    }

    if ('opt-show-menu' in items) {
      $scope.showMenu = items['opt-show-menu'];
    } else {
      chrome.storage.sync.set({ 'opt-show-menu': true });
      $scope.showMenu = true;
    }
  });
}];
contentModule.controller('MainController', MainController);

var SidePanelController = ['$scope', '$window', 'Pages', 'Documents',
      function ($scope, $window, Pages, Documents) {
  $scope.isLoading = false;

  // Dummy loading
  // $scope.isLoading = true;

  // var i = 1;
  // var crunch = $window.setInterval(function () {
  //   $scope.progress = i++;
  // }, 10);
  // $window.setTimeout(function() {
    // $window.clearInterval(crunch);
  //   $scope.isLoading = false;
  // }, 2000);

  // POST the current page
  var page = Pages.$build({
    /* jshint camelcase: false */
    page_url: $window.location.href,
    title: document.title,
    content: ''
  });
  page.$save();

  // GET the evidence document list
  var evidence = Documents.$find(1);
  evidence.$then(function() {
    $scope.evidence = evidence.data;

    $scope.isLoading = false;
  });
}];
contentModule.controller('SidePanelController', SidePanelController);


/*
 * Directives
 */
var MainDirective = [function () {
  return {
    link: function (scope) {
      scope.$watch('isSidebarHidden', function (value) {
        angular.element('body').toggleClass('hide-sidebar', value);
      });
    }
  };
}];
contentModule.directive('skMain', MainDirective);

var SidePanelDirective = ['$sce', function ($sce) {
  return {
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
contentModule.directive('skSidePanel', SidePanelDirective);

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
contentModule.directive('skSelect', SelectDirective);


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
        .append('<div ng-controller="MainController" id="sherlocke"><div sk-side-panel ng-controller="SidePanelController"></div></div>');

    angular.bootstrap(document, ['SherlockeContent']);
  }
});
