'use strict';

var BAKERSTREET_API = 'http://api.sherlocke.me/api/';

/* Declare AngularJS app */
angular.module('BakerStreet', ['restmod']);

/* Define restmod models */
var Pages = ['restmod', function (restmod) {
  return restmod.model(BAKERSTREET_API + '/pages');
}];
angular
   .module('BakerStreet')
   .factory('Pages', Pages);

var Questions = ['restmod', function (restmod) {
  return restmod.model(BAKERSTREET_API + '/questions');
}];
angular
   .module('BakerStreet')
   .factory('Questions', Questions);

var Users = ['restmod', function (restmod) {
  return restmod.model(BAKERSTREET_API + '/users');
}];
angular
   .module('BakerStreet')
   .factory('Users', Users);

var Documents = ['restmod', function (restmod) {
  return restmod.model(BAKERSTREET_API + '/documents');
}];
angular
   .module('BakerStreet')
   .factory('Documents', Documents);



// var QuestionService = ['$http', function ($http) {
//   var QuestionService = {};

//   QuestionService.postQuestion = function (question) {
//     return $http.post(QUESTION_API, {
//       'question': question
//     }, {
//       headers: {
//         'Authorization': 'Basic dXRfc3R1ZGVudDU6OUp3WGFjUEg=',
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//         'X-SyncTimeout': '30'
//       }
//     });
//   };

//   return QuestionService;
// }];
// angular
//     .module('BakerStreet')
//     .factory('QuestionService', QuestionService);
