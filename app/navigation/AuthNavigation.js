import Login from "../screens/Login";
import SignUp from "../screens/SignUp";
import { createStackNavigator } from "@react-navigation/stack";
import config from '../config/animation'
import Home from "../screens/Home";
const Stack = createStackNavigator();

const AuthNavigation = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      transitionSpec: {
        open: config.navigation,
        close: config.navigation
      }
    }}
  >
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="SignUp" component={SignUp} />

  </Stack.Navigator>
);

export default AuthNavigation;
