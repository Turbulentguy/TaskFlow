import { fetchAPI } from "./api.js";

const API_URL = import.meta.env.VITE_API_URL;

async function userRename(user, newName, setUser) {
    const response = await fetchAPI(
        `${API_URL}/users/me`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "Application/json",
            },
            body: JSON.stringify({
                name: newName
            })
        },
        user,
        setUser
    );

    const data = await response.json();

    if(!response.ok) {
        throw new Error(data.detail);
    }

    return data;
}

async function changePassword(user, form, setUser) {
    const response = await fetchAPI(
        `${API_URL}/users/me/password`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "Application/json",
            },
            body: JSON.stringify({
                current_password: form.current_password,
                new_password: form.new_password
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

export { userRename, changePassword }