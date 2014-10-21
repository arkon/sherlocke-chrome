// chrome.extension.sendMessage({}, function(response) {
//   var readyStateCheckInterval = setInterval(function() {
//   if (document.readyState === "complete") {
//     clearInterval(readyStateCheckInterval);

//   }
//   }, 10);
// });

// TODO:
// - confidence level bars in suggestions list
// - fixed filter bar?


// Settings
var optShowMenu;


var isDocument = false;

if (document.getElementById('documentHeader') != null) {
  isDocument = true;
  document.body.classList.add('sherlocke');
}

if (isDocument) {

  // Base Sherlocke sidebar
  $('#wrap').after('<div id="sherlocke">\
      <div id="sherlocke-header">Sherlocke</div>\
      <div id="sherlocke-content" class="hidden">\
        <div id="sherlocke-filters">\
          <span id="sherlocke-filter">All related documents</span>\
          <ul id="sherlocke-filters-list">\
            <li>All related documents</li>\
            <li>Legislation</li>\
            <li>Cases</li>\
            <li>Miscellaneous</li>\
          </ul>\
        </div>\
        <ul id="sherlocke-suggestions"></ul>\
      </div>\
      <div id="sherlocke-loading">\
        <h1>Crunching data...</h1>\
        <p id="sherlocke-loading-message"></p>\
      </div>\
      <div id="sherlocke-toggle"></div>\
    </div>');

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

    if (optShowMenu)
      chrome.storage.sync.set({ 'opt-show-menu': false });

    e.stopPropagation();
  });

  document.body.addEventListener('click', function() {
    if ($sherlocke.hasClass('show-menu')) {
      $sherlocke.removeClass('show-menu');

      if (optShowMenu)
        chrome.storage.sync.set({ 'opt-show-menu': false });
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


  // Fixed filters on scroll
  var filtersOffset = $filters.offset().top;

  $(window).scroll(function() {
    // var scroll = $filters.scrollTop();

    // console.log(scroll + ', ' + filtersOffset);

    // if (scroll >= filtersOffset)
    //   $filters.addClass('fixed');
    // else
    //   $filters.removeClass('fixed');
  });


  // Aggregate suggestions and show it in a list
  var $suggestions = $('#sherlocke-suggestions');

  for (var i = 0; i < 20; i++) {
    $suggestions.append('<li><a href="#"><h1>Wow</h1><p>' + i + '</p><p>CanLII</p></a></li>');
  }

}  // End of isDocument
