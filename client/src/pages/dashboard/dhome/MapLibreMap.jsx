import { useRef, useEffect, useState, useContext } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./maplibre-premium.css";
import { ThemeContext } from "../../../App";

export default function MapLibreMap({ markers = [], markerColor = "#d00", onMarkerClick }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [popupInstance, setPopupInstance] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const { theme } = useContext(ThemeContext);

  // Get user geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lng: pos.coords.longitude, lat: pos.coords.latitude });
        },
        () => setUserLocation(null),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;
    // Clean up previous map instance if it exists
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    // Center on user location if available, else default
    const center = userLocation ? [userLocation.lng, userLocation.lat] : [0, 20];
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center,
      zoom: userLocation ? 4 : 1.5,
    });
    mapRef.current = map;

    // Fit map to markers if more than one
    if (markers.length > 1) {
      const bounds = new maplibregl.LngLatBounds();
      markers.forEach(({ lng, lat }) => bounds.extend([lng, lat]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 4 });
    }

    // Add backend markers with custom popup logic
    markers.forEach(({ lng, lat, label, id }) => {
      const marker = new maplibregl.Marker({ color: markerColor })
        .setLngLat([lng, lat]);
      marker.getElement().style.cursor = "pointer";
      marker.addTo(map);
      marker.getElement().addEventListener("click", () => {
        if (popupInstance) popupInstance.remove();
        const popup = new maplibregl.Popup({ offset: 20 })
          .setLngLat([lng, lat])
          .setHTML(label)
          .addTo(map);
        setPopupInstance(popup);
        if (onMarkerClick) onMarkerClick({ lng, lat, label, id });
      });
    });

    // Add user location marker if available
    if (userLocation) {
      const userMarker = new maplibregl.Marker({ color: "#0077ff" })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map);
      userMarker.getElement().title = "Your Location";
      userMarker.getElement().style.cursor = "pointer";
      userMarker.getElement().addEventListener("click", () => {
        if (popupInstance) popupInstance.remove();
        const popup = new maplibregl.Popup({ offset: 20 })
          .setLngLat([userLocation.lng, userLocation.lat])
          .setHTML("<b>Your Location</b>")
          .addTo(map);
        setPopupInstance(popup);
      });
    }

    return () => {
      if (popupInstance) popupInstance.remove();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line
  }, [markers, markerColor, onMarkerClick, userLocation]);

  // Add or remove dark class on map container
  useEffect(() => {
    if (mapContainer.current) {
      if (theme === "dark") {
        mapContainer.current.classList.add("dark");
      } else {
        mapContainer.current.classList.remove("dark");
      }
    }
  }, [theme]);

  return (
    <div style={{ position: "relative" }}>
      <div ref={mapContainer} className="premium-map-container" />
    </div>
  );
}
