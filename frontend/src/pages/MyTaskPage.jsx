import { useState, useEffect } from "react";
import logo from '../assets/5f9312fea43b7381d2fe525c7b736dd8.jpg';
import { House, Folder, SquareCheck, Settings, LogOut, CircleUser, Clock, Clock8Icon, ClockAlert, CheckCircle2, Plus, X, ChevronDown, Users, Flag, CalendarDays, MoreVertical, Pencil, RefreshCcw, Trash } from "lucide-react";

import '../pages/DashBoardPage.css';
import '../pages/ProjectPage.css';
import '../pages/MyTaskPage.css';
import '../pages/SettingsPage.css';

import DashboardPage from "./DashBoardPage.jsx";
import ProjectPage from "./ProjectPage.jsx";
import SettingsPage from "./SettingsPage.jsx";
import LoginPage from "./LoginPage.jsx";

import { getDashboard } from '../services/dashboardservice.js';
import { createTask, getTasks, updateTask, deleteTask } from "../services/taskservice.js";
import { getProjects } from "../services/projectservice.js";
import { getMembers } from "../services/memberservice.js";

function MyTaskPage({ user, setUser }) {
    const [isDashboard, setIsDashboard] = useState(false);
    const [isProject, setIsProject] = useState(false);
    const [isSettings, setIsSettings] = useState(false);
    const [isLogin, setIsLogin] = useState(false);

    const [projects, setProjects] = useState([]);
    const [members, setMembers] = useState([]);
    const [allMembers, setAllMembers] = useState([]);
    const [tasks, setTasks] = useState([]);

    const [selectedProjectId, setSelectedProjectId] = useState('');

    const [addTaskPopup, setAddTaskPopup] = useState(false);
    const [statisticDashboard, setStatisticDashboard] = useState(null);
    const [activeTaskMenu, setActiveTaskMenu] = useState(null);
    const [editTaskDetail, setEditTaskDetail] = useState(null);
    const [deleteTaskDetail, setDeleteTaskDetail] = useState(null); 
    const [projectMembers, setProjectMembers] = useState({});
    const [activeFilter, setActiveFilter] = useState("all")

    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        assignee_id: '',
        due_date: ''
    });

    const [editTaskForm, setEditTaskForm] = useState({
        title: '',
        description: '',
        priority: '',
        status: '',
        assignee_id: '',
        due_date: ''
    });

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

    useEffect(() => {
        async function fetchAllMembers() {
            try {
                const results = await Promise.all(
                    projects.map(async (project) => {
                        const data = await getMembers(user, project.id);

                        return {
                            projectId: project.id,
                            members: data.items ?? []
                        };
                    })
                );

                const memberMap = Object.fromEntries(
                    results.map((result) => [
                        result.projectId,
                        result.members
                    ])
                );

                setProjectMembers(memberMap);

                setAllMembers(
                    results.flatMap((result) => result.members)
                );

            } catch (error) {
                alert(error.message);
            }
    }

    if (projects.length > 0) {
        fetchAllMembers();
    }
}, [user, projects]);

    useEffect(() => {
        async function fetchTasks() {
            try {
                const data = await getTasks(user);
                setTasks(data.items ?? []);
            } catch (error) {
                alert(error.message);
            }
        }

        fetchTasks();
    }, [user]);

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
            await createTask(user, selectedProjectId, {
                ...taskForm,
                assignee_id: taskForm.assignee_id || null,
                due_date: taskForm.due_date || null
            });

            const updatedTasks = await getTasks(user);
            setTasks(updatedTasks.items ?? []);

            const updatedDashboard = await getDashboard(user);
            setStatisticDashboard(updatedDashboard);

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

    function handleEditTaskChange(event) {
        const { name, value } = event.target;

        setEditTaskForm((previousForm) => ({
            ...previousForm,
            [name]: value
        }));
    }

    async function handleEditTaskSubmit(event) {
        event.preventDefault();

        try {
            await updateTask(user, editTaskDetail.id, {
                ...editTaskForm,
                assignee_id: editTaskForm.assignee_id || null,
                due_date: editTaskForm.due_date || null
            });

            const updatedTasks = await getTasks(user);
            setTasks(updatedTasks.items ?? []);

            const updatedDashboard = await getDashboard(user);
            setStatisticDashboard(updatedDashboard);

            alert("Task updated successfully");

            setEditTaskDetail(null);

        } catch (error) {
            alert(error.message);
        }
    }

    function formatStatus(status) {
        const statusLabels = {
            todo: "To-do",
            in_progress: "In Progress",
            done: "Done"
        };

        return statusLabels[status] ?? status;
    }

    function canManageTask(task) {
        const isAssignee =
            String(task.assignee_id) === String(user.id);

        const isCreator =
            String(task.created_by) === String(user.id);

        const currentProjectMember = projectMembers[task.project_id]?.find(
            (member) => String(member.user_id) === String(user.id)
        );

        const isOwnerOrAdmin = ["Owner", "Admin"].includes(
            currentProjectMember?.role
        );

        return isOwnerOrAdmin || (isAssignee && isCreator);
    }

    async function handleDeleteTask() {
        if (!deleteTaskDetail) {
            return;
        }

        try {
            await deleteTask(user, deleteTaskDetail.id);

            const updatedTasks = await getTasks(user);
            setTasks(updatedTasks.items ?? []);

            const updatedDashboard = await getDashboard(user);
            setStatisticDashboard(updatedDashboard);

            setDeleteTaskDetail(null);
            setActiveTaskMenu(null);

            alert("Task deleted successfully");

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

    const filteredTasks = tasks.filter((task) => {
        if (activeFilter === "all") {
            return true;
        }

        if (activeFilter === "todo") {
            return task.status === "todo";
        }

        if (activeFilter === "in_progress") {
            return task.status === "in_progress"
        }

        if (activeFilter === "overdue") {
            return (
                task.status !== "done" &&
                task.due_date &&
                new Date(task.due_date) < new Date()
            );
        }

        if(activeFilter === "done") {
            return task.status === "done";
        }

        return true;
    })

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
                                <button className={`tasks-filter-all ${activeFilter === "all" ? "active" : ""}`} onClick={() => setActiveFilter("all")}>
                                    All Tasks
                                    <div className="number-of-tasks-filter-all">
                                        {statisticDashboard?.total_tasks}
                                    </div>
                                </button>
                                <button className={`tasks-filter-to-do ${activeFilter === "todo" ? "active" : ""}`} onClick={() => setActiveFilter("todo")}>
                                    To-do
                                    <div className="number-of-tasks-filter-to-do">
                                        {statisticDashboard?.todo_tasks}
                                    </div>
                                </button>
                                <button className={`tasks-filter-in-progress ${activeFilter === "in_progress" ? "active" : ""}`} onClick={() => setActiveFilter("in_progress")}>
                                    In Progress
                                    <div className="number-of-tasks-filter-in-progress">
                                        {statisticDashboard?.in_progress_tasks}
                                    </div>
                                </button>
                                <button className={`tasks-filter-overdue ${activeFilter === "overdue" ? "active" : ""}`} onClick={() => setActiveFilter("overdue")}>
                                    Overdue
                                    <div className="number-of-tasks-filter-overdue">
                                        {statisticDashboard?.overdue_tasks}
                                    </div>
                                </button>
                                <button className={`tasks-filter-done ${activeFilter === "done" ? "active" : ""}`} onClick={() => setActiveFilter("done")}>
                                    Done
                                    <div className="number-of-tasks-filter-done">
                                        {statisticDashboard?.done_tasks}
                                    </div>
                                </button>
                            </div>
                            <div className="tasks-section">
                                <div className="tasks-section-header-container">
                                    <p className="tasks-section-header-task">
                                        Task
                                    </p>
                                    <p className="tasks-section-header-project">
                                        Project
                                    </p>
                                    <p className="tasks-section-header-assignee">
                                        Assignee
                                    </p>
                                    <p className="tasks-section-header-priority">
                                        Priority
                                    </p>
                                    <p className="tasks-section-header-due-date">
                                        Due Date
                                    </p>
                                    <p className="tasks-section-header-status">
                                        Status
                                    </p>
                                </div>
                                <div className="tasks-section-tasks-container">
                                    {
                                        filteredTasks.map((task) => {
                                            const project = projects.find(
                                                (project) => project.id === task.project_id
                                            );

                                            const assignee = allMembers.find(
                                                (member) => member.user_id === task.assignee_id
                                            );

                                            return (
                                                <div key={task.id} className="tasks-section-task-container">
                                                    <div className="task-section-title-description-container">
                                                        <p className="tasks-section-task-title">
                                                            {task.title}
                                                        </p>
                                                        <p className="tasks-section-task-description">
                                                            {task.description}
                                                        </p>
                                                    </div>
                                                    <p className="tasks-section-task-project">
                                                        {project?.name}
                                                    </p>
                                                    <p className="tasks-section-task-assignee">
                                                        {assignee?.name ?? "Unassigned"}
                                                    </p>
                                                    <p className="tasks-section-task-priority">
                                                        {task.priority}
                                                    </p>
                                                    <p className="tasks-section-task-due-date">
                                                        {task.due_date 
                                                            ? new Date(task.due_date).toLocaleDateString()
                                                            : "No due date"
                                                        }
                                                    </p>
                                                    <p className="tasks-section-task-status">
                                                        {formatStatus(task.status)}
                                                    </p>
                                                    {canManageTask(task) && (
                                                        <button className="three-dot-task" onClick={() => {
                                                            setActiveTaskMenu(
                                                                activeTaskMenu === task.id ? null : task.id
                                                            )
                                                        }}>
                                                            <MoreVertical size={30}/>
                                                        </button>
                                                    )}
                                                    {
                                                        activeTaskMenu === task.id && (
                                                            <div className="task-features-container">
                                                                <button className="task-features-edit-button" onClick={() => {
                                                                    setEditTaskDetail(task);
                                                                    setSelectedProjectId(task.project_id);
                                                                    setEditTaskForm({
                                                                        title: task.title,
                                                                        description: task.description ?? '',
                                                                        status: task.status,
                                                                        priority: task.priority,
                                                                        assignee_id: task.assignee_id ?? '',
                                                                        due_date: task.due_date ? String(task.due_date).slice(0, 10) : ''
                                                                    });
                                                                    setActiveTaskMenu(null)
                                                                }}>
                                                                    <Pencil /> Edit Task
                                                                </button>
                                                                <button className="task-features-delete-task-button" onClick={() => {
                                                                    setDeleteTaskDetail(task);
                                                                }}>
                                                                    <Trash /> Delete Task
                                                                </button>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            );
                                        })
                                    }
                                </div>
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
                                        <option value="">Unassigned</option>
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
                            <button type="button" className="create-task-cancel-button" onClick={() => {setAddTaskPopup(false)}}>
                                Cancel
                            </button>
                            <button type="submit" className="create-task-create-task-button">
                                <Plus size={30}/>
                                <span>Create Task</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {editTaskDetail && (
            <div className="create-project-overlay">
                <div className="create-project-popup">
                    <form className="create-project-container" onSubmit={handleEditTaskSubmit}>
                        <div className="create-project-header-title-and-close">
                            <p className="create-project-header-title">
                                Edit Task
                            </p>
                            <X size={40} className="close" onClick={() => {setEditTaskDetail(null)}}/>
                        </div>
                        <p className="update-project-header-subtitle">
                            Update your task details
                        </p>
                        <p className="task-title-header">
                            Task Title
                        </p>
                        <input type="text" name="title" value={editTaskForm.title} onChange={handleEditTaskChange} className="task-edit-title" placeholder={editTaskDetail.title} required/>
                        <p className="task-description-header">
                            Description (Optional)
                        </p>
                        <textarea name="description" value={editTaskForm.description} onChange={handleEditTaskChange} className="task-edit-description" rows={3} placeholder={editTaskDetail.description}></textarea>
                        <div className="create-task-project-assignee-container">
                            <div className="create-task-assignee-container">
                                <div className="select-task-assignee-title">
                                    Assignee
                                </div>
                                <div className="select-assignee-container">
                                    <Users size={30}/>
                                    <select className="select-assignee"
                                        name="assignee_id"
                                        value={editTaskForm.assignee_id}
                                        onChange={handleEditTaskChange}>
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
                            <div className="create-task-status-container">
                                <div className="select-task-status-title">
                                    Status
                                </div>
                                <div className="select-status-container">
                                    <RefreshCcw size={30}/>
                                    <select
                                        className="select-status"
                                        name="status"
                                        value={editTaskForm.status}
                                        onChange={handleEditTaskChange}
                                        required
                                    >
                                        <option value="todo">To-do</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="done">Done</option>
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
                                        value={editTaskForm.priority}
                                        onChange={handleEditTaskChange}
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
                                            value={editTaskForm.due_date} 
                                            onChange={handleEditTaskChange} 
                                            className="select-due-date"/>
                                        <span className="due-date-placeholder">
                                            Select due date...
                                        </span>
                                    </div>
                                </div>
                                <div className="edit-task-buttons">
                                    <button type="button" className="edit-task-cancel-button" onClick={() => {setEditTaskDetail(null)}}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="edit-task-edit-task-button">
                                        <Plus size={30}/>
                                        <span>Edit Task</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {deleteTaskDetail && (
            <div className="create-project-overlay">
                <div className="delete-task-popup">
                    <div className="delete-task-container">
                        <Trash size={100} color="red" className="delete-task-icon"/>
                        <p className="delete-task-delete-popup-title">
                            Delete Task
                        </p>
                        <p className="delete-task-delete-popup-subtitle">
                            Are you sure you want to delete
                            <br className="delete-task-delete-popup-task"/>
                            "{deleteTaskDetail.title}"?
                        </p>
                    </div>
                    <div className="delete-task-buttons">
                        <button type="button" className="delete-task-cancel-button" onClick={() => {setDeleteTaskDetail(null)}}>
                            Cancel
                        </button>
                        <button type="submit" className="delete-task-delete-button" onClick={handleDeleteTask}>
                            Delete
                        </button>
                    </div>
                </div>
            </div>    
        )}
        </div>
    );
}

export default MyTaskPage;