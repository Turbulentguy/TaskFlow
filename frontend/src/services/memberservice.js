const API_URL = import.meta.env.VITE_API_URL;

async function getMembers(user, project_id) {
    const response = await fetch(
        `${API_URL}/projects/${project_id}/members`,
        {
            method: "GET",
            headers: {
                "Content-Type": "Application/json",
                "Authorization": `Bearer ${user.access_token}`
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail);
    }

    return data;
}

export { getMembers }