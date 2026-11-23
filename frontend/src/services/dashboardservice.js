import { fetchAPI } from "./api.js";

const API_URL = import.meta.env.VITE_API_URL;

async function getDashboard(user, setUser) {
    const response = await fetchAPI(
        `${API_URL}/dashboard/summary`,
        {
            method: "GET",
            headers: {
                "Content-Type": "Application/json",
            }
        },
        user,
        setUser
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail);
    }

    return data;
}

export { getDashboard };