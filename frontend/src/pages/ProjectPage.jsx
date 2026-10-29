import { useState, useEffect } from "react";
import logo from '../assets/5f9312fea43b7381d2fe525c7b736dd8.jpg';
import { House, Folder, SquareCheck, Settings, LogOut, CircleUser, Plus, Search, Users, X, MoreVertical, Check, Trash } from 'lucide-react';

import '../pages/DashBoardPage.css';
import '../pages/ProjectPage.css';

import DashboardPage from '../pages/DashBoardPage.jsx';
import LoginPage from "./LoginPage.jsx";

import { getProjects, createProject, editProject, deleteProject } from "../services/projectservice.js";
import { getMembers, addMember, updateMember, deleteMember } from "../services/memberservice.js";

function ProjectPage({ user }) {
    const [isDashboard, setIsDashboard] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [addProject, setIsAddProject] = useState(false);

    const [activeMenuId, setActiveMenuId] = useState(null);
    const [manageMember, setManageMember] = useState(null);
    const [activeMemberMenuId, setActiveMemberMenuId] = useState(null);
    const [editProjectDetail, setEditProjectDetail] = useState(null);
    const [deleteProjectDetail, setDeleteProjectDetail] = useState(null);
    const [search, setSearch] = useState('');

    const [form, setForm] = useState({
        name: '',
        description: ''
    });

    const [memberForm, setMemberForm] = useState({
        email: ''
    });

    const [editProjectForm, setEditProjectForm] = useState({
        name: '',
        description: ''
    });

    const [projects, setProjects] = useState([]);
    const [members, setMembers] = useState({});

    function handleProjectChange(event) {
        const { name, value } = event.target;

        setForm((previousForm) => ({
            ...previousForm,
            [name]: value
        }))
    }

    function handleMemberChange(event) {
        const { name, value } = event.target;

        setMemberForm((previousForm) => ({
            ...previousForm,
            [name]: value
        }))
    }

    function handleEditProjectChange(event) {
        const {name, value} = event.target;

        setEditProjectForm((previousForm) => ({
            ...previousForm,
            [name]: value
        }))
    }

    async function handleProjectSubmit(event) {
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

    async function handleMemberSubmit(event) {
        event.preventDefault();

        try {
            const email = memberForm.email.trim().toLowerCase();

            if (!email) {
                alert("Please enter an email.");
                return;
            }

            const currentMembers = members[manageMember.id]?.items ?? [];

            const isAlreadyMember = currentMembers.some(
                (member) => member.email?.toLowerCase() === email
            );

            if (isAlreadyMember) {
                alert("This user is already a member of this project.");
                return;
            }

            await addMember(user, manageMember.id, {
                email
            });

            const data = await getMembers(user, manageMember.id);

            setMembers((previousMember) => ({
                ...previousMember,
                [manageMember.id]: data
            }));

            setMemberForm({
                email: ''
            });

            setActiveMenuId(null);

        } catch (error) {
            console.log(error);
        }
    }

    async function handleEditProjectSubmit(event) {
        event.preventDefault();

        try {
            const data = await editProject(user, editProjectDetail.id, editProjectForm);

            setProjects((previousProjects) =>
                previousProjects.map((project) =>
                project.id === editProjectDetail.id
                    ? { ...project, ...data }
                    : project
            ));

            setEditProjectDetail(null);

        } catch (error) {
            alert(error.message);
        }
    }

    async function handleDeleteProject() {
        if (!deleteProjectDetail) {
            return;
        }

        if (!window.confirm(`Are you sure you want to delete "${deleteProjectDetail.name}"? This action cannot be undone, and all tasks, comments, and project members associated with this project will be permanently deleted.`)) {
            return;
        }

        try {

            await deleteProject(user, deleteProjectDetail.id);

            setProjects((previousProjects) =>
                previousProjects.filter(
                    (project) => project.id !== deleteProjectDetail.id
                )
            );

            setDeleteProjectDetail(null);

            setMembers((previousMembers) => {
                const updatedMembers = { ...previousMembers };
                delete updatedMembers[deleteProjectDetail.id];
                return updatedMembers;
            });

        } catch (error) {
            alert(error.message);
        }
    }
    
    async function handleChangeRole(member) {
        try {
            const data = await updateMember(user, manageMember.id, member.user_id);

            setMembers((previousMembers) => ({
                ...previousMembers,
                [manageMember.id]: data
            }));

            setActiveMemberMenuId(null);

        } catch (error) {
            alert(error.message);
        }
    }

    async function handleDeleteMember(member) {
        if (!window.confirm(`Remove ${member.name} from this project?`)) {
            return;
        }
        
        try {
            await deleteMember(user, manageMember.id, member.user_id);

            const data = await getMembers(user, manageMember.id);

            setMembers((previousMembers) => ({
                ...previousMembers,
                [manageMember.id]: data
            }));

            setActiveMemberMenuId(null);

        } catch (error) {
            alert(error.message);
        }
    }

    function handleSearch(event) {
        setSearch(event.target.value);
    }

    const filteredProjects = projects.filter((project) =>
        project.name.toLowerCase().includes(search.trim().toLowerCase())
    );

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
                    memberByProject[project.id] = data;
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
                    <p className="side-bar-menu-selections-project">
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
                                <input className="project-search" type="text" name="project-search" value={search} onChange={handleSearch} placeholder="Search projects..." />
                            </div>
                            <button className="new-project-button" onClick={() => {setIsAddProject(true)}}>
                                <Plus size={30} color="white" />
                                New Project
                            </button>
                        </div>
                    </div>
                    <div className="project-card-container">
                        {filteredProjects.map((project) => (
                            <div className="project-card" key={project.id}>
                                <div className="project-information">
                                    <div className="project-title-header">
                                        <p className="project-title">{project.name}</p>
                                        
                                    {(
                                        project.owner_id === user.id ||
                                        members[project.id]?.items?.some(
                                            (member) =>
                                                member.user_id === user.id &&
                                                member.role === "Admin"
                                        )
                                    ) && (
                                        <>
                                            <button
                                                className="project-three-dots"
                                                onClick={() => {
                                                    setActiveMenuId(
                                                        activeMenuId === project.id ? null : project.id
                                                    );
                                                }}
                                            >
                                                <MoreVertical size={30} />
                                            </button>

                                            {activeMenuId === project.id && (
                                                <div className="active-menu-container">
                                                    <button
                                                        className="active-menu-manage-members"
                                                        onClick={() => {
                                                            setManageMember(project);
                                                            setActiveMenuId(null);
                                                        }}
                                                    >
                                                        Manage Members
                                                    </button>

                                                    <button
                                                        className="active-menu-edit-project"
                                                        onClick={() => {
                                                            setEditProjectDetail(project);
                                                            setEditProjectForm({
                                                                name: project.name ?? "",
                                                                description: project.description ?? ""
                                                            });
                                                            setActiveMenuId(null);
                                                        }}
                                                    >
                                                        Edit Project
                                                    </button>

                                                    <button
                                                        className="active-menu-delete-project"
                                                        onClick={() => {
                                                            setDeleteProjectDetail(project);
                                                            setActiveMenuId(null);
                                                        }}
                                                    >
                                                        Delete Project
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    </div>

                                    <p className="project-description">
                                        {project.description}
                                    </p>
                                    <p className="project-members-container">
                                        <Users size={40}/>
                                        <span>{(members[project.id]?.total ?? 0) === 1 ? '1 member' : `${members[project.id]?.total} members`} </span>
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
                            <form onSubmit={handleProjectSubmit}>
                                <p className="create-project-name">
                                    Project Name
                                </p>
                                <input type="text" name="name" value={form.name} onChange={handleProjectChange} className="input-project-name" placeholder="Enter project name..." required/>
                                <p className="create-project-description">
                                    Description
                                </p>
                                <textarea className="input-project-description" name="description" value={form.description} onChange={handleProjectChange} placeholder="Describe your project..." rows={7} required></textarea>
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

            {manageMember && (
                <div className="create-project-overlay">
                    <div className="create-project-popup">
                        <div className="create-project-container">
                            <div className="create-project-header-title-and-close">
                                <p className="create-project-header-title">
                                    Manage Members
                                </p>
                                <X size={40} className="close" onClick={() => {setManageMember(null)}}/>
                            </div>
                            <div className="create-project-header-subtitle">
                                <p className="project-title">
                                    {manageMember.name}
                                </p>
                                <p className="project-description">
                                    {manageMember.description}
                                </p>
                            </div>
                            <div className="project-members-header-container">
                                <p className="project-members-header">
                                    Project Members
                                </p>
                                <p className="number-project-members-container">
                                    <Users size={30}/>
                                    <span className="number-project-members">
                                        {(members[manageMember.id]?.total ?? 0) === 1 ? '1 member' : `${members[manageMember.id]?.total ?? 0} members`}
                                    </span>
                                </p>
                            </div>
                            <div className="project-members-scroll">
                                <div className="project-members-list-container">
                                    <CircleUser className="project-member-list-logo" size={60}/>
                                        <div className="project-owner-name">
                                            {members[manageMember.id]?.items?.find((member) => member.user_id === manageMember.owner_id)?.name ?? "Owner not found"}
                                            <div className="project-owner-role">
                                                Owner
                                            </div>
                                        </div>
                                </div>
                                {members[manageMember.id]?.items
                                ?.filter((member) => member.user_id !== manageMember.owner_id)
                                .map((member) => (
                                    <div
                                        className="project-members-list-container"
                                        key={member.user_id}
                                    >
                                        <CircleUser
                                            className="project-member-list-logo"
                                            size={60}
                                        />

                                        <div className="project-owner-name">
                                            {member.name}

                                            <div className="project-owner-role">
                                                {member.role}
                                            </div>
                                        </div>
                                        {manageMember.owner_id === user.id && (
                                        <button
                                            className="project-member-three-dot"
                                            type="button"
                                            onClick={() => {
                                            setActiveMemberMenuId(
                                                activeMemberMenuId === member.user_id
                                                ? null
                                                : member.user_id
                                            );
                                            }}
                                        >
                                            <MoreVertical size={24} />
                                        </button>
                                        )}
                                        {
                                            activeMemberMenuId === member.user_id && (
                                                <div className="active-member-menu-container">
                                                    <button className="active-member-menu-change-role" onClick={() => handleChangeRole(member)}>
                                                        Change Role
                                                    </button>
                                                    <button className="active-member-menu-remove-member" onClick={() => handleDeleteMember(member)}>
                                                        Remove Member
                                                    </button>
                                                </div>
                                            )
                                        }
                                    </div>
                                ))}
                            </div>
                            <div className="add-members-header">
                                Add Members
                            </div>
                            <div className="add-members-subtitle">
                                Invite team members to collaborate on this project.
                            </div>
                            <form onSubmit={handleMemberSubmit}>
                                <div className="add-member-input-container">
                                    <input name="email" onChange={handleMemberChange} value={memberForm.email} type="text" className="add-members-input" placeholder="Search by name or email..."/>
                                    <button className="add-members-button">
                                        Add
                                    </button>
                                </div>
                                <button className="add-members-cancel-button" type="button" onClick={() => {
                                    setManageMember(null);
                                    setMemberForm({ email: '' });
                                }}>
                                    Close
                                </button>
                            </form>
                        </div>
                    </div>           
                </div>
            )}
            {editProjectDetail && (
                <div className="create-project-overlay">
                    <div className="create-project-popup">
                        <div className="create-project-container">
                            <div className="create-project-header-title-and-close">
                                <p className="create-project-header-title">
                                    Edit Project
                                </p>
                                <X size={40} className="close" onClick={() => {setEditProjectDetail(null)}}/>
                            </div>
                            <p className="update-project-header-subtitle">
                                Update your project details and keep your team
                                <br />
                                informed.
                            </p>
                            <form onSubmit={handleEditProjectSubmit}>
                                <p className="project-members-header">
                                    Project Name
                                </p>
                                <input type="text" name="name" value={editProjectForm.name} onChange={handleEditProjectChange} className="edit-project-name" placeholder={editProjectDetail.name} />
                                <p className="project-members-header">
                                    Description
                                </p>
                                <textarea name="description" value={editProjectForm.description} onChange={handleEditProjectChange} className="edit-project-description" placeholder={editProjectDetail.description} rows={5}></textarea>
                                <div className="edit-project-buttons">
                                        <button className="cancel-edit-project-button" type="button" onClick={() => setEditProjectDetail(null)}>
                                            Cancel
                                        </button>
                                        <button className="edit-project-save-change-button" type="submit">
                                            <Check size={40}/> Save Change
                                        </button>
                                </div>
                            </form>
                            </div>
                        </div>
                    </div>
            )}
            {
                deleteProjectDetail && (
                    <div className="create-project-overlay">
                        <div className="create-project-popup">
                            <div className="create-project-container">
                                <X size={40} className="close" onClick={() => {setDeleteProjectDetail(null)}}/>
                            </div>
                            <div className="delete-project-detail">
                                <Trash className="delete-project-logo" color="red"/>
                                <div className="delete-project-header-title">
                                    Delete Project?
                                </div>
                                <div className="delete-project-header-subtitle">
                                    Are you sure you want to delete
                                </div>
                                <div className="delete-project-header-project-name">
                                    "<strong>{deleteProjectDetail.name}</strong>"?
                                </div>
                                <div className="delete-project-header-subtitle">
                                    This action cannot be undone.
                                </div>
                            </div>
                            <div className="delete-project-notice-message-container">
                                <span className="delete-project-notice-logo">!</span>
                                <div className="delete-project-notice-message">
                                    All tasks, members and data related to this project
                                    <br />
                                    will be permanently deleted.
                                </div>
                            </div>
                            <div className="delete-project-buttons">
                                <button className="delete-project-cancel-button" type="button" onClick={() => setDeleteProjectDetail(null)}>
                                    Cancel
                                </button>
                                <button className="delete-project-delete-project-button" type="submit" onClick={handleDeleteProject}>
                                    <Trash size={30}/>
                                    Delete Project
                                </button>
                            </div>
                        </div>
                    </div>        
                )
            }
        </div> 
    )
}

export default ProjectPage