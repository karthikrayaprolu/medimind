const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Session token management for mobile apps (Capacitor)
const SESSION_KEY = "medimind-session-token";

export const getSessionToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
};

export const setSessionToken = (token: string): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_KEY, token);
  } catch (e) {
    console.error("Failed to save session token", e);
  }
};

export const clearSessionToken = (): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error("Failed to clear session token", e);
  }
};

// Get auth headers for API requests
export const getAuthHeaders = (): HeadersInit => {
  const token = getSessionToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  email: string;
  password: string;
  fullName?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user_id: string;
  email: string;
  fullName?: string;
  session_id?: string;
  error?: string;
}

interface Schedule {
  _id: string;
  user_id: string;
  prescription_id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  timings: string[];
  enabled: boolean;
  created_at: string;
}

interface Prescription {
  _id: string;
  user_id: string;
  raw_text: string;
  structured_data: string;
  created_at: string;
}

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.detail || "Login failed");
    }

    // Store session token for mobile apps
    if (result.session_id) {
      setSessionToken(result.session_id);
    }

    return result;
  },

  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.detail || "Signup failed");
    }

    // Store session token for mobile apps
    if (result.session_id) {
      setSessionToken(result.session_id);
    }

    return result;
  },

  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    // Clear session token regardless of response
    clearSessionToken();

    if (!response.ok) {
      throw new Error("Logout failed");
    }
  },

  async me(): Promise<{ user_id: string; email: string; fullName?: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user info");
    }

    return response.json();
  },

  async updateFcmToken(token: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/auth/fcm-token`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ fcm_token: token }),
    });

    if (!response.ok) {
      throw new Error("Failed to update FCM token");
    }

    return response.json();
  },
};

export const prescriptionApi = {
  async uploadPrescription(file: File, userId: string): Promise<{
    success: boolean;
    prescription_id: string;
    schedule_ids: string[];
    medicines: unknown[];
    message: string;
    schedules_created?: number;
    medicines_detected?: number;
    quality_warnings?: string[];
    quality_metrics?: {
      width?: number;
      height?: number;
      file_size_kb?: number;
      aspect_ratio?: number;
      brightness?: number;
    };
    enrichment_stats?: {
      enabled: boolean;
      total_medicines: number;
      enriched_count: number;
      skipped_count: number;
      failed_count: number;
      enriched_medicines: Array<{
        name: string;
        fields_added: string[];
        confidence: string;
      }>;
    };
    raw_text_preview?: string;
    suggestions?: string[];
  }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", userId);

    const token = getSessionToken();
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/upload-prescription`, {
      method: "POST",
      headers,
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      // Create detailed error with backend information
      const error: any = new Error(result.message || result.error || result.detail || "Upload failed");
      error.details = result;
      throw error;
    }

    return result;
  },

  async getUserSchedules(userId: string): Promise<Schedule[]> {
    const response = await fetch(`${API_BASE_URL}/api/user/${userId}/schedules`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch schedules");
    }

    return response.json();
  },

  async getUserPrescriptions(userId: string): Promise<Prescription[]> {
    const response = await fetch(`${API_BASE_URL}/api/user/${userId}/prescriptions`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch prescriptions");
    }

    return response.json();
  },

  async toggleSchedule(scheduleId: string, enabled: boolean): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/toggle-schedule`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ schedule_id: scheduleId, enabled }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.detail || "Toggle failed");
    }

    return result;
  },

  async deleteSchedule(scheduleId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/schedule/${scheduleId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.detail || "Delete failed");
    }

    return result;
  },

  async updateSchedule(
    scheduleId: string,
    data: {
      medicine_name?: string;
      dosage?: string;
      frequency?: string;
      timings?: string[];
    }
  ): Promise<{ success: boolean; message: string; schedule: Schedule }> {
    const response = await fetch(`${API_BASE_URL}/api/schedule/${scheduleId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.detail || "Update failed");
    }

    return result;
  },

  async clearHistory(userId: string): Promise<{ success: boolean; message: string; prescriptions_deleted: number; schedules_deleted: number }> {
    const response = await fetch(`${API_BASE_URL}/api/user/${userId}/prescriptions`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.detail || "Clear history failed");
    }

    return result;
  },
};
