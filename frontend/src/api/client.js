const API_URL = "http://localhost:8080";

class ApiClient {
  constructor() {
    this.token = localStorage.getItem("token");
  }

  setToken(token) {
    this.token = token;

    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;

    const token = localStorage.getItem("token"); // ALWAYS fresh

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    console.log("📡 REQUEST:", {
      url,
      method: options.method,
      token: token ? "EXISTS" : "MISSING",
    });

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Session expired");
    }

    let data = null;

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      data = await response.json();
    }

    if (!response.ok) {
      throw new Error(
        data?.error || data?.message || `HTTP Error ${response.status}`,
      );
    }

    return data;
  }

  async getTasks() {
    const result = await this.request("/api/v1/tasks");
    return result?.tasks || result || [];
  }

  async createTask(taskData) {
    return this.request("/api/v1/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  }

  async getTask(id) {
    return this.request(`/api/v1/tasks/${id}`);
  }

  async updateTask(id, taskData) {
    return this.request(`/api/v1/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(id) {
    return this.request(`/api/v1/tasks/${id}`, {
      method: "DELETE",
    });
  }

  async login(credentials) {
    const data = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    console.log("LOGIN RESPONSE", data);

    if (data?.token) {
      this.setToken(data.token);
    }

    return data;
  }
  async register(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    try {
      await this.request("/auth/logout", {
        method: "POST",
      });
    } finally {
      this.setToken(null);
      localStorage.removeItem("user");
    }
  }
}

const api = new ApiClient();

export default api;
