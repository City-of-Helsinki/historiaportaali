// eslint-disable-next-line no-unused-vars
(($, Drupal, drupalSettings) => {
  Drupal.behaviors.mapControls = {
    attach: function(context, settings) {
      let self = this;
      
      L.Map.addInitHook(function () {
        if (this.options?.mapName == 'comparison-map') {
          self.bindLayerControls(this, 'comparison-map');
        } else {
          self.bindLayerControls(this, 'main-map');
          self.bindZoomControls(this);
          self.bindLocateControl(this);
          this.removeControl(this.zoomControl);
        }

        $('.map-controls__map-layer').select2({
          minimumResultsForSearch: Infinity,
          placeholder: {
            id: 'default',
            text: 'Select an option'
          },
          allowClear: true
        }).on('select2:clear', function (e) {
          $(this).on('select2:opening.cancelOpen', function (e) {
            e.preventDefault();
            $(this).off('select2:opening.cancelOpen');
          });
        });

        this.on('unload', function() {
          if (this.options?.mapName == 'comparison-map') {
            self.unBindLayerControls('comparison-map');
          } else {
            self.unBindLayerControls('main-map');
          }
        });
      });
    },

    bindLayerControls: function(lMap, mapName) {
      let self = this;
      let $controls = $(`.map-controls__map-layer.${mapName}`);
      $controls.change(function(e) {
        let selectedLayerTitle = $(e.target).find(':selected').not("[map-layer-title='default']").data('map-layer-title')
            mapApiEndpoints = $(e.target).find(':selected').not("[map-layer-title='default']").data('map-api-endpoints');
        self.handleLayerSelection(lMap, selectedLayerTitle, mapApiEndpoints);
        // Clear other select2s.
        $controls.not(e.target).val('').trigger('change.select2');
      });
    },

    unBindLayerControls: function(mapName) {
      let $controls = $(`.map-controls__map-layer.${mapName}`);
      $controls.off('click');
    },

    toggleLayerSelectorVisibility: function(mapName) {
      let $controlsContainer = $(`.map-controls__map-layer.${mapName}`);
      
      if ($controlsContainer.is('.open')) {
        $controlsContainer.removeClass('open');
      } else {
        $controlsContainer.addClass('open');
      }
    },

    handleLayerSelection: function(lMap, selectedLayerTitle, mapApiEndpoints) {
      let self = this;
      
      if (selectedLayerTitle == 'present') {
        self.removeOtherMapLayers(lMap, null);
        return;
      }

      if (mapApiEndpoints) {
        mapApiEndpoints.forEach(endpoint => {
          self.addMapLayer(lMap, endpoint, selectedLayerTitle);
        });
      }
    },

    addMapLayer: function(lMap, endpoint, selectedLayerTitle) {
      let self = this;

      let mapApiUrl = self.getMapApiUrl(endpoint.map_api);

      self.showLoadingSpinner();

      let mapLayer = L.tileLayer.wms(mapApiUrl, {
        layers: endpoint.wms_title,
        format: 'image/png',
        transparent: true,
        className: selectedLayerTitle
      });

      mapLayer.addTo(lMap);

      // Remove other layers after the new layer has loaded
      mapLayer.on('load', function(ev) {
        self.removeOtherMapLayers(lMap, selectedLayerTitle);
        self.hideLoadingSpinner();
      });
    },

    removeOtherMapLayers: function(lMap, newLayerTitle) {
      let allMapLayers = Object.entries(lMap._layers).filter(([key, layer]) => layer.wmsParams?.layers);
      let layersToBeDeleted;

      // Remove all layers if the new layer title isn't passed
      if (!newLayerTitle) {
        layersToBeDeleted = allMapLayers;
      } else {
        layersToBeDeleted = allMapLayers.filter(([key, layer]) => layer.options.className !== newLayerTitle);
      }
      
      if (layersToBeDeleted.length) {
        layersToBeDeleted.forEach(layer => layer[1].remove());
      }
    },

    getMapApiUrl: function(mapApi) {
      switch (mapApi) {
        case 'kartta_hel_fi':
          return 'https://kartta.hel.fi/ws/geoserver/avoindata/wms';

        case 'geoserver_hel_fi':
          return 'https://geoserver.hel.fi/geoserver/ows';

        default:
          return '';
      }
    },

    showLoadingSpinner: function() {
      $('#map-loading-overlay').fadeIn(150);
    },

    hideLoadingSpinner: function() {
      $('#map-loading-overlay').fadeOut(150);
    },

    bindZoomControls: function(lMap) {
      let $zoomInBtn = $('.map-controls__control-button#zoom-in-btn');
      let $zoomOutBtn = $('.map-controls__control-button#zoom-out-btn');

      $zoomInBtn.on('click', function() {
        lMap.zoomIn();
      });

      $zoomOutBtn.on('click', function() {
        lMap.zoomOut();
      });
    },

    bindLocateControl: function(lMap) {
      let self = this;
      let $locateBtn = $('.map-controls__control-button#locate-btn');

      $locateBtn.on('click', function() {
        if (!navigator.geolocation) {
          console.log('Geolocation is not supported by your browser');
        } else {
          self.showLoadingSpinner();
          
          navigator.geolocation.getCurrentPosition((position) => {
            self.hideLoadingSpinner();

            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            
            self.addUserLocationMarker(userLat, userLon, lMap);
            
            lMap.panTo([userLat, userLon]);
            lMap.setZoom(15);
          }, (error) => {
            if (error.code === 1) {
              self.showGeolocationDeniedBox();
            }
            self.hideLoadingSpinner();
          });
        }
      });
    },

    addUserLocationMarker: function(userLat, userLon, lMap) {
      let userLatLng = new L.LatLng(userLat, userLon);

      let userIcon = L.icon({
        iconSize: ['36', '36'],
        iconUrl: '/themes/custom/hdbt_subtheme/src/icons/user.svg'
      });

      let userMarker = L.marker(userLatLng, {
        icon: userIcon
      });
      
      userMarker.addTo(lMap);
    },

    showGeolocationDeniedBox: function() {
      let self = this;
      let title = Drupal.t('Location data blocked', {}, {context: 'Map selectors'});
      let description = Drupal.t('Unfortunately, we are unable to show places on the map based on your location until you agree to use your location.', {}, {context: 'Map selectors'});
      let closeBtnText = Drupal.t('Close', {}, {context: 'Map selectors'});

      $('.leaflet-container').prepend(`
        <div id="geolocation-denied-overlay" style="display:none;">
          <div class="info-box">
            <div class="info-header">
              <span class="info-icon"></span>
              <h3>${title}</h3>
              <div class="close-btn" role="button">${closeBtnText}</div>
            </div>
            <p>${description}</p>
          </div>
        </div>
      `);

      $('#geolocation-denied-overlay').fadeIn(150);

      $('#geolocation-denied-overlay .close-btn').on('click', function() {
        self.hideGeoloactionDeniedBox();
      });

      // Hide with escape key
      $(document).keyup(function(e) {
        if (e.keyCode === 27)
          self.hideGeoloactionDeniedBox();
      });
    },

    hideGeoloactionDeniedBox: function() {
      $('#geolocation-denied-overlay').fadeOut(150);
    }
  };
  // eslint-disable-next-line no-undef
})(jQuery, Drupal, drupalSettings);
