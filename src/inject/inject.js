// chrome.extension.sendMessage({}, function(response) {
//   var readyStateCheckInterval = setInterval(function() {
//   if (document.readyState === "complete") {
//     clearInterval(readyStateCheckInterval);

//   }
//   }, 10);
// });

// Base Sherlocke sidebar
$('#wrap').after('<div id="sherlocke">\
    <div id="sherlocke-header">Sherlocke</div>\
    <div id="sherlocke-filters">\
      <span id="sherlocke-filter">All suggestions</span>\
      <ul id="sherlocke-filters-list">\
        <li>All suggestions</li>\
        <li>Legislation</li>\
        <li>Cases</li>\
        <li>Miscellaneous</li>\
      </ul>\
    </div>\
    <ul id="sherlocke-suggestions"></ul>\
    <div id="sherlocke-toggle"></div>\
  </div>');


// Handle sidebar toggle
$('#sherlocke-toggle').click(function() {
  $('body').toggleClass('show-sidebar');
});


// Handle showing/hiding of filters menu
var $sherlocke = $('#sherlocke');

$('#sherlocke-filters').click(function(e) {
  $sherlocke.toggleClass('show-menu');
  e.stopPropagation();
});

document.body.addEventListener('click', function() {
  if ($sherlocke.hasClass('show-menu')) {
    $sherlocke.removeClass('show-menu');
  }
}, false);


// Aggregate suggestions and show it in a list
var $suggestions = $('#sherlocke-suggestions');

for (var i = 0; i < 20; i++) {
  $suggestions.append('<li><a href="#"><h1>Wow</h1><p>' + i + '</p><p>CanLII</p></a></li>');
}
