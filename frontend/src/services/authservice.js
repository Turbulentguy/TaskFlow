const API_URL = import.meta.env.VITE_API_URL;

async function registerUser(form) {
    const response = await fetch(
        `${API_URL}/auth/register`,
        {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify({
                name: form.name,
                email: form.email,
                password: form.password
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Registration failed");
    }

    return data;
}

async function loginUser(form) {
    const response = await fetch(
        `${API_URL}/auth/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "Application/x-www-form-urlencoded"
            },
            credentials: "include",
            body: new URLSearchParams({
                username: form.email,
                password: form.password
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Login failed");
    }

    return data;
}

async function logoutUser() {
    const response = await fetch(
        `${API_URL}/auth/logout`,
        {
            method: "POST",
            credentials: "include"
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail);
    }

    return data;
}

let restorePromise = null;

async function restoreSession() {
    if (restorePromise) {
        return restorePromise;
    }

    restorePromise = (async () => {
        const refreshResponse = await fetch(
            `${API_URL}/auth/refresh`,
            {
                method: "POST",
                credentials: "include"
            }
        );

        if (refreshResponse.status === 401) {
            return null;
        }

        const refreshData = await refreshResponse.json();

        if (!refreshResponse.ok) {
            throw new Error(
                refreshData.detail || "Session restoration failed."
            );
        }

        const userResponse = await fetch(
            `${API_URL}/auth/me`,
            {
                headers: {
                    "Authorization": `Bearer ${refreshData.access_token}`
                }
            }
        );

        if (!userResponse.ok) {
            throw new Error("Unable to retrieve user information.");
        }

        const userData = await userResponse.json();

        return {
            ...userData,
            access_token: refreshData.access_token
        };
    })();

    try {
        return await restorePromise;
    } finally {
        restorePromise = null;
    }
}

export { registerUser, loginUser, logoutUser, restoreSession };
