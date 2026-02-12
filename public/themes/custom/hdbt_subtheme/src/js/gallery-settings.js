import { tns } from "tiny-slider";
import Splide from "@splidejs/splide";

/* global document, window */

document.addEventListener("DOMContentLoaded", () => {
  const galleries = document.getElementsByClassName("gallery");

  // Screen width to start showing pagination.
  const breakpointWidth = 992;

  for (const gallery of galleries) {
    const splideElement = gallery.getElementsByClassName("splide")[0];
    const splide = new Splide(splideElement, {
      pagination: window.innerWidth >= breakpointWidth,
      a11y: true,
    });

    // Handle window resize to toggle pagination
    const handleResize = () => {
      const shouldShowPagination = window.innerWidth >= breakpointWidth;
      if (shouldShowPagination && !splide.options.pagination) {
        splide.options.pagination = true;
        splide.refresh();
      } else if (!shouldShowPagination && splide.options.pagination) {
        splide.options.pagination = false;
        splide.refresh();
      }
    };

    window.addEventListener("resize", handleResize);

    const thumbnails = gallery.getElementsByClassName(
      "gallery__thumbnails__item",
    );
    let activeThumbnail;
    let currentIndex;
    const activeClass = "is-active";

    // Initialize thumbnail click handlers
    const initThumbnailClick = (index, thumbnail) => {
      splide.on(
        "click",
        () => {
          if (activeThumbnail !== thumbnail) {
            activeThumbnail?.classList.remove(activeClass);
            thumbnail.classList.add(activeClass);
            splide.go(index);
            activeThumbnail = thumbnail;
          }
        },
        thumbnail,
      );
    };

    // Set up thumbnail click handlers
    let thumbnailIndex = 0;
    for (const thumbnail of thumbnails) {
      initThumbnailClick(thumbnailIndex, thumbnail);
      thumbnailIndex += 1;
    }

    // Initialize tiny-slider for thumbnails
    const thumbnailList = gallery.getElementsByClassName(
      "gallery__thumbnails__list",
    )[0];
    const thumbnailSlider = tns({
      container: thumbnailList,
      mouseDrag: true,
      items: 6,
      center: false,
      loop: false,
      slideBy: 1,
      autoplay: false,
      gutter: 16,
      nav: false,
      edgePadding: 0,
      responsive: {
        0: { disable: true },
        [breakpointWidth]: { disable: false },
      },
    });

    // Disable thumbnail slider if there are fewer than 6 items
    if (thumbnailSlider.getInfo().slideCount < 6) {
      gallery
        .getElementsByClassName("gallery__thumbnails")[0]
        .classList.add("tns-disabled");
    }

    // Update slide count
    const slideCount = gallery.getElementsByClassName(
      "gallery__slide-count",
    )[0];
    splide.on("mounted move", (index) => {
      const thumbnail = thumbnails[index !== undefined ? index : splide.index];
      currentIndex = index === undefined ? 1 : index + 1;
      slideCount.innerText = `${currentIndex}/${thumbnails.length}`;

      if (thumbnail && activeThumbnail !== thumbnail) {
        activeThumbnail?.classList.remove(activeClass);
        thumbnail.classList.add(activeClass);
        activeThumbnail = thumbnail;
      }
    });

    // Handle thumbnail slider navigation
    const thumbnailItems = gallery.querySelectorAll(
      ".gallery__thumbnails__item",
    );
    let startIndex = 0;
    let endIndex = 5;
    let isSliderMoving = false;

    splide.on("moved", () => {
      for (const item of thumbnailItems) {
        if (item.classList.contains("is-active")) {
          const currentSlideIndex = splide.index;

          if (currentSlideIndex === endIndex + 1) {
            isSliderMoving = true;
            thumbnailSlider.goTo("next");
            startIndex += 1;
            endIndex += 1;
          } else if (currentSlideIndex < startIndex) {
            isSliderMoving = true;
            thumbnailSlider.goTo(currentSlideIndex);
            startIndex = currentSlideIndex;
            endIndex = currentSlideIndex + 5;
          } else if (startIndex > 0 && currentSlideIndex + 1 === startIndex) {
            isSliderMoving = true;
            thumbnailSlider.goTo("prev");
            startIndex -= 1;
            endIndex -= 1;
          } else if (currentSlideIndex > endIndex) {
            isSliderMoving = true;
            thumbnailSlider.goTo(currentSlideIndex);
            startIndex = currentSlideIndex - 5;
            endIndex = currentSlideIndex;
          }
        }
      }
    });

    thumbnailSlider.events.on("indexChanged", () => {
      if (!isSliderMoving) {
        startIndex = thumbnailSlider.getInfo().index;
        endIndex = 5 + thumbnailSlider.getInfo().index;
      }
      isSliderMoving = false;
    });

    splide.mount();
  }
});
