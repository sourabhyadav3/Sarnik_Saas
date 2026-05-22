import axiosInstance from "./axiosInstance";

/** Mock dashboard stats when API unavailable */
const MOCK_DASHBOARD = {
  totalCompanies: 0,
  totalEmployees: 0,
  activeUsers: 0,
  activeSubscriptions: 0,
};

export const fetchSuperAdminDashboard = async () => {
  try {
    const res = await axiosInstance.get("/superadmin/dashboard");
    if (res.data?.success) return res.data.data;
    return MOCK_DASHBOARD;
  } catch {
    return MOCK_DASHBOARD;
  }
};

export const fetchSaasCompanies = async () => {
  try {
    const res = await axiosInstance.get("/superadmin/companies");
    return res.data?.data ?? [];
  } catch {
    return [];
  }
};

export const createSaasCompany = async (payload) => {
  const res = await axiosInstance.post("/superadmin/company/create", payload);
  return res.data;
};

export const updateSaasCompany = async (id, payload) => {
  const res = await axiosInstance.put(`/superadmin/company/${id}`, payload);
  return res.data;
};

export const deleteSaasCompany = async (id) => {
  const res = await axiosInstance.delete(`/superadmin/company/${id}`);
  return res.data;
};

export const fetchSuperAdminUsers = async () => {
  try {
    const res = await axiosInstance.get("/superadmin/users");
    return res.data?.data ?? [];
  } catch {
    return [];
  }
};

export const fetchSuperAdminRevenue = async () => {
  try {
    const res = await axiosInstance.get("/superadmin/revenue");
    return res.data?.data ?? null;
  } catch (err) {
    console.error("fetchSuperAdminRevenue error:", err);
    return null;
  }
};

export const fetchSuperAdminAnalytics = async () => {
  try {
    const res = await axiosInstance.get("/superadmin/analytics");
    return res.data?.data ?? null;
  } catch (err) {
    console.error("fetchSuperAdminAnalytics error:", err);
    return null;
  }
};

export const fetchSaasSubscriptions = async () => {
  try {
    const res = await axiosInstance.get("/superadmin/subscriptions");
    return res.data?.data ?? [];
  } catch (err) {
    console.error("fetchSaasSubscriptions error:", err);
    return [];
  }
};

export const createSaasSubscription = async (payload) => {
  const res = await axiosInstance.post("/superadmin/subscription/create", payload);
  return res.data;
};

export const updateSaasSubscription = async (id, payload) => {
  const res = await axiosInstance.put(`/superadmin/subscription/${id}`, payload);
  return res.data;
};

