import { useState, useEffect } from "react"
import logo from '../assets/5f9312fea43b7381d2fe525c7b736dd8.jpg'
import { House, Folder, SquareCheck, Settings, LogOut, CircleUser, Clock, Clock8Icon, ClockAlert, CheckCircle2, ChevronRight } from 'lucide-react'

import '../pages/DashBoardPage.css'

import ProjectPage from "./ProjectPage.jsx";
import MyTaskPage from "./MyTaskPage.jsx";
import SettingsPage from "./SettingsPage.jsx";
import LoginPage from "./LoginPage.jsx";
import TaskChart from "../components/TaskChart.jsx";

import { getDashboard } from '../services/dashboardservice.js';
import { getProjects } from "../services/projectservice.js";
import { getTasksById } from "../services/taskservice.js";
import { handleLogout } from "../components/handlelogout.js";

function DashboardPage({ user, setUser }) {
    const [isProject, setIsProject] = useState(false);
    const [isMyTask, setIsMyTask] = useState(false);
    const [isSettings, setIsSettings] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    
    const [statisticDashboard, setStatisticDashboard] = useState(null);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        if (!user) {
            return;
        }

        async function fetchDashboard() {
            try {
                const data = await getDashboard(user, setUser);
                setStatisticDashboard(data);
            } catch (error) {
                alert(error.message);
            }
        }

        fetchDashboard();
    }, [user?.access_token]);

    useEffect(() => {
        if (!user) {
            return;
        }

        async function fetchProjects() {
            try {
                const data = await getProjects(user, setUser);

                const projectList = await Promise.all(
                    (data.items ?? []).map(async (project) => {
                        const taskData = await getTasksById(user, project.id, setUser);

                        return {
                            ...project,
                            taskCount: taskData.total ?? 0
                        };
                    })
                )

                setProjects(projectList);
            } catch (error) {
                alert(error.message);
            }
        }

        fetchProjects();
    }, [user?.access_token]);

    const activeProjects = [...projects]
        .sort((a, b) => b.taskCount - a.taskCount)
        .slice(0, 5);

    if (isLogin) {
        return <LoginPage />
    }

    if (isProject) {
        return <ProjectPage user={user} setUser={setUser}/>
    }

    if (isMyTask) {
        return <MyTaskPage user={user} setUser={setUser}/>
    }

    if (isSettings) {
        return <SettingsPage user={user} setUser={setUser}/>
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
                    <p className="side-bar-menu-selections-dashboard">
                        <House size={40} color="white"/>
                        <span>Dashboard</span>
                    </p>
                    <p className="side-bar-menu-selections" onClick={() => {setIsProject(true)}}>
                        <Folder size={40} color="white"/>
                        <span>Projects</span>
                    </p>
                    <p className="side-bar-menu-selections" onClick={() => {setIsMyTask(true)}}>
                        <SquareCheck size={40} color="white"/>
                        <span>My Tasks</span>
                    </p>
                    <p className="side-bar-menu-selections" onClick={() => {setIsSettings(true)}}>
                        <Settings size={40} color="white"/>
                        <span>Settings</span>
                    </p>
                    <p className="side-bar-menu-selections logout-selection" onClick={() => {handleLogout(setUser, setIsLogin)}}>
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
                                {statisticDashboard?.overdue_tasks}
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
                            <div className="recent-projects-headers">
                                <p className="recent-projects">
                                    Recent Projects
                                </p>
                                <button className="recent-projects-view-all" onClick={() => {setIsProject(true)}}>
                                    View all
                                </button>
                            </div>
                            {activeProjects.map((project) => (
                                <div key={project.id} className="recent-project-name-task-container">
                                    <p className="recent-project-name">
                                        {project.name}
                                    </p>
                                    <div className="recent-project-num-tasks-logo">
                                        <p className="recent-project-task">
                                            {project.taskCount} {project.taskCount > 1 ? "tasks" : "task"}
                                        </p>
                                        <button className="recent-project-logo" onClick={() => setIsProject(true)}>
                                            <ChevronRight />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="task-overview-container">
                            <p className="task-overview">
                                Task Overview
                            </p>
                            <TaskChart
                                statisticDashboard={statisticDashboard}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage

