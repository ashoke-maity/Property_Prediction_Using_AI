import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// This is the fix for the default marker icon.
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
});

L.Marker.prototype.options.icon = DefaultIcon;