(function (g) {
  'use strict';

  let FTR = function (config) {
    let DEFAULT_BASE_URL = '/api';

    let init = function (config) {

      function loadFromDefaults() {
        console.log('Loading config from default values.');
      
      }

      function loadFromConfig(config) {
        console.log('Loading config from config object.');
      }

      console.log('Copyright © FTR 2016');
      if ((typeof config === 'object') && (config !== null)) {
        loadFromConfig(config);
      }
      else {
        loadFromDefaults();
      }
    };

    init(config);

    this.getResults = function (formData) {
      console.log(formData);
      return $.ajax({
        url: DEFAULT_BASE_URL + '/result',
        cache: true,
        data: formData
      });
    }
    
    return this;
  }

  let app = new FTR({
    baseUrl: '/api'
  });

  function renderNoResults() {
    console.log('No results found :(');
  }

  function scrollToResults() {
    var results = $('#results');
    if (results !== null) {
      $('html,body').animate({
        scrollTop: results.offset().top
      }, 'slow');
    }
  }

  function renderResults(data) {
    let resultsElem = $('#results');
    resultsElem.empty();
    if (Array.isArray(data) && data.length > 0) {
      data.forEach(function (item) { 
        let result = resultView.render(item);
        resultsElem.append(result);
      });
      resultsElem.show();
      scrollToResults();
    }
    else {
      renderNoResults();
    }
  }

  function onResult(res) {
    let data = res.data;
    renderResults(data);
  }

  $('#main-form').submit(function (e) {
    let formData = {};

    e.preventDefault();
    $(this).serializeArray().forEach(function (item) {
      formData[item.name] = item.value;
    });
    app.getResults(formData).done(onResult);
  });

  g.app = app;

  let resultDoodleView = {
    render: function (link) {
      return $('<div/>', {
        'class': 'col-xs-4 col-md-3',
      })
      .append($('<a/>', {
        'href': '/doodleShare',
        'text': 'Add'
      }));
    }
  }

  let resultMainView = {
    render: function (hotel, flights) {
      return $('<div/>', {
        'class': 'col-xs-8 col-md-6',
        'text': hotel.name
      });
    }
  }

  let bookingView = {
    render: function (result) {
      return $('<div/>', {
        'class': 'col-xs-4 col-md-3',
        'text': 'Book now'
      });
    }
  }

  let resultView = {
    render: function (result) {
      let doodleView = resultDoodleView;
      let mainView = resultMainView;
      let elem = $('<div/>', {
        'class': 'row'
      })
      elem.append(doodleView.render(result.doodle))
      elem.append(mainView.render(result.hotel));
      elem.append(bookingView.render(result));
      return elem;
    }
  }

})(window);
