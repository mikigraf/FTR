(function () {
  'use strict';

  var ftr = {
    init: function() {
      console.log('Copytight 2016 © FTR');
      setHandlers();
    }
  };

  function setHandlers() {
    $('#main-form').submit(function (e) {
      e.preventDefault();
      console.log('Do some AJAXy stuff here');
    });
  }

  ftr.init();

})();
