import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";

const FullMapScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { location, searchQuery } = route.params || {};

  const [selectedLayer, setSelectedLayer] = useState("organic");
  const [mapType, setMapType] = useState("map");
  const [loading, setLoading] = useState(true);

  if (!location?.latitude || !location?.longitude) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Location data missing</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getTileURL = (layer) => {
    switch (layer) {
      case "organic":
        return "https://tiles.openlandmap.org/ocd/m/v02/mean/{z}/{x}/{y}.png";
      case "nitrogen":
        return "https://tiles.openlandmap.org/nitrogen_tot/m/v01/mean/{z}/{x}/{y}.png";
      case "ph":
        return "https://tiles.openlandmap.org/phh2o/m/v02/mean/{z}/{x}/{y}.png";
      case "moisture":
        return "https://tiles.openlandmap.org/water_content/m/v02/mean/{z}/{x}/{y}.png";
      default:
        return "https://tiles.openlandmap.org/ocd/m/v02/mean/{z}/{x}/{y}.png";
    }
  };

  const getLayerName = (key) => {
    const names = {
      organic: "Organic Carbon",
      nitrogen: "Nitrogen",
      ph: "pH Level",
      moisture: "Moisture",
    };
    return names[key] || "Unknown Layer";
  };

  const htmlContent = (lat, lng, layer, view) => {
    // Escape the searchQuery for HTML/JS
    const escapedQuery = searchQuery
      ? searchQuery.replace(/['"<>]/g, "")
      : "Your Location";

    const layerName = getLayerName(layer);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Soil Map</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="default-src *; style-src * 'unsafe-inline'; script-src * 'unsafe-inline' 'unsafe-eval';">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
          <style>
            html, body, #map {
              height: 100%;
              margin: 0;
              padding: 0;
              background: #e0e0e0;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
          <script>
            document.addEventListener('DOMContentLoaded', function () {
              const map = L.map('map').setView([${lat}, ${lng}], 13);

              const baseLayer = L.tileLayer('${
                view === "satellite"
                  ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              }', {
                attribution: '&copy; OpenStreetMap contributors'
              }).addTo(map);

              const soilLayer = L.tileLayer('${getTileURL(layer)}', {
                attribution: 'OpenLandMap',
                opacity: 0.7
              }).addTo(map);

              const marker = L.marker([${lat}, ${lng}]).addTo(map)
                .bindPopup(
                  '<b>' + ${JSON.stringify(escapedQuery)} + '</b><br>' +
                  ${JSON.stringify(layerName)}
                )
                .openPopup();

              // Make the map container clickable
              document.getElementById('map').addEventListener('click', function() {
                window.ReactNativeWebView.postMessage('mapClicked');
              });

              // Reverse geocode for better display
              fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}\`, {
                headers: {
                  'User-Agent': 'LeafSync/1.0 (your@email.com)'
                }
              })
                .then(response => response.json())
                .then(data => {
                  const address = data.display_name || 'Your Location';
                  marker.setPopupContent(
                    '<b>' + ${JSON.stringify(escapedQuery)} + '</b><br>' +
                    address + '<br>' +
                    ${JSON.stringify(layerName)}
                  );
                })
                .catch(console.error);
            });
          </script>
        </body>
      </html>
    `;
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Control Panel */}
      <View style={styles.controlPanel}>
        <Picker
          selectedValue={selectedLayer}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedLayer(itemValue)}
        >
          <Picker.Item label="Organic Carbon" value="organic" />
          <Picker.Item label="Nitrogen" value="nitrogen" />
          <Picker.Item label="pH Level" value="ph" />
          <Picker.Item label="Moisture" value="moisture" />
        </Picker>

        <TouchableOpacity
          onPress={() => setMapType(mapType === "map" ? "satellite" : "map")}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleText}>
            {mapType === "map" ? "Satellite" : "Map"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      )}

      {/* Map Display */}
      <WebView
        originWhitelist={["*"]}
        source={{
          html: htmlContent(
            location.latitude,
            location.longitude,
            selectedLayer,
            mapType
          ),
        }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          alert("Failed to load map");
        }}
        onMessage={(event) => {
          if (event.nativeEvent.data === "mapClicked") {
            // Handle map click if needed
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
  controlPanel: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  picker: {
    flex: 1,
    height: 50,
  },
  toggleButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  toggleText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#c62828",
    fontSize: 18,
    marginBottom: 20,
  },
  backText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FullMapScreen;
