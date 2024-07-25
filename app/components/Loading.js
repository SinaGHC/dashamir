import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React from "react";
import colors from "../config/colors";

const Loading = ({ width, height, flex }) => {
  return (
    <View
      style={{
        backgroundColor: colors.DARK,
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
      }}
    >
      <ActivityIndicator style={{ width: width, height: height }}/>
    </View>
  );
};

export default Loading;

const styles = StyleSheet.create({});
