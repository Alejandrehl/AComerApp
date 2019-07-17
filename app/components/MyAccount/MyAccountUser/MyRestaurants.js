import React, { useContext, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import AuthContext from "../../../context/auth/authContext";

const MyRestaurants = ({ navigation }) => {
  const authContext = useContext(AuthContext);
  const { loadMyRestaurants, myRestaurants } = authContext;
  const user = navigation.state.params;

  useEffect(() => {
    loadMyRestaurants(user);
  }, []);

  return (
    <View style={styles.viewBody}>
      {myRestaurants && <Text>{myRestaurants.length}</Text>}
      <Text>Mis restaurantes</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  viewBody: {
    flex: 1
  }
});

export default MyRestaurants;
