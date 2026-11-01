/*
 * Clean City – interactive map (WEDE5020 Part 3)
 * Uses the Leaflet library with OpenStreetMap tiles to show our three areas.
 */
(function () {
  'use strict';

  function init() {
    var el = document.getElementById('clean-city-map');
    var data = window.CC_DATA;
    if (!el || !data || typeof window.L === 'undefined') { return; }
    var L = window.L;

    var map = L.map(el, { scrollWheelZoom: false, keyboard: true }).setView([-26.197, 28.04], 14);

    var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" rel="noopener noreferrer">OpenStreetMap</a> contributors'
    }).addTo(map);

    var note = document.getElementById('map-note');
    tiles.on('tileerror', function () {
      if (note) { note.textContent = 'The map tiles could not load. Our locations are also listed beside the map.'; note.hidden = false; }
    });

    var bounds = [];
    data.areas.forEach(function (area) {
      var popup = document.createElement('div');
      var h = document.createElement('strong'); h.textContent = area.place; popup.appendChild(h);
      var p = document.createElement('p'); p.textContent = area.blurb; popup.appendChild(p);
      var a = document.createElement('a');
      a.href = 'enquiry.html?area=' + encodeURIComponent(area.id);
      a.textContent = 'Enquire about ' + area.name;
      popup.appendChild(a);

      var marker = L.marker([area.lat, area.lng], { title: area.place, alt: area.place + ' marker' }).addTo(map);
      marker.bindPopup(popup);
      bounds.push([area.lat, area.lng]);

      // Location list items focus the matching marker.
      var item = document.querySelector('[data-area="' + area.id + '"]');
      if (item) {
        item.addEventListener('click', function () { map.setView([area.lat, area.lng], 16); marker.openPopup(); });
        item.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); }
        });
      }
    });

    map.fitBounds(bounds, { padding: [40, 40] });

    var reset = document.getElementById('map-reset');
    if (reset) { reset.addEventListener('click', function () { map.closePopup(); map.fitBounds(bounds, { padding: [40, 40] }); }); }

    window.CC = window.CC || {};
    window.CC.map = map;
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
