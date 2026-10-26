import { useState, useEffect } from "react";
import logo from '../assets/5f9312fea43b7381d2fe525c7b736dd8.jpg';
import { House, Folder, SquareCheck, Settings, LogOut, CircleUser, Plus, Search, Users, X, MoreVertical } from 'lucide-react';

import '../pages/DashBoardPage.css';
import '../pages/ProjectPage.css';

import DashboardPage from '../pages/DashBoardPage.jsx';
import LoginPage from "./LoginPage.jsx";

import { getProjects, createProject } from "../services/projectservice.js";
import { getMembers } from "../services/memberservice.js";

function ProjectPage({ user }) {
    const [isDashboard, setIsDashboard] = useState(false);
    const [isLogin, setIsLogin] = useState(false);

    const [addProject, setIsAddProject] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: ''
    });

    const [projects, setProjects] = useState([]);
    const [members, setMembers] = useState({});

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previousForm) => ({
            ...previousForm,
            [name]: value
        }))
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const data = await createProject(user, form);

            setProjects((previousProjects) => [
                ...previousProjects,
                data
            ]);

            setForm({
                name: '',
                description: ''
            });

            setIsAddProject(false);

        } catch (error) {
            console.log(error);
        }
    } 

    useEffect(() => {
        async function fetchProjects() {
            try {
                const data = await getProjects(user);
                setProjects(data.items ?? []);
            } catch (error) {
                error.message;
            }
        }

        fetchProjects();

    }, [user]);

    useEffect(() => {
        async function fetchMembers() {
            try {
                const memberByProject = {};

                for (const project of projects) {
                    const data = await getMembers(user, project.id);
                    memberByProject[project.id] = data.total;
                }

                setMembers(memberByProject)

            } catch (error) {
                error.message;
            }
        }

        if (user?.access_token && projects.length > 0) {
            fetchMembers();
        }

    }, [user, projects]);

    if (isDashboard) {
        return <DashboardPage user={user}/>
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
                    <p className="side-bar-menu-selections-project" onClick={() => {setIsProject(true)}}>
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
                    <div className="project-page-header">
                        <div className="greeting-dashboard">
                            Projects
                            <p className="greeting-subtitle">
                                Manage and track all your projects
                            </p>
                        </div>
                        <div className="nav-project-bar">
                            <div className="project-search-container">
                                <Search size={30} color="black" className="search-icon"/>
                                <input className="project-search" type="text" name="project-search" placeholder="Search projects..." />
                            </div>
                            <button className="new-project-button" onClick={() => {setIsAddProject(true)}}>
                                <Plus size={30} color="white" />
                                New Project
                            </button>
                        </div>
                    </div>
                    <div className="project-card-container">
                        {projects.map((project) => (
                            <div className="project-card" key={project.id}>
                                <div className="project-information">
                                    <div className="project-title-header">
                                        <p className="project-title">{project.name}</p>
                                        <MoreVertical size={30} className="project-three-dots"/>
                                    </div>
                                    <p className="project-description">
                                        {project.description}
                                    </p>
                                    <p className="project-members-container">
                                        <Users size={40}/>
                                        <span>{members[project.id] ?? 0} members</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {addProject && (
                <div className="create-project-overlay">
                    <div className="create-project-popup">
                        <div className="create-project-container">
                            <div className="create-project-header-title-and-close">
                                <p className="create-project-header-title">
                                    Create New Project
                                </p>
                                <X size={40} className="close" onClick={() => {setIsAddProject(false)}}/>
                            </div>
                            <p className="create-project-header-subtitle">
                                Create a new project and start collaborating
                                <br />
                                with your team.
                            </p>
                            <form onSubmit={handleSubmit}>
                                <p className="create-project-name">
                                    Project Name
                                </p>
                                <input type="text" name="name" value={form.name} onChange={handleChange} className="input-project-name" placeholder="Enter project name..." required/>
                                <p className="create-project-description">
                                    Description
                                </p>
                                <textarea className="input-project-description" name="description" value={form.description} onChange={handleChange} placeholder="Describe your project..." rows={7} required></textarea>
                                <div className="create-project-buttons-container">
                                    <button className="cancel-button" type="button" onClick={() => {setIsAddProject(false)}}>
                                        Cancel
                                    </button>
                                    <button className="create-project-button" type="submit">
                                        Create Project
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>           
                </div>
            )}
        </div> 
    )
}

export default ProjectPage