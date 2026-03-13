const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8000/api").replace(/\/$/, "");

export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => localStorage.setItem("token", token);
export const removeToken = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};

export const setUser = (user) => localStorage.setItem("user", JSON.stringify(user));
export const getUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};

export const fetchApi = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (e) {
    throw new Error("Network error: Backend not reachable (is Django running on :8000?)");
  }

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      window.location.href = "/login";
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const api = {
  login: async (username, password) => {
    const data = await fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (data.user) setUser(data.user);
    return data;
  },
  getMe: async () => {
    const data = await fetchApi("/auth/me", { method: "GET" });
    if (data.user) setUser(data.user);
    return data;
  },
  // Backend route is /api/interventions/create
  createIntervention: (data) => fetchApi("/interventions/create", {
      method: "POST",
      body: JSON.stringify(data)
  })
};
