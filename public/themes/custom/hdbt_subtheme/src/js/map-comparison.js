((jQuery, Drupal, drupalSettings, once) => {
  let mainMap;
  let comparisonMap;
  const COMPARISON_MAP_ID = "comparison-map-container";
  const VIEW_CONTAINER_SELECTOR = ".views--combined-map";

  const { behaviors } = Drupal;

  behaviors.mapComparison = {
    attach(context) {
      jQuery(document).on("leafletMapInit", (_e, _mapSettings, lMap) => {
        mainMap = lMap;
        this.bindCompareButton(context);
      });
    },

    bindCompareButton(context) {
      const $viewContainer = jQuery(VIEW_CONTAINER_SELECTOR, context);
      const $button = jQuery(
        once(
          "comparison-button",
          ".map-controls__control #map-comparison-btn",
          context,
        ),
      );

      $button.on("click", () => {
        if (!$viewContainer.is(".comparison-enabled")) {
          this.enableMapComparison();
          $button.attr("aria-pressed", "true");
        } else {
          this.disableMapComparison();
          $button.attr("aria-pressed", "false");
        }
      });
    },

    enableMapComparison() {
      // Init comparison map first
      const $comparisonMapContainer = jQuery(`#${COMPARISON_MAP_ID}`);
      const comparisonMapInitialized = this.initMap(COMPARISON_MAP_ID);

      if (!comparisonMapInitialized) {
        console.error("Failed to initialize comparison map");
        return;
      }

      const $viewContainer = jQuery(VIEW_CONTAINER_SELECTOR);
      $viewContainer.addClass("comparison-enabled");

      $comparisonMapContainer.fadeIn(150);

      // Re-position map after resize
      mainMap.invalidateSize();

      this.attachPopupListeners(COMPARISON_MAP_ID);

      // Small delay to ensure map is fully rendered before syncing
      setTimeout(() => {
        const synced = this.syncMaps();
        if (!synced) {
          console.error("Failed to sync maps");
        }
      }, 100);
    },

    initMap(mapId) {
      const $container = jQuery(`#${mapId}`);
      const mainMapLeaflet = Object.values(drupalSettings.leaflet)[0];

      if (!mainMapLeaflet) {
        return false;
      }

      // Copy map definiton from the main map
      const mapDefinition = mainMapLeaflet.map;
      mapDefinition.settings.mapName = "comparison-map";

      // Init comparison map
      if ($container.data("leaflet") === undefined) {
        $container.data(
          "leaflet",
          new Drupal.Leaflet(L.DomUtil.get(mapId), mapId, mapDefinition),
        );

        // Save map to a global variable
        comparisonMap = $container.data("leaflet").lMap;

        $container.data("leaflet").lMap.zoomControl.remove();

        // Add Leaflet Map Features from the main map.
        if (mainMapLeaflet.features.length > 0) {
          $container.data("leaflet").markers = {};
          $container.data("leaflet").features = {};

          $container
            .data("leaflet")
            .add_features(mainMapLeaflet.features, true);
        }
      }

      return true;
    },

    attachPopupListeners(mapId) {
      // Attach leaflet ajax popup listeners.
      const $container = jQuery(`#${mapId}`);
      $container.data("leaflet").lMap.on("popupopen", (e) => {
        const element = e.popup._contentNode;
        const content = jQuery("[data-leaflet-ajax-popup]", element);

        if (content.length) {
          const url = content.data("leaflet-ajax-popup");
          Drupal.ajax({ url })
            .execute()
            .done(() => {
              e.popup.setContent(element.innerHTML);
              e.popup.update();
              Drupal.attachBehaviors(element, drupalSettings);
            });
        }
      });
    },

    disableMapComparison() {
      const $comparisonMapContainer = jQuery(`#${COMPARISON_MAP_ID}`);
      const $viewContainer = jQuery(VIEW_CONTAINER_SELECTOR);

      $viewContainer.removeClass("comparison-enabled");
      $comparisonMapContainer.fadeOut(150);

      this.unSyncMaps();
      mainMap.invalidateSize();
    },

    syncMaps() {
      // Bidirectional sync: moving either map syncs the other
      if (!mainMap || !comparisonMap) {
        console.warn("Cannot sync maps: one or both maps not initialized");
        return false;
      }

      // Check if sync plugin is available
      if (
        typeof mainMap.sync !== "function" ||
        typeof comparisonMap.sync !== "function"
      ) {
        console.error("Leaflet.Sync plugin not loaded");
        return false;
      }

      try {
        mainMap.sync(comparisonMap);
        comparisonMap.sync(mainMap);
        return true;
      } catch (error) {
        console.error("Error syncing maps:", error);
        return false;
      }
    },

    unSyncMaps() {
      // Unsync both maps
      if (!mainMap || !comparisonMap) {
        console.warn("Cannot unsync maps: one or both maps not initialized");
        return false;
      }

      // Check if unsync method exists
      if (
        typeof mainMap.unsync !== "function" ||
        typeof comparisonMap.unsync !== "function"
      ) {
        console.warn("Leaflet.Sync plugin not loaded or maps not synced");
        return false;
      }

      try {
        mainMap.unsync(comparisonMap);
        comparisonMap.unsync(mainMap);
        return true;
      } catch (error) {
        console.error("Error unsyncing maps:", error);
        return false;
      }
    },
  };
})(jQuery, Drupal, drupalSettings, once);
