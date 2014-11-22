'use strict';
/* jshint multistr: true */

/* Declare AngularJS app */
angular.module('SherlockeContent', ['ChromeMessaging', 'truncate']);

angular.module('truncate', []).filter('characters', function () {
  return function (input, chars, breakOnWord) {
    if (isNaN(chars)) { return input; }
    if (chars <= 0) { return ''; }
    if (input && input.length > chars) {
      input = input.substring(0, chars);

      if (!breakOnWord) {
        var lastspace = input.lastIndexOf(' ');
        // get last space
        if (lastspace !== -1) {
          input = input.substr(0, lastspace);
        }
      } else {
        while (input.charAt(input.length-1) === ' '){
          input = input.substr(0, input.length -1);
        }
      }
      return input + '...';
    }
    return input;
  };
})
.filter('words', function () {
  return function (input, words) {
    if (isNaN(words)) { return input; }
    if (words <= 0) { return ''; }
    if (input) {
      var inputWords = input.split(/\s+/);
      if (inputWords.length > words) {
        input = inputWords.slice(0, words).join(' ') + '...';
      }
    }
    return input;
  };
});

/*
 * Controllers
 */
function SidePanelController(/*$window, $document, $log, ChromeMessaging*/) {
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
  // var url   = $window.location.href;
  // var title = $document[0].title.replace(/^CanLII - /, '');

  // ChromeMessaging.callMethod('SherlockeApp', 'sendCurrentPage', {
  //   url:   url,
  //   title: title
  // }).then(function success(/*_page*/) {
  //   // var page = _page.$response.data;
  //   return ChromeMessaging.callMethod('SherlockeApp', 'getDocuments');
  // }).then(function success(documents) {
  //   vm.evidence = documents;
  //   vm.isLoading = false;
  // }, function failure(reason) {
  //   $log.warn(reason);
  //   vm.isLoading = false;
  // });

  vm.evidence = [{ url: 'www.google.ca', source: 'CanLII', title: 'Wow', text: 'Tonx wayfarers fashion axe, art party tofu.', pinned: false },
                 { url: 'www.google.ca', source: 'Government of Canada', title: 'Something else with a really long title that needs multiple lines', text: 'Tonx wayfarers fashion axe, art party tofu farm-to-table meggings pop-up Etsy Shoreditch deep v sustainable small batch street art master cleanse. Twee ennui Blue Bottle Pinterest. Shoreditch gluten-free meditation, chia kogi cray banh mi XOXO hella farm-to-table Odd Future Blue Bottle Thundercats. Vice meditation viral chia, semiotics literally Pinterest. Before they sold out cliche +1 locavore, biodiesel try-hard polaroid Vice craft beer keffiyeh flexitarian. Pop-up single-origin coffee cold-pressed selfies keffiyeh artisan mumblecore health goth banjo flannel. Tattooed street art post-ironic direct trade quinoa four dollar toast, listicle artisan polaroid.', pinned: true },
                 { url: 'www.google.ca', source: 'Government of Canada', title: 'Something else with a really long title that needs multiple lines', text: 'Tonx wayfarers fashion axe, art party tofu farm-to-table meggings pop-up Etsy Shoreditch deep v sustainable small batch street art master cleanse. Twee ennui Blue Bottle Pinterest. Shoreditch gluten-free meditation, chia kogi cray banh mi XOXO hella farm-to-table Odd Future Blue Bottle Thundercats. Vice meditation viral chia, semiotics literally Pinterest. Before they sold out cliche +1 locavore, biodiesel try-hard polaroid Vice craft beer keffiyeh flexitarian. Pop-up single-origin coffee cold-pressed selfies keffiyeh artisan mumblecore health goth banjo flannel. Tattooed street art post-ironic direct trade quinoa four dollar toast, listicle artisan polaroid.', pinned: true },
                 { url: 'www.google.ca', source: 'Government of Canada', title: 'Something else with a really long title that needs multiple lines', text: 'Tonx wayfarers fashion axe, art party tofu farm-to-table meggings pop-up Etsy Shoreditch deep v sustainable small batch street art master cleanse. Twee ennui Blue Bottle Pinterest. Shoreditch gluten-free meditation, chia kogi cray banh mi XOXO hella farm-to-table Odd Future Blue Bottle Thundercats. Vice meditation viral chia, semiotics literally Pinterest. Before they sold out cliche +1 locavore, biodiesel try-hard polaroid Vice craft beer keffiyeh flexitarian. Pop-up single-origin coffee cold-pressed selfies keffiyeh artisan mumblecore health goth banjo flannel. Tattooed street art post-ironic direct trade quinoa four dollar toast, listicle artisan polaroid.', pinned: true }];
  vm.isLoading = false;
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
  // var documentHeader = angular.element('#documentHeader');
  // if (documentHeader && documentHeader.length) {

  // Wrap the actual page contents within a div for manipulating width
  $('body').wrapInner('<div class="sherlocke-original-page" />');

  // Inject the main directive & controller onto CanLII's #wrap div and insert the side panel
  // angular.element('#wrap')
  angular.element('body')
      .attr('sk-main', true)
      .append('<div id="sherlocke"><div sk-side-panel ng-controller="SidePanelController as side"></div></div>');

  angular.bootstrap(document, ['SherlockeContent']);
  // }
});
