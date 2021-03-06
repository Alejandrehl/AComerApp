import React, { useContext, useEffect, useRef, useState } from "react";
import AuthContext from "../../context/auth/authContext";
import RestaurantContext from "../../context/restaurant/restaurantContext";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl
} from "react-native";
import { Image } from "react-native-elements";
import ActionButton from "react-native-action-button";
import Icon from "react-native-vector-icons/Ionicons";
import Toast from "react-native-easy-toast";
import * as Permissions from "expo-permissions";
import * as Location from "expo-location";
import OverlayCamera from "../../components/Elements/OverlayCamera";

const Restaurants = ({ navigation }) => {
  const toast = useRef(null);
  const [overlayComponent, setOverlayComponent] = useState(null);
  const authContext = useContext(AuthContext);
  const { loadUser, isAuthenticated } = authContext;

  const restaurantContext = useContext(RestaurantContext);
  const {
    getRestaurants,
    restaurants,
    setStartRestaurants,
    loadingRestaurants,
    refreshRestaurants,
    loading
  } = restaurantContext;

  useEffect(() => {
    loadUser();
    getRestaurants();
  }, []);

  const renderRow = restaurant => {
    const { name, city, description, address, image } = restaurant.item;
    return (
      <TouchableOpacity onPress={() => goToRestaurant(restaurant.item)}>
        <View style={styles.viewRestaurant}>
          <View sytle={styles.viewRestaurantImage}>
            <Image
              resizeMode="cover"
              source={{ uri: image }}
              style={styles.imageRestaurant}
              PlaceholderContent={<ActivityIndicator />}
            />
          </View>
          <View style={styles.viewRestaurantInfo}>
            <Text style={styles.flatlistRestaurantName}>{name}</Text>
            <Text style={styles.flatlistRestaurantAddress}>
              {address}, {city}
            </Text>
            <Text style={styles.flatlistRestaurantDescription}>
              {description.substr(0, 60)} ...
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const goToRestaurant = restaurant => {
    navigation.navigate("Restaurant", restaurant);
  };

  const handleLoadMore = async () => {
    let resultRestaurants = restaurants;
    await setStartRestaurants(resultRestaurants.length);
    await getRestaurants();
  };

  const renderFooter = () => {
    if (restaurants.length >= 8) {
      if (loadingRestaurants) {
        return (
          <View style={styles.loaderRestaurants}>
            <ActivityIndicator size="large" />
          </View>
        );
      } else {
        return (
          <View style={styles.noFoundRestaurants}>
            <Text>Pronto se añadiran más restaurantes</Text>
          </View>
        );
      }
    } else {
      return (
        <View style={styles.noFoundRestaurants}>
          <Text>Pronto se añadiran más restaurantes</Text>
        </View>
      );
    }
  };

  const getCameraPermissions = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    if (status === "denied") {
      toast.current.show("Es necesario aceptar los permisos cámara");
    } else {
      setOverlayComponent(
        <OverlayCamera
          closeFunction={closeOverlayCamera}
          toast={toast.current}
        />
      );
    }
  };

  const closeOverlayCamera = () => {
    setOverlayComponent(null);
  };

  const getLocalization = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status === "denied") {
      toast.current.show("Es necesario aceptar los permisos de ubicación");
    } else {
      const res = await Location.getCurrentPositionAsync({});
      const params = {
        latitude: res.coords.latitude,
        longitude: res.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      };
      const location = await Location.reverseGeocodeAsync(params);
      console.log("RES", res);
      console.log("PArams", params);
      console.log("Location", location);
      navigation.navigate("MapRestaurants", params);
    }
  };

  return (
    <View style={styles.viewBody}>
      {restaurants ? (
        <View style={styles.viewFlatlist}>
          <FlatList
            data={restaurants}
            renderItem={renderRow}
            keyExtractor={(item, index) => index.toString()}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={refreshRestaurants}
              />
            }
          />
        </View>
      ) : (
        <View style={styles.startLoadRestaurants}>
          <ActivityIndicator size="large" />
          <Text>Cargando restaurants</Text>
        </View>
      )}

      <ActionButton buttonColor="#ffc107">
        {isAuthenticated && (
          <ActionButton.Item
            buttonColor="#ffc107"
            title="Nuevo Restaurant"
            onPress={() => navigation.navigate("AddRestaurant")}
          >
            <Icon name="md-create" style={styles.actionButtonIcon} />
          </ActionButton.Item>
        )}
        <ActionButton.Item
          buttonColor="#ffc107"
          title="Buscar"
          onPress={() => getLocalization()}
        >
          <Icon name="md-compass" style={styles.actionButtonIcon} />
        </ActionButton.Item>
        <ActionButton.Item
          buttonColor="black"
          title="Escanear QR"
          onPress={() => getCameraPermissions()}
        >
          <Icon name="md-qr-scanner" style={styles.actionButtonIcon} />
        </ActionButton.Item>
      </ActionButton>

      {overlayComponent}

      <Toast
        ref={toast}
        position="bottom"
        positionValue={250}
        fadeInDuration={750}
        fadeOutDuration={1000}
        opacity={0.8}
        textStyle={{ color: "#fff" }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  viewBody: {
    flex: 1
  },
  viewFlatlist: {
    flex: 1
  },
  startLoadRestaurants: {
    marginTop: 20,
    alignItems: "center"
  },
  viewRestaurant: {
    flexDirection: "row",
    margin: 10
  },
  viewRestaurantImage: {
    marginRight: 15
  },
  imageRestaurant: {
    width: 80,
    height: 80
  },
  viewRestaurantInfo: {
    marginLeft: 15
  },
  flatlistRestaurantName: {
    fontWeight: "bold"
  },
  flatlistRestaurantAddress: {
    paddingTop: 2,
    color: "grey"
  },
  flatlistRestaurantDescription: {
    paddingTop: 2,
    color: "grey",
    width: 300
  },
  loaderRestaurants: {
    marginTop: 20,
    marginBottom: 20
  },
  noFoundRestaurants: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: "center"
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: "white"
  }
});

export default Restaurants;
