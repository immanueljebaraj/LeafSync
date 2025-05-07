import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Button, Card, SegmentedButtons } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Device from "expo-device";
import * as Network from "expo-network";
import { Platform } from "react-native";
const DiseaseDetectorScreen = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modelType, setModelType] = useState("plant");
  const [baseUrl, setBaseUrl] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [isGettingSuggestions, setIsGettingSuggestions] = useState(false);

  // Set base URL based on platform and environment
  useEffect(() => {
    const determineBaseUrl = async () => {
      try {
        if (Platform.OS === "android") {
          // Android emulator
          setBaseUrl("http://10.0.2.2:8000/api/");
        } else {
          // iOS
          if (Device.isDevice) {
            // Physical device - get computer's IP automatically
            setBaseUrl("http://172.20.10.5:8000/api/"); // Replace with your actual IP
          } else {
            // iOS simulator
            setBaseUrl("http://localhost:8000/api/");
          }
        }
      } catch (error) {
        console.error("Error determining base URL:", error);
        // Fallback URL
        setBaseUrl("http://localhost:8000/api/");
      }
    };

    determineBaseUrl();
  }, []);

  const pickImage = async (source) => {
    let result;

    if (source === "gallery") {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
    } else {
      await ImagePicker.requestCameraPermissionsAsync();
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
    }

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setDetectionResult(null); // Clear previous result when new image is selected
      setSuggestions(null); // Clear previous suggestions
    }
  };

  const detectDisease = async () => {
    if (!selectedImage || !baseUrl) return;

    setIsLoading(true);
    setDetectionResult(null);
    setSuggestions(null);

    try {
      // Convert image to blob for upload
      const fileInfo = await FileSystem.getInfoAsync(selectedImage);
      const fileUri = fileInfo.uri;
      const fileType = "image/jpeg";
      const fileName = fileUri.split("/").pop();

      const formData = new FormData();
      formData.append(modelType === "plant" ? "image" : "file", {
        uri: fileUri,
        name: fileName,
        type: fileType,
      });

      const endpoint =
        modelType === "plant"
          ? `${baseUrl}plant/predict/`
          : `${baseUrl}insect/predict/`;

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.json();

      if (response.ok) {
        const resultKey = modelType === "plant" ? "prediction" : "class";
        setDetectionResult({
          type: modelType,
          result: data[resultKey],
          description: `This appears to be ${data[resultKey]}. Consider consulting an expert for confirmation.`,
        });
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      setDetectionResult({
        type: "error",
        result: "Detection Failed",
        description:
          "Sorry, we couldn't process your request. Please try again.",
      });
      console.error("API Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestions = async () => {
    if (!detectionResult || !baseUrl) return;

    setIsGettingSuggestions(true);

    try {
      const prompt =
        `I have a ${detectionResult.type} problem in my farm. ` +
        `The detected issue is: ${detectionResult.result}. ` +
        `Please provide organic treatment suggestions and preventive measures.`;

      const response = await fetch(`${baseUrl}groq/ask-groq/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: prompt,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuggestions(data.response);
      } else {
        throw new Error(data.error || "Failed to get suggestions");
      }
    } catch (error) {
      setSuggestions(
        "Sorry, we couldn't get suggestions at this time. Please try again later."
      );
      console.error("Suggestions Error:", error);
    } finally {
      setIsGettingSuggestions(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.header}>Plant & Insect Detector</Text>

      <SegmentedButtons
        value={modelType}
        onValueChange={setModelType}
        buttons={[
          {
            value: "plant",
            label: "Plant Disease",
          },
          {
            value: "insect",
            label: "Insect",
          },
        ]}
        style={styles.segment}
      />

      <View style={styles.buttonGroup}>
        <Button
          mode="contained"
          onPress={() => pickImage("gallery")}
          style={styles.button}
          icon="image"
        >
          Gallery
        </Button>

        <Button
          mode="contained"
          onPress={() => pickImage("camera")}
          style={styles.button}
          icon="camera"
        >
          Camera
        </Button>
      </View>

      {selectedImage && (
        <Card style={styles.imageCard}>
          <Image
            source={{ uri: selectedImage }}
            style={styles.image}
            resizeMode="contain"
          />
        </Card>
      )}

      {selectedImage && (
        <Button
          mode="contained"
          onPress={detectDisease}
          style={styles.scanButton}
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading
            ? "Analyzing..."
            : `Detect ${modelType === "plant" ? "Disease" : "Insect"}`}
        </Button>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>
            Analyzing {modelType === "plant" ? "plant health" : "insect"}...
          </Text>
        </View>
      )}

      {detectionResult && !isLoading && (
        <Card style={styles.resultCard}>
          <Card.Title
            title={`${
              modelType === "plant" ? "Disease" : "Insect"
            } Detection Result`}
            titleStyle={styles.resultTitle}
            left={(props) => (
              <MaterialIcons
                name={modelType === "plant" ? "local-florist" : "bug-report"}
                size={24}
                color="#FF5722"
              />
            )}
          />
          <Card.Content>
            <Text style={styles.diseaseName}>
              Detected: {detectionResult.result}
            </Text>
            <Text style={styles.descriptionText}>
              {detectionResult.description}
            </Text>

            <Button
              mode="outlined"
              onPress={getSuggestions}
              style={styles.suggestionButton}
              loading={isGettingSuggestions}
              disabled={isGettingSuggestions}
              icon="lightbulb-on"
            >
              Get Treatment Suggestions
            </Button>
          </Card.Content>
        </Card>
      )}

      {isGettingSuggestions && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Getting suggestions...</Text>
        </View>
      )}

      {suggestions && !isGettingSuggestions && (
        <Card style={styles.suggestionCard}>
          <Card.Title
            title="Treatment Suggestions"
            titleStyle={styles.suggestionTitle}
            left={(props) => (
              <MaterialIcons name="lightbulb" size={24} color="#4CAF50" />
            )}
          />
          <Card.Content>
            <Text style={styles.suggestionText}>{suggestions}</Text>
          </Card.Content>
        </Card>
      )}

      {!selectedImage && (
        <View style={styles.placeholder}>
          <MaterialIcons
            name={modelType === "plant" ? "local-florist" : "bug-report"}
            size={100}
            color="#DDD"
          />
          <Text style={styles.placeholderText}>
            Select or take a photo of the{" "}
            {modelType === "plant" ? "affected plant" : "insect"}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40, // Extra padding at the bottom for scroll
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  segment: {
    marginBottom: 20,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    borderRadius: 8,
  },
  imageCard: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
    backgroundColor: "white",
  },
  image: {
    width: "100%",
    height: 300,
    backgroundColor: "#f0f0f0",
  },
  scanButton: {
    marginBottom: 20,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 8,
  },
  resultCard: {
    marginBottom: 20,
    backgroundColor: "#FFF9F2",
    borderLeftWidth: 5,
    borderLeftColor: "#FF5722",
    borderRadius: 10,
    overflow: "hidden",
  },
  resultTitle: {
    fontWeight: "bold",
    color: "#FF5722",
    fontSize: 18,
  },
  diseaseName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF5722",
    marginBottom: 8,
  },
  confidenceText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 12,
  },
  descriptionText: {
    color: "#666",
    lineHeight: 22,
    marginBottom: 15,
  },
  suggestionButton: {
    marginTop: 12,
    borderColor: "#4CAF50",
    borderRadius: 8,
    borderWidth: 1.5,
  },
  suggestionCard: {
    marginBottom: 30,
    backgroundColor: "#F5FFF5",
    borderLeftWidth: 5,
    borderLeftColor: "#4CAF50",
    borderRadius: 10,
    overflow: "hidden",
  },
  suggestionTitle: {
    fontWeight: "bold",
    color: "#4CAF50",
    fontSize: 18,
  },
  suggestionText: {
    color: "#333",
    lineHeight: 22,
    fontSize: 15,
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 40,
    padding: 20,
    backgroundColor: "#fafafa",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    marginHorizontal: 20,
  },
  placeholderText: {
    marginTop: 20,
    color: "#888",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 20,
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: "#555",
    fontSize: 16,
  },
  // Additional styles for the segmented buttons
  segmentButton: {
    borderColor: "#4CAF50",
  },
  segmentButtonSelected: {
    backgroundColor: "#4CAF50",
  },
  segmentButtonLabel: {
    color: "#4CAF50",
  },
  segmentButtonLabelSelected: {
    color: "white",
  },
  // Style for the button text
  buttonText: {
    fontWeight: "600",
  },
  // Style for the suggestion button text
  suggestionButtonText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
});

export default DiseaseDetectorScreen;
