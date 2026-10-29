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

async function editProject(user, project_id, form) {
    const response = await fetch(
        `${API_URL}/projects/${project_id}`,
        {
            method: "PATCH",
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

async function deleteProject(user, project_id) {
    const response = await fetch(
        `${API_URL}/project/${project_id}`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "Application/json",
                "Authorization": `Bearer ${user.access_token}`
            }
        }
    )

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail);
    }

    return true;
}

export { getProjects, createProject, editProject, deleteProject }