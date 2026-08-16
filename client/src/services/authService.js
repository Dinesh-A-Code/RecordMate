import api from "./api";

// Thin wrappers around the /api/auth endpoints. Keeping these separate from
// the AuthContext makes it easy to unit test or reuse outside of React state.

export const registerRequest = async (formData) => {
  const { data } = await api.post("/auth/register", formData);
  return data; // { user, token }
};

export const loginRequest = async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data; // { user, token }
};

export const getMeRequest = async () => {
  const { data } = await api.get("/auth/me");
  return data.user;
};
