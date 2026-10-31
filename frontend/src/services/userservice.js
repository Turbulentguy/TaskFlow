const API_URL = import.meta.env.VITE_API_URL;

async function userRename(user, newName) {
    const response = await fetch(
        `${API_URL}/users/me`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "Application/json",
                "Authorization": `Bearer ${user.access_token}`
            },
            body: JSON.stringify({
                name: newName
            })
        }
    );

    const data = await response.json();

    if(!response.ok) {
        throw new Error(data.detail);
    }

    return data;
}

async function changePassword(user, form) {
    const response = await fetch(
        `${API_URL}/users/me/password`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "Application/json",
                "Authorization": `Bearer ${user.access_token}`
            },
            body: JSON.stringify({
                current_password: form.current_password,
                new_password: form.new_password
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail);
    }

    return data;
}

export { userRename, changePassword }