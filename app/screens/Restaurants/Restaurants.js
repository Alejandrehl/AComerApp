import React from "react";
import { StyleSheet, View, Text } from "react-native";
import ActionButton from "react-native-action-button";

const Restaurants = () => {
  return (
    <View style={styles.viewBody}>
      <Text>Restaurants Screen</Text>
      <ActionButton
        buttonColor="#ffc107"
        onPress={() => {
          console.log("hi");
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff"
  }
});

export default Restaurants;