import React, { useReducer } from "react";
import AuthContext from "./authContext";
import authReducer from "./authReducer";
import {
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  LOGOUT,
  SET_ERROR,
  REMOVE_ERROR,
  UPDATE_USER,
  LOADING,
  LOAD_MY_RESTAURANTS
} from "../types";
import { AsyncStorage } from "react-native";
import api from "../../utils/ApiConnection";
import setAuthToken from "../../utils/setAuthToken";
import { RNS3 } from "react-native-aws3";
import config from "../../utils/AwsConfig";

const AuthState = props => {
  const initialState = {
    token: AsyncStorage.getItem("token"),
    isAuthenticated: null,
    error: null,
    user: null,
    loading: false,
    myRestaurants: null
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  // LOAD USER
  const loadUser = async () => {
    await AsyncStorage.getItem("token", (err, result) => setAuthToken(result));

    try {
      const res = await api.get("/api/auth");
      dispatch({ type: USER_LOADED, user: res.data });
    } catch (err) {
      dispatch({ type: AUTH_ERROR });
      setError(err.response.data.msg);
    }
  };

  // LOGIN USER
  const login = async formData => {
    try {
      const res = await api.post("/api/auth", formData);
      dispatch({ type: LOGIN_SUCCESS, token: res.data.token });
      loadUser();
    } catch (err) {
      if (formData.facebook_auth) {
        return register(formData);
      }

      dispatch({ type: LOGIN_FAIL, payload: err.response.data.msg });
      setError(err.response.data.msg);
    }
  };

  // REGISTER USER
  const register = async formData => {
    try {
      const res = await api.post("/api/users/register", formData);
      dispatch({ type: REGISTER_SUCCESS, token: res.data.token });
      loadUser();
    } catch (err) {
      dispatch({ type: REGISTER_FAIL });
      setError(err.response.data.msg);
    }
  };

  // LOGOUT USER
  const logout = () => dispatch({ type: LOGOUT });

  // SET ERROR
  const setError = msg => {
    dispatch({ type: SET_ERROR, msg });
    setTimeout(() => dispatch({ type: REMOVE_ERROR }), 2000);
  };

  // UPDATE USER
  const updateUser = async (data, id, toast, timeout) => {
    try {
      const res = await api.put(`/api/users/${id}`, data);
      dispatch({ type: UPDATE_USER, payload: res.data });
      toast.show("¡Actualizado con éxito!", timeout);
    } catch (err) {
      toast.show("Ocurrió un error al actualizar tus datos.", timeout);
    }
  };

  // UPLOAD IMAGE
  const uploadImage = async (file, id, toast, timeout) => {
    try {
      const res = await RNS3.put(file, config).progress(e => {
        if (e.percent < 1) dispatch({ type: LOADING, payload: true });
      });

      updateUser({ image: res.body.postResponse.location }, id, toast, timeout);
    } catch (err) {
      toast.show("Ocurrió un error al subir la imagen");
    }
  };

  // LOAD MY RESTAURANTS
  const loadMyRestaurants = async user => {
    try {
      const res = await api.get(`/api/users/${user.id}/restaurants`);
      dispatch({ type: LOAD_MY_RESTAURANTS, payload: res.data });
    } catch (err) {}
  };

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        error: state.error,
        loading: state.loading,
        myRestaurants: state.myRestaurants,
        setError,
        loadUser,
        login,
        register,
        logout,
        updateUser,
        uploadImage,
        loadMyRestaurants
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthState;
