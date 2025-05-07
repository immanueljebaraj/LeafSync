import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";

const MiniMap = ({ coordinates, searchQuery }) => {
  const [soilLayer, setSoilLayer] = useState("organic");
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation(); // Get navigation from the hook

  const getDominantSoilProperty = (soilData) => {
    if (!soilData) return "organic";
    if (soilData.organicCarbon > 30) return "organic";
    if (soilData.ph < 5.5) return "acidic";
    if (soilData.sand > 50) return "sandy";
    return "mineral";
  };

  useEffect(() => {
    if (coordinates) {
      setLoading(false);
    }
  }, [coordinates]);

  const getTileURL = () => {
    const layers = {
      organic: "ocd",
      acidic: "phh2o",
      sandy: "sand",
      mineral: "clay",
    };
    return `https://tiles.openlandmap.org/${layers[soilLayer]}/m/v02/mean/{z}/{x}/{y}.png`;
  };

  const htmlContent = (lat, lng) => {
    // Escape the searchQuery for HTML/JS
    const escapedQuery = searchQuery
      ? searchQuery.replace(/['"<>]/g, "")
      : "Your Location";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Soil Map</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
          <style>
            html, body, #map { 
              height: 100%; 
              margin: 0; 
              padding: 0; 
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
          <script>
            document.addEventListener('DOMContentLoaded', function() {
              const map = L.map('map').setView([${lat}, ${lng}], 13);
              
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
              }).addTo(map);
              
              L.tileLayer('${getTileURL()}', {
                attribution: 'SoilGrids/OpenLandMap',
                opacity: 0.7
              }).addTo(map);
              
              const marker = L.marker([${lat}, ${lng}]).addTo(map)
                .bindPopup(
                  '<b>' + ${JSON.stringify(escapedQuery)} + '</b><br>' +
                  'Soil: ' + ${JSON.stringify(soilLayer.toUpperCase())}
                )
                .openPopup();
            });
          </script>
        </body>
      </html>
    `;
  };

  if (loading || !coordinates) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        navigation.navigate("FullMap", {
          location: coordinates,
          searchQuery,
        })
      }
    >
      <WebView
        originWhitelist={["*"]}
        source={{
          html: htmlContent(coordinates.latitude, coordinates.longitude),
        }}
        style={styles.webview}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 15,
  },
  webview: {
    flex: 1,
  },
});

export default MiniMap;
