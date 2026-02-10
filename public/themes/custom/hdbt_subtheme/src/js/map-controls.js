// eslint-disable-next-line no-unused-vars
(($, Drupal, drupalSettings) => {
  Drupal.behaviors.mapControls = {
    attach: function(context, settings) {
      let self = this;

      // Ensure Leaflet is loaded before adding init hooks
      if (typeof L === 'undefined' || !L.Map) {
        return;
      }

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

          // Select2 has no option to prevent opening when clear is clicked (4.x behavior).
          $select.on('select2:unselecting', function() {
            $select.data('map-controls-unselecting', true);
          });
          $select.on('select2:opening', function(e) {
            if ($select.data('map-controls-unselecting')) {
              $select.removeData('map-controls-unselecting');
              e.preventDefault();
              setTimeout(function() {
                $select.select2('close');
                $select.next('.select2-container').find('.select2-selection').trigger('blur');
              }, 0);
            }
          });

          // Target the specific selection container
          const $selectionContainer = $select.next('.select2-container').find('.select2-selection__rendered');
          $selectionContainer.attr({
            'role': 'combobox',
            'aria-label': ariaLabel,
            'aria-haspopup': 'listbox',
            'aria-expanded': 'false'
          });

          $select.on('select2:open', function() {
            $selectionContainer.attr('aria-expanded', 'true');
          }).on('select2:close', function() {
            $selectionContainer.attr('aria-expanded', 'false');
          });
          $select.on('select2:select', function(e) {
            $selectionContainer.attr('aria-label', `${ariaLabel}: ${e.params.data.text}`);
            $(document).find('.map-controls__clear-btn[data-clear-for="' + $select.attr('id') + '"]').prop('hidden', false).attr('aria-hidden', 'false');
          });
          $select.on('select2:clear', function() {
            $selectionContainer.attr('aria-label', ariaLabel);
            $(document).find('.map-controls__clear-btn[data-clear-for="' + $select.attr('id') + '"]').prop('hidden', true).attr('aria-hidden', 'true');
          });
        });

        $('.map-controls__map-layer').val('default').trigger('change.select2');

        $('.map-controls__map-layer').each(function() {
          const $select = $(this);
          const $btn = $(document).find('.map-controls__clear-btn[data-clear-for="' + $select.attr('id') + '"]');
          if ($select.val()) {
            $btn.prop('hidden', false).attr('aria-hidden', 'false');
          } else {
            $btn.prop('hidden', true).attr('aria-hidden', 'true');
          }
        });

        $(document).on('mousedown.mapcontrols click.mapcontrols', '.map-controls__clear-btn', function(e) {
          e.preventDefault();
          e.stopPropagation();
          if (e.type === 'mousedown') return;
          const $btn = $(this);
          const selectId = $btn.data('clear-for');
          const $select = $('#' + selectId);
          if (!$select.length || !$select.hasClass('map-controls__map-layer')) return;
          $btn.prop('hidden', true).attr('aria-hidden', 'true');
          requestAnimationFrame(function() {
            $select.data('map-controls-unselecting', true);
            $select.val(null).trigger('change');
            self.removeOtherMapLayers(map, null);
          });
        });

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

            // Set up mutation observer to watch for cluster elements (tabindex + aria-label)
            const observer = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                if (mutation.addedNodes) {
                  mutation.addedNodes.forEach(function(node) {
                    if (node.classList && node.classList.contains('marker-cluster')) {
                      node.setAttribute('tabindex', '0');

                      // Get the cluster count
                      const count = node.querySelector('.marker-cluster-count')?.textContent || '0';
                      node.setAttribute('aria-label', 'Cluster of ' + count + ' markers');
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

            // Single keydown handler on map container (delegation): works when focus is on cluster or any child
            const mapContainer = map.getContainer();
            const clusterKeydown = function(event) {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              const clusterNode = (event.target && event.target.closest && event.target.closest('.marker-cluster')) || null;
              if (!clusterNode) return;
              event.preventDefault();

              const rect = clusterNode.getBoundingClientRect();
              const mapRect = mapContainer.getBoundingClientRect();
              const clusterPoint = [
                rect.left - mapRect.left + rect.width / 2,
                rect.top - mapRect.top + rect.height / 2
              ];

              // Try programmatic spiderfy first (reliable for keyboard); fallback to mouse events
              const clusterLayer = findClusterByIcon(clusterGroup, clusterNode);
              if (clusterLayer && typeof clusterLayer.spiderfy === 'function') {
                clusterLayer.spiderfy();
              } else {
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                ['mousedown', 'mouseup', 'click'].forEach(function(type) {
                  const ev = new MouseEvent(type, {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    clientX: centerX,
                    clientY: centerY
                  });
                  clusterNode.dispatchEvent(ev);
                });
              }

              setTimeout(function() {
                const focusable = Array.from(mapContainer.querySelectorAll('.leaflet-marker-pane [tabindex="0"]'))
                  .filter(function(el) { return !el.classList.contains('marker-cluster'); });
                const withDist = focusable.map(function(el) {
                  const r = el.getBoundingClientRect();
                  const cx = r.left - mapRect.left + r.width / 2;
                  const cy = r.top - mapRect.top + r.height / 2;
                  const d = (r.width === 0 && r.height === 0) ? Infinity : Math.pow(cx - clusterPoint[0], 2) + Math.pow(cy - clusterPoint[1], 2);
                  return { el: el, d: d };
                }).filter(function(x) { return x.d < Infinity; });
                withDist.sort(function(a, b) { return a.d - b.d; });
                const ordered = withDist.map(function(x) { return x.el; });
                if (ordered.length) {
                  ordered[0].focus();
                  map._spiderfiedMarkerElements = ordered;
                }
              }, 450);
            };
            mapContainer.addEventListener('keydown', clusterKeydown, true);

            mapContainer.addEventListener('focusout', function(ev) {
              if (!mapContainer.contains(ev.relatedTarget)) {
                map._spiderfiedMarkerElements = null;
              }
            });
          }
        });

        // Find L.MarkerCluster whose _icon is the given DOM node (walk cluster group tree)
        function findClusterByIcon(group, node) {
          if (!group || !node || typeof group.getVisibleParent !== 'function') return null;
          const top = group._topClusterLevel;
          if (!top) return null;
          function walk(c) {
            if (c._icon === node) return c;
            if (c._childClusters) {
              for (let i = 0; i < c._childClusters.length; i++) {
                const found = walk(c._childClusters[i]);
                if (found) return found;
              }
            }
            return null;
          }
          return walk(top);
        }

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

        // Handle keyboard navigation between markers (and within spiderfied cluster)
        map.on('keydown', function(e) {
          if (e.key === 'Tab') {
            const active = document.activeElement;
            const spiderfied = map._spiderfiedMarkerElements;

            if (spiderfied && spiderfied.length && spiderfied.indexOf(active) !== -1) {
              const idx = spiderfied.indexOf(active);
              if (!e.shiftKey && idx < spiderfied.length - 1) {
                e.preventDefault();
                spiderfied[idx + 1].focus();
                return;
              }
              if (e.shiftKey && idx > 0) {
                e.preventDefault();
                spiderfied[idx - 1].focus();
                return;
              }
              map._spiderfiedMarkerElements = null;
              return;
            }

            const markers = Array.from(map.getLayers())
              .filter(layer => layer instanceof L.Marker)
              .map(layer => layer.getElement())
              .filter(el => el);

            const currentIndex = markers.indexOf(active);

            if (currentIndex > -1) {
              e.preventDefault();
              const nextIndex = e.shiftKey ? currentIndex - 1 : currentIndex + 1;
              const nextMarker = markers[nextIndex >= markers.length ? 0 : nextIndex < 0 ? markers.length - 1 : nextIndex];
              nextMarker.focus();
            }
          }
        });

        const escapeHandler = function(e) {
          if (e.key === 'Escape') {
            // Check if there's an open popup first
            const openPopup = document.querySelector('.leaflet-popup');

            if (openPopup) {
              e.preventDefault();
              map.closePopup();
            } else {
              // Check if we're on a map element and exit the map
              const mapContainer = map.getContainer();
              const isOnMapElement = mapContainer.contains(document.activeElement);

              if (isOnMapElement) {
                e.preventDefault();
                // Focus on next paragraph-content
                const paragraphContent = document.querySelector('.paragraph-content');
                if (paragraphContent) {
                  if (paragraphContent.tabIndex === -1) {
                    paragraphContent.tabIndex = 0;
                  }
                  paragraphContent.focus();
                }
              }
            }
          }
        };

        document.addEventListener('keydown', escapeHandler);

        // Clean up event listener when map is unloaded
        this.on('unload', function() {
          document.removeEventListener('keydown', escapeHandler);
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
        lMap._mapControlsResettingOthers = true;
        $controls.not(e.target).each(function() {
          $(document).find('.map-controls__clear-btn[data-clear-for="' + $(this).attr('id') + '"]').prop('hidden', true).attr('aria-hidden', 'true');
        });
        $controls.not(e.target).val(null).trigger('change.select2');
        setTimeout(function() { lMap._mapControlsResettingOthers = false; }, 0);
      });

      $controls.on('select2:clear', function () {
        if (lMap._mapControlsResettingOthers) return;
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
      let title = Drupal.t('Location data blocked', {}, {context: 'Map controls'});
      let description = Drupal.t('Unfortunately, we are unable to show places on the map based on your location until you agree to use your location.', {}, {context: 'Map controls'});
      let closeBtnText = Drupal.t('Close', {}, {context: 'Map controls'});

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
