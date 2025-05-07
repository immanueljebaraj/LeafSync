import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import MiniMap from "../components/MiniMap";
import * as Location from "expo-location";
import { LineChart } from "react-native-chart-kit";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Mock data generator with additional metrics
const generateMockData = (lat, lng) => {
  const seed = lat * lng;
  const random = (min, max) => {
    const x = Math.sin(seed + 1) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min)) + min;
  };

  // Generate monthly data for graphs
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthSeed = seed + i;
    const monthRandom = (min, max) => {
      const y = Math.sin(monthSeed + 1) * 10000;
      return Math.floor((y - Math.floor(y)) * (max - min)) + min;
    };

    return {
      month: new Date(2023, i).toLocaleString("default", { month: "short" }),
      healthScore: monthRandom(50, 90),
      nitrogen: monthRandom(0.5, 2.5),
      phosphorus: monthRandom(0.1, 1.5),
      potassium: monthRandom(0.5, 3.0),
      moisture: monthRandom(20, 80),
      temperature: monthRandom(10, 35),
    };
  });

  return {
    properties: {
      ocd_mean: random(10, 60) * 10, // Organic Carbon (g/kg)
      phh2o_mean: random(50, 90), // pH Level
      nitrogen_mean: random(5, 20) * 10, // Nitrogen (%)
      sand_mean: random(10, 80) * 10, // Sand (%)
      phosphorus_mean: random(2, 15) * 10, // Phosphorus (mg/kg)
      potassium_mean: random(10, 50) * 10, // Potassium (mg/kg)
      calcium_mean: random(100, 500), // Calcium (mg/kg)
      magnesium_mean: random(20, 100), // Magnesium (mg/kg)
      sulfur_mean: random(5, 30), // Sulfur (mg/kg)
      moisture_mean: random(30, 70), // Soil Moisture (%)
      temperature_mean: random(15, 30), // Temperature (°C)
      monthlyData, // For graphs
    },
  };
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [soilData, setSoilData] = useState(null);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  // Enhanced soil health calculation
  const calculateSoilHealth = (data) => {
    if (!data?.properties) return null;

    const metrics = {
      organicCarbon: data.properties.ocd_mean / 10,
      ph: data.properties.phh2o_mean / 10,
      nitrogen: data.properties.nitrogen_mean / 100,
      sand: data.properties.sand_mean / 10,
      phosphorus: data.properties.phosphorus_mean / 10,
      potassium: data.properties.potassium_mean / 10,
      moisture: data.properties.moisture_mean,
      temperature: data.properties.temperature_mean,
    };

    const weights = {
      organicCarbon: 0.2,
      ph: 0.15,
      nitrogen: 0.15,
      phosphorus: 0.1,
      potassium: 0.1,
      sand: 0.1,
      moisture: 0.1,
      temperature: 0.1,
    };

    const scores = {
      organicCarbon: Math.min(metrics.organicCarbon * 10, 100),
      ph:
        metrics.ph > 6 && metrics.ph < 7.5
          ? 80
          : metrics.ph > 5.5 && metrics.ph < 8.5
          ? 60
          : 40,
      nitrogen: Math.min(metrics.nitrogen * 100, 100),
      phosphorus: Math.min(metrics.phosphorus * 50, 100),
      potassium: Math.min(metrics.potassium * 30, 100),
      sand: metrics.sand > 30 && metrics.sand < 60 ? 80 : 60,
      moisture:
        metrics.moisture > 40 && metrics.moisture < 60
          ? 90
          : metrics.moisture > 30 && metrics.moisture < 70
          ? 70
          : 50,
      temperature:
        metrics.temperature > 18 && metrics.temperature < 25
          ? 90
          : metrics.temperature > 15 && metrics.temperature < 28
          ? 70
          : 50,
    };

    return Math.round(
      Object.keys(scores).reduce(
        (total, key) => total + scores[key] * weights[key],
        0
      )
    );
  };

  // Mock data fetch with realistic delay
  const fetchSoilData = async (lat, lng) => {
    setLoading(true);
    setSoilData(null); // Clear previous data

    // Simulate analysis delay (1.5-3 seconds)
    await new Promise((resolve) =>
      setTimeout(resolve, 1500 + Math.random() * 1500)
    );

    try {
      const mockData = generateMockData(lat, lng);
      setSoilData(mockData);
      return mockData;
    } catch (error) {
      console.error("Error generating mock data:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const soilHealth = soilData ? calculateSoilHealth(soilData) : null;

  // Enhanced metrics display
  const getSoilMetrics = () => {
    if (!soilData) return [];

    return [
      {
        name: "Organic Carbon",
        value: (soilData.properties.ocd_mean / 10).toFixed(1),
        unit: "g/kg",
        icon: "leaf",
      },
      {
        name: "pH Level",
        value: (soilData.properties.phh2o_mean / 10).toFixed(1),
        unit: "",
        icon: "flask",
      },
      {
        name: "Nitrogen (N)",
        value: (soilData.properties.nitrogen_mean / 100).toFixed(2),
        unit: "%",
        icon: "nutrition",
      },
      {
        name: "Phosphorus (P)",
        value: (soilData.properties.phosphorus_mean / 10).toFixed(1),
        unit: "mg/kg",
        icon: "flask-outline",
      },
      {
        name: "Potassium (K)",
        value: (soilData.properties.potassium_mean / 10).toFixed(1),
        unit: "mg/kg",
        icon: "speedometer",
      },
      {
        name: "Sand Content",
        value: (soilData.properties.sand_mean / 10).toFixed(1),
        unit: "%",
        icon: "water",
      },
      {
        name: "Soil Moisture",
        value: soilData.properties.moisture_mean.toFixed(1),
        unit: "%",
        icon: "water-outline",
      },
      {
        name: "Temperature",
        value: soilData.properties.temperature_mean.toFixed(1),
        unit: "°C",
        icon: "thermometer",
      },
    ];
  };

  // Render NPK graph
  const renderNPKGraph = () => {
    if (!soilData?.properties.monthlyData) return null;

    const labels = soilData.properties.monthlyData.map((d) => d.month);
    const nitrogenData = soilData.properties.monthlyData.map((d) => d.nitrogen);
    const phosphorusData = soilData.properties.monthlyData.map(
      (d) => d.phosphorus
    );
    const potassiumData = soilData.properties.monthlyData.map(
      (d) => d.potassium
    );

    return (
      <View style={styles.metricBoxGraph}>
        <Text style={styles.graphTitle}>NPK Levels Throughout the Year</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels,
              datasets: [
                {
                  data: nitrogenData,
                  color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`,
                  strokeWidth: 2,
                },
                {
                  data: phosphorusData,
                  color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
                  strokeWidth: 2,
                },
                {
                  data: potassiumData,
                  color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
                  strokeWidth: 2,
                },
              ],
              legend: ["Nitrogen", "Phosphorus", "Potassium"],
            }}
            width={Dimensions.get("window").width - 60} // Adjusted width
            height={220}
            fromZero={true}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: "#ffa726",
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
      </View>
    );
  };

  // Render Health Score graph
  const renderHealthScoreGraph = () => {
    if (!soilData?.properties.monthlyData) return null;

    const labels = soilData.properties.monthlyData.map((d) => d.month);
    const healthScores = soilData.properties.monthlyData.map(
      (d) => d.healthScore
    );

    return (
      <View style={styles.metricBoxGraph}>
        <Text style={styles.graphTitle}>Soil Health Trend</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels,
              datasets: [
                {
                  data: healthScores,
                  color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
                  strokeWidth: 2,
                },
              ],
            }}
            width={Dimensions.get("window").width - 60}
            height={220}
            fromZero={true}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: "#2e7d32",
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
      </View>
    );
  };

  const handleLocationPress = async () => {
    setMapError(null);
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setMapError("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const newCoordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCoordinates(newCoordinates);
      setSearchText("Current Location");
      setShowMap(true);
      await fetchSoilData(newCoordinates.latitude, newCoordinates.longitude);
      setSearchHistory((prev) => [
        { query: "Current Location", coords: newCoordinates },
        ...prev.slice(0, 4),
      ]);
    } catch (error) {
      setMapError("Failed to get current location");
      console.error("Location error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchText.trim()) return;

    setMapError(null);
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchText
        )}`,
        {
          headers: {
            "User-Agent": "LeafSync/1.0 (your@email.com)",
          },
        }
      );

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();

      if (data.length > 0) {
        const firstResult = data[0];
        const newCoordinates = {
          latitude: parseFloat(firstResult.lat),
          longitude: parseFloat(firstResult.lon),
        };
        setCoordinates(newCoordinates);
        setShowMap(true);
        await fetchSoilData(newCoordinates.latitude, newCoordinates.longitude);
        setSearchHistory((prev) => [
          { query: searchText, coords: newCoordinates },
          ...prev.slice(0, 4),
        ]);
      } else {
        setMapError("Location not found");
      }
    } catch (error) {
      setMapError("Failed to search location");
      console.error("Geocoding error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryItemPress = (item) => {
    setSearchText(item.query);
    setCoordinates(item.coords);
    setShowMap(true);
    fetchSoilData(item.coords.latitude, item.coords.longitude);
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const navItems = [
    { name: "Home", icon: "home", screen: "Home" },
    { name: "Disease Detector", icon: "bug-report", screen: "DiseaseDetector" },
    { name: "Crop Journal", icon: "book", screen: "CropJournal" },
    { name: "Task Planner", icon: "checklist", screen: "TaskPlanner" },
    { name: "Chatbot", icon: "chat", screen: "Chatbot" },
    { name: "Profile", icon: "person", screen: "Profile" },
  ];

  const soilMetrics = getSoilMetrics();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <LinearGradient
        colors={["#b0eacb", "#ffffff"]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.5 }}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { height: 60 + insets.top, paddingTop: insets.top },
          ]}
        >
          <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
            <MaterialIcons name="menu" size={30} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{"🌱 LeafSync"}</Text>
          <View style={{ width: 30 }} />
        </View>

        {/* Hamburger Menu Modal - Updated with proper insets */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={menuVisible}
          onRequestClose={() => setMenuVisible(false)}
        >
          <View style={styles.menuOverlay}>
            <View
              style={[
                styles.menuContainer,
                {
                  marginLeft: menuVisible
                    ? 0
                    : -Dimensions.get("window").width * 0.75,
                },
              ]}
            >
              <View
                style={[styles.menuHeader, { paddingTop: insets.top + 10 }]}
              >
                <Text style={styles.menuHeaderText}>LeafSync</Text>
              </View>

              {navItems.map((item) => (
                <TouchableOpacity
                  key={item.name}
                  style={styles.menuItem}
                  onPress={() => {
                    navigation.navigate(item.screen);
                    setMenuVisible(false);
                  }}
                >
                  <MaterialIcons name={item.icon} size={24} color="#4CAF50" />
                  <Text style={styles.menuItemText}>{item.name}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[styles.closeButton, { top: insets.top + 10 }]}
                onPress={() => setMenuVisible(false)}
              >
                <MaterialIcons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Tap-to-close area */}
            <TouchableOpacity
              style={styles.overlay}
              activeOpacity={1}
              onPress={() => setMenuVisible(false)}
            />
          </View>
        </Modal>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 20 },
          ]}
        >
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleLocationPress}
              disabled={loading}
            >
              <Ionicons
                name={loading ? "refresh" : "location"}
                size={24}
                color="#4CAF50"
              />
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by location..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#888"
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={loading || !searchText.trim()}
            >
              <Ionicons
                name="search"
                size={20}
                color={loading || !searchText.trim() ? "#ccc" : "#4CAF50"}
              />
            </TouchableOpacity>
          </View>

          {/* Search History */}
          {searchHistory.length > 0 && !showMap && (
            <View style={styles.historyContainer}>
              <Text style={styles.historyTitle}>Recent Searches</Text>
              {searchHistory.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.historyItem}
                  onPress={() => handleHistoryItemPress(item)}
                >
                  <Ionicons name="time" size={16} color="#666" />
                  <Text style={styles.historyItemText}>{item.query}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Map Display */}
          {showMap && coordinates && (
            <View style={styles.mapContainer}>
              <MiniMap
                coordinates={coordinates}
                searchQuery={searchText}
                navigation={navigation}
              />
              {mapError && <Text style={styles.errorText}>{mapError}</Text>}
              {soilHealth !== null && (
                <View style={styles.healthContainer}>
                  <Text style={styles.healthTitle}>
                    Soil Health Score: {soilHealth}/100
                  </Text>
                </View>
              )}
              {soilMetrics.length > 0 && (
                <View style={styles.metricsContainer}>
                  {soilMetrics.map((metric, index) => (
                    <View key={index} style={styles.metricBox}>
                      <Ionicons name={metric.icon} size={24} color="#4CAF50" />
                      <Text style={styles.metricName}>{metric.name}</Text>
                      <Text style={styles.metricValue}>
                        {metric.value} {metric.unit}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              {soilData && (
                <>
                  {renderNPKGraph()}
                  {renderHealthScoreGraph()}
                </>
              )}
            </View>
          )}

          {loading && (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#4CAF50" />
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  menuButton: {
    padding: 5,
  },
  content: {
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  locationButton: {
    padding: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    color: "#000",
  },
  searchButton: {
    padding: 5,
  },
  historyContainer: {
    marginBottom: 15,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 5,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },
  historyItemText: {
    marginLeft: 10,
    color: "#666",
  },
  mapContainer: {
    marginTop: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  healthContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  healthTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  metricsContainer: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  metricBox: {
    backgroundColor: "#e8f5e9",
    borderRadius: 10,
    padding: 15,
    width: "48%",
    marginVertical: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricBoxGraph: {
    backgroundColor: "#e8f5e9",
    borderRadius: 10,
    padding: 15,
    width: "100%",
    marginVertical: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: "center",
  },
  metricName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 5,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 2,
  },
  loader: {
    marginTop: 20,
    alignItems: "center",
  },
  menuOverlay: {
    flex: 1,
    flexDirection: "row",
  },
  menuContainer: {
    backgroundColor: "#fff",
    width: "75%",
    height: "100%",
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemText: {
    fontSize: 18,
    marginLeft: 20,
    color: "#333",
    fontWeight: "500",
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    padding: 10,
  },
  closeButtonText: {
    display: "none",
  },
  menuHeader: {
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 10,
  },
  menuHeaderText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  chartContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default HomeScreen;
