import { API_BASE_URL } from "../../../../services/api.service";

export const API_BASE = API_BASE_URL;

const authHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const ownerAvailabilityAPI = {
    getVehicleAvailability: async (vehicleId: string, vechileType: string, startDate: string, endDate: string) => {
        const response = await fetch(
            `${API_BASE}/getVehicleAvailability?VechileId=${vehicleId}&vechileType=${vechileType}&startDate=${startDate}&endDate=${endDate}`
        );
        return response.json();
    },

    createNotAvailability: async (data: URLSearchParams) => {
        const response = await fetch(`${API_BASE}/createNotAvailability`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded", ...authHeaders() },
            body: data,
        });
        return {
            ok: response.ok,
            status: response.status,
            data: await response.json()
        };
    },

    updateNotAvailability: async (id: string, data: URLSearchParams) => {
        const response = await fetch(`${API_BASE}/updateNotAvailability/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/x-www-form-urlencoded", ...authHeaders() },
            body: data,
        });
        return {
            ok: response.ok,
            status: response.status,
            data: await response.json()
        };
    },

    deleteNotAvailability: async (id: string) => {
        const response = await fetch(`${API_BASE}/deleteNotAvailability/${id}`, {
            method: "DELETE",
            headers: { ...authHeaders() },
        });

        // Handle 204 No Content
        if (response.status === 204) {
            return { ok: true, status: 204, data: {} };
        }

        return {
            ok: response.ok,
            status: response.status,
            data: await response.json()
        };
    }
};
