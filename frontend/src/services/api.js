const API_URL = import.meta.env.VITE_API_URL;

async function fetchAPI(url, options, user, setUser) {
    if (!user?.access_token) {
        throw new Error("Please login again.");
    }

    let response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            "Authorization": `Bearer ${user.access_token}`
        }
    });

    if (response.status === 401) {
        const refreshResponse = await fetch(
            `${API_URL}/auth/refresh`,
            {
                method: "POST",
                credentials: "include"
            }
        );

        if (!refreshResponse.ok) {
            throw new Error("Session expired. Please login again.");
        }

        const refreshData = await refreshResponse.json();

        setUser(previousUser => ({
            ...previousUser,
            access_token: refreshData.access_token
        }));

        response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                "Authorization": `Bearer ${refreshData.access_token}`
            }
        });
    }

    return response;
}

export { fetchAPI };