// utils/auth.ts
import Cookies from "js-cookie";
import { jwtDecode, JwtPayload } from "jwt-decode";

// Set the token in cookies
export const setToken = (token: string, name: string) => {
  Cookies.set(name, token, { expires: 7, secure: true });
};

// Get the token from cookies
export const getToken = (name: string): string | undefined => {
  return Cookies.get(name);
};

// Remove the token from cookies
export const removeToken = (name: string) => {
  Cookies.remove(name);

  localStorage.clear();
};

// Check if the token is valid (not expired)
export const isTokenValid = (token: string | undefined, tokenName: string): boolean => {
  if (!token) return false;

  try {
    const decodedToken: JwtPayload = jwtDecode<JwtPayload>(token); // Use JwtPayload type
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    console.log(decodedToken);
    if (!decodedToken.exp || decodedToken.exp <= currentTime) {
      removeToken(tokenName); // Remove the expired token
      console.log("invalid");
      return false; // Expired token
    }
    console.log("valid");
    return true; // Valid token
  } catch (error) {
    return false; // Return false for invalid tokens
  }
};
