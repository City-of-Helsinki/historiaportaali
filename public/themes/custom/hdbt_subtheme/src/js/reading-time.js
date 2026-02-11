const readTimeEstimate = require("read-time-estimate");

((jQuery, Drupal) => {
  const { behaviors } = Drupal;

  behaviors.readingTime = {
    attach() {
      if (jQuery(".reading-time").length) {
        const readingTimeValue = jQuery(".reading-time__value").text().trim();

        // Calculate reading time programmatically
        // if it isn't set manually on the node
        if (!readingTimeValue) {
          const content = jQuery(
            ".layout-content article.node--view-mode-full",
          ).html();
          const { duration: minutes } = readTimeEstimate(content, 275, 2, 500, [
            "img",
            "Image",
          ]);

          jQuery(".reading-time__value").text(Math.round(minutes));
        }
      }
    },
  };
})(jQuery, Drupal);
