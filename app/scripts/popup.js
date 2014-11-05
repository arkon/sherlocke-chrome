'use strict';


/* Declare AngularJS app */
angular.module('SherlockePopup', ['ngRoute', 'BakerStreet']);

angular
    .module('SherlockePopup')
    .config(function($routeProvider) {
  $routeProvider
    .when('/tab1', {
      controller:'PinnedController',
      templateUrl:'templates/popup-pinned.html'
    })
    .when('/tab2', {
      controller:'PriorityController',
      templateUrl:'templates/popup-priority.html'
    })
    .when('/tab3', {
      controller:'HistoryController',
      templateUrl:'templates/popup-history.html'
    })
    .when('/new', {
      controller:'SessionsController',
      templateUrl:'templates/session-new-form.html'
    })
    .when('/delete', {
      controller:'SessionsController',
      templateUrl:'templates/session-delete.html'
    })
    .otherwise({
      redirectTo:'/tab1'
    });
});


/*
 * Controllers
 */
var PopupController = ['$scope', function (/*$scope*/) {
  // Handle active tab's styling
  $('ul.tabs li:first').addClass('active');
  $('ul.tabs li').on('click', function(){
    $('ul.tabs li').removeClass('active');
    $(this).addClass('active');
  });
}];
angular
    .module('SherlockePopup')
    .controller('PopupController', PopupController);


var PinnedController = ['$scope', function ($scope) {
  $scope.documents = [{'id': 0, 'url': 'www.example.com'},
                      {'id': 1, 'url': 'Lorem ipsum'}];

  $scope.noPinned = $scope.documents.length === 0;
}];
angular
    .module('SherlockePopup')
    .controller('PinnedController', PinnedController);


var PriorityController = ['$scope', function ($scope) {
  $scope.prioritized = [{'id': 0, 'name': 'Something'},
                        {'id': 1, 'name': 'Lorem ipsum'}];

  $scope.noPriority = $scope.prioritized.length === 0;
}];
angular
    .module('SherlockePopup')
    .controller('PriorityController', PriorityController);


var HistoryController = ['$scope', function ($scope) {
  $scope.pages = [{'id': 0, 'url': 'www.example.com'},
                  {'id': 1, 'url': 'Lorem ipsum'}];

  $scope.noHistory = $scope.pages.length === 0;
}];
angular
    .module('SherlockePopup')
    .controller('HistoryController', HistoryController);


var SessionsController = ['$scope', '$location', 'ResearchSession',
    function ($scope, $location, ResearchSession) {

  // Some example stuff
  $scope.sessions = [{'id': 0, 'user': 1, 'name': 'Example'},
                     {'id': 1, 'user': 1, 'name': 'Lorem ipsum'}];

  $scope.save = function() {
    var session = ResearchSession.$create({ name: 'Wat' });
    session.$then(function(_session) {
      $scope.session = _session;
      $scope.sessionId = _session.id;

      $scope.sessions.$add(_session).then(function () {
        $location.path('/');
      });
    });
  };

  $scope.destroy = function() {
    // session.$destroy();
    // $scope.sessions.$remove($scope.session).then(function () {
    $location.path('/');
    // });
  };
}];
angular
    .module('SherlockePopup')
    .controller('SessionsController', SessionsController);


/*
 * Directives
 */
var SessionsDirective = ['$sce', function ($sce) {
  return {
    templateUrl: $sce.trustAsResourceUrl(chrome.extension.getURL('templates/session-list.html')),
    link: function (scope, element) {
      // Handle pause button
      element.find('#session-pause').click(function() {
        angular.element(this).toggleClass('paused');
      });
    }
  };
}];
angular
    .module('SherlockePopup')
    .directive('skSession', SessionsDirective);


// // Event listner for clicks on links in a browser action popup.
// // Open the link in a new tab of the current window.
// function onAnchorClick(event) {
//  // chrome.tabs.create({
//  //   selected: true,
//  //   url: event.srcElement.href
//  // });

//  var none = document.getElementById('priority-list-none');

