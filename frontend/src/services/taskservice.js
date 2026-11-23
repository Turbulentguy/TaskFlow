import { fetchAPI } from "./api.js";

const API_URL = import.meta.env.VITE_API_URL;

async function createTask(user, project_id, form, setUser) {
    const response = await fetchAPI(
        `${API_URL}/projects/${project_id}/tasks`,
        {
            method: "POST",
            headers: {
                "Content-Type": "Application/json",
            },
            body: JSON.stringify({
                title: form.title,
                description: form.description,
                priority: form.priority,
                assignee_id: form.assignee_id,
                due_date: form.due_date
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

async function getTasksById(user, project_id, setUser) {
    const response = await fetchAPI(
        `${API_URL}/projects/${project_id}/tasks`,
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

async function getTasks(user, setUser) {
    const response = await fetchAPI(
        `${API_URL}/tasks/me`,
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

async function updateTask(user, task_id, form, setUser) {
    const response = await fetchAPI(
        `${API_URL}/tasks/${task_id}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "Application/json",
            },

            body: JSON.stringify({
            title: form.title,
            description: form.description,
            priority: form.priority,
            status: form.status,
            assignee_id: form.assignee_id,
            due_date: form.due_date
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

async function deleteTask(user, task_id, setUser) {
    const response = await fetchAPI(
        `${API_URL}/tasks/${task_id}`,
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

export { createTask, getTasksById, getTasks, updateTask, deleteTask }