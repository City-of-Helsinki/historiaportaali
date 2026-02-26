(($, Drupal) => {
  const { behaviors } = Drupal;

  behaviors.mapControls = {
    attach() {
      const self = this;

      // Ensure Leaflet is loaded before adding init hooks
      if (typeof L === "undefined" || !L.Map) {
        return;
      }

      L.Map.addInitHook(function () {
        const map = this;

        const mapName =
          this.options?.mapName === "comparison-map"
            ? "comparison-map"
            : "main-map";

        if (mapName === "comparison-map") {
          self.bindLayerControls(this, "comparison-map");
        } else {
          self.bindLayerControls(this, "main-map");
          self.bindZoomControls(this);
          self.bindLocateControl(this);
          this.removeControl(this.zoomControl);
        }

        const $mapLayerSelects = $(`.map-controls__map-layer.${mapName}`);

        const focusNoScroll = (el) => {
          const y = window.scrollY;
          el.focus({ preventScroll: true });
          requestAnimationFrame(() => window.scrollTo(0, y));
        };

        $mapLayerSelects.each(function () {
          const $select = $(this);
          const ariaLabel = $select.attr("aria-label");
          const selectId = $select.attr("id");

          if (!selectId) return;

          $select.select2({
            minimumResultsForSearch: Number.POSITIVE_INFINITY,
            placeholder() {
              return $(this).data("placeholder");
            },
            allowClear: true,
          });

          $select.on("select2:unselecting", () => {
            $select.data("map-controls-unselecting", true);
          });
          $select.on("select2:opening", (e) => {
            if ($select.data("map-controls-unselecting")) {
              $select.removeData("map-controls-unselecting");
              e.preventDefault();
              setTimeout(() => {
                $select.select2("close");
                $select
                  .next(".select2-container")
                  .find(".select2-selection")
                  .trigger("blur");
              }, 0);
            }
          });

          const $selectionContainer = $select
            .next(".select2-container")
            .find(".select2-selection__rendered");
          $selectionContainer.attr({
            role: "combobox",
            "aria-label": ariaLabel,
            "aria-haspopup": "listbox",
            "aria-expanded": "false",
          });

          const $clearBtn = $(
            `.map-controls__clear-btn[data-clear-for="${selectId}"]`,
          );

          $select
            .on("select2:open", () => {
              $selectionContainer.attr("aria-expanded", "true");
            })
            .on("select2:close", () => {
              $selectionContainer.attr("aria-expanded", "false");
            });
          $select.on("select2:select", (e) => {
            $selectionContainer.attr(
              "aria-label",
              `${ariaLabel}: ${e.params.data.text}`,
            );
            $clearBtn.prop("hidden", false).attr("aria-hidden", "false");
          });
          $select.on("select2:clear", () => {
            $selectionContainer.attr("aria-label", ariaLabel);
            $clearBtn.prop("hidden", true).attr("aria-hidden", "true");
          });
          $clearBtn.prop("hidden", true).attr("aria-hidden", "true");
        });

        $mapLayerSelects.val("default").trigger("change.select2");

        // Track Tab vs mouse for marker focus: only pan on keyboard focus, not click
        if (!document.body.hasAttribute("data-map-controls-keyboard-tracker")) {
          document.body.setAttribute("data-map-controls-keyboard-tracker", "1");
          document.addEventListener(
            "keydown",
            (e) => {
              if (e.key === "Tab") window._mapControlsFocusFromKeyboard = true;
            },
            true,
          );
          document.addEventListener(
            "mousedown",
            () => {
              window._mapControlsFocusFromKeyboard = false;
            },
            true,
          );
        }

        if (!$(document).data("map-controls-clear-handler-attached")) {
          $(document).data("map-controls-clear-handler-attached", true);
          $(document).on(
            "mousedown.mapcontrols click.mapcontrols",
            ".map-controls__clear-btn",
            (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.type === "mousedown") return;
              const $btn = $(e.currentTarget);
              const selectId = $btn.data("clear-for");
              const $select = $(`#${selectId}`);
              if (
                !$select.length ||
                !$select.hasClass("map-controls__map-layer")
              )
                return;
              const isComparison = $select.hasClass("comparison-map");
              const $mapContainer = isComparison
                ? $("#comparison-map-container")
                : $("[id^='leaflet-map-view-combined-map-block']").first();
              const lMap = $mapContainer.data("leaflet")?.lMap;
              if (!lMap) return;
              $btn.prop("hidden", true).attr("aria-hidden", "true");
              requestAnimationFrame(() => {
                $select.data("map-controls-unselecting", true);
                $select.val(null).trigger("change");
                self.removeOtherMapLayers(lMap, null);
              });
            },
          );
        }

        this.on("unload", function () {
          if (this.options?.mapName === "comparison-map") {
            self.unBindLayerControls("comparison-map");
          } else {
            self.unBindLayerControls("main-map");
          }
        });

        // Make markers keyboard focusable and handle navigation
        map.on("layeradd", (e) => {
          if (
            e.layer instanceof L.Marker &&
            !(e.layer instanceof L.MarkerCluster)
          ) {
            const markerElement = e.layer.getElement();
            if (markerElement) {
              markerElement.setAttribute("tabindex", "0");
              const label =
                (e.layer.options?.title &&
                  String(e.layer.options.title).trim()) ||
                Drupal.t("Map marker", {}, { context: "Map controls" });
              markerElement.removeAttribute("title");
              markerElement.setAttribute("aria-label", label);

              // Pan map to center marker on keyboard focus only (mouse click has its own popup+pan flow)
              markerElement.addEventListener("focus", () => {
                if (window._mapControlsFocusFromKeyboard) {
                  window._mapControlsFocusFromKeyboard = false;
                  map.panTo(e.layer.getLatLng(), { animate: true });
                }
              });

              // Enter+Space open popup (Leaflet only handles Enter via keypress)
              markerElement.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  e.layer.openPopup();
                }
              });
            }
          }
        });

        // Handle marker cluster keyboard interaction
        map.on("layeradd", (e) => {
          if (e.layer instanceof L.MarkerClusterGroup) {
            // Set up mutation observer to watch for cluster elements (tabindex + aria-label)
            const setClusterAccessibility = (clusterNode) => {
              if (!clusterNode || !clusterNode.isConnected) return;
              clusterNode.setAttribute("tabindex", "0");
              clusterNode.setAttribute("role", "button");
              const count =
                clusterNode.querySelector("span")?.textContent?.trim() || "0";
              clusterNode.setAttribute(
                "aria-label",
                Drupal.t(
                  "Cluster of @count markers",
                  { "@count": count },
                  { context: "Map controls" },
                ),
              );
            };

            const mapContainer = map.getContainer();

            const ensureClusterAriaLabels = () => {
              mapContainer
                .querySelectorAll(".marker-cluster:not([aria-label])")
                .forEach(setClusterAccessibility);
            };

            const observer = new MutationObserver(() => {
              ensureClusterAriaLabels();
            });

            observer.observe(mapContainer, {
              childList: true,
              subtree: true,
            });

            ensureClusterAriaLabels();
            setTimeout(ensureClusterAriaLabels, 100);

            // Single keydown handler on map container (delegation): works when focus is on cluster or any child
            const clusterKeydown = (event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              const clusterNode =
                event.target?.closest?.(".marker-cluster") || null;
              if (!clusterNode) return;
              event.preventDefault();

              const rect = clusterNode.getBoundingClientRect();
              const mapRect = mapContainer.getBoundingClientRect();
              const clusterPoint = [
                rect.left - mapRect.left + rect.width / 2,
                rect.top - mapRect.top + rect.height / 2,
              ];
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;

              // Simulate mouse click so keyboard and mouse behave identically (zoom or spiderfy)
              for (const type of ["mousedown", "mouseup", "click"]) {
                clusterNode.dispatchEvent(
                  new MouseEvent(type, {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    clientX: centerX,
                    clientY: centerY,
                  }),
                );
              }

              setTimeout(() => {
                const focusables = Array.from(
                  mapContainer.querySelectorAll(
                    '.leaflet-marker-pane [tabindex="0"]',
                  ),
                );
                const byDistance = focusables
                  .map((el) => {
                    const r = el.getBoundingClientRect();
                    const cx = r.left - mapRect.left + r.width / 2;
                    const cy = r.top - mapRect.top + r.height / 2;
                    const d =
                      r.width && r.height
                        ? (cx - clusterPoint[0]) ** 2 +
                          (cy - clusterPoint[1]) ** 2
                        : Number.POSITIVE_INFINITY;
                    return { el, d };
                  })
                  .filter((x) => x.d < Number.POSITIVE_INFINITY)
                  .sort((a, b) => a.d - b.d);
                if (byDistance.length) {
                  focusNoScroll(byDistance[0].el);
                  map._spiderfiedMarkerElements = byDistance.map((x) => x.el);
                }
              }, 450);
            };
            mapContainer.addEventListener("keydown", clusterKeydown, true);

            // Arrow key navigation between markers and clusters
            const arrowKeys = [
              "ArrowUp",
              "ArrowDown",
              "ArrowLeft",
              "ArrowRight",
            ];
            mapContainer.addEventListener(
              "keydown",
              (ev) => {
                if (!arrowKeys.includes(ev.key)) return;
                const active = document.activeElement;
                if (!mapContainer.contains(active)) return;
                if (active.closest(".leaflet-popup")) return;
                const inPane = active.closest(".leaflet-marker-pane");
                if (!inPane || !active.matches?.("[tabindex='0']")) return;

                const focusables = Array.from(
                  mapContainer.querySelectorAll(
                    ".leaflet-marker-pane [tabindex='0']",
                  ),
                ).filter((el) => el !== active);
                if (!focusables.length) return;

                const rect = active.getBoundingClientRect();
                const mapRect = mapContainer.getBoundingClientRect();
                const cx = rect.left - mapRect.left + rect.width / 2;
                const cy = rect.top - mapRect.top + rect.height / 2;

                const inDirection = focusables
                  .map((el) => {
                    const r = el.getBoundingClientRect();
                    const x = r.left - mapRect.left + r.width / 2;
                    const y = r.top - mapRect.top + r.height / 2;
                    let ok = false;
                    if (ev.key === "ArrowUp" && y < cy - 2) ok = true;
                    if (ev.key === "ArrowDown" && y > cy + 2) ok = true;
                    if (ev.key === "ArrowLeft" && x < cx - 2) ok = true;
                    if (ev.key === "ArrowRight" && x > cx + 2) ok = true;
                    const d = (x - cx) ** 2 + (y - cy) ** 2;
                    return ok ? { el, d } : null;
                  })
                  .filter(Boolean)
                  .sort((a, b) => a.d - b.d);
                if (inDirection.length) {
                  ev.preventDefault();
                  window._mapControlsFocusFromKeyboard = true;
                  focusNoScroll(inDirection[0].el);
                }
              },
              true,
            );

            mapContainer.addEventListener("focusout", (ev) => {
              if (!mapContainer.contains(ev.relatedTarget)) {
                map._spiderfiedMarkerElements = null;
              }
            });

            // Intercept Tab into map area: prevent scroll when focus would move into map
            const viewEl = mapContainer.closest(".views--combined-map");
            const mapArea = viewEl?.querySelector(".map-container");
            if (
              viewEl &&
              mapArea &&
              !viewEl.hasAttribute("data-map-tab-intercept")
            ) {
              viewEl.setAttribute("data-map-tab-intercept", "1");
              viewEl.addEventListener(
                "keydown",
                (ev) => {
                  if (ev.key !== "Tab" || ev.shiftKey) return;
                  const active = document.activeElement;
                  if (!viewEl.contains(active) || mapContainer.contains(active))
                    return;
                  const all = [
                    ...viewEl.querySelectorAll(
                      'a[href], button, input, select, textarea, [tabindex="0"]',
                    ),
                  ].filter(
                    (el) =>
                      el.tabIndex >= 0 &&
                      !el.disabled &&
                      el.offsetParent !== null,
                  );
                  const i = all.indexOf(active);
                  const next = i >= 0 && i < all.length - 1 ? all[i + 1] : null;
                  if (next && mapArea.contains(next)) {
                    ev.preventDefault();
                    window._mapControlsFocusFromKeyboard = true;
                    focusNoScroll(next);
                  }
                },
                true,
              );
            }
          }
        });

        // Handle popup opening: focus link (retry for async-loaded content)
        map.on("popupopen", (e) => {
          const { popup } = e;
          const container = popup._container;
          if (!container) return;

          map.panInside(e.popup.getLatLng(), { padding: [50, 50] });

          const tryFocus = () => {
            const content = container.querySelector(".leaflet-popup-content");
            const link = content?.querySelector(".content-card__link, a[href]");
            const toFocus = link || content;
            if (toFocus) {
              if (toFocus === content) toFocus.setAttribute("tabindex", "-1");
              focusNoScroll(toFocus);
              return !!link;
            }
            return false;
          };
          requestAnimationFrame(() => {
            if (!tryFocus()) setTimeout(tryFocus, 100);
          });
        });

        // Handle popup closing
        map.on("popupclose", (e) => {
          const marker = e.popup._source;
          if (marker) {
            const markerElement = marker.getElement();
            if (markerElement) focusNoScroll(markerElement);
          }
        });

        // Handle Tab between markers and clusters (all focusables in marker pane)
        const mapContainerEl = map.getContainer();
        map.on("keydown", (e) => {
          if (e.key !== "Tab") return;
          const active = document.activeElement;
          if (!mapContainerEl.contains(active)) return;

          const spiderfied = map._spiderfiedMarkerElements;
          const idx = spiderfied?.indexOf(active);
          if (idx >= 0) {
            if (!e.shiftKey && idx < spiderfied.length - 1) {
              e.preventDefault();
              focusNoScroll(spiderfied[idx + 1]);
            } else if (e.shiftKey && idx > 0) {
              e.preventDefault();
              focusNoScroll(spiderfied[idx - 1]);
            } else {
              map._spiderfiedMarkerElements = null;
            }
            return;
          }

          const focusables = Array.from(
            mapContainerEl.querySelectorAll(
              ".leaflet-marker-pane [tabindex='0']",
            ),
          );
          const cur = focusables.indexOf(active);
          if (cur === -1) return;

          e.preventDefault();
          const next = e.shiftKey
            ? (cur - 1 + focusables.length) % focusables.length
            : (cur + 1) % focusables.length;
          window._mapControlsFocusFromKeyboard = true;
          focusNoScroll(focusables[next]);
        });

        function escapeHandler(e) {
          if (e.key !== "Escape") return;
          const $overlay = $("#geolocation-denied-overlay");
          if ($overlay.length && $overlay.is(":visible")) {
            e.preventDefault();
            self.hideGeolocationDeniedBox();
            return;
          }
          if (document.querySelector(".leaflet-popup")) {
            e.preventDefault();
            map.closePopup();
            return;
          }
          if (map.getContainer().contains(document.activeElement)) {
            e.preventDefault();
            const paragraphContent =
              document.querySelector(".paragraph-content");
            if (paragraphContent) {
              if (paragraphContent.tabIndex === -1)
                paragraphContent.tabIndex = 0;
              paragraphContent.focus();
            }
          }
        }

        document.addEventListener("keydown", escapeHandler);

        // Clean up event listener when map is unloaded
        this.on("unload", () => {
          document.removeEventListener("keydown", escapeHandler);
        });
      });
    },

    bindLayerControls(lMap, mapName) {
      const $controls = $(`.map-controls__map-layer.${mapName}`);

      $controls.change((e) => {
        const $target = $(e.target);
        const selectedLayerTitle = $target
          .find(":selected")
          .not("[map-layer-title='default']")
          .data("map-layer-title");
        const mapApiEndpoints = $target
          .find(":selected")
          .not("[map-layer-title='default']")
          .data("map-api-endpoints");
        this.handleLayerSelection(lMap, selectedLayerTitle, mapApiEndpoints);
        lMap._mapControlsResettingOthers = true;
        $controls.not(e.target).each(function () {
          const selectId = $(this).attr("id");
          if (!selectId) return;
          $(this)
            .closest(".map-controls__select-row")
            .find(`.map-controls__clear-btn[data-clear-for="${selectId}"]`)
            .prop("hidden", true)
            .attr("aria-hidden", "true");
        });
        $controls.not(e.target).val(null).trigger("change.select2");
        setTimeout(() => {
          lMap._mapControlsResettingOthers = false;
        }, 0);
      });

      $controls.on("select2:clear", () => {
        if (lMap._mapControlsResettingOthers) return;
        this.removeOtherMapLayers(lMap, null);
      });
    },

    unBindLayerControls(mapName) {
      const $controls = $(`.map-controls__map-layer.${mapName}`);
      $controls.off("click");
    },

    toggleLayerSelectorVisibility(mapName) {
      const $controlsContainer = $(`.map-controls__map-layer.${mapName}`);

      if ($controlsContainer.is(".open")) {
        $controlsContainer.removeClass("open");
      } else {
        $controlsContainer.addClass("open");
      }
    },

    handleLayerSelection(lMap, selectedLayerTitle, mapApiEndpoints) {
      if (selectedLayerTitle === "present") {
        this.removeOtherMapLayers(lMap, null);
        return;
      }

      if (mapApiEndpoints) {
        for (const endpoint of mapApiEndpoints) {
          this.addMapLayer(lMap, endpoint, selectedLayerTitle);
        }
      }
    },

    addMapLayer(lMap, endpoint, selectedLayerTitle) {
      const mapApiUrl = this.getMapApiUrl(endpoint.map_api);

      this.showLoadingSpinner();

      const mapLayer = L.tileLayer.wms(mapApiUrl, {
        layers: endpoint.wms_title,
        format: "image/png",
        transparent: true,
        className: selectedLayerTitle,
      });

      mapLayer.addTo(lMap);

      // Remove other layers after the new layer has loaded
      mapLayer.on("load", () => {
        this.removeOtherMapLayers(lMap, selectedLayerTitle);
        this.hideLoadingSpinner();
      });
    },

    removeOtherMapLayers(lMap, newLayerTitle) {
      const allMapLayers = Object.entries(lMap._layers).filter(
        ([, layer]) => layer.wmsParams?.layers,
      );
      let layersToBeDeleted;

      // Remove all layers if the new layer title isn't passed
      if (!newLayerTitle) {
        layersToBeDeleted = allMapLayers;
      } else {
        layersToBeDeleted = allMapLayers.filter(
          ([, layer]) => layer.options.className !== newLayerTitle,
        );
      }

      if (layersToBeDeleted.length) {
        for (const layer of layersToBeDeleted) {
          layer[1].remove();
        }
      }
    },

    getMapApiUrl(mapApi) {
      switch (mapApi) {
        case "kartta_hel_fi":
          return "https://kartta.hel.fi/ws/geoserver/avoindata/wms";

        default:
          return "";
      }
    },

    showLoadingSpinner() {
      $("#map-loading-overlay").fadeIn(150);
    },

    hideLoadingSpinner() {
      $("#map-loading-overlay").fadeOut(150);
    },

    bindZoomControls(lMap) {
      const $zoomInBtn = $(".map-controls__control-button#zoom-in-btn");
      const $zoomOutBtn = $(".map-controls__control-button#zoom-out-btn");

      $zoomInBtn.on("click", () => {
        lMap.zoomIn();
      });

      $zoomOutBtn.on("click", () => {
        lMap.zoomOut();
      });
    },

    bindLocateControl(lMap) {
      const $locateBtn = $(".map-controls__control-button#locate-btn");

      $locateBtn.on("click", () => {
        if (!navigator.geolocation) {
          console.error("Geolocation is not supported by your browser");
        } else {
          this.showLoadingSpinner();

          navigator.geolocation.getCurrentPosition(
            (position) => {
              this.hideLoadingSpinner();

              const userLat = position.coords.latitude;
              const userLon = position.coords.longitude;

              this.addUserLocationMarker(userLat, userLon, lMap);

              lMap.panTo([userLat, userLon]);
              lMap.setZoom(15);
            },
            (error) => {
              if (error.code === 1) {
                this.showGeolocationDeniedBox();
              }
              this.hideLoadingSpinner();
            },
          );
        }
      });
    },

    addUserLocationMarker(userLat, userLon, lMap) {
      const userLatLng = new L.LatLng(userLat, userLon);

      const userIcon = L.icon({
        iconSize: ["36", "36"],
        iconUrl: "/themes/custom/hdbt_subtheme/src/icons/user.svg",
      });

      const userMarker = L.marker(userLatLng, {
        icon: userIcon,
      });

      userMarker.addTo(lMap);
    },

    showGeolocationDeniedBox() {
      const title = Drupal.t(
        "Location data blocked",
        {},
        { context: "Map controls" },
      );
      const description = Drupal.t(
        "You must allow your broser to use your location to see places near you.",
        {},
        { context: "Map controls" },
      );
      const closeBtnText = Drupal.t("Close");

      if (!$("#geolocation-denied-overlay").length) {
        $(".leaflet-container").prepend(
          '<div id="geolocation-denied-overlay" style="display:none;" role="dialog" aria-modal="true" aria-labelledby="geolocation-denied-title" aria-describedby="geolocation-denied-desc">' +
            '<div class="info-box"><div class="info-header">' +
            '<span class="icon" aria-hidden="true"></span>' +
            '<h3 id="geolocation-denied-title"></h3>' +
            '<button type="button" class="close-btn"></button>' +
            '</div><p id="geolocation-denied-desc"></p></div></div>',
        );
      }
      const $box = $("#geolocation-denied-overlay");
      $box.find("#geolocation-denied-title").text(title);
      $box.find("#geolocation-denied-desc").text(description);
      $box.find(".close-btn").text(closeBtnText);

      $box
        .off("click keydown")
        .on("click", ".close-btn", () => {
          this.hideGeolocationDeniedBox();
        })
        .on("keydown", ".close-btn", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.hideGeolocationDeniedBox();
          }
        });

      $(document)
        .off("keydown.geolocationDenied")
        .on("keydown.geolocationDenied", (e) => {
          if (e.key !== "Tab" || !$box.is(":visible")) return;
          const box = $box[0];
          const focusables = Array.from(
            box.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            ),
          ).filter((el) => el.offsetParent);
          if (!focusables.length) return;
          const inside = $.contains(box, e.target);
          const cur = focusables.indexOf(document.activeElement);
          const last = focusables.length - 1;
          if (!inside || cur === -1 || (e.shiftKey ? cur <= 0 : cur >= last)) {
            e.preventDefault();
            focusables[e.shiftKey ? last : 0].focus();
          }
        });

      $box.fadeIn(150, () => {
        $box.find(".close-btn")[0].focus();
      });
    },

    hideGeolocationDeniedBox() {
      $(document).off("keydown.geolocationDenied");
      $("#geolocation-denied-overlay").fadeOut(150);
    },
  };
})(jQuery, Drupal);
