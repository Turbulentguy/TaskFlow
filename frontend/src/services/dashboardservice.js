const API_KEY = import.meta.env.VITE_API_URL;

async function getDashboard(user) {
    const response = await fetch(
        `${API_KEY}/dashboard/summary`,
        {
            method: "GET",
            headers: {
                "Content-Type": "Application/json",
                "Authorization": `Bearer ${user.access_token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail);
    }

    return data;
}

export { getDashboard };