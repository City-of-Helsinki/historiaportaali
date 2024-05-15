// eslint-disable-next-line no-unused-vars
(($, Drupal, drupalSettings) => {
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
      const $searchToggleBtn = $('.header-search .hds-button--search-toggle');
      if ($searchToggleBtn.length) {
        $searchToggleBtn.on('click', function(e) {
          $(this).attr('aria-expanded', function (i, attr) {
            return attr == 'true' ? 'false' : 'true'
          });
        });
      }

      // Hide header search form if clicked outside the search element
      $(document).on('click', function(event) {
        if (!$(event.target).closest('.header-search').length) {
          $searchToggleBtn.attr('aria-expanded', false);
        }
      });

      // Hide header search form on escape key press
      $(document).keyup(function(e) {
        if (e.key === "Escape") {
          $searchToggleBtn.attr('aria-expanded', false);
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
      $(document).on('leafletMapInit', function(e, settings, lMap, mapid) {

        $buildings = $('div.paragraph--type--kore-building', context);
        $buildings.each(function() {
          // Remove buttons with identical geolocation.
          let addresses = $(this).find('div.paragraph--type--kore-address');
          addresses.each(function() {
            let buttons = $(this).find('button.kore-address');
            buttons.each(function() {
              $('[data-lat="'+$(this).attr('data-lat')+'"][data-lon="'+$(this).attr('data-lon')+'"]:not(:first)').remove();
            });
          });

          // Add markers to map.
          let lat = $(this).find('button.kore-address').attr('data-lat');
          let lon = $(this).find('button.kore-address').attr('data-lon');
          if (lat != lon) {
            let latlon = new L.LatLng(lat, lon);
            let markerIcon = L.icon({
              iconSize: ['36', '36'],
              iconUrl: '/themes/custom/hdbt_subtheme/src/icons/map_marker.svg'
            });
    
            L.marker(latlon, { icon: markerIcon }).addTo(lMap);
          }
        });

        $buttons = $('button.kore-address', context);
        $buttons.on('click', function() {
          let lat = $(this).attr('data-lat');
          let lon = $(this).attr('data-lon');
          let latlon = new L.LatLng(lat, lon);

          lMap.flyTo(latlon, 16);

          $('article')[0].scrollIntoView({
            behavior: 'smooth',
          });
        });

      });
    }
  };
  // eslint-disable-next-line no-undef
})(jQuery, Drupal, drupalSettings);
