(($, Drupal, drupalSettings, once) => {
  let mainMap;
  let comparisonMap;
  const COMPARISON_MAP_ID = 'comparison-map-container';
  const VIEW_CONTAINER_SELECTOR = '.views--combined-map';

  Drupal.behaviors.mapComparison = {
    attach: function(context, settings) {
      let self = this;

      $(document).on('leafletMapInit', function(e, settings, lMap, mapid) {
        mainMap = lMap;
        self.bindCompareButton(context);
      });
    },

    bindCompareButton: function(context) {
      let self = this;
      let $viewContainer = $(VIEW_CONTAINER_SELECTOR, context);
      let $button = $(once('comparison-button', '.map-controls__control #map-comparison-btn', context));

      $button.on('click', function() {
        if (!$viewContainer.is('.comparison-enabled')) {
          self.enableMapComparison();
        } else {
          self.disableMapComparison();
        }
      });
    },
    
    enableMapComparison: function() {
      let self = this;

      // Init comparison map first
      const $comparisonMapContainer = $(`#${COMPARISON_MAP_ID}`);
      const comparisonMapInitialized = self.initMap(COMPARISON_MAP_ID);

      if (!comparisonMapInitialized) {
        console.error('Failed to initialize comparison map');
        return;
      }

      let $viewContainer = $(VIEW_CONTAINER_SELECTOR);
      $viewContainer.addClass('comparison-enabled');

      $comparisonMapContainer.fadeIn(150);

      // Re-position map after resize
      mainMap.invalidateSize();

      self.attachPopupListeners(COMPARISON_MAP_ID);

      // Small delay to ensure map is fully rendered before syncing
      setTimeout(() => {
        const synced = self.syncMaps();
        if (!synced) {
          console.error('Failed to sync maps');
        }
      }, 100);
    },

    initMap: function(mapId) {
      let $container = $(`#${mapId}`);
      const mainMapLeaflet = Object.values(drupalSettings.leaflet)[0];

      if (!mainMapLeaflet) {
        return false;
      }

      // Copy map definiton from the main map
      let mapDefinition = mainMapLeaflet.map;
      mapDefinition.settings.mapName = 'comparison-map';

      // Init comparison map
      if ($container.data('leaflet') === undefined) {
        $container.data('leaflet', new Drupal.Leaflet(L.DomUtil.get(mapId), mapId, mapDefinition));

        // Save map to a global variable
        comparisonMap = $container.data('leaflet').lMap;

        $container.data('leaflet').lMap.zoomControl.remove();

        // Add Leaflet Map Features from the main map.
        if (mainMapLeaflet.features.length > 0) {
          $container.data('leaflet').markers = {};
          $container.data('leaflet').features = {};

          $container.data('leaflet').add_features(mainMapLeaflet.features, true);
        }
      }

      return true;
    },

    attachPopupListeners: function(mapId) {
      // Attach leaflet ajax popup listeners.
      let $container = $(`#${mapId}`);
      $container.data('leaflet').lMap.on('popupopen', function(e) {
        let element = e.popup._contentNode;
        let content = $('[data-leaflet-ajax-popup]', element);

        if (content.length) {
          let url = content.data('leaflet-ajax-popup');
          Drupal.ajax({url: url}).execute().done(function () {
            e.popup.setContent(element.innerHTML);
            e.popup.update();
            Drupal.attachBehaviors(element, drupalSettings);
          });
        }
      });
    },

    disableMapComparison: function() {
      let self = this;
      const $comparisonMapContainer = $(`#${COMPARISON_MAP_ID}`);
      let $viewContainer = $(VIEW_CONTAINER_SELECTOR);

      $viewContainer.removeClass('comparison-enabled');
      $comparisonMapContainer.fadeOut(150);

      self.unSyncMaps();
      mainMap.invalidateSize();
    },

    syncMaps: function() {
      // Bidirectional sync: moving either map syncs the other
      if (!mainMap || !comparisonMap) {
        console.warn('Cannot sync maps: one or both maps not initialized');
        return false;
      }

      // Check if sync plugin is available
      if (typeof mainMap.sync !== 'function' || typeof comparisonMap.sync !== 'function') {
        console.error('Leaflet.Sync plugin not loaded');
        return false;
      }

      try {
        mainMap.sync(comparisonMap);
        comparisonMap.sync(mainMap);
        return true;
      } catch (error) {
        console.error('Error syncing maps:', error);
        return false;
      }
    },

    unSyncMaps: function() {
      // Unsync both maps
      if (!mainMap || !comparisonMap) {
        console.warn('Cannot unsync maps: one or both maps not initialized');
        return false;
      }

      // Check if unsync method exists
      if (typeof mainMap.unsync !== 'function' || typeof comparisonMap.unsync !== 'function') {
        console.warn('Leaflet.Sync plugin not loaded or maps not synced');
        return false;
      }

      try {
        mainMap.unsync(comparisonMap);
        comparisonMap.unsync(mainMap);
        return true;
      } catch (error) {
        console.error('Error unsyncing maps:', error);
        return false;
      }
    }
  };
})(jQuery, Drupal, drupalSettings, once);