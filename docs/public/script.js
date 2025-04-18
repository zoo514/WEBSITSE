// script.js
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sideNav = document.getElementById('sideNav');
const closeNavBtn = document.getElementById('closeNavBtn');

// Open side nav when hamburger is clicked
hamburgerBtn.addEventListener('click', () => {
  sideNav.classList.add('open');
});

// Close side nav when close button is clicked
closeNavBtn.addEventListener('click', () => {
  sideNav.classList.remove('open');
});

// Optionally, close the side nav when any link is clicked
document.querySelectorAll('.side-nav a').forEach(link => {
  link.addEventListener('click', () => {
    sideNav.classList.remove('open');
  });
});

/* JS Carousel auto-rotate */
document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.carousel .slide');
  let current = 0;
  if(slides.length > 0) {
    slides[0].classList.add('active');
    setInterval(() => {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 4000);
  }
});


// ▶ Google Map Drawing Tool ▶
document.addEventListener('DOMContentLoaded', () => {
  const mapDiv = document.getElementById('map');
  if (!mapDiv) {
    console.error('Map container not found!');
    return;
  }
  const map = new google.maps.Map(mapDiv, {
    center: { lat: 40.0, lng: -75.0 },
    zoom: 15,
  });

  // Address search autocomplete
  const addressInput = document.getElementById('address-input');
  const autocomplete = new google.maps.places.Autocomplete(addressInput);
  autocomplete.bindTo('bounds', map);
  autocomplete.addListener('place_changed', function() {
    const place = autocomplete.getPlace();
    if (!place.geometry) {
      return;
    }
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }
  });

  const drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: ['polygon'],
    },
    polygonOptions: {
      editable: true,
      draggable: true,
    },
  });
  drawingManager.setMap(map);

  let currentPolygon = null;
  google.maps.event.addListener(
    drawingManager,
    'overlaycomplete',
    (e) => {
      if (currentPolygon) { currentPolygon.setMap(null); }
      currentPolygon = e.overlay;
      calculateArea(currentPolygon);
      currentPolygon.getPath().addListener('set_at', () => calculateArea(currentPolygon));
      currentPolygon.getPath().addListener('insert_at', () => calculateArea(currentPolygon));
    }
  );

  function calculateArea(polygon) {
    const path = polygon.getPath();
    const areaM2 = google.maps.geometry.spherical.computeArea(path);
    const areaFt2 = areaM2 * 10.7639104167;
    document.getElementById('area-info').textContent = `Area: ${areaM2.toFixed(1)} m² (${areaFt2.toFixed(1)} ft²)`;
    
    // Compute cost estimates based on area in ft²
    const rate = {
      asphalt: {min:3, max:7},
      concrete: {min:4, max:8},
      general: {min:3, max:17}
    };
    const costAsphaltMin = areaFt2 * rate.asphalt.min;
    const costAsphaltMax = areaFt2 * rate.asphalt.max;
    const costConcreteMin = areaFt2 * rate.concrete.min;
    const costConcreteMax = areaFt2 * rate.concrete.max;
    const costGeneralMin = areaFt2 * rate.general.min;
    const costGeneralMax = areaFt2 * rate.general.max;

    document.getElementById('area-info').innerHTML = 
      `Area: ${areaM2.toFixed(1)} m² (${areaFt2.toFixed(1)} ft²)<br/>
      Estimated cost:<br/>
      - Asphalt: $${costAsphaltMin.toFixed(2)} - $${costAsphaltMax.toFixed(2)}<br/>
      - Concrete: $${costConcreteMin.toFixed(2)} - $${costConcreteMax.toFixed(2)}<br/>
      - General: $${costGeneralMin.toFixed(2)} - $${costGeneralMax.toFixed(2)}`;
    
  }
});


// Projects slider
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('#projects-slider .slide');
    let currentIndex = 0;
    const total = slides.length;
    // Initialize
    slides.forEach((slide, idx) => {
        slide.style.position = 'absolute';
        slide.style.top = '0';
        slide.style.left = '0';
        slide.style.width = '100%';
        slide.style.opacity = idx === 0 ? '1' : '0';
        slide.style.transition = 'opacity 1s ease-in-out';
    });
    setInterval(() => {
        slides[currentIndex].style.opacity = '0';
        currentIndex = (currentIndex + 1) % total;
        slides[currentIndex].style.opacity = '1';
    }, 5000);
});
