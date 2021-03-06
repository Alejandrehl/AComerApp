import React, { useEffect, useContext } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity
} from "react-native";
import { Card, Image, Rating } from "react-native-elements";
import RestaurantContext from "../context/restaurant/restaurantContext";

const TopFive = ({ navigation }) => {
  const restaurantContext = useContext(RestaurantContext);
  const { loadTopFiveRestaurants, topFiveRestaurants } = restaurantContext;

  useEffect(() => {
    loadTopFiveRestaurants();
  }, []);

  const touchRestaurant = restaurant => {
    const { id, name, description, address, city, image } = restaurant;
    navigation.navigate("Restaurant", {
      id,
      name,
      description,
      address,
      city,
      image
    });
  };

  return (
    <ScrollView style={styles.viewBody}>
      {topFiveRestaurants ? (
        <View>
          {topFiveRestaurants.map((restaurant, index) => {
            return (
              <TouchableOpacity
                key={index}
                onPress={() => touchRestaurant(restaurant)}
              >
                <Card>
                  <Image
                    style={styles.restaurantImage}
                    resizeMode="cover"
                    source={{ uri: restaurant.image }}
                    PlaceholderContent={<ActivityIndicator />}
                  />
                  <View style={styles.titleRating}>
                    <Text style={styles.title}>{restaurant.name}</Text>
                    <Rating
                      imageSize={20}
                      startingValue={restaurant.rating}
                      readonly
                      style={styles.rating}
                    />
                  </View>
                  <Text style={styles.description}>
                    {restaurant.description}
                  </Text>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles.startLoadRestaurants}>
          <ActivityIndicator size="large" />
          <Text>Cargando restaurants</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  viewBody: {
    flex: 1
  },
  restaurantImage: {
    width: "100%",
    height: 200
  },
  titleRating: {
    flexDirection: "row",
    marginTop: 10
  },
  title: {
    fontSize: 20,
    fontWeight: "bold"
  },
  rating: {
    position: "absolute",
    right: 0
  },
  description: {
    color: "grey",
    marginTop: 10,
    textAlign: "justify"
  },
  startLoadRestaurants: {
    marginTop: 20,
    alignItems: "center"
  }
});

export default TopFive;
