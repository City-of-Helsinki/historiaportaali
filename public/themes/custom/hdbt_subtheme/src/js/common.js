/* global jQuery, Drupal, once, L, document */

((jQuery, Drupal, once) => {
  const { behaviors } = Drupal;

  behaviors.themeCommon = {
    attach(context) {
      // Header search form
      const $searchToggleBtn = jQuery(
        ".header-search .nav-toggle__button",
        context,
      );
      const $searchFormWrapper = jQuery(
        ".header-search__form-wrapper",
        context,
      );

      const openSearchForm = () => {
        $searchToggleBtn.attr("aria-expanded", "true");
        $searchFormWrapper.stop(true, false).slideDown(300, () => {
          jQuery("#edit-q-header").focus();
        });
      };

      const closeSearchForm = () => {
        $searchToggleBtn.attr("aria-expanded", "false");
        $searchFormWrapper.stop(true, false).slideUp(300);
      };

      for (const element of once(
        "header-search-toggle",
        ".header-search .nav-toggle__button",
        context,
      )) {
        jQuery(element).on("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          const isExpanded = jQuery(element).attr("aria-expanded") === "true";
          if (isExpanded) {
            closeSearchForm();
          } else {
            openSearchForm();
          }
        });
      }

      // Hide header search form if clicked outside the search element
      jQuery(document).on("click", (event) => {
        if (!jQuery(event.target).closest(".header-search").length) {
          if ($searchToggleBtn.attr("aria-expanded") === "true") {
            closeSearchForm();
          }
        }
      });

      // Hide header search form on escape key press.
      jQuery(document).keyup((e) => {
        if (
          e.key === "Escape" &&
          $searchToggleBtn.attr("aria-expanded") === "true"
        ) {
          closeSearchForm();
        }
      });

      // Add even / odd classes to Image and Video -paragraphs
      behaviors.themeCommon.addEvenOddClasses(context);

      behaviors.themeCommon.addKoreMarkers(context);
    },

    addEvenOddClasses(context) {
      const $articleContentContainer = jQuery(
        ".node--type-article.node--view-mode-full .paragraph-content",
        context,
      );
      const $elements = jQuery(
        ".image, .remote-video",
        $articleContentContainer,
      );

      if ($elements.length) {
        $elements.each((index, element) => {
          const $element = jQuery(element);
          if (index % 2 === 0) {
            $element.addClass("odd");
          } else {
            $element.addClass("even");
          }
        });
      }
    },

    addKoreMarkers() {
      // Note: We search globally (not within context) because for logged-in users,
      // the context parameter is often limited to admin toolbar/contextual links
      // and doesn't include the main content area where these elements exist.
      const BUILDING_SELECTOR = "div.paragraph--type--kore-building";
      const BUTTON_SELECTOR = "button.kore-address";

      jQuery(document).on("leafletMapInit", (_e, _settings, lMap) => {
        const $buildings = jQuery(BUILDING_SELECTOR);

        $buildings.each((_index, building) => {
          const $building = jQuery(building);

          // Add marker to map for this building
          const $button = $building.find(BUTTON_SELECTOR);
          const lat = $button.attr("data-lat");
          const lon = $button.attr("data-lon");

          if (lat && lon && lat !== lon) {
            const latlon = new L.LatLng(lat, lon);
            const markerIcon = L.icon({
              iconSize: ["36", "36"],
              iconUrl: "/themes/custom/hdbt_subtheme/src/icons/map_marker.svg",
            });

            L.marker(latlon, { icon: markerIcon }).addTo(lMap);
          }
        });

        // Attach click handlers to all remaining buttons
        const $allButtons = jQuery(BUTTON_SELECTOR);
        $allButtons.off("click").on("click", (event) => {
          const $target = jQuery(event.currentTarget);
          const lat = $target.attr("data-lat");
          const lon = $target.attr("data-lon");
          const latlon = new L.LatLng(lat, lon);

          lMap.flyTo(latlon, 16);

          jQuery("article")[0].scrollIntoView({
            behavior: "smooth",
          });
        });
      });
    },
  };
})(jQuery, Drupal, once);
