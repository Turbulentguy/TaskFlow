const API_URL = import.meta.env.VITE_API_URL

async function registerUser(form) {
    const response = await fetch(
        `${API_URL}/auth/register`,
        {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: form.name,
                email: form.email,
                password: form.password
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail | "Registration failed")
    }

    return data
}

async function loginUser(form) {
    const response = await fetch(
        `${API_URL}/auth/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "Application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                username: form.email,
                password: form.password
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Login failed")
    }

    return data
}

export { registerUser, loginUser }