//  if (none) {
//    none.parentElement.removeChild(none);
//  }

//  var newItem = '<li>' + event.srcElement.href + '</li>';

//  var inList = document.getElementById('priority-list').innerHTML.indexOf(newItem) > -1;

//  if (!inList) {
//    document.getElementById('priority-list').innerHTML += newItem;

//    chrome.storage.sync.set({ 'priority-list': document.getElementById('priority-list').innerHTML });
//  }

//  return false;
// }

// // Given an array of URLs, build a DOM list of those URLs in the
// // browser action popup.
// function buildPopupDom(divName, data) {
//   var ul = document.getElementById(divName);

//   for (var i = 0, ie = data.length; i < ie; ++i) {
//     var a = document.createElement('a');
//     a.href = data[i];
//     a.appendChild(document.createTextNode(data[i]));
//     // a.addEventListener('click', onAnchorClick);

//     var li = document.createElement('li');
//     li.appendChild(a);

//     ul.appendChild(li);
//   }
// }

// // // Search history to find up to ten links that a user has typed in,
// // // and show those links in a popup.
// function buildTypedUrlList(divName) {
//   // To look for history items visited in the last day,
//   // subtract a week of microseconds from the current time.
//   var microsecondsPerDay = 1000 * 60 * 60 * 24;
//   var oneDayAgo = new Date().getTime() - microsecondsPerDay;

//   // Track the number of callbacks from chrome.history.getVisits()
//   // that we expect to get.  When it reaches zero, we have all results.
//   var numRequestsOutstanding = 0;

//   chrome.history.search({
//       'text': '',              // Return every history item....
//       'startTime': oneDayAgo   // that was accessed less than one day ago.
//     },
//     function(historyItems) {
//       // For each history item, get details on all visits.
//       for (var i = 0; i < historyItems.length; ++i) {
//         var url = historyItems[i].url;
//         chrome.history.getVisits({url: url}, function(visitItems) {
//           processVisits(url, visitItems);
//         });
//         numRequestsOutstanding++;
//       }
//       if (!numRequestsOutstanding) {
//         onAllVisitsProcessed();
//       }
//     });

//   // Maps URLs to a count of the number of times the user typed that URL into
//   // the omnibox.
//   var urlToCount = {};

//   // Callback for chrome.history.getVisits().  Counts the number of
//   // times a user visited a URL by typing the address.
//   var processVisits = function(url, visitItems) {
//     for (var i = 0, ie = visitItems.length; i < ie; ++i) {
//       // Ignore items unless the user typed the URL.
//       if (visitItems[i].transition != 'typed') {
//         continue;
//       }

//       if (!urlToCount[url]) {
//         urlToCount[url] = 0;
//       }

//       urlToCount[url]++;
//     }

//     // If this is the final outstanding call to processVisits(),
//     // then we have the final results.  Use them to build the list
//     // of URLs to show in the popup.
//     if (!--numRequestsOutstanding) {
//       onAllVisitsProcessed();
//     }
//   };

//  // This function is called when we have the final list of URls to display.
//   var onAllVisitsProcessed = function() {
//     // Get the top scorring urls.
//     var urlArray = [];
//     for (var url in urlToCount) {
//       urlArray.push(url);
//     }

//     // Sort the URLs by the number of times the user typed them.
//     urlArray.sort(function(a, b) {
//       return urlToCount[b] - urlToCount[a];
//     });

//     buildPopupDom(divName, urlArray.slice(0, 10));
//   };
// }

// document.addEventListener('DOMContentLoaded', function () {
//   buildTypedUrlList('priority-history');

//   chrome.storage.sync.get(['priority-list'], function(items) {
//     if (items['priority-list']) {
//       document.getElementById('priority-list').innerHTML = items['priority-list'];
//     }
//   });
// });

// document.getElementById('priority-clear').addEventListener('click', function() {
//   document.getElementById('priority-list').innerHTML = '';
//   chrome.storage.sync.set({ 'priority-list': null });
// }, false);
