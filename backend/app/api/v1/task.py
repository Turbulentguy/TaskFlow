from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from app.core.dependencies import get_db, get_current_user
from app.schema.task import TaskCreateRequest, TaskCreateResponse, TaskGetResponse, TaskUpdateRequest

from app.models.user import User
from app.models.task import Task
from app.models.project import Project
from app.models.members import ProjectMember

router = APIRouter(
    tags = ["Tasks"]
)

@router.post("/projects/{project_id}/tasks", response_model = TaskCreateResponse, status_code = 201)
def addTask(
    project_id: int,
    task: TaskCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    queryProject = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if queryProject is None:
        raise HTTPException(
            status_code = 404,
            detail = "Project not found." 
        )

    is_owner = db.query(Project).filter(
        (Project.owner_id == current_user.id) &
        (Project.id == project_id)
    ).first()

    is_admin = db.query(ProjectMember).filter(
        (ProjectMember.project_id == project_id) &
        (ProjectMember.user_id == current_user.id) &
        (ProjectMember.role == "Admin")
    ).first()

    is_member = db.query(ProjectMember).filter(
        (ProjectMember.project_id == project_id) &
        (ProjectMember.user_id == current_user.id) &
        (ProjectMember.role == "Member")
    ).first()

    if not (is_owner or is_admin or is_member):
        raise HTTPException(
            status_code = 403,
            detail = "Access denied."
        )

    if task.due_date is not None and task.due_date.date() < date.today():
        raise HTTPException(
            status_code = 422,
            detail = "Due date cannot be in the past."
        )

    if is_owner or is_admin:
        assignee_id = task.assignee_id

        if assignee_id is None:
            assignee_id = current_user.id

        if assignee_id != queryProject.owner_id:
            is_project_member = db.query(ProjectMember).filter(
                (ProjectMember.project_id == project_id) &
                (ProjectMember.user_id == assignee_id)
            ).first()

            if is_project_member is None:
                raise HTTPException(
                    status_code = 422,
                    detail = "Assignee must be a member of this project."
                )

    else:
        assignee_id = current_user.id

    new_task = Task(
        project_id = project_id,
        title = task.title,
        description = task.description,
        status = task.status,
        priority = task.priority,
        assignee_id = assignee_id,
        due_date = task.due_date,
        created_by = current_user.id
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task

@router.get("/projects/{project_id}/tasks", response_model = TaskGetResponse)
def getTasks(
    project_id: int,
    status: str | None = None,
    page: int = 1,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    queryProject = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if queryProject is None:
        raise HTTPException(
            status_code = 404,
            detail = "Project not found."
        )

    is_owner = db.query(Project).filter(
        (Project.id == project_id) &
        (Project.owner_id == current_user.id)
    ).first()

    is_admin = db.query(ProjectMember).filter(
        (ProjectMember.project_id == project_id) &
        (ProjectMember.user_id == current_user.id) &
        (ProjectMember.role == "Admin")
    ).first()

    is_member = db.query(ProjectMember).filter(
        (ProjectMember.project_id == project_id) &
        (ProjectMember.user_id == current_user.id) &
        (ProjectMember.role == "Member")
    ).first()

    if not (is_owner or is_admin or is_member):
        raise HTTPException(
            status_code = 403,
            detail = "Access denied."
        )

    queryTasks = db.query(Task).filter(
        (Task.project_id == project_id)
    )

    if status is not None:
        queryTasks = queryTasks.filter(
            Task.status == status
        )

    total = queryTasks.count()
    offset = (page - 1) * limit
    tasks = queryTasks.offset(offset).limit(limit).all()

    return {
        "items": tasks,
        "total": total,
        "page": page,
        "page_size": limit
    }

@router.patch("/tasks/{task_id}", response_model = TaskCreateResponse)
def updateTask(
    task_id: int,
    task: TaskUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    queryTask = db.query(Task).filter(
        Task.id == task_id
    ).first()

    if queryTask is None:
        raise HTTPException(
            status_code = 404,
            detail = "Task not found."
        )

    queryProject = db.query(Project).filter(
        Project.id == queryTask.project_id
    ).first()

    if queryProject is None:
        raise HTTPException(
            status_code = 404,
            detail = "Project not found."
        )

    is_owner = db.query(Project).filter(
        (Project.id == queryTask.project_id) &
        (Project.owner_id == current_user.id)
    ).first()

    is_admin = db.query(ProjectMember).filter(
        (ProjectMember.project_id == queryTask.project_id) &
        (ProjectMember.user_id == current_user.id) &
        (ProjectMember.role == "Admin")
    ).first()

    is_member = db.query(ProjectMember).filter(
        (ProjectMember.project_id == queryTask.project_id) &
        (ProjectMember.user_id == current_user.id) &
        (ProjectMember.role == "Member")
    ).first()

    if not (is_owner or is_admin or is_member):
        raise HTTPException(
            status_code = 403,
            detail = "Access denied."
        )

    if task.due_date is not None and task.due_date.date() < date.today():
        raise HTTPException(
            status_code = 422,
            detail = "Due date cannot be in the past."
        )

    if "assignee_id" in task.model_fields_set:
        if is_owner or is_admin:
            if task.assignee_id is not None:
                if task.assignee_id != queryProject.owner_id:
                    is_project_member = db.query(ProjectMember).filter(
                        ProjectMember.project_id == queryTask.project_id,
                        ProjectMember.user_id == task.assignee_id
                    ).first()

                    if is_project_member is None:
                        raise HTTPException(
                            status_code = 422,
                            detail = "Assignee must be a member of this project."
                        )
        elif is_member:
            task.assignee_id = current_user.id

    update_data = task.model_dump(exclude_unset = True)

    for field, value in update_data.items():
        setattr(queryTask, field, value)

    db.commit()
    db.refresh(queryTask)

    return queryTask

@router.delete("/tasks/{task_id}", status_code = 204)
def deleteTask(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    queryTask = db.query(Task).filter(
        Task.id == task_id
    ).first()

    if queryTask is None:
        raise HTTPException(
            status_code = 404,
            detail = "Task not found."
        )

    is_owner = db.query(Project).filter(
        (Project.id == queryTask.project_id) &
        (Project.owner_id == current_user.id)
    ).first()

    is_admin = db.query(ProjectMember).filter(
        (ProjectMember.project_id == queryTask.project_id) &
        (ProjectMember.user_id == current_user.id) &
        (ProjectMember.role == "Admin")
    ).first()

    is_member = db.query(ProjectMember).filter(
        (ProjectMember.project_id == queryTask.project_id) &
        (ProjectMember.user_id == current_user.id) &
        (ProjectMember.role == "Member")
    ).first()

    if not (is_owner or is_admin or is_member):
        raise HTTPException(
            status_code = 403,
            detail = "Access denied."
        )

    if not (is_owner or is_admin or (is_member and queryTask.created_by == current_user.id)):
        raise HTTPException(
            status_code = 403,
            detail = "Access denied."
        )

    db.delete(queryTask)
    db.commit()