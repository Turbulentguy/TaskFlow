import { useState, useEffect } from "react";
import logo from '../assets/5f9312fea43b7381d2fe525c7b736dd8.jpg';
import { House, Folder, SquareCheck, Settings, LogOut, CircleUser, Clock, Clock8Icon, ClockAlert, CheckCircle2, Plus, X, ChevronDown, Users, Flag, CalendarDays } from "lucide-react";

import '../pages/DashBoardPage.css';
import '../pages/ProjectPage.css';
import '../pages/MyTaskPage.css';
import '../pages/SettingsPage.css';

import DashboardPage from "./DashBoardPage.jsx";
import ProjectPage from "./ProjectPage.jsx";
import SettingsPage from "./SettingsPage.jsx";
import LoginPage from "./LoginPage.jsx";

import { getDashboard } from '../services/dashboardservice.js';
import { createTask } from "../services/taskservice.js";
import { getProjects } from "../services/projectservice.js";
import { getMembers } from "../services/memberservice.js";

function MyTaskPage({ user, setUser }) {
    const [isDashboard, setIsDashboard] = useState(false);
    const [isProject, setIsProject] = useState(false);
    const [isSettings, setIsSettings] = useState(false);
    const [isLogin, setIsLogin] = useState(false);

    const [projects, setProjects] = useState([]);
    const [members, setMembers] = useState([]);

    const [selectedProjectId, setSelectedProjectId] = useState('');

    const [addTaskPopup, setAddTaskPopup] = useState(false);
    const [statisticDashboard, setStatisticDashboard] = useState(null);

    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        assignee_id: '',
        due_date: ''
    })

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

    useEffect(() => {
        async function fetchProjects() {
            try {
                const data = await getProjects(user);
                setProjects(data.items ?? []);
            } catch (error) {
                alert(error.message);
            }
        }

        fetchProjects();
    }, [user]);

    useEffect(() => {
        async function fetchProjectMembers() {
            if (!selectedProjectId) {
                setMembers([]);
                return;
            }

            try {
                const data = await getMembers(user, selectedProjectId);
                setMembers(data.items ?? []);
            } catch (error) {
                alert(error.message);
            }
        }

        fetchProjectMembers();
    }, [user, selectedProjectId]);

    function handleAddTaskChange(event) {
        const { name, value } = event.target;

        setTaskForm((previousForm) => ({
            ...previousForm,
            [name]: value
        }));
    }

    async function handleAddTaskSubmit(event) {
        event.preventDefault();

        try {
            const data = await createTask(user, selectedProjectId, {
                ...taskForm,
                assignee_id: taskForm.assignee_id || null,
                due_date: taskForm.due_date || null
            });

            alert("Task created successfully");

            setTaskForm({
                title: '',
                description: '',
                priority: 'Medium',
                assignee_id: '',
                due_date: ''
            });

            setSelectedProjectId('');
            setAddTaskPopup(false);

        } catch (error) {
            alert(error.message);
        }
    }

    const currentMember = members.find(
        (member) => member.user_id === user.id
    );

    const isAdmin = ["Owner", "Admin"].includes(currentMember?.role);

    const availableAssignees = isAdmin
        ? members
        : members.filter(
            (member) => member.user_id === user.id
        );

    if (isDashboard) {
        return <DashboardPage user={user} setUser={setUser}/>
    }

    if (isProject) {
        return <ProjectPage user={user}/>
    }

    if (isSettings) {
        return <SettingsPage user={user}/>
    }

    if (isLogin) {
        return <LoginPage/>
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
                    <p className="side-bar-menu-selections-my-task">
                        <SquareCheck size={40} color="white"/>
                        <span>My Tasks</span>
                    </p>
                    <p className="side-bar-menu-selections" onClick={() => {setIsSettings(true)}}>
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
                    <div className="my-task-page-header">
                        <div className="my-task-page-container">
                            <p className="greeting-dashboard">
                                My Tasks
                            </p>
                            <button className="new-task-button" onClick={() => {setAddTaskPopup(true)}}>
                                <Plus size={30} color="white" />
                                New Task
                            </button>
                        </div>
                        <p className="my-task-subtitle">
                            Track and manage your assigned tasks
                        </p>
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
                            <div className="tasks-filter-container">
                                <button className="tasks-filter-all">
                                    All Tasks
                                    <div className="number-of-tasks-filter-all">
                                        {statisticDashboard?.total_tasks}
                                    </div>
                                </button>
                                <button className="tasks-filter-to-do">
                                    To-do
                                    <div className="number-of-tasks-filter-to-do">
                                        {statisticDashboard?.todo_tasks}
                                    </div>
                                </button>
                                <button className="tasks-filter-in-progress">
                                    In Progress
                                    <div className="number-of-tasks-filter-in-progress">
                                        {statisticDashboard?.in_progress_tasks}
                                    </div>
                                </button>
                                <button className="tasks-filter-overdue">
                                    Overdue
                                    <div className="number-of-tasks-filter-overdue">
                                        {statisticDashboard?.overdue_tasks}
                                    </div>
                                </button>
                                <button className="tasks-filter-done">
                                    Done
                                    <div className="number-of-tasks-filter-done">
                                        {statisticDashboard?.done_tasks}
                                    </div>
                                </button>
                            </div>
                    </div>
                </div>
            </div>
        {addTaskPopup && (
            <div className="create-task-overlay">
                <div className="create-task-popup">
                    <div className="create-task-popup-header">
                        <div className="create-task-title-container">
                            <Plus size={40} className="create-task-logo"/>
                            <p className="create-task-title">
                                Create New Task
                            </p>
                        </div>
                        <div className="create-task-container">
                            <X size={40} className="close" onClick={() => {setAddTaskPopup(false)}}/>
                        </div>
                    </div>
                    <form onSubmit={handleAddTaskSubmit} className="create-task-details-container">
                        <div className="create-task-title-title">
                            Task Title 
                        </div>
                        <input type="text" 
                            name="title"
                            value={taskForm.title}
                            onChange={handleAddTaskChange}
                            className="create-task-title-input" 
                            placeholder="Enter task title..." 
                            required/>
                        <div className="create-task-description-title">
                            Description (Optional)
                        </div>
                        <textarea placeholder="Add more details about this task..." 
                            name="description"
                            value={taskForm.description}
                            onChange={handleAddTaskChange}
                            className="create-task-description-input" 
                            rows={3}></textarea>
                        <div className="create-task-project-assignee-container">
                            <div className="create-task-project-container">
                                <div className="select-task-project-title">
                                    Project
                                </div>
                                <div className="select-project-container">
                                    <Folder size={30}/>
                                    <select className="select-project" 
                                        value={selectedProjectId} 
                                        onChange={(event) => {
                                            setSelectedProjectId(event.target.value);

                                            setTaskForm((previousForm) => ({
                                                ...previousForm,
                                                assignee_id: ''
                                            }));
                                        }}
                                        required>
                                        <option value="">Select project...</option> 
                                        {
                                            projects.map((project) => (
                                                <option key={project.id} value={project.id}>
                                                    {project.name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                    <ChevronDown size={20} className="chevron-down"/>
                                </div>
                            </div>
                            <div className="create-task-assignee-container">
                                <div className="select-task-assignee-title">
                                    Assignee
                                </div>
                                <div className="select-assignee-container">
                                    <Users size={30}/>
                                    <select className="select-assignee"
                                        name="assignee_id"
                                        value={taskForm.assignee_id}
                                        onChange={handleAddTaskChange}>
                                        <option value="">Assign to...</option>
                                        {
                                            availableAssignees.map((member) => 
                                                <option key={member.user_id} value={member.user_id}>
                                                    {member.name}
                                                </option>
                                            )
                                        }
                                    </select>
                                    <ChevronDown size={20} className="chevron-down"/>
                                </div>
                            </div>
                        </div>
                        <div className="create-task-priority-due-date-container">
                            <div className="create-task-priority-container">
                                <div className="select-task-priority-title">
                                    Priority
                                </div>
                                <div className="select-priority-container">
                                    <Flag size={30}/>
                                    <select name="priority"
                                        value={taskForm.priority}
                                        onChange={handleAddTaskChange}
                                        className="select-priority">
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                    <ChevronDown size={20} className="chevron-down"/>
                                </div>
                            </div>
                            <div className="create-task-due-date-container">
                                <div className="select-task-due-date-title">
                                    Due Date
                                </div>
                                <div className="select-due-date-container">
                                    <CalendarDays size={30}/>
                                    <div className="due-date-input-wrapper">
                                        <input type="date" 
                                            name="due_date" 
                                            value={taskForm.due_date} 
                                            onChange={handleAddTaskChange} 
                                            className="select-due-date"/>
                                        <span className="due-date-placeholder">
                                            Select due date...
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="create-task-buttons">
                            <button className="create-task-cancel-button" onClick={() => {setAddTaskPopup(false)}}>
                                Cancel
                            </button>
                            <button className="create-task-create-task-button">
                                <Plus size={30}/>
                                <span>Create Task</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </div>
    );
}

export default MyTaskPage;