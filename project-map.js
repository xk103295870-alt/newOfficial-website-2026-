'use strict';

// Blank Basemap starter for the Smart District page.
// It intentionally contains no project labels, cards or decorative frame yet.
(() => {
  const element = document.querySelector('[data-maplibre-map]');
  if (!element || !window.maplibregl) return;

  new window.maplibregl.Map({
    container: element,
    // Blank Basemap: the map itself only, with no markers, cards or labels added by us.
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [113, 29],
    zoom: 3.15,
    minZoom: 1.5,
    maxZoom: 10,
    attributionControl: false,
    dragRotate: false,
    pitchWithRotate: false,
    doubleClickZoom: true,
    touchZoomRotate: true
  });
})();
