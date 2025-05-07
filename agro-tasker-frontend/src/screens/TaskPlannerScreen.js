import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  ScrollView,
} from "react-native";
import { Checkbox, Button } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

const TaskPlannerScreen = () => {
  // Input states
  const [nitrogen, setNitrogen] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");
  const [moisture, setMoisture] = useState("");
  const [temperature, setTemperature] = useState("");

  // Tasks state
  const [tasks, setTasks] = useState([]);

  // Generate smart tasks based on inputs
  const generateTasks = () => {
    const n = parseFloat(nitrogen) || 0;
    const p = parseFloat(phosphorus) || 0;
    const k = parseFloat(potassium) || 0;
    const m = parseFloat(moisture) || 0;
    const temp = parseFloat(temperature) || 0;

    const generatedTasks = [];

    if (n < 30 || p < 20 || k < 40) {
      generatedTasks.push({
        id: "1",
        title: "Apply balanced fertilizer",
        description: `Recommended NPK ratio: ${Math.max(30 - n, 0)}-${Math.max(
          20 - p,
          0
        )}-${Math.max(40 - k, 0)}`,
        completed: false,
        icon: "local-florist",
        color: "#2E86AB",
      });
    }

    if (m < 50) {
      generatedTasks.push({
        id: "2",
        title: "Irrigation needed",
        description: `Soil moisture (${m}%) is below optimal level (50%)`,
        completed: false,
        icon: "opacity",
        color: "#2E86AB",
      });
    } else if (m > 80) {
      generatedTasks.push({
        id: "2",
        title: "Reduce watering",
        description: `Soil moisture (${m}%) is above optimal level (80%)`,
        completed: false,
        icon: "opacity",
        color: "#2E86AB",
      });
    }

    if (temp < 15) {
      generatedTasks.push({
        id: "3",
        title: "Protect crops from cold",
        description: `Temperature (${temp}°C) is below optimal range`,
        completed: false,
        icon: "ac-unit",
        color: "#2E86AB",
      });
    } else if (temp > 35) {
      generatedTasks.push({
        id: "3",
        title: "Provide shade or cooling",
        description: `Temperature (${temp}°C) is above optimal range`,
        completed: false,
        icon: "wb-sunny",
        color: "#2E86AB",
      });
    }

    if (generatedTasks.length === 0) {
      generatedTasks.push({
        id: "4",
        title: "Regular maintenance",
        description:
          "Conditions are optimal. Perform regular crop maintenance.",
        completed: false,
        icon: "check-circle",
        color: "#2E86AB",
      });
    }

    setTasks(generatedTasks);
  };

  const toggleTask = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const renderTask = ({ item }) => (
    <View style={[styles.taskItem, { borderLeftColor: item.color }]}>
      <View style={styles.taskIcon}>
        <MaterialIcons name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.taskInfo}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskDescription}>{item.description}</Text>
      </View>
      <Checkbox
        status={item.completed ? "checked" : "unchecked"}
        onPress={() => toggleTask(item.id)}
        color={item.color}
      />
    </View>
  );

  return (
    <LinearGradient
      colors={["#E6F7FF", "#F0FFF4"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.headerIcon}>
            <MaterialIcons name="checklist" size={28} color="#2E86AB" />
          </View>
          <Text style={styles.subHeader}>
            Get personalized farming tasks based on your soil data
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="grass" size={20} color="#2E86AB" />
            <Text style={styles.cardTitle}>Soil Nutrient Levels</Text>
          </View>
          <View style={styles.npkContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Nitrogen (N)</Text>
              <TextInput
                style={styles.input}
                placeholder="0-100%"
                keyboardType="numeric"
                value={nitrogen}
                onChangeText={setNitrogen}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Phosphorus (P)</Text>
              <TextInput
                style={styles.input}
                placeholder="0-100%"
                keyboardType="numeric"
                value={phosphorus}
                onChangeText={setPhosphorus}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Potassium (K)</Text>
              <TextInput
                style={styles.input}
                placeholder="0-100%"
                keyboardType="numeric"
                value={potassium}
                onChangeText={setPotassium}
              />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="wb-cloudy" size={20} color="#2E86AB" />
            <Text style={styles.cardTitle}>Environmental Factors</Text>
          </View>
          <View style={styles.environmentContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Soil Moisture</Text>
              <TextInput
                style={styles.input}
                placeholder="0-100%"
                keyboardType="numeric"
                value={moisture}
                onChangeText={setMoisture}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Temperature</Text>
              <TextInput
                style={styles.input}
                placeholder="°C"
                keyboardType="numeric"
                value={temperature}
                onChangeText={setTemperature}
              />
            </View>
          </View>
        </View>

        <Button
          mode="contained"
          onPress={generateTasks}
          style={styles.generateButton}
          labelStyle={styles.buttonLabel}
          icon="auto-awesome"
        >
          Generate Smart Tasks
        </Button>

        {tasks.length > 0 && (
          <View style={styles.tasksCard}>
            <View style={styles.sectionHeaderContainer}>
              <MaterialIcons name="list-alt" size={24} color="#2E86AB" />
              <Text style={styles.sectionHeader}>Recommended Tasks</Text>
            </View>
            <FlatList
              data={tasks}
              renderItem={renderTask}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 25,
    alignItems: "center",
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
  subHeader: {
    fontSize: 16,
    color: "#2E86AB",
    textAlign: "center",
    paddingHorizontal: 20,
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#2E86AB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(46, 134, 171, 0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E86AB",
    marginLeft: 10,
  },
  inputWrapper: {
    marginBottom: 15,
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: "#555",
    fontWeight: "500",
  },
  input: {
    height: 50,
    borderColor: "rgba(46, 134, 171, 0.3)",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
  },
  npkContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  environmentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  generateButton: {
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    backgroundColor: "#2E86AB",
    shadowColor: "#2E86AB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  tasksCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#2E86AB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(46, 134, 171, 0.1)",
  },
  sectionHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#2E86AB",
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: "rgba(46, 134, 171, 0.1)",
  },
  taskIcon: {
    marginRight: 15,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 3,
    color: "#333",
  },
  taskDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});

export default TaskPlannerScreen;
