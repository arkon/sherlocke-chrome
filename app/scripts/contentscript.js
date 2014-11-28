'use strict';
/* jshint multistr: true */

/* Declare AngularJS app */
angular.module('SherlockeContent', ['truncate', 'ChromeMessaging']);

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

function SidePanelController() {
  var vm = this;

  // Whether sidebar is loading
  vm.isLoading = true;

  // Whether filter selection menu is shown
  vm.showMenu = false;

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


  /* Dummy data to work with for now */
  vm.evidence = [{ url: 'www.google.ca', source: 'CanLII', title: 'Wow', text: 'Tonx wayfarers fashion axe, art party tofu.', pinned: false },
                 { url: 'www.google.ca', source: 'Government of Canada', title: 'Something else with a really long title that needs multiple lines', text: 'Tonx wayfarers fashion axe, art party tofu farm-to-table meggings pop-up Etsy Shoreditch deep v sustainable small batch street art master cleanse. Twee ennui Blue Bottle Pinterest. Shoreditch gluten-free meditation, chia kogi cray banh mi XOXO hella farm-to-table Odd Future Blue Bottle Thundercats. Vice meditation viral chia, semiotics literally Pinterest. Before they sold out cliche +1 locavore, biodiesel try-hard polaroid Vice craft beer keffiyeh flexitarian. Pop-up single-origin coffee cold-pressed selfies keffiyeh artisan mumblecore health goth banjo flannel. Tattooed street art post-ironic direct trade quinoa four dollar toast, listicle artisan polaroid.', pinned: true },
                 { url: 'www.google.ca', source: 'Government of Canada', title: 'Something else with a really long title that needs multiple lines', text: 'Tonx wayfarers fashion axe, art party tofu farm-to-table meggings pop-up Etsy Shoreditch deep v sustainable small batch street art master cleanse. Twee ennui Blue Bottle Pinterest. Shoreditch gluten-free meditation, chia kogi cray banh mi XOXO hella farm-to-table Odd Future Blue Bottle Thundercats. Vice meditation viral chia, semiotics literally Pinterest. Before they sold out cliche +1 locavore, biodiesel try-hard polaroid Vice craft beer keffiyeh flexitarian. Pop-up single-origin coffee cold-pressed selfies keffiyeh artisan mumblecore health goth banjo flannel. Tattooed street art post-ironic direct trade quinoa four dollar toast, listicle artisan polaroid.', pinned: true },
                 { url: 'www.google.ca', source: 'Government of Canada', title: 'Something else with a really long title that needs multiple lines', text: 'Tonx wayfarers fashion axe, art party tofu farm-to-table meggings pop-up Etsy Shoreditch deep v sustainable small batch street art master cleanse. Twee ennui Blue Bottle Pinterest. Shoreditch gluten-free meditation, chia kogi cray banh mi XOXO hella farm-to-table Odd Future Blue Bottle Thundercats. Vice meditation viral chia, semiotics literally Pinterest. Before they sold out cliche +1 locavore, biodiesel try-hard polaroid Vice craft beer keffiyeh flexitarian. Pop-up single-origin coffee cold-pressed selfies keffiyeh artisan mumblecore health goth banjo flannel. Tattooed street art post-ironic direct trade quinoa four dollar toast, listicle artisan polaroid.', pinned: true }];
  vm.isLoading = false;
}
angular
    .module('SherlockeContent')
    .controller('SidePanelController', SidePanelController);


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

function FilterSelectController() {
  var vm = this;

  // Currently-selected filter
  vm.filter = null;

  vm.click = function ($event) {
    vm.filter = $event.target;
  };
}
angular
    .module('SherlockeContent')
    .controller('FilterSelectController', FilterSelectController);

var SelectDirective = function () {
  return {
    link: function (scope, element) {
      // Handle showing/hiding of filters menu
      var $filters   = element;
      var $sherlocke = element.closest('#sherlocke');

      $sherlocke.toggleClass('show-menu', scope.showMenu);

      $filters.click(function(e) {
        $sherlocke.toggleClass('show-menu');
        e.stopPropagation();
      });

      angular.element('body').click(function () {
        if ($sherlocke.hasClass('show-menu')) {
          $sherlocke.removeClass('show-menu');
        }
      });

      // Handle the filters
      $filters.find('li').click(function() {
        $('#sherlocke-filter').html(this.innerHTML);
      });
    }
  };
};
angular
    .module('SherlockeContent')
    .directive('skSelect', SelectDirective);


var blacklist = ['stackoverflow.com', 'youtube.com', 'facebook.com', 'css-tricks.com', 'unhaltable.slack.com', 'piazza.com'];

/*
 * Bootstrap AngularJS
 * https://docs.angularjs.org/guide/bootstrap
 */
angular.element(document).ready(function () {
  if (blacklist.indexOf(window.location.host.replace('www.', '')) === -1) {
    // Wrap the actual page contents within a div for manipulating width
    $('body').wrapInner('<div class="sherlocke-original-page" />');

    // Inject the main directive & controller onto the page and insert the side panel
    angular.element('body')
        .attr('ng-controller', 'MainController as main')
        .attr('ng-class', 'main.bodyClass')
        .append('<div id="sherlocke"><div sk-side-panel ng-controller="SidePanelController as side"></div></div>');

    angular.bootstrap(document, ['SherlockeContent']);
  }
});
