import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Screen from "./Screen";

const NoInternet = () => {
  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.text}>
          Unable to establish a connection. Please check your internet
          connection and try again.
        </Text>
      </View>
    </Screen>
  );
};

export default NoInternet;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 100,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F44336",
  },
  text: {
    fontSize: 18,
  },
});
