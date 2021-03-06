import React, { useRef, useState, useContext, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { Image, Button, SocialIcon, Divider } from "react-native-elements";
import Toast from "react-native-easy-toast";
import AuthContext from "../../context/auth/authContext";

import * as Facebook from "expo-facebook";
import { FacebookApi } from "../../utils/Social";

import t from "tcomb-form-native";
const Form = t.form.Form;
import { LoginStruct, LoginOptions } from "../../forms/Login";

const Login = ({ navigation }) => {
  const loginForm = useRef(null);
  const toast = useRef(null);
  const authContext = useContext(AuthContext);
  const { login, isAuthenticated, setError, error } = authContext;

  useEffect(() => {
    if (isAuthenticated) {
      toast.current.show("¡Bienvenido!", 500, () => {
        navigation.navigate("MyAccount");
      });
    }
    // eslint-disable-next-line
  }, [isAuthenticated]);

  const [user, setUser] = useState({
    email: "",
    password: ""
  });

  const { email, password } = user;

  const onChange = formData => setUser(formData);

  const onSubmit = e => {
    e.preventDefault();
    if (email === "" || password === "") {
      setError("Debes completar todos los campos");
    } else {
      const validate = loginForm.current.getValue();
      if (validate) {
        login({ email, password });
      } else {
        setError("Formulario Inválido");
      }
    }
  };

  const loginFacebook = async () => {
    const { type, token } = await Facebook.logInWithReadPermissionsAsync(
      FacebookApi.application_id,
      { permissions: FacebookApi.permissions }
    );

    if (type == "success") {
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`
      );
      const userData = await response.json();

      login({
        name: userData.name,
        email: userData.email,
        image: userData.picture.data.url,
        password: userData.id,
        facebook_auth: true
      });
    } else if (type === "cancel") {
      toast.current.show("Inicio de sesión cancelada.", 1500);
    } else {
      toast.current.show("Error desconocido.", 1500);
    }
  };

  return (
    <ScrollView style={styles.viewBody}>
      <Image
        source={require("../../../assets/img/logo.png")}
        style={styles.logo}
        containerStyle={styles.containerLogo}
        PlaceholderContent={<ActivityIndicator />}
        resizeMode="contain"
      />
      <View style={styles.viewForm}>
        <Form
          ref={loginForm}
          type={LoginStruct}
          options={LoginOptions}
          value={user}
          onChange={onChange}
        />
        <Button
          title="¡Acceder!"
          buttonStyle={styles.buttonLoginContainer}
          onPress={onSubmit}
        />
        <Text style={styles.textRegister}>
          ¿Aún no tienes una cuenta?{" "}
          <Text
            style={styles.buttonRegister}
            onPress={() => navigation.navigate("Register")}
          >
            ¡Registrate!
          </Text>
        </Text>
        <Text style={styles.formErrorMessage}>{error}</Text>
        <Toast
          ref={toast}
          position="top"
          positionValue={350}
          fadeInDuration={750}
          fadeOutDuration={1000}
          opacity={0.8}
          textStyle={{ color: "#fff" }}
        />
        <Divider style={styles.divider} />
        <SocialIcon
          title="Acceder con Facebook"
          button
          type="facebook"
          onPress={() => loginFacebook()}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    marginLeft: 30,
    marginRight: 30
  },
  containerLogo: {
    alignItems: "center"
  },
  viewForm: {
    marginTop: 40
  },
  logo: {
    width: 200,
    height: 100
  },
  buttonLoginContainer: {
    backgroundColor: "#ffc107",
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10
  },
  formErrorMessage: {
    color: "#f00",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 30
  },
  divider: {
    backgroundColor: "#ffc107",
    marginBottom: 20
  },
  textRegister: {
    marginTop: 15,
    marginLeft: 10,
    marginRight: 10
  },
  buttonRegister: {
    color: "#ffc107",
    fontWeight: "bold"
  }
});

export default Login;
