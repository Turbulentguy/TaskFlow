import { fetchAPI } from "./api.js";

const API_URL = import.meta.env.VITE_API_URL;

async function getMembers(user, project_id, setUser) {
    const response = await fetchAPI(
        `${API_URL}/projects/${project_id}/members`,
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

async function addMember(user, project_id, form, setUser) {
    const response = await fetchAPI(
        `${API_URL}/projects/${project_id}/members`,
        {
            method: "POST",
            headers: {
                "Content-Type": "Application/json",
            },
            body: JSON.stringify({
                email: form.email
            })
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

async function updateMember(user, project_id, user_id, setUser) {
    const response = await fetchAPI(
        `${API_URL}/projects/${project_id}/members/${user_id}`,
        {
            method: "PATCH",
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

async function deleteMember(user, project_id, user_id, setUser) {
    const response = await fetchAPI(
        `${API_URL}/projects/${project_id}/members/${user_id}`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "Application/json",
            }
        },
        user,
        setUser
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail);
    }

    return true;
} 

export { getMembers, addMember, updateMember, deleteMember }