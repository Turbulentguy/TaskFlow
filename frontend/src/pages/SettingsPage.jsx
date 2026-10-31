import { useState } from "react";
import logo from '../assets/5f9312fea43b7381d2fe525c7b736dd8.jpg';
import { House, Folder, SquareCheck, Settings, LogOut, CircleUser, User2, Check, Lock, LockKeyhole, Eye, EyeOff } from 'lucide-react'

import '../pages/DashBoardPage.css';
import '../pages/ProjectPage.css';
import '../pages/SettingsPage.css';

import DashboardPage from "./DashBoardPage.jsx";
import ProjectPage from "./ProjectPage.jsx";
import LoginPage from "./LoginPage.jsx";

import { userRename, changePassword } from "../services/userservice.js";

function SettingsPage({ user, setUser }) {
    const [isDashboard, setIsDashboard] = useState(false);
    const [isProject, setIsProject] = useState(false);
    const [isLogin, setIsLogin] = useState(false);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [userForm, setUserForm] = useState({
        name: ""
    });

    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: ""
    });

    function handleUserChange(event) {
        const { name, value } = event.target;

        setUserForm((previousForm) => ({
            ...previousForm,
            [name]: value
        }));
    }

    function handlePasswordChange(event) {
        const { name, value } = event.target;

        setPasswordForm((previousPasswordForm) => ({
            ...previousPasswordForm,
            [name]: value
        }));
    }

    async function handleUserSubmit(event) {
        event.preventDefault();

        const newName = userForm.name.trim();

        if (!newName) {
            alert("Please enter your name.");
            return;
        }

        if (newName === user.name) {
            alert("Your name has not changed.");
            return;
        }

        try {
            const data = await userRename(user, newName);

            alert("Name updated successfully!");

            setUser((previousUser) => ({
                ...previousUser,
                name: newName
            }));

            setUserForm({ name: "" });

        } catch (error) {
            alert(error.message);
        }
    }

    async function handlePasswordSubmit(event) {
        event.preventDefault();
        
        const { current_password, new_password, new_password_confirmation } = passwordForm;

        if (!current_password || !new_password || !new_password_confirmation) {
            alert("Please fill in all password fields.");
            return;
        }

        if (current_password === new_password) {
            alert("New password must be different from current password.");
            return;
        }

        if (new_password !== new_password_confirmation) {
            alert("New passwords do not match.");
            return;
        }

        try {
            await changePassword(user, passwordForm);

            alert("Password updated successfully!");

            setPasswordForm({
                current_password: "",
                new_password: "",
                new_password_confirmation: ""
            });

        } catch (error) {
            alert(error.message);
        }

    }

    if (isDashboard) {
        return <DashboardPage user={user} setUser={setUser}/>
    }

    if (isProject) {
        return <ProjectPage user={user}/>
    }

    if (isLogin) {
        return <LoginPage />
    }

    return (
        <div className="dashboard-layout">
                    <div className="left-container">
                        <div className="brand-container">
                            <img src={logo} alt="Logo" className="logo-dashboard"/>
                            <p className="brand-dashboard">
                                Jiraiya
                            </p>
                        </div>
                        <div className="side-bar-menu">
                            <p className="side-bar-menu-selections" onClick={() => {setIsDashboard(true)}}>
                                <House size={40} color="white"/>
                                <span>Dashboard</span>
                            </p>
                            <p className="side-bar-menu-selections" onClick={() => {setIsProject(true)}}>
                                <Folder size={40} color="white"/>
                                <span>Projects</span>
                            </p>
                            <p className="side-bar-menu-selections">
                                <SquareCheck size={40} color="white"/>
                                <span>My Tasks</span>
                            </p>
                            <p className="side-bar-menu-selections-settings">
                                <Settings size={40} color="white"/>
                                <span>Settings</span>
                            </p>
                            <p className="side-bar-menu-selections logout-selection" onClick={() => {setIsLogin(true)}}>
                                <LogOut size={40} color="white"/>
                                <span>Log Out</span>
                            </p>
                        </div>
                    </div>
                    <div className="right-container">
                        <div className="nav-bar-menu">
                            <div className="nav-bar-profile">
                                <CircleUser size={70} color="grey"/>
                                <span>{user?.name ?? "User"}</span>
                            </div>
                        </div>
                        <div className="main-dashboard">
                            <div className="settings-page-container">
                                <p className="settings-page-header-title">
                                    Settings
                                </p>
                                <p className="settings-page-header-subtitle">
                                    Manage your account and keep your workspace secure
                                </p>
                                <form onSubmit={handleUserSubmit} className="account-information-container">
                                        <User2 size={250} strokeWidth={0.5} className="account-information-logo"/>
                                        <div className="account-information-subcontainer">
                                            <p className="account-information-header-title">
                                                Account Information
                                            </p>
                                            <p className="account-information-header-subtitle">
                                                Update your display name
                                            </p>
                                            <div className="account-information-edit-container">
                                                <p className="account-information-name">
                                                    Name
                                                </p>
                                                <input type="text" className="account-information-input" placeholder={user.name} name="name" value={userForm.name} onChange={handleUserChange}/>
                                            </div>
                                        </div>
                                    <button className="account-information-save-change-button">
                                        <Check size={40} color="white"/>
                                        Save Changes
                                    </button>
                                </form>
                                <form className="change-password-container" onSubmit={handlePasswordSubmit}>
                                    <Lock size={80} strokeWidth={1.5} className="change-password-logo"/>
                                    <div className="change-password-subcontainer">
                                        <p className="change-password-header-title">
                                            Change Password
                                        </p>
                                        <p className="change-password-header-subtitle">
                                            Keep your account secure with <u>a new password</u>
                                        </p>
                                        <div className="current-password-container">
                                            <p className="current-password-title">
                                                Current Password
                                            </p>
                                            <div className="current-password-input-container">
                                                <input 
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    className="current-password-input" 
                                                    placeholder="Enter current password" 
                                                    name="current_password" 
                                                    value={passwordForm.current_password} 
                                                    onChange={handlePasswordChange}/>
                                                <button type="button" className="password-toggle-button" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                                    {showCurrentPassword ? <EyeOff /> : <Eye />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="new-password-container">
                                            <p className="new-password-title">
                                                New Password
                                            </p>
                                            <div className="new-password-input-container">
                                                <input 
                                                    type={showNewPassword ? "text" : "password"}
                                                    className="new-password-input" 
                                                    placeholder="Enter new password" 
                                                    name="new_password" 
                                                    value={passwordForm.new_password} 
                                                    onChange={handlePasswordChange}/>
                                                <button type="button" className="password-toggle-button" onClick={() => setShowNewPassword(!showNewPassword)}>
                                                    {showNewPassword ? <EyeOff /> : <Eye />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="confirm-password-container">
                                            <p className="confirm-password-title">
                                               <u>Confirm Password</u>
                                            </p>
                                            <div className="confirm-password-input-container">
                                                <input 
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    className="confirm-new-password-input" 
                                                    placeholder="Enter new password" 
                                                    name="new_password_confirmation" 
                                                    value={passwordForm.new_password_confirmation} 
                                                    onChange={handlePasswordChange}/>
                                                <button type="button" className="password-toggle-button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="update-password-button" type="submit">
                                        <LockKeyhole size={40}/>
                                        Update Password
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
        </div>         
    )
}

export default SettingsPage;