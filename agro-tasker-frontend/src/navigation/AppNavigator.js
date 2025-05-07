import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import TaskPlannerScreen from "../screens/TaskPlannerScreen";
import CropJournalScreen from "../screens/CropJournalScreen";
import DiseaseDetectorScreen from "../screens/DiseaseDetectorScreen";
import ChatbotScreen from "../screens/ChatbotScreen";
import StartScreen from "../screens/StartScreen";
import AuthScreen from "../screens/AuthScreen";
import ProfileScreen from "../screens/ProfileScreen";
import FullMapScreen from "../screens/FullMapScreen";
const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Start">
      {/* Authentication Flow */}
      <Stack.Screen
        name="Start"
        component={StartScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{ headerShown: false }}
      />

      {/* Main App Screens */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false, // Using custom nav bar in HomeScreen
          gestureEnabled: false, // Disable swipe back to auth
        }}
      />
      <Stack.Screen
        name="TaskPlanner"
        component={TaskPlannerScreen}
        options={{
          title: "Task Planner",
          headerStyle: {
            backgroundColor: "#fbfbf3",
          },
          headerTintColor: "#2E7D32",
        }}
      />
      <Stack.Screen
        name="CropJournal"
        component={CropJournalScreen}
        options={{
          title: "Crop Journal",
          headerStyle: {
            backgroundColor: "#fbfbf3",
          },
        }}
      />
      <Stack.Screen
        name="DiseaseDetector"
        component={DiseaseDetectorScreen}
        options={{
          title: "Disease Detector",
          headerStyle: {
            backgroundColor: "#fbfbf3",
          },
        }}
      />
      <Stack.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{
          title: "Farming Assistant",
          headerStyle: {
            backgroundColor: "#fbfbf3",
          },
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "My Profile",
          headerStyle: {
            backgroundColor: "#fbfbf3",
          },
        }}
      />

      <Stack.Screen
        name="FullMap"
        component={FullMapScreen}
        options={{
          title: "Soil Map",
          headerStyle: {
            backgroundColor: "#fbfbf3",
          },
          headerTintColor: "#2E7D32",
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
