import firebase from "gatsby-plugin-firebase";
import { pick } from "lodash";
import React, { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import useAuthState from "../hooks/useAuthState";

const defaultUser = {
  uid: null,
  email: null,
  displayName: null,
  isAnonymous: false,
};

const defaultState = {
  loading: false,
  user: defaultUser,
  logout: async () => {},
  loginWithGoogle: async () => {},
};

const UserContext = createContext(defaultState);

const UserProvider = ({ children }) => {
  const [firebaseUser, loading] = useAuthState(firebase);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setUser(user);
  }, []);

  useEffect(() => {
    if (firebaseUser) {
      const user = pick(firebaseUser, Object.keys(defaultUser));
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      const addUserToDatabase = async () => {
        const userRef = firebase.database().ref(`users/${user.uid}`);
        const snapshot = await userRef.once("value");
        !snapshot.val() && userRef.set(user);
      };

      addUserToDatabase();
    }
  }, [firebaseUser]);

  const loginWithGoogle = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();

    try {
      await firebase.auth().signInWithPopup(provider);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = async () => {
    await firebase.auth().signOut();
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        logout,
        loading,
        loginWithGoogle,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;

export { UserProvider };
