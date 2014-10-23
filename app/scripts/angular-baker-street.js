'use strict';

var QUESTION_API = 'https://watson-wdc01.ihost.com/instance/507/deepqa/v1/question';

/* Declare AngularJS app */
angular.module('BakerStreet', ['restmod']);

/* Define restmod models */
//var Question = ['restmod', function (restmod) {
//  return restmod.model(QUESTION_API);
//}];
//angular
//    .module('BakerStreet')
//    .factory('Question', Question);

var QuestionService = ['$http', function ($http) {
  var QuestionService = {};

  QuestionService.postQuestion = function (question) {
    return $http.post(QUESTION_API, {
      'question': question
    }, {
      headers: {
        'Authorization': 'Basic dXRfc3R1ZGVudDU6OUp3WGFjUEg=',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-SyncTimeout': '30'
      }
    });
  };

  return QuestionService;
}];
angular
    .module('BakerStreet')
    .factory('QuestionService', QuestionService);
