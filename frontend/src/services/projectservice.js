const API_URL = import.meta.env.VITE_API_URL;

async function getProjects(user) {
    const response = await fetch(
        `${API_URL}/projects`,
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

async function createProject(user, form) {
    const response = await fetch(
        `${API_URL}/projects`,
        {
            method: "POST",
            headers: {
                "Content-Type": "Application/json",
                "Authorization": `Bearer ${user.access_token}`
            },
            body: JSON.stringify({
                name: form.name,
                description: form.description
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail);
    }

    return data;
}

export { getProjects, createProject }