import { useState, useEffect } from "react"
import logo from '../assets/5f9312fea43b7381d2fe525c7b736dd8.jpg'
import { House, Folder, SquareCheck, Settings, LogOut, CircleUser, Clock, Clock8Icon, ClockAlert, CheckCircle2 } from 'lucide-react'

import LoginPage from '../pages/LoginPage'
import '../pages/DashBoardPage.css'
import { getDashboard } from '../services/dashboardservice.js'

function DashboardPage({ user }) {
    const [isLogin, setIsLogin] = useState(false);
    const [statisticDashboard, setStatisticDashboard] = useState(null);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const data = await getDashboard(user);
                setStatisticDashboard(data);
            } catch (error) {
                alert(error.message);
            }
        }

        fetchDashboard();
    }, [user]);

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
                    <p className="side-bar-menu-selections">
                        <House size={40} color="white"/>
                        <span>Dashboard</span>
                    </p>
                    <p className="side-bar-menu-selections">
                        <Folder size={40} color="white"/>
                        <span>Projects</span>
                    </p>
                    <p className="side-bar-menu-selections">
                        <SquareCheck size={40} color="white"/>
                        <span>My Tasks</span>
                    </p>
                    <p className="side-bar-menu-selections">
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
                    <div className="greeting-dashboard">
                        Hello, {user?.name ?? "User"}!
                        <p className="greeting-subtitle">
                            Here's what's happening with your projects and tasks
                        </p>
                    </div>
                    <div className="statistic-dashboard">
                        <div className="total-projects-container">
                            <div className="total-projects-logo-container">
                                <Folder size={40} color="purple"/>
                            </div>
                            <p className="dashboard-title">
                                Total Projects
                            </p>
                            <p className="dashboard-count">
                                {statisticDashboard?.total_projects}
                            </p>
                        </div>
                        <div className="total-tasks-container">
                            <div className="total-tasks-logo-container">
                                <SquareCheck size={40} color="blue"/>
                            </div>
                            <p className="dashboard-title">
                                Total Tasks
                            </p>
                            <p className="dashboard-count">
                                {statisticDashboard?.total_tasks}
                            </p>
                        </div>
                        <div className="todo-tasks-container">
                            <div className="todo-tasks-logo-container">
                                <Clock size={40} color="orange"/>
                            </div>
                            <p className="dashboard-title">
                                To-do
                            </p>
                            <p className="dashboard-count">
                                {statisticDashboard?.todo_tasks}
                            </p>
                        </div>
                        <div className="in-progress-tasks-container">
                            <div className="in-progress-tasks-logo-container">
                                <Clock8Icon size={40} color="purple"/>
                            </div>
                            <p className="dashboard-title">
                                In Progress
                            </p>
                            <p className="dashboard-count">
                                {statisticDashboard?.in_progress_tasks}
                            </p>
                        </div>
                        <div className="overdue-tasks-container">
                            <div className="overdue-tasks-logo-container">
                                <ClockAlert size={40} color="red"/>
                            </div>
                            <p className="dashboard-title">
                                Overdue
                            </p>
                            <p className="dashboard-count">
                                {statisticDashboard?.done_tasks}
                            </p>
                        </div>
                        <div className="done-tasks-container">
                            <div className="done-tasks-logo-container">
                                <CheckCircle2 size={40} color="green"/>
                            </div>
                            <p className="dashboard-title">
                                Done
                            </p>
                            <p className="dashboard-count">
                                {statisticDashboard?.done_tasks}
                            </p>
                        </div>
                    </div>
                    <div className="projects-tasks-container">
                        <div className="projects-container">
                            <p className="recent-projects">
                                Recent Projects
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage

