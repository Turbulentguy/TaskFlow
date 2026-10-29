from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.dependencies import get_db, get_current_user
from app.schema.project import ProjectCreateRequest, ProjectCreateResponse, GetProjectsResponse

from app.models.user import User
from app.models.project import Project
from app.models.members import ProjectMember

router = APIRouter(
    prefix = "/api/v1",
    tags = ["Projects"]
)

@router.post("/projects", response_model = ProjectCreateResponse, status_code = 201)
def addProject(
    project: ProjectCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_project = Project(
        name = project.name,
        description = project.description,
        owner_id = current_user.id
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project

@router.get("/projects", response_model = GetProjectsResponse)
def getProjects(
    current_user: User = Depends(get_current_user),
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
):
    query = db.query(Project).filter(
        or_(
            Project.owner_id == current_user.id,
            Project.id.in_(
                db.query(ProjectMember.project_id).filter(
                    ProjectMember.user_id == current_user.id
                )
            )
        )
    )

    total = query.count()

    offset = (page - 1) * limit
    projects = query.offset(offset).limit(limit).all()

    return {
        "items": projects,
        "total": total,
        "page": page,
        "page_size": limit
    }

@router.get("/projects/{project_id}", response_model = ProjectCreateResponse)
def getProjectById(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        (Project.owner_id == current_user.id) &
        (Project.id == project_id)
    ).first()

    if project is None:
        raise HTTPException(
            status_code = 404,
            detail = "Project {project_id} not found."
        )

    return project

@router.patch("/projects/{project_id}", response_model = ProjectCreateResponse)
def updateProjectById(
    project_id: int,
    project: ProjectCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Project).filter(
        (Project.id == project_id) &
        (Project.owner_id == current_user.id)
    ).first()

    if query is None:
        raise HTTPException(
            status_code = 404,
            detail = "Project {project_id} not found."
        )

    query.name = project.name
    query.description = project.description

    db.commit()
    db.refresh(query)

    return query

@router.delete("/project/{project_id}", status_code = 204)
def deleteProjectById(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        (Project.id == project_id) &
        (Project.owner_id == current_user.id)
    ).first()

    if project is None:
        raise HTTPException(
            status_code = 404,
            detail = "Project {project_id} not found."
        )

    db.delete(project)
    db.commit()

    return {
        "message": "Project {project_id} has been deleted."
    }
