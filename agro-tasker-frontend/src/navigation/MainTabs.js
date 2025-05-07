import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import TaskPlannerScreen from "../screens/TaskPlannerScreen";
import DiseaseDetectorScreen from "../screens/DiseaseDetectorScreen";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const iconMap = {
            Home: "home",
            Tasks: "checklist",
            Scanner: "camera-alt",
          };
          return (
            <MaterialIcons
              name={iconMap[route.name]}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Tasks" component={TaskPlannerScreen} />
      <Tab.Screen name="Scanner" component={DiseaseDetectorScreen} />
    </Tab.Navigator>
  );
}
