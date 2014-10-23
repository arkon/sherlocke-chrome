'use strict';
/* jshint multistr: true */

/*
  TODO:
  - confidence level bars in suggestions list
  - fixed filter bar?
*/


/*
 * Some shortcuts for long JavaScript calls
 */

function getElemId(elementId) {
  return document.getElementById(elementId);
}

Element.prototype.addClass = function(className) {
  this.classList.add(className);
};

Element.prototype.removeClass = function(className) {
  this.classList.remove(className);
};

Element.prototype.hasClass = function(className) {
  return this.classList.contains(className);
};


/* Declare AngularJS app */
angular.module('Sherlocke', ['BakerStreet']);

/*
 * Controllers
 */
var MainController = ['$scope', function ($scope) {
  $scope.test = 'test';
}];
angular
    .module('Sherlocke')
    .controller('MainController', MainController);

var SidePanelController = ['$scope', 'QuestionService', function ($scope, QuestionService) {
  QuestionService.postQuestion({
    questionText: 'What is the Labour Code?'
  }).then(function success(data/*, status, headers, config*/) {
    $scope.sampleResponse = data;
  }, function failure(/*data, status, headers, config*/) {

  });
}];
angular
    .module('Sherlocke')
    .controller('SidePanelController', SidePanelController);

/*
 * Directives
 */

var SidePanelDirective = ['$sce', function ($sce) {
  return {
    restrict: 'A',
    templateUrl: $sce.trustAsResourceUrl(chrome.extension.getURL('templates/side-panel.html'))
  };
}];
angular
    .module('Sherlocke')
    .directive('sidePanel', SidePanelDirective);


/*
 * Bootstrap AngularJS
 * https://docs.angularjs.org/guide/bootstrap
 */
angular.element(document).ready(function () {
  var optShowMenu;
  var isDocument = false;

  if (getElemId('documentHeader') !== null) {
    isDocument = true;
    document.body.addClass('sherlocke');
  }

  if (isDocument) {
    // Inject the main controller onto CanLII's #wrap div and insert the side panel
    angular.element('#wrap')
        .attr('ng-controller', 'MainController as main')
        .after('<div side-panel ng-controller="SidePanelController as side" id="sherlocke"></div>');

    angular.bootstrap(document, ['Sherlocke']);

    // Dummy loading
    var i = 1;
    var crunch = setInterval(function() { $('#sherlocke-loading-message').html('Analyzed ' + i + ' documents'); i++; }, 10);
    setTimeout(function() {
      clearInterval(crunch);
      $('#sherlocke-content').removeClass('hidden');
      $('#sherlocke-loading').addClass('hidden');
    }, 2000);


    // Handle sidebar toggle
    $('#sherlocke-toggle').click(function() {
      $('body').toggleClass('hide-sidebar');

      // Sync setting
      chrome.storage.sync.set({ 'opt-hide-sidebar': $('body').hasClass('hide-sidebar') });
    });


    // Handle showing/hiding of filters menu
    var $sherlocke = $('#sherlocke');
    var $filters   = $('#sherlocke-filters');

    $filters.click(function(e) {
      $sherlocke.toggleClass('show-menu');

      if (optShowMenu) {
        chrome.storage.sync.set({ 'opt-show-menu': false });
      }

      e.stopPropagation();
    });

    document.body.addEventListener('click', function() {
      if ($sherlocke.hasClass('show-menu')) {
        $sherlocke.removeClass('show-menu');

        if (optShowMenu) {
          chrome.storage.sync.set({ 'opt-show-menu': false });
        }
      }
    }, false);


    // Handle the filters
    $('#sherlocke-filters li').click(function() {
      $('#sherlocke-filter').html(this.innerHTML);
    });


    // Settings
    chrome.storage.sync.get(['opt-hide-sidebar', 'opt-show-menu'], function(items) {
      if (items['opt-hide-sidebar']) {
        $('body').toggleClass('hide-sidebar', items['opt-hide-sidebar']);
      } else {
        chrome.storage.sync.set({ 'opt-hide-sidebar': false });
      }

      if (items['opt-show-menu']) {
        optShowMenu = items['opt-show-menu'];
        $sherlocke.toggleClass('show-menu', optShowMenu);
      } else {
        optShowMenu = true;
        chrome.storage.sync.set({ 'opt-show-menu': true });
      }
    });


    // Aggregate suggestions and show it in a list
    var $suggestions = $('#sherlocke-suggestions');

    // Dummy list items
    for (i = 0; i < 20; i++) {
      $suggestions.append('<li><a href="#"><h1>Wow</h1><p>' + i + '</p><p>CanLII</p></a></li>');
    }
  }

});
