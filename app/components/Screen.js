import {
  StyleSheet,
  View,
} from "react-native";
import React from "react";
import Constants from 'expo-constants'
import colors from "../config/colors";

const Screen = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>{children}</View>
  );
};

export default Screen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: Constants.statusBarHeight,
    backgroundColor: colors.DARK
  },
});
