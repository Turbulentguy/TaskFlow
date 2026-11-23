import { fetchAPI } from "./api.js";

const API_URL = import.meta.env.VITE_API_URL;

async function getProjects(user, setUser) {
    const response = await fetchAPI(
        `${API_URL}/projects`,
        {
            method: "GET",
            headers: {
                "Content-Type": "Application/json",
            },
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

async function createProject(user, form, setUser) {
    const response = await fetchAPI(
        `${API_URL}/projects`,
        {
            method: "POST",
            headers: {
                "Content-Type": "Application/json",
            },
            body: JSON.stringify({
                name: form.name,
                description: form.description
            }),
        },
        user,
        setUser,
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail);
    }

    return data;
}

async function editProject(user, project_id, form, setUser) {
    const response = await fetchAPI(
        `${API_URL}/projects/${project_id}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "Application/json",
            },
            body: JSON.stringify({
                name: form.name,
                description: form.description
            }),
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

async function deleteProject(user, project_id, setUser) {
    const response = await fetchAPI(
        `${API_URL}/project/${project_id}`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "Application/json",
            },
        },
        user,
        setUser
    )

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail);
    }

    return true;
}

export { getProjects, createProject, editProject, deleteProject }