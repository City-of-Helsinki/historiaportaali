// eslint-disable-next-line no-unused-vars
(($, Drupal, drupalSettings) => {
  Drupal.behaviors.mapControls = {
    attach: function(context, settings) {
      let self = this;

      console.log('TESTING !');
      L.Map.addInitHook(function () {
        const map = this;

        if (this.options?.mapName == 'comparison-map') {
          self.bindLayerControls(this, 'comparison-map');
        } else {
          self.bindLayerControls(this, 'main-map');
          self.bindZoomControls(this);
          self.bindLocateControl(this);
          this.removeControl(this.zoomControl);
        }

        $('.map-controls__map-layer').each(function() {
          const $select = $(this);
          const ariaLabel = $select.attr('aria-label');

          $select.select2({
            minimumResultsForSearch: Infinity,
            placeholder: function() {
              return $(this).data('placeholder');
            },
            allowClear: true
          });

          // Target the specific selection container
          const $selectionContainer = $select.next('.select2-container').find('.select2-selection__rendered');
          $selectionContainer.attr({
            'role': 'combobox',
            'aria-label': ariaLabel,
            'aria-haspopup': 'listbox',
            'aria-expanded': 'false'
          });

          // Update ARIA attributes on open/close
          $select.on('select2:open', function() {
            $selectionContainer.attr('aria-expanded', 'true');
          }).on('select2:close', function() {
            $selectionContainer.attr('aria-expanded', 'false');
          });

          // Update ARIA attributes on selection
          $select.on('select2:select', function(e) {
            const selectedText = e.params.data.text;
            $selectionContainer.attr('aria-label', `${ariaLabel}: ${selectedText}`);
          });
        });

        $('.map-controls__map-layer').val('default').trigger('change.select2');

        this.on('unload', function() {
          if (this.options?.mapName == 'comparison-map') {
            self.unBindLayerControls('comparison-map');
          } else {
            self.unBindLayerControls('main-map');
          }
        });

        // Make markers keyboard focusable and handle navigation
        map.on('layeradd', function(e) {
          if (e.layer instanceof L.Marker) {
            const markerElement = e.layer.getElement();
            if (markerElement) {
              markerElement.setAttribute('tabindex', '0');
              markerElement.setAttribute('role', 'button');
              markerElement.setAttribute('aria-label', e.layer.getPopup()?.getContent() || 'Map marker');

              // Add focus event to center map on marker
              markerElement.addEventListener('focus', function() {
                const marker = e.layer;
                if (marker) {
                  // Check if marker is near the edge of the map
                  const markerPoint = map.latLngToContainerPoint(marker.getLatLng());
                  const mapSize = map.getSize();
                  const edgeBuffer = 100; // pixels from edge

                  if (markerPoint.x < edgeBuffer ||
                      markerPoint.x > mapSize.x - edgeBuffer ||
                      markerPoint.y < edgeBuffer ||
                      markerPoint.y > mapSize.y - edgeBuffer) {
                    // Center map on marker with padding
                    map.setView(marker.getLatLng(), map.getZoom(), {
                      animate: true,
                      duration: 0.5,
                      padding: [50, 50]
                    });
                  }
                }
              });

              // Add keyboard event handler for opening popup
              markerElement.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  e.layer.openPopup();
                }
              });
            }
          }
        });

        // Handle marker cluster keyboard interaction
        map.on('layeradd', function(e) {
          if (e.layer instanceof L.MarkerClusterGroup) {
            const clusterGroup = e.layer;

            // Set up mutation observer to watch for cluster elements
            const observer = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                if (mutation.addedNodes) {
                  mutation.addedNodes.forEach(function(node) {
                    if (node.classList && node.classList.contains('marker-cluster')) {
                      node.setAttribute('tabindex', '0');
                      node.setAttribute('role', 'button');

                      // Get the cluster count
                      const count = node.querySelector('.marker-cluster-count')?.textContent || '0';
                      node.setAttribute('aria-label', 'Cluster of ' + count + ' markers');

                      // Add keyboard event handler for expanding cluster
                      node.addEventListener('keydown', function(event) {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();

                          // Get the cluster's position from the DOM element
                          const rect = node.getBoundingClientRect();
                          const mapRect = map.getContainer().getBoundingClientRect();
                          const point = map.containerPointToLatLng([
                            rect.left - mapRect.left + rect.width / 2,
                            rect.top - mapRect.top + rect.height / 2
                          ]);

                          // Find the closest cluster
                          const clusters = clusterGroup.getLayers();
                          let closestCluster = null;
                          let minDistance = Infinity;

                          clusters.forEach(layer => {
                            if (layer instanceof L.MarkerCluster) {
                              const layerPoint = map.latLngToContainerPoint(layer.getLatLng());
                              const nodePoint = map.latLngToContainerPoint(point);
                              const distance = Math.sqrt(
                                Math.pow(layerPoint.x - nodePoint.x, 2) +
                                Math.pow(layerPoint.y - nodePoint.y, 2)
                              );

                              if (distance < minDistance) {
                                minDistance = distance;
                                closestCluster = layer;
                              }
                            }
                          });

                          if (closestCluster && minDistance < 100) {
                            const markers = closestCluster.getAllChildMarkers();
                            if (markers.length > 0) {
                              const markerBounds = L.latLngBounds(markers.map(m => m.getLatLng()));
                              map.fitBounds(markerBounds, {
                                padding: [50, 50],
                                animate: true,
                                duration: 0.5
                              });

                              setTimeout(() => {
                                const firstMarker = markers[0].getElement();
                                if (firstMarker) {
                                  firstMarker.focus();
                                }
                              }, 600);
                            }
                          }
                        }
                      });
                    }
                  });
                }
              });
            });

            // Start observing the map container for changes
            observer.observe(map.getContainer(), {
              childList: true,
              subtree: true
            });
          }
        });

        // Handle popup opening
        map.on('popupopen', function(e) {
          const popup = e.popup;
          const popupContent = popup.getElement();

          if (popupContent) {
            // Make popup content focusable
            popupContent.setAttribute('tabindex', '0');

            // Find the first interactive element in the popup
            const firstInteractive = popupContent.querySelector('.content-card__link, a, button, [tabindex="0"]');
            if (firstInteractive) {
              firstInteractive.setAttribute('tabindex', '0');
              firstInteractive.focus();
            } else {
              popupContent.focus();
            }

            // Center map on popup if it's near the edge
            const popupPoint = map.latLngToContainerPoint(e.popup.getLatLng());
            const mapSize = map.getSize();
            const edgeBuffer = 100;

            if (popupPoint.x < edgeBuffer ||
                popupPoint.x > mapSize.x - edgeBuffer ||
                popupPoint.y < edgeBuffer ||
                popupPoint.y > mapSize.y - edgeBuffer) {
              map.setView(e.popup.getLatLng(), map.getZoom(), {
                animate: true,
                duration: 0.5,
                padding: [50, 50]
              });
            }
          }
        });

        // Handle popup closing
        map.on('popupclose', function(e) {
          const marker = e.popup._source;
          if (marker) {
            const markerElement = marker.getElement();
            if (markerElement) {
              markerElement.focus();
            }
          }
        });

        // Handle keyboard navigation between markers
        map.on('keydown', function(e) {
          if (e.key === 'Tab') {
            const markers = Array.from(map.getLayers())
              .filter(layer => layer instanceof L.Marker)
              .map(layer => layer.getElement())
              .filter(el => el);

            const currentIndex = markers.indexOf(document.activeElement);

            if (currentIndex > -1) {
              e.preventDefault();
              const nextIndex = e.shiftKey ? currentIndex - 1 : currentIndex + 1;
              const nextMarker = markers[nextIndex >= markers.length ? 0 : nextIndex < 0 ? markers.length - 1 : nextIndex];
              nextMarker.focus();
            }
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
        $controls.not(e.target).val('default').trigger('change.select2');
      });

      $controls.on('select2:clear', function (e) {
        self.removeOtherMapLayers(lMap, null);
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
