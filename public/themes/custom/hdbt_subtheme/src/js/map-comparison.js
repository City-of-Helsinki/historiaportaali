// eslint-disable-next-line no-unused-vars
(($, Drupal, drupalSettings) => {
  let mainMap;
  let comparisonMap;

  Drupal.behaviors.mapComparison = {
    attach: function(context, settings) {
      let self = this;

      $(document).on('leaflet.map', function(e, settings, lMap, mapid) {
        mainMap = lMap;
        self.bindCompareButton();
      });
    },

    bindCompareButton: function() {
      let self = this;
      let $viewContainer = $('.views--combined-map');
      let $button = $('.map-controls__control #map-comparison-btn');

      $button.on('click', function(e) {
        if (!$viewContainer.is('.comparison-enabled')) {
          self.enableMapComparison();
        } else {
          self.disableMapComparison();
        }
      });
    },
    
    enableMapComparison: function() {
      let self = this;

      let $viewContainer = $('.views--combined-map');
      $viewContainer.addClass('comparison-enabled');

      $('#comparison-map-container').fadeIn(150);

      // Re-position map after resize
      mainMap.invalidateSize();

      // Init comparison map
      const comparisonMapId = 'comparison-map-container';
      const comparisonMapInitialized = self.initMap(comparisonMapId);

      if (comparisonMapInitialized) {
        self.syncMaps();
      }
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

        // Add Leaflet Map Features from the main map.
        if (mainMapLeaflet.features.length > 0) {
          Drupal.Leaflet[mapId].markers = {};
          Drupal.Leaflet[mapId].features = {};

          $container.data('leaflet').add_features(mapId, mainMapLeaflet.features, true);
        }
      }

      return true;
    },

    disableMapComparison: function() {
      let self = this;
      let $viewContainer = $('.views--combined-map');

      $viewContainer.removeClass('comparison-enabled');
      $('#comparison-map-container').fadeOut(150);

      self.unSyncMaps();
      mainMap.invalidateSize();
    },

    syncMaps: function() {
      if (!mainMap.isSynced(comparisonMap)) {
        mainMap.sync(comparisonMap);
      }
      
      if (!comparisonMap.isSynced(mainMap)) {
        comparisonMap.sync(mainMap);
      }
    },

    unSyncMaps: function() {
      if (mainMap.isSynced(comparisonMap)) {
        mainMap.unsync(comparisonMap);
      }
      
      if (comparisonMap.isSynced(mainMap)) {
        comparisonMap.unsync(mainMap);
      }
    }
  };
  // eslint-disable-next-line no-undef
})(jQuery, Drupal, drupalSettings);