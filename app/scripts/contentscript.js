'use strict';
/* jshint multistr: true */

/*
  TODO:
  - confidence level bars in suggestions list
  - fixed filter bar?
*/

/* Declare AngularJS app */
angular.module('Sherlocke', ['BakerStreet']);

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
angular
    .module('Sherlocke')
    .controller('MainController', MainController);

var SidePanelController = ['$scope', '$window', 'QuestionService', function ($scope, $window, QuestionService) {
  // Dummy loading
  $scope.isLoading = false;
//  $scope.isLoading = true;
//  var i = 1;
//  var crunch = $window.setInterval(function () {
//    $scope.progress = i++;
//  }, 10);
//  $window.setTimeout(function() {
//    $window.clearInterval(crunch);
//    $scope.isLoading = false;
//  }, 2000);

  var questions = {
    'https://www.canlii.org/en/qc/laws/stat/cqlr-c-c-27/latest/cqlr-c-c-27.html': 'What is the Labour Code?',
    'https://www.canlii.org/en/sk/laws/stat/rss-1978-c-l-1/latest/rss-1978-c-l-1.html': 'What is the Labour Standards Act?',
    'https://www.canlii.org/en/on/laws/stat/so-2000-c-41/latest/so-2000-c-41.html': 'What does the "Employment Standards Act" say about minimum wage?',
    'https://www.canlii.org/en/on/onlrb/doc/2000/2000canlii7807/2000canlii7807.html?searchUrlHash=AAAAAQAMbWluaW11bSB3YWdlAAAAAAE': 'What is minimum wage?'
  };

  // Post sample question
  QuestionService.postQuestion({
    questionText: questions[$window.location.href] || 'What is the Labour Code?'
  }).then(function success(data/*, status, headers, config*/) {
    var links = {
      'PB_74093ED8A37A20A251ED45580874251': 'https://www.canlii.org/en/ca/laws/stat/rsc-1985-c-l-2/latest/rsc-1985-c-l-2.html',
      'T_E52D6070706DC1A240C9266A18A26365': 'https://www.canlii.org/en/nu/laws/stat/rsnwt-nu-1988-c-l-1/latest/rsnwt-nu-1988-c-l-1.html'
    };

    $scope.evidence = _.map(data.data.question.evidencelist, function (document) {
      document.link = links[document.id] || '#';
      return document;
    });

  }, function failure(/*data, status, headers, config*/) {

  });
}];
angular
    .module('Sherlocke')
    .controller('SidePanelController', SidePanelController);

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
angular
    .module('Sherlocke')
    .directive('skMain', MainDirective);

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
angular
    .module('Sherlocke')
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
    .module('Sherlocke')
    .directive('skSelect', SelectDirective);


/*
 * Bootstrap AngularJS
 * https://docs.angularjs.org/guide/bootstrap
 */
angular.element(document).ready(function () {
  var documentHeader = angular.element('#documentHeader');
  if (documentHeader && documentHeader.length) {
    // Add class to body for styling
    angular.element('body').addClass('sherlocke');

    // Inject the main directive & controller onto CanLII's #wrap div and insert the side panel
    angular.element('#wrap')
        .attr('sk-main', true)
        .attr('ng-controller', 'MainController')
        .after('<div sk-side-panel ng-controller="SidePanelController" id="sherlocke"></div>');

    angular.bootstrap(document, ['Sherlocke']);
  }

});
