import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import colors from "../config/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const NoteList = ({ title, imageUri, subtitle }) => {
  return (
    <View style={styles.container}>
      {imageUri ? (
        <Image style={styles.image} source={{ uri: imageUri }} />
      ) : (
        <MaterialCommunityIcons
          style={{ marginRight: 25 }}
          name="account"
          size={40}
          color={colors.LIGHT}
        />
      )}
      <View>
        <Text
          style={[styles.title, subtitle == null && styles.centeredTitle]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        {subtitle != null && subtitle !== "" && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
    </View>
  );
};

export default NoteList;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginVertical: 7,
  },
  title: {
    color: colors.LIGHT,
    fontSize: 18,
    fontWeight: "900",
    flex: 1,
  },
  centeredTitle: {
    textAlignVertical: "center",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 13,
  },
  image: {
    marginRight: 15,
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});
