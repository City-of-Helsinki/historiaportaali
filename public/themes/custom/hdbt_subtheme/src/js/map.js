// eslint-disable-next-line no-unused-vars
(($, Drupal, drupalSettings, once) => {
  let map;
  let mapContainer;

  Drupal.behaviors.map = {
    attach: function(context, settings) {
      let self = this;

      if (once('map', 'body').length) {
        $(document).on('leafletMapInit', function(e, settings, lMap, mapid) {
          if (mapid.startsWith('leaflet-map-view-combined-map-block')) {
            map = lMap;
            mapContainer = $('#' + mapid);
            const idFromUrl = self.getUrlParameter('id');
  
            self.bindPopupPositioning();
  
            if (idFromUrl) {
              // Small delay to ensure markers are loaded
              setTimeout(function() {
                self.openPopupByNid(idFromUrl);
              }, 300);
            }
          }
        });
      }

      self.bindFilterToggle(context);
    },

    bindFilterToggle: function(context) {
      $filterToggleBtn = $(once('button', '.exposed-filters .toggle-filters-btn'));
      $filterContainer = $('.exposed-filters .exposed-filters__container');

      $filterToggleBtn.on('click', function() {
        $filterContainer.slideToggle(150);
        if ($filterContainer.is(":visible") && $filterToggleBtn.find('span.hds-icon').hasClass('hds-icon--angle-down')) {
          $filterToggleBtn.find('span.hds-icon').removeClass('hds-icon--angle-down');
          $filterToggleBtn.find('span.hds-icon').addClass('hds-icon--angle-up');
        } else {
          $filterToggleBtn.find('span.hds-icon').removeClass('hds-icon--angle-up');
          $filterToggleBtn.find('span.hds-icon').addClass('hds-icon--angle-down');
        }
      });
    },

    openPopupByNid: function(id) {
      if (!map || !mapContainer || !id) {
        return;
      }

      const leafletInstance = mapContainer.data('leaflet');
      if (!leafletInstance?.markers) {
        return;
      }

      const entityId = String(id);
      let selectedMarker = leafletInstance.markers[entityId];
      
      // Fallback: check with suffix (e.g., "655-0")
      if (!selectedMarker) {
        const key = Object.keys(leafletInstance.markers).find(k => k.startsWith(entityId + '-'));
        if (key) {
          selectedMarker = leafletInstance.markers[key];
        }
      }

      if (!selectedMarker) {
        console.warn('Map: No marker found ID', entityId);
        console.log('Available marker IDs:', Object.keys(leafletInstance.markers).map(k => k.replace('-0', '')));
        return;
      }

      // Check if marker is in a cluster group
      let layerInsideGroup = false;
      map.eachLayer(layer => {
        if (layer._group && typeof layer.getAllChildMarkers === 'function') {
          if (layer.getAllChildMarkers().includes(selectedMarker)) {
            layerInsideGroup = true;
          }
        }
      });

      this.zoomToLayer(selectedMarker, layerInsideGroup);
    },

    zoomToLayer: function(selectedMarker, layerInsideGroup = false) {
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
        map.off('moveend', openPopupHandler);
      };

      map.on('moveend', openPopupHandler);
      map.setView(selectedMarker._latlng, 15);
      return true;
    },

    bindPopupPositioning: function() {
      map.on('popupopen', function(e) {
        // Find the pixel location on the map where the popup anchor is
        var px = map.project(e.target._popup._latlng);
        // Find the height of the popup container and subtract from the Y axis of marker location
        px.y -= e.target._popup._container.clientHeight;
        // Pan to new center
        map.panTo(map.unproject(px),{animate: true});
      });
    },

    getUrlParameter: function(sParam) {
      var sPageURL = window.location.search.substring(1),
          sURLVariables = sPageURL.split('&'),
          sParameterName,
          i;
    
      for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
          return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
      }
      return false;
    }
  };
  // eslint-disable-next-line no-undef
})(jQuery, Drupal, drupalSettings, once);