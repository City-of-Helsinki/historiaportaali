// eslint-disable-next-line no-unused-vars
(($, Drupal, drupalSettings) => {
  Drupal.behaviors.readingTime = {
    attach: function (context, settings) {
      if ($('.reading-time').length) {
        const $readingTimeValueEl = $('.reading-time__value');
        const readingTimeValue = $readingTimeValueEl.text().trim();
      
        // Calculate reading time programmatically
        // if it isn't set manually on the node
        if (!readingTimeValue) {
          const readTimeEstimate = require('read-time-estimate');
      
          const content = $('.layout-content article.node--view-mode-full').html();
          const { duration: minutes } = readTimeEstimate(content, 275, 2, 500, ['img', 'Image']);

          $('.reading-time__value').text(Math.round(minutes));
        } 
      }
    }
  };
  // eslint-disable-next-line no-undef
})(jQuery, Drupal, drupalSettings);
