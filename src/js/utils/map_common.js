var g = google.maps;
var infowindow; // Only one at a time
var markerArray = [];

Number.prototype.toRad = function() {
   return this * Math.PI / 180;
}

Number.prototype.toDeg = function() {
   return this * 180 / Math.PI;
}

g.LatLng.prototype.destinationPoint = function(brng, dist) {
   dist = dist / 6371;
   brng = brng.toRad();
   var lat1 = this.lat().toRad(), lon1 = this.lng().toRad();
   var lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist) +
                        Math.cos(lat1) * Math.sin(dist) * Math.cos(brng));
   var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist) *
                                Math.cos(lat1),
                                Math.cos(dist) - Math.sin(lat1) *
                                Math.sin(lat2));
   if (isNaN(lat2) || isNaN(lon2)) return null;
   var dest = new g.LatLng(lat2.toDeg(), lon2.toDeg());
   console.log("Orig: " + this + " Dest: " + dest);
   return dest;
}

var mapc = {

	// Pins
	stage_pin: new g.MarkerImage("/images/stage_marker.png"),
	landmark_pin: new g.MarkerImage("/images/landmark_marker.png"),
	terminal_pin: new g.MarkerImage("/images/pinkpin.png"),

  // Locations
  NBO: new g.LatLng(-1.274359, 36.813106),

	// Helper Functions

  latlngFromString: function(s) {
    if (s != null && s.length > 0) {
      var lat = s.replace(/\s*\,.*/, ''); // first 123
      var lng = s.replace(/.*,\s*/, ''); // second ,456

      var latLng = new g.LatLng(parseFloat(lat), parseFloat(lng));

      return latLng;      
    } else return null;
  },

	addPin: function(map, center, title, icon, draggable) {
    var marker = new g.Marker({
      map: map,
      position: center,
      title: title,
      icon: icon,
      draggable: draggable || false
    });
    markerArray.push(marker)
    return marker;
	},

  clearMarkers: function() {
    if (markerArray) {
      markerArray.forEach(function(m, i, arr) {
        m.setMap(null);
      });
      markerArray.length = 0;
    }
  },

  showInfoWindow: function(map, center, html) {
    infowindow = new g.InfoWindow({});
    if (infowindow) infowindow.close();
    infowindow.setContent(html);
    infowindow.setPosition(center);
    infowindow.open(map);
  },

  drawRectangle: function(map, bl, tr, color) {
    var _color = color || '#FF0000';
    var rectangle = new g.Rectangle({
        strokeColor: _color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: _color,
        fillOpacity: 0.35,
        map: map,
        bounds: new google.maps.LatLngBounds(bl, tr)
      });
    return rectangle;
  },

  drawCircle: function(map, center, radius, color) {
    var _color = color || '#FF0000';
    var ops = {
      strokeColor: _color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: _color,
      fillOpacity: 0.35,
      map: map,
      center: center,
      radius: radius
    };
    cityCircle = new g.Circle(ops);
    return cityCircle;
  },

  gMapUrl: function(lat, lon, w, h, zoom) {
    latlon = lat + ',' + lon;
    var enc = EncodeURI({'center': latlon, 'zoom': zoom, 'size': w+'x'+h, 'sensor': 'false', 'maptype': 'street', 'markers':'size:mid|color:red|'+latlon});
    return "http://maps.google.com/maps/api/staticmap?" + enc;
  },

  loadMapsScript: function(callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    var src = "http://maps.googleapis.com/maps/api/js?key=AIzaSyDK5614BxaTvnxQQX6Dk_z4fueLSyTo4Kg&sensor=true";
    if (callback) src += "&callback=" + callback;
    script.src = src;
    document.body.appendChild(script);
  },

  extrapolateLocation: function(location, velocity, bearing, ts) {
    // Velocity (kph)
    // Bearing (degrees from North. E = 90 W = -90)
    // ts (timestamp)
    if (bearing < 0) bearing += 360;
    var mins = (timestamp() - ts) / 60.;
    var dist = velocity * mins / 60.; // km
    console.log("Mins elapsed: " + mins);
    return location.destinationPoint(bearing, dist);
  },

  InitMap: function(sel, center, zoom) {
    var zoom = zoom || 13;
    var _center = center || this.NBO;
    var mapDiv = document.getElementById(sel);
    var myOptions = {
      zoom: zoom,
      center: _center,
      mapTypeControl: false,
      streetViewControl: false,
      disableDoubleClickZoom: false,
      mapTypeId: g.MapTypeId.ROADMAP
    }
    return new g.Map(mapDiv, myOptions);
  },

  requestLocation: function(callback) {
      if(navigator.geolocation)
          navigator.geolocation.getCurrentPosition(callback);
  },

  setMapBounds: function(map, markers){
    var latlngbounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++) {
      latlngbounds.extend(markers[i].position);
    }
    map.fitBounds(latlngbounds);
  }

}

module.exports = mapc;