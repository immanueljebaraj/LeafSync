import React, { useState, useEffect } from "react";
import * as Device from "expo-device";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Image,
  ScrollView,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const AuthScreen = () => {
  const navigation = useNavigation();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");

  // 1. Configure for development only
  useEffect(() => {
    if (Platform.OS === "android") {
      // Android emulator
      setBaseUrl("http://10.0.2.2:8000/api/");
    } else {
      // iOS - check if physical device or simulator
      if (Device.isDevice) {
        // Physical iOS device (replace with your laptop IP)
        setBaseUrl("http://172.20.10.5:8000/api/");
      } else {
        // iOS simulator
        setBaseUrl("http://localhost:8000/api/");
      }
    }
  }, []);

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    // Validate inputs
    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? "login/" : "register/";
      const payload = isLogin
        ? { username: formData.email, password: formData.password }
        : {
            username: formData.email,
            email: formData.email,
            password: formData.password,
            password2: formData.confirmPassword,
            first_name: formData.name,
          };

      const response = await axios.post(`${baseUrl}${endpoint}`, payload);

      // Store tokens and user data securely
      await AsyncStorage.multiSet([
        ["access_token", response.data.access],
        ["refresh_token", response.data.refresh],
        ["user", JSON.stringify(response.data.user)],
      ]);

      navigation.navigate("Home");
    } catch (error) {
      console.error("API Error:", error.response?.data);
      let errorMessage = "Authentication failed. Please try again.";

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.password) {
        errorMessage = error.response.data.password[0];
      } else if (error.response?.data?.email) {
        errorMessage = error.response.data.email[0];
      } else if (error.response?.data?.username) {
        errorMessage = error.response.data.username[0];
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </Text>

        {/* Auth Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, isLogin && styles.activeToggle]}
            onPress={() => setIsLogin(true)}
            disabled={loading}
          >
            <Text
              style={[styles.toggleText, isLogin && styles.activeToggleText]}
            >
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, !isLogin && styles.activeToggle]}
            onPress={() => setIsLogin(false)}
            disabled={loading}
          >
            <Text
              style={[styles.toggleText, !isLogin && styles.activeToggleText]}
            >
              Register
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#999"
            value={formData.name}
            onChangeText={(text) => handleChange("name", text)}
            autoCapitalize="words"
            editable={!loading}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#999"
          value={formData.email}
          onChangeText={(text) => handleChange("email", text)}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={formData.password}
          onChangeText={(text) => handleChange("password", text)}
          secureTextEntry
          editable={!loading}
        />

        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            value={formData.confirmPassword}
            onChangeText={(text) => handleChange("confirmPassword", text)}
            secureTextEntry
            editable={!loading}
          />
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isLogin ? "Sign In" : "Create Account"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Switch Auth Mode */}
        <TouchableOpacity
          style={styles.switchAuthContainer}
          onPress={() => setIsLogin(!isLogin)}
          disabled={loading}
        >
          <Text style={styles.switchAuthText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Text style={styles.switchAuthLink}>
              {isLogin ? "Register" : "Login"}
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fbfbf3",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 25,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 25,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#eee",
    borderRadius: 30,
    padding: 5,
    marginBottom: 25,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  activeToggle: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  activeToggleText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  button: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  switchAuthContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  switchAuthText: {
    color: "#666",
    fontSize: 14,
  },
  switchAuthLink: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AuthScreen;
