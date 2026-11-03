const API_URL = import.meta.env.VITE_API_URL;

async function createTask(user, project_id, form) {
    const response = await fetch(
        `${API_URL}/projects/${project_id}/tasks`,
        {
            method: "POST",
            headers: {
                "Content-Type": "Application/json",
                "Authorization": `Bearer ${user.access_token}`
            },
            body: JSON.stringify({
                title: form.title,
                description: form.description,
                priority: form.priority,
                assignee_id: form.assignee_id,
                due_date: form.due_date
            })
        }
    );
    
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail);
    }

    return data;
}

export { createTask }