import { createStackNavigator } from "@react-navigation/stack";
import Home from "../screens/Home";
import Chat from "../screens/Chat";
const Stack = createStackNavigator();

const ChatNavigation = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="MainHome" component={Home} />
    <Stack.Screen name="Chat" component={Chat} />
  </Stack.Navigator>
);

export default ChatNavigation;
