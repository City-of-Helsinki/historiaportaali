import { tns } from 'tiny-slider';

!function () { function e(e, t) { var r = "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"]; if (!r) { if (Array.isArray(e) || (r = function (e, t) { if (!e) return; if ("string" == typeof e) return n(e, t); var r = Object.prototype.toString.call(e).slice(8, -1); "Object" === r && e.constructor && (r = e.constructor.name); if ("Map" === r || "Set" === r) return Array.from(e); if ("Arguments" === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)) return n(e, t) }(e)) || t && e && "number" == typeof e.length) { r && (e = r); var o = 0, a = function () { }; return { s: a, n: function () { return o >= e.length ? { done: !0 } : { done: !1, value: e[o++] } }, e: function (e) { throw e }, f: a } } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.") } var i, l = !0, s = !1; return { s: function () { r = r.call(e) }, n: function () { var e = r.next(); return l = e.done, e }, e: function (e) { s = !0, i = e }, f: function () { try { l || null == r.return || r.return() } finally { if (s) throw i } } } } function n(e, n) { (null == n || n > e.length) && (n = e.length); for (var t = 0, r = new Array(n); t < n; t++)r[t] = e[t]; return r } document.addEventListener("DOMContentLoaded", (function () { var n, t = e(document.getElementsByClassName("gallery")); try { var r = function () { for (var t = n.value, r = t.getElementsByClassName("splide")[0], o = new Splide(r, { pagination: !1 }), a = t.getElementsByClassName("gallery__thumbnails__item"), i = void 0, l = void 0, s = "is-active", u = function (e, n) { var t = a[e]; o.on("click", (function () { i !== t && (i.classList.remove(s), t.classList.add(s), o.go(e), i = t) }), t) }, c = 0, d = a.length; c < d; c++)u(c); var f = t.getElementsByClassName("gallery__thumbnails__list")[0], m = new tns({ container: f, mouseDrag: !0, items: 6, center: !1, loop: !1, slideBy: 1, autoplay: !1, gutter: 16, nav: !1, edgePadding: 0, responsive: { 0: { disable: !0 }, 992: { disable: !1 } } }); m.getInfo().slideCount < 6 && t.getElementsByClassName("gallery__thumbnails")[0].classList.add("tns-disabled"); var v = t.getElementsByClassName("gallery__slide-count")[0]; o.on("mounted move", (function (e) { var n = a[void 0 !== e ? e : o.index]; l = void 0 === e ? 1 : e + 1, v.innerText = l + "/" + a.length, n && i !== n && (i && i.classList.remove(s), n.classList.add(s), i = n) })); var g = t.querySelectorAll(".gallery__thumbnails__item"), y = 0, h = 5, b = !1; o.on("moved", (function () { var n, t = e(g); try { for (t.s(); !(n = t.n()).done;) { if (n.value.classList.contains("is-active")) { var r = o.index; r === h + 1 ? (b = !0, m.goTo("next"), y += 1, h += 1) : r < y && (b = !0, m.goTo(r), y = r, h = r + 5), y > 0 && r + 1 === y ? (b = !0, m.goTo("prev"), y -= 1, h -= 1) : r > h && (b = !0, m.goTo(r), y = r - 5, h = r) } } } catch (e) { t.e(e) } finally { t.f() } })), m.events.on("indexChanged", (function () { !1 === b && (y = m.getInfo().index, h = 5 + m.getInfo().index), b = !1 })), o.mount() }; for (t.s(); !(n = t.n()).done;)r() } catch (e) { t.e(e) } finally { t.f() } })) }();

document.addEventListener('DOMContentLoaded', () => {
  const galleries = document.getElementsByClassName('gallery');

  for (const gallery of galleries) {
    const splideElement = gallery.getElementsByClassName('splide')[0];
    const splide = new Splide(splideElement, {
      pagination: false
    });

    const thumbnails = gallery.getElementsByClassName('gallery__thumbnails__item');
    let activeThumbnail = undefined;
    let currentIndex = undefined;
    const activeClass = 'is-active';

    // Initialize thumbnail click handlers
    const initThumbnailClick = (index, thumbnail) => {
      splide.on('click', () => {
        if (activeThumbnail !== thumbnail) {
          activeThumbnail?.classList.remove(activeClass);
          thumbnail.classList.add(activeClass);
          splide.go(index);
          activeThumbnail = thumbnail;
        }
      }, thumbnail);
    };

    // Set up thumbnail click handlers
    for (let i = 0; i < thumbnails.length; i++) {
      initThumbnailClick(i, thumbnails[i]);
    }

    // Initialize tiny-slider for thumbnails
    const thumbnailList = gallery.getElementsByClassName('gallery__thumbnails__list')[0];
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
        992: { disable: false }
      }
    });

    // Disable thumbnail slider if there are fewer than 6 items
    if (thumbnailSlider.getInfo().slideCount < 6) {
      gallery.getElementsByClassName('gallery__thumbnails')[0].classList.add('tns-disabled');
    }

    // Update slide count
    const slideCount = gallery.getElementsByClassName('gallery__slide-count')[0];
    splide.on('mounted move', (index) => {
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
    const thumbnailItems = gallery.querySelectorAll('.gallery__thumbnails__item');
    let startIndex = 0;
    let endIndex = 5;
    let isSliderMoving = false;

    splide.on('moved', () => {
      for (const item of thumbnailItems) {
        if (item.classList.contains('is-active')) {
          const currentIndex = splide.index;

          if (currentIndex === endIndex + 1) {
            isSliderMoving = true;
            thumbnailSlider.goTo('next');
            startIndex += 1;
            endIndex += 1;
          } else if (currentIndex < startIndex) {
            isSliderMoving = true;
            thumbnailSlider.goTo(currentIndex);
            startIndex = currentIndex;
            endIndex = currentIndex + 5;
          } else if (startIndex > 0 && currentIndex + 1 === startIndex) {
            isSliderMoving = true;
            thumbnailSlider.goTo('prev');
            startIndex -= 1;
            endIndex -= 1;
          } else if (currentIndex > endIndex) {
            isSliderMoving = true;
            thumbnailSlider.goTo(currentIndex);
            startIndex = currentIndex - 5;
            endIndex = currentIndex;
          }
        }
      }
    });

    thumbnailSlider.events.on('indexChanged', () => {
      if (!isSliderMoving) {
        startIndex = thumbnailSlider.getInfo().index;
        endIndex = 5 + thumbnailSlider.getInfo().index;
      }
      isSliderMoving = false;
    });

    splide.mount();
  }
});
