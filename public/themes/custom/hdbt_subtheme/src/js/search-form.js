((jQuery, Drupal, _drupalSettings) => {
  const { behaviors } = Drupal;
    behaviors.searchForm = {
      attach(context) {
        jQuery(".exposed-filters .year-interval__toggle", context).on(
          "click",
            (e) => {
              const pressed = e.target.getAttribute("aria-pressed") === "true";
              e.target.setAttribute("aria-pressed", String(!pressed));

              jQuery(".exposed-filters .year-interval__form").toggleClass("hidden");
            },
          );
      },
    };
})(jQuery, Drupal, drupalSettings);
