import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Button, Checkbox, IconButton } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

const CropJournalScreen = () => {
  // State for journal entries
  const [entries, setEntries] = useState([
    {
      id: "1",
      date: new Date(2023, 5, 15),
      description: "Planted tomatoes in the north field. Soil pH was 6.5.",
      completed: false,
    },
    {
      id: "2",
      date: new Date(2023, 5, 20),
      description: "Applied organic fertilizer. Noticed some aphids on leaves.",
      completed: true,
    },
    {
      id: "3",
      date: new Date(2023, 5, 25),
      description: "First signs of flowering. Installed support stakes.",
      completed: false,
    },
  ]);

  // State for new entry
  const [newEntry, setNewEntry] = useState({
    date: new Date(),
    description: "",
  });

  // Date picker visibility
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Add a new journal entry
  const addEntry = () => {
    if (newEntry.description.trim() === "") return;

    const entry = {
      id: Date.now().toString(),
      date: newEntry.date,
      description: newEntry.description.trim(),
      completed: false,
    };

    setEntries([entry, ...entries]);
    setNewEntry({ date: new Date(), description: "" });
  };

  // Toggle entry completion status
  const toggleEntry = (entryId) => {
    setEntries(
      entries.map((entry) =>
        entry.id === entryId ? { ...entry, completed: !entry.completed } : entry
      )
    );
  };

  // Handle date change
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewEntry({ ...newEntry, date: selectedDate });
    }
  };

  // Delete an entry
  const deleteEntry = (entryId) => {
    setEntries(entries.filter((entry) => entry.id !== entryId));
  };

  // Render each journal entry
  const renderEntry = ({ item }) => (
    <View style={[styles.entryCard, item.completed && styles.completedEntry]}>
      <View style={styles.entryHeader}>
        <View style={styles.entryDateContainer}>
          <MaterialIcons name="event" size={18} color="#2E86AB" />
          <Text style={styles.entryDate}>
            {item.date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>
        <View style={styles.entryActions}>
          <Checkbox
            status={item.completed ? "checked" : "unchecked"}
            onPress={() => toggleEntry(item.id)}
            color="#2E86AB"
          />
          <TouchableOpacity onPress={() => deleteEntry(item.id)}>
            <MaterialIcons name="delete" size={22} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.entryDescription}>{item.description}</Text>
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
            <MaterialIcons name="book" size={28} color="#2E86AB" />
          </View>
          <Text style={styles.subHeader}>
            Track your crop activities and observations
          </Text>
        </View>

        {/* Add New Entry Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="add-circle" size={20} color="#2E86AB" />
            <Text style={styles.cardTitle}>New Journal Entry</Text>
          </View>

          {/* Date Picker */}
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.dateInputContent}>
              <MaterialIcons name="event" size={20} color="#2E86AB" />
              <Text style={styles.dateText}>
                {newEntry.date.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={newEntry.date}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          {/* Description Input */}
          <TextInput
            style={styles.descriptionInput}
            placeholder="What did you observe today?"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={newEntry.description}
            onChangeText={(text) =>
              setNewEntry({ ...newEntry, description: text })
            }
          />

          <Button
            mode="contained"
            onPress={addEntry}
            style={styles.addButton}
            labelStyle={styles.buttonLabel}
            disabled={!newEntry.description.trim()}
            icon="plus"
          >
            Add Entry
          </Button>
        </View>

        {/* Journal Entries List */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="history" size={20} color="#2E86AB" />
            <Text style={styles.cardTitle}>Past Entries</Text>
          </View>

          {entries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons
                name="info-outline"
                size={40}
                color="#2E86AB"
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>
                No entries yet. Add your first journal entry!
              </Text>
            </View>
          ) : (
            <FlatList
              data={entries}
              renderItem={renderEntry}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
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
  dateInput: {
    borderColor: "rgba(46, 134, 171, 0.3)",
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  dateInputContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    marginLeft: 10,
    color: "#333",
  },
  descriptionInput: {
    height: 120,
    borderColor: "rgba(46, 134, 171, 0.3)",
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
    textAlignVertical: "top",
  },
  addButton: {
    marginTop: 10,
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
  entryCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2E86AB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: "rgba(46, 134, 171, 0.1)",
  },
  completedEntry: {
    opacity: 0.7,
    borderLeftColor: "#95a5a6",
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  entryDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  entryDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E86AB",
    marginLeft: 8,
  },
  entryActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  entryDescription: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyIcon: {
    marginBottom: 15,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 16,
    color: "#2E86AB",
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 5,
  },
});

export default CropJournalScreen;
