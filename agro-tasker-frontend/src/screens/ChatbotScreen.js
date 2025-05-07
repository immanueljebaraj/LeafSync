import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Device from "expo-device";
import * as Network from "expo-network";

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hello! I'm your farming assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const scrollViewRef = useRef();

  // Set base URL (your existing implementation)
  useEffect(() => {
    const determineBaseUrl = async () => {
      try {
        if (Platform.OS === "android") {
          setBaseUrl("http://10.0.2.2:8000/api/");
        } else {
          if (Device.isDevice) {
            setBaseUrl("http://172.20.10.5:8000/api/");
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

  const handleSend = async () => {
    if (inputText.trim() === "" || !baseUrl) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch(`${baseUrl}groq/ask-groq/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: inputText }),
      });

      const data = await response.json();

      if (response.ok) {
        const botMessage = {
          id: Date.now().toString() + "bot",
          text: data.response,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now().toString() + "error",
        text: "Sorry, I couldn't process your request. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("API Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <LinearGradient
      colors={["#E6F7FF", "#F0FFF4"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialIcons name="chat" size={28} color="#2E86AB" />
        </View>
        <Text style={styles.headerText}>Farming Assistant</Text>
        <Text style={styles.subHeader}>Ask me anything about farming</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.sender === "user" && styles.userContainer,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.sender === "user"
                  ? styles.userBubble
                  : styles.botBubble,
              ]}
            >
              <Text
                style={
                  message.sender === "user" ? styles.userText : styles.botText
                }
              >
                {message.text}
              </Text>
              <Text style={styles.timestamp}>
                {formatTime(message.timestamp)}
              </Text>
            </View>
          </View>
        ))}
        {isLoading && (
          <View style={[styles.messageContainer, styles.botContainer]}>
            <View style={[styles.messageBubble, styles.botBubble]}>
              <ActivityIndicator size="small" color="#2E86AB" />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your farming question..."
          placeholderTextColor="#999"
          multiline
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (inputText.trim() === "" || isLoading) && styles.disabledButton,
          ]}
          onPress={handleSend}
          disabled={inputText.trim() === "" || isLoading}
        >
          <Ionicons
            name="send"
            size={24}
            color={inputText.trim() === "" || isLoading ? "#aaa" : "#2E86AB"}
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: "center",
    paddingTop: 40,
  },
  headerIcon: {
    backgroundColor: "rgba(46, 134, 171, 0.1)",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E86AB",
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 14,
    color: "#2E86AB",
    opacity: 0.8,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  chatContent: {
    paddingVertical: 15,
  },
  messageContainer: {
    width: "100%",
    marginBottom: 12,
  },
  userContainer: {
    alignItems: "flex-end",
  },
  botContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: "#2E86AB",
    borderTopRightRadius: 0,
  },
  botBubble: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 0,
    borderWidth: 1,
    borderColor: "rgba(46, 134, 171, 0.2)",
  },
  userText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
  },
  botText: {
    color: "#333",
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 5,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    paddingBottom: 25,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "rgba(46, 134, 171, 0.1)",
  },
  input: {
    flex: 1,
    minHeight: 50,
    maxHeight: 120,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 25,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "rgba(46, 134, 171, 0.3)",
  },
  sendButton: {
    marginLeft: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(46, 134, 171, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "rgba(170, 170, 170, 0.1)",
  },
});

export default ChatbotScreen;
