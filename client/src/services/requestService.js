import api from "./api";

// Thin wrappers around the /api/requests endpoints, mirroring the other
// service files.

export const createRequestRequest = async (formData) => {
  const { data } = await api.post("/requests", formData);
  return data.request;
};

export const getMyRequestsRequest = async () => {
  const { data } = await api.get("/requests/my");
  return data.requests;
};

export const getRequestByIdRequest = async (id) => {
  const { data } = await api.get(`/requests/${id}`);
  return data.request;
};

export const getNearbyRequestsRequest = async ({ collegeMode = "same", sort = "distance" } = {}) => {
  const { data } = await api.get("/requests/nearby", { params: { collegeMode, sort } });
  return data.requests;
};

export const cancelRequestRequest = async (id) => {
  const { data } = await api.patch(`/requests/${id}/cancel`);
  return data.request;
};

export const acceptRequestRequest = async (id) => {
  const { data } = await api.patch(`/requests/${id}/accept`);
  return data.request;
};

export const updateRequestStatusRequest = async (id, status) => {
  const { data } = await api.patch(`/requests/${id}/status`, { status });
  return data.request;
};

export const getAcceptedRequestsRequest = async () => {
  const { data } = await api.get("/requests/accepted");
  return data.requests;
};
