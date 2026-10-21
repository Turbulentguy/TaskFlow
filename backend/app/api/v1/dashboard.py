from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.schema.dashboard import DashBoardResponse
from app.core.dependencies import get_db, get_current_user

from app.models.user import User
from app.models.project import Project
from app.models.task import Task
from app.models.members import ProjectMember

router = APIRouter(
    tags = ["Dashboard"]
)

@router.get("/dashboard/summary", response_model = DashBoardResponse)
def dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    queryOwnedProjects = db.query(Project.id).filter(
        Project.owner_id == current_user.id
    )

    queryMemberProjects = db.query(ProjectMember.project_id).filter(
        ProjectMember.user_id == current_user.id
    )

    queryProjects = queryOwnedProjects.union(
        queryMemberProjects
    )

    queryTasks = db.query(Task).filter(
        Task.assignee_id == current_user.id
    )

    queryTodoTasks = db.query(Task).filter(
        (Task.assignee_id == current_user.id) &
        (Task.status == "todo")
    )

    queryInProgressTasks = db.query(Task).filter(
        (Task.assignee_id == current_user.id) &
        (Task.status == "in_progress")
    )

    queryDoneTasks = db.query(Task).filter(
        (Task.assignee_id == current_user.id) &
        (Task.status == "done")
    )

    queryOverDueDateTasks = db.query(Task).filter(
        (Task.assignee_id == current_user.id) &
        (Task.status != "done") &
        (Task.due_date < datetime.now()) &
        (Task.due_date.isnot(None))
    )

    total_projects = queryProjects.count()
    total_tasks = queryTasks.count()
    todo_tasks = queryTodoTasks.count()
    in_progress_tasks = queryInProgressTasks.count()
    done_tasks = queryDoneTasks.count()
    overdue_tasks = queryOverDueDateTasks.count()

    return {
        "total_projects": total_projects,
        "total_tasks": total_tasks,
        "todo_tasks": todo_tasks,
        "in_progress_tasks": in_progress_tasks,
        "done_tasks": done_tasks,
        "overdue_tasks": overdue_tasks
    }