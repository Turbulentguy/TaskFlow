import { fetchAPI } from "./api.js";

const API_URL = import.meta.env.VITE_API_URL;

async function getComments(user, task_id, setUser) {
    const response = await fetchAPI(
        `${API_URL}/tasks/${task_id}/comments`,
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

async function addComment(user, task_id, form, setUser) {
    const response = await fetchAPI(
        `${API_URL}/tasks/${task_id}/comments`,
        {
            method: "POST",
            headers: {
                "Content-Type": "Application/json",
            },
            body: JSON.stringify({
                content: form.content
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

async function updateComment(user, comment_id, form, setUser) {
    const response = await fetchAPI(
        `${API_URL}/comments/${comment_id}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "Application/json",
            },
            body: JSON.stringify({
                content: form.content
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

async function deleteComment(user, comment_id, setUser) {
    const response = await fetchAPI(
        `${API_URL}/comments/${comment_id}`,
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

export { getComments, addComment, updateComment, deleteComment };