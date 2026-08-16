import api from "./api";

// Thin wrappers around the /api/users endpoints, mirroring authService.js.

export const getMyProfileRequest = async () => {
  const { data } = await api.get("/users/me");
  return data.user;
};

export const updateMyProfileRequest = async (updates) => {
  const { data } = await api.patch("/users/me", updates);
  return data.user;
};

export const updateMyModeRequest = async (mode) => {
  const { data } = await api.patch("/users/me/mode", { mode });
  return data.user;
};
