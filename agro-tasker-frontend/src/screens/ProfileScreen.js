import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Network from "expo-network";
import { Platform } from "react-native";

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    joinDate: "",
    username: "",
  });
  const [loading, setLoading] = useState(true);
  const [baseUrl, setBaseUrl] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Set base URL based on platform and environment
  useEffect(() => {
    const determineBaseUrl = async () => {
      try {
        if (Platform.OS === "android") {
          setBaseUrl("http://10.0.2.2:8000/api/");
        } else {
          if (Device.isDevice) {
            setBaseUrl("http://172.20.10.5:8000/api/"); // Replace with your IP
          } else {
            setBaseUrl("http://localhost:8000/api/");
          }
        }
      } catch (error) {
        console.error("Error determining base URL:", error);
        setBaseUrl("http://localhost:8000/api/");
      }
    };
    determineBaseUrl();
  }, []);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("access_token");
        if (!storedToken) {
          navigation.navigate("Auth");
          return;
        }

        const response = await fetch(`${baseUrl}profile/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${storedToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser({
            name:
              `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
              "User",
            email: data.email || "No email provided",
            username: data.username,
            joinDate: data.date_joined
              ? `Joined ${new Date(data.date_joined).toLocaleDateString()}`
              : "Member since unknown date",
          });
        } else if (response.status === 401) {
          await AsyncStorage.removeItem("access_token");
          navigation.navigate("Auth");
        } else {
          throw new Error("Failed to fetch profile");
        }
      } catch (error) {
        Alert.alert("Error", error.message);
      } finally {
        setLoading(false);
      }
    };

    if (baseUrl) {
      fetchProfile();
    }
  }, [baseUrl, navigation]);

  const handleLogout = async () => {
    try {
      Alert.alert("Log Out", "Are you sure you want to log out?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              const refreshToken = await AsyncStorage.getItem("refresh_token");
              const accessToken = await AsyncStorage.getItem("access_token");

              // Attempt backend logout
              await fetch(`${baseUrl}logout/`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  refresh_token: refreshToken,
                }),
              });

              // Clear all stored data
              await AsyncStorage.multiRemove([
                "access_token",
                "refresh_token",
                "userData",
              ]);

              // Reset navigation stack
              navigation.reset({
                index: 0,
                routes: [{ name: "Auth" }],
              });
            } catch (error) {
              console.error("Logout error:", error);
              await AsyncStorage.multiRemove([
                "access_token",
                "refresh_token",
                "userData",
              ]);
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to initiate logout");
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#b0eacb", "#ffffff"]}
        style={[styles.container, styles.loadingContainer]}
      >
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#b0eacb", "#ffffff"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0.5 }}
    >
      <View style={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarPlaceholder}>
            <MaterialIcons name="person" size={60} color="#4CAF50" />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.joinDate}>{user.joinDate}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("EditProfile", { user })}
          >
            <MaterialIcons name="edit" size={24} color="#4CAF50" />
            <Text style={styles.menuText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Settings")}
          >
            <MaterialIcons name="settings" size={24} color="#4CAF50" />
            <Text style={styles.menuText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Help")}
          >
            <MaterialIcons name="help" size={24} color="#4CAF50" />
            <Text style={styles.menuText}>Help & Support</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color="#e53935" />
            ) : (
              <>
                <MaterialIcons name="logout" size={24} color="#e53935" />
                <Text style={[styles.menuText, { color: "#e53935" }]}>
                  Log Out
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e8f5e9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  joinDate: {
    fontSize: 14,
    color: "#888",
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#555",
  },
});

export default ProfileScreen;
