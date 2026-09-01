import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 2500,
});

export async function fetchParking({ search, vehicle, sort }) {
  const response = await api.get("/parking", {
    params: { search, vehicle, sort },
  });
  return response.data.data;
}

export async function createBooking({
  parkingId,
  vehicleType,
  vehicleNumber,
  startTime,
  durationHours,
  token,
}) {
  const response = await api.post(
    "/bookings",
    { parkingId, vehicleType, vehicleNumber, startTime, durationHours },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data.data;
}

function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export async function fetchMyProfile(token) {
  const response = await api.get("/users/me", authHeaders(token));
  return response.data.data;
}

export async function fetchMyBookings(token) {
  const response = await api.get("/bookings/my", authHeaders(token));
  return response.data.data;
}

export async function cancelBooking(token, id) {
  const response = await api.patch(
    `/bookings/${id}/cancel`,
    {},
    authHeaders(token),
  );
  return response.data.data;
}

export async function createPaymentOrder(token, bookingId) {
  const response = await api.post(
    "/payments/create-order",
    { bookingId },
    authHeaders(token),
  );
  return response.data.data;
}

export async function verifyPayment(token, payment) {
  const response = await api.post(
    "/payments/verify",
    payment,
    authHeaders(token),
  );
  return response.data.data;
}

export async function fetchAdminDashboard(token) {
  const response = await api.get("/admin/dashboard", authHeaders(token));
  return response.data.data;
}

export async function fetchAdminParking(token) {
  const response = await api.get("/admin/parking", authHeaders(token));
  return response.data.data;
}

export async function fetchAdminBookings(token) {
  const response = await api.get("/admin/bookings", authHeaders(token));
  return response.data.data;
}

export async function createAdminParking(token, parking) {
  const response = await api.post(
    "/admin/parking",
    parking,
    authHeaders(token),
  );
  return response.data.data;
}

export async function updateAdminParking(token, id, parking) {
  const response = await api.put(
    `/admin/parking/${id}`,
    parking,
    authHeaders(token),
  );
  return response.data.data;
}

export async function updateAdminAvailability(token, id, availability) {
  const response = await api.put(
    `/admin/parking/${id}/availability`,
    availability,
    authHeaders(token),
  );
  return response.data.data;
}

export async function deleteAdminParking(token, id) {
  await api.delete(`/admin/parking/${id}`, authHeaders(token));
}

export async function createOwnerRequest(token, requestData) {
  const response = await api.post(
    "/owner-requests",
    requestData,
    authHeaders(token),
  );
  return response.data.data;
}

export async function fetchOwnerRequests(token) {
  const response = await api.get("/admin/owner-requests", authHeaders(token));
  return response.data.data;
}

export async function reviewOwnerRequest(token, id, decision) {
  const response = await api.patch(
    `/admin/owner-requests/${id}`,
    { decision },
    authHeaders(token),
  );
  return response.data.data;
}

export async function checkIn(token, bookingId) {
  const response = await api.post(
    "/checkin",
    { bookingId },
    authHeaders(token),
  );
  return response.data.data;
}

export async function checkOut(token, bookingId) {
  const response = await api.post(
    "/checkout",
    { bookingId },
    authHeaders(token),
  );
  return response.data.data;
}
