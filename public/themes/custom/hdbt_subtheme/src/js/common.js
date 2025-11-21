// eslint-disable-next-line no-unused-vars
(($, Drupal, drupalSettings, once) => {
  Drupal.behaviors.themeCommon = {
    attach: function (context, settings) {

      // Show 'Back'-link if the user
      // is coming from another page
      let previousUrl = document.referrer;
      if (previousUrl) {
        // Default to the generic back link
        let $backLinkEl = $('.generic-back-link', context);

        // Use 'Back to search results'-link if the user
        // is coming from the search page
        if (previousUrl.includes('/haku') ||
            previousUrl.includes('/search')) {
          $backLinkEl = $('.back-to-search-results', context);
        }

        // If browser history exists, use it
        if (history.length > 1) {
          previousUrl = 'javascript:history.go(-1)';
        }

        const $container = $backLinkEl.closest('.container');

        if ($backLinkEl.length) {
          $('a', $backLinkEl).attr('href', previousUrl);

          if (!$container.is(':visible')) {
            $container.show();
          }

          $backLinkEl.show();
        }
      }

      // Header search form
      const $searchToggleBtn = $('.header-search .nav-toggle__button', context);
      const $searchFormWrapper = $('.header-search__form-wrapper', context);

      const openSearchForm = function() {
        $searchToggleBtn.attr('aria-expanded', 'true');
        $searchFormWrapper.stop(true, false).slideDown(300, function() {
          $('#edit-q-header').focus();
        });
      };

      const closeSearchForm = function() {
        $searchToggleBtn.attr('aria-expanded', 'false');
        $searchFormWrapper.stop(true, false).slideUp(300);
      };

      once('header-search-toggle', '.header-search .nav-toggle__button', context).forEach(element => {
        $(element).on('click', function(e) {
          e.preventDefault();
          e.stopPropagation();

          const isExpanded = $(this).attr('aria-expanded') === 'true';
          isExpanded ? closeSearchForm() : openSearchForm();
        });
      });

      // Hide header search form if clicked outside the search element
      $(document).on('click', function(event) {
        if (!$(event.target).closest('.header-search').length) {
          if ($searchToggleBtn.attr('aria-expanded') === 'true') {
            closeSearchForm();
          }
        }
      });
      
      // Hide header search form on escape key press.
      $(document).keyup(function(e) {
        if (e.key === "Escape" && $searchToggleBtn.attr('aria-expanded') === 'true') {
          closeSearchForm();
        }
      });

      // Add even / odd classes to Image and Video -paragraphs
      Drupal.behaviors.themeCommon.addEvenOddClasses(context);

      Drupal.behaviors.themeCommon.addKoreMarkers(context);
    },

    addEvenOddClasses: function(context) {
      let $articleContentContainer = $('.node--type-article.node--view-mode-full .paragraph-content', context);
      let $elements = $('.image, .remote-video', $articleContentContainer);

      if ($elements.length) {
        $elements.each(function(index) {
          if ((index % 2) == 0) {
            $(this).addClass('odd');
          } else {
            $(this).addClass('even');
          }
        });
      }
    },

    addKoreMarkers: function(context) {
      // Note: We search globally (not within context) because for logged-in users,
      // the context parameter is often limited to admin toolbar/contextual links
      // and doesn't include the main content area where these elements exist.
      const BUILDING_SELECTOR = 'div.paragraph--type--kore-building';
      const BUTTON_SELECTOR = 'button.kore-address';

      $(document).on('leafletMapInit', function(e, settings, lMap, mapid) {
        const $buildings = $(BUILDING_SELECTOR);

        $buildings.each(function() {
          const $building = $(this);

          // Add marker to map for this building
          const $button = $building.find(BUTTON_SELECTOR);
          const lat = $button.attr('data-lat');
          const lon = $button.attr('data-lon');

          if (lat && lon && lat !== lon) {
            const latlon = new L.LatLng(lat, lon);
            const markerIcon = L.icon({
              iconSize: ['36', '36'],
              iconUrl: '/themes/custom/hdbt_subtheme/src/icons/map_marker.svg'
            });

            L.marker(latlon, { icon: markerIcon }).addTo(lMap);
          }
        });

        // Attach click handlers to all remaining buttons
        const $allButtons = $(BUTTON_SELECTOR);
        $allButtons.off('click').on('click', function() {
          const lat = $(this).attr('data-lat');
          const lon = $(this).attr('data-lon');
          const latlon = new L.LatLng(lat, lon);

          lMap.flyTo(latlon, 16);

          $('article')[0].scrollIntoView({
            behavior: 'smooth',
          });
        });
      });
    }
  };
  // eslint-disable-next-line no-undef
})(jQuery, Drupal, drupalSettings, once);
