import { logoutUser } from "../services/authservice.js";

async function handleLogout(setUser, setIsLogin) {
        try {
            await logoutUser();
            setUser(null);
            setIsLogin(true);
        } catch (error) {
            alert(error.message);
        } finally {
            setUser(null);
            setIsLogin(true);
        }
    }

export { handleLogout }