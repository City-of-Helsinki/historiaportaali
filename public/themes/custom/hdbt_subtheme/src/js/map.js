/* global jQuery, Drupal, L, once, document, window */

((jQuery, Drupal, once) => {
  let map;
  let mapContainer;

  const { behaviors } = Drupal;

  behaviors.map = {
    attach(context) {
      if (once("map", "body").length) {
        jQuery(document).on("leafletMapInit", (_e, _mapSettings, lMap, mapid) => {
          if (mapid.startsWith("leaflet-map-view-combined-map-block")) {
            map = lMap;
            mapContainer = jQuery(`#${mapid}`);
            const idFromUrl = this.getUrlParameter("id");

            this.bindPopupPositioning();

            setTimeout(() => {
              if (idFromUrl) this.openPopupByNid(idFromUrl);
              else this.applyZoomToView();
            }, 300);
          }
        });
      }

      this.bindFilterToggle(context);
      this.bindFilterForm(context);
    },

    bindFilterForm(context) {
      jQuery(document).on(
        "submit",
        ".node-type--map_page .views-exposed-form",
        () => {
          this.announceFilterStatus("searching");
        },
      );
    },

    announceFilterStatus(status, count) {
      const $el = jQuery("#map-filter-status");
      if (!$el.length) return;
      if (status === "searching") {
        $el.text(Drupal.t("Searching...", {}, { context: "Map" }));
      } else if (status === "complete") {
        $el.text(
          count === 0
            ? Drupal.t("Search complete. No items found.", {}, { context: "Map" })
            : Drupal.t("Search complete. @count items found.", { "@count": count }, { context: "Map" }),
        );
      }
    },

    bindFilterToggle(context) {
      const $filterToggleBtn = jQuery(
        once("button", ".exposed-filters .toggle-filters-btn", context),
      );
      const $filterContainer = jQuery(
        ".exposed-filters .exposed-filters__container",
        context,
      );

      $filterToggleBtn.on("click", () => {
        $filterContainer.slideToggle(150);
        if (
          $filterContainer.is(":visible") &&
          $filterToggleBtn
            .find("span.hds-icon")
            .hasClass("hds-icon--angle-down")
        ) {
          $filterToggleBtn
            .find("span.hds-icon")
            .removeClass("hds-icon--angle-down");
          $filterToggleBtn.find("span.hds-icon").addClass("hds-icon--angle-up");
        } else {
          $filterToggleBtn
            .find("span.hds-icon")
            .removeClass("hds-icon--angle-up");
          $filterToggleBtn
            .find("span.hds-icon")
            .addClass("hds-icon--angle-down");
        }
      });
    },

    openPopupByNid(id) {
      if (!map || !mapContainer || !id) {
        return;
      }

      const leafletInstance = mapContainer.data("leaflet");
      if (!leafletInstance?.markers) {
        return;
      }

      const entityId = String(id);
      let selectedMarker = leafletInstance.markers[entityId];

      // Fallback: check with suffix (e.g., "655-0")
      if (!selectedMarker) {
        const key = Object.keys(leafletInstance.markers).find((k) =>
          k.startsWith(`${entityId}-`),
        );
        if (key) {
          selectedMarker = leafletInstance.markers[key];
        }
      }

      if (!selectedMarker) {
        console.warn("Map: No marker found ID", entityId);
        console.info(
          "Available marker IDs:",
          Object.keys(leafletInstance.markers).map((k) => k.replace("-0", "")),
        );
        return;
      }

      // Check if marker is in a cluster group
      let layerInsideGroup = false;
      map.eachLayer((layer) => {
        if (layer._group && typeof layer.getAllChildMarkers === "function") {
          if (layer.getAllChildMarkers().includes(selectedMarker)) {
            layerInsideGroup = true;
          }
        }
      });

      this.zoomToLayer(selectedMarker, layerInsideGroup);
    },

    zoomToLayer(selectedMarker, layerInsideGroup = false) {
      if (!selectedMarker || !map) {
        return false;
      }

      // Use Leaflet Markercluster's zoomToShowLayer for grouped markers
      if (layerInsideGroup && selectedMarker.__parent?._group) {
        selectedMarker.__parent._group.zoomToShowLayer(selectedMarker, () => {
          selectedMarker.openPopup();
        });
        return true;
      }

      // For standalone markers, center map and open popup
      const openPopupHandler = () => {
        selectedMarker.openPopup();
        map.off("moveend", openPopupHandler);
      };

      map.on("moveend", openPopupHandler);
      map.setView(selectedMarker._latlng, 15);
      return true;
    },

    // Zooming logic: zoom to fit all markers when filters are applied, otherwise zoom to the center of the map.
    applyZoomToView() {
      if (!map || !mapContainer) return;
      const leaflet = mapContainer.data("leaflet");
      if (!leaflet) return;

      if (this.hasActiveFilters()) {
        const latlngs = Object.values(leaflet.markers || {})
          .map((m) => m.getLatLng?.() || m._latlng)
          .filter(Boolean);
        this.announceFilterStatus("complete", latlngs.length);
        if (latlngs.length === 0) return;
        latlngs.length === 1
          ? map.setView(latlngs[0], 15)
          : map.fitBounds(L.latLngBounds(latlngs), { padding: [20, 20], maxZoom: 18 });
      } else if (leaflet.map_settings?.center) {
        const c = leaflet.map_settings.center;
        map.setView(L.latLng(c.lat, c.lon), leaflet.map_settings.zoom ?? 14);
      }
    },

    hasActiveFilters() {
      const $f = jQuery(".node-type--map_page .views-exposed-form");
      const start = $f.find('input[name="start_year"]').val()?.trim();
      const end = $f.find('input[name="end_year"]').val()?.trim();
      const kw = $f.find('select[name="field_keywords_target_id"]').val();
      return !!(start || end || (kw && kw !== "All"));
    },

    bindPopupPositioning() {
      map.on("popupopen", (e) => {
        const popup = e.popup || e.target?._popup;
        const marker = popup?._source;
        if (marker?.getElement?.()) {
          marker.getElement().classList.add("active");
        }

        // Find the pixel location on the map where the popup anchor is
        const px = map.project(popup._latlng);
        // Find the height of the popup container and subtract from the Y axis of marker location
        px.y -= popup._container.clientHeight;
        // Pan to new center
        map.panTo(map.unproject(px), { animate: true });

        // Update URL with entity ID
        this.updateUrlWithEntityId(marker);
      });

      map.on("popupclose", (e) => {
        const popup = e.popup || e.target?._popup;
        const marker = popup?._source;
        if (marker?.getElement?.()) {
          marker.getElement().classList.remove("active");
        }

        // Remove ID from URL when popup is closed
        this.clearUrlEntityId();
      });
    },

    updateUrlWithEntityId(marker) {
      if (!marker || !mapContainer) {
        return;
      }

      const leafletInstance = mapContainer.data("leaflet");
      if (!leafletInstance?.markers) {
        return;
      }

      // Find the entity ID by reverse lookup in the markers object
      const entityId = Object.keys(leafletInstance.markers).find(
        (key) => leafletInstance.markers[key] === marker,
      );

      if (entityId) {
        // Remove the "-0" suffix if present
        const cleanId = entityId.replace("-0", "");
        const url = new URL(window.location);
        url.searchParams.set("id", cleanId);
        window.history.replaceState({}, "", url);
      }
    },

    clearUrlEntityId() {
      const url = new URL(window.location);
      url.searchParams.delete("id");
      window.history.replaceState({}, "", url);
    },

    getUrlParameter(sParam) {
      const sPageURL = window.location.search.substring(1);
      const sURLVariables = sPageURL.split("&");
      let sParameterName;
      let i;

      for (i = 0; i < sURLVariables.length; i += 1) {
        sParameterName = sURLVariables[i].split("=");
        if (sParameterName[0] === sParam) {
          return typeof sParameterName[1] === "undefined"
            ? true
            : decodeURIComponent(sParameterName[1]);
        }
      }
      return false;
    },
  };
})(jQuery, Drupal, once);
