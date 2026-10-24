from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.schema.comments import CommentCreateRequest, CommentCreateResponse, CommentGetResponse

from app.models.user import User
from app.models.task import Task
from app.models.project import Project
from app.models.members import ProjectMember
from app.models.comment import Comment

router = APIRouter(
    prefix = "/api/v1",
    tags = ["Comments"]
)

@router.post("/tasks/{task_id}/comments", response_model = CommentCreateResponse, status_code = 201)
def addComment(
    task_id: int,
    comment: CommentCreateRequest,
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

    is_member = db.query(ProjectMember).filter(
        (ProjectMember.project_id == queryTask.project_id) &
        (ProjectMember.user_id == current_user.id)
    ).first()

    if not (is_owner or is_member):
        raise HTTPException(
            status_code = 403,
            detail = "Access denied."
        )

    new_comment = Comment(
        task_id = task_id,
        user_id = current_user.id,
        content = comment.content
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return new_comment

@router.get("/tasks/{task_id}/comments", response_model = CommentGetResponse)
def getComments(
    task_id: int,
    page: int = 1,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
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

    is_member = db.query(ProjectMember).filter(
        (ProjectMember.project_id == queryTask.project_id) &
        (ProjectMember.user_id == current_user.id)
    ).first()

    if not (is_owner or is_member):
        raise HTTPException(
            status_code = 403,
            detail = "Access denied."
        )

    queryComments = db.query(Comment).filter(
        Comment.task_id == task_id
    )

    total = queryComments.count()
    offset = (page - 1) * limit
    tasks = queryComments.offset(offset).limit(limit).all()

    return {
        "items": tasks,
        "total": total,
        "page": page,
        "page_size": limit
    }

@router.patch("/comments/{comment_id}", response_model = CommentCreateResponse)
def updateComment(
    comment_id: int,
    comment: CommentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    queryComment = db.query(Comment).filter(
        (Comment.id == comment_id) &
        (Comment.user_id == current_user.id)
    ).first()

    if queryComment is None:
        raise HTTPException(
            status_code = 404,
            detail = "Comment not found."
        )

    queryComment.content = comment.content

    db.commit()
    db.refresh(queryComment)

    return queryComment

@router.delete("/comments/{comment_id}", status_code = 204)
def deleteComment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    queryComment = db.query(Comment).filter(
        Comment.id == comment_id
    ).first()

    if queryComment is None:
        raise HTTPException(
            status_code = 404,
            detail = "Comment not found."
        )

    queryTask = db.query(Task).filter(
        Task.id == queryComment.task_id
    ).first()

    queryProject = db.query(Project).filter(
        Project.id == queryTask.project_id
    ).first()

    is_author = queryComment.user_id == current_user.id

    is_owner = queryProject.owner_id == current_user.id

    is_admin = db.query(ProjectMember).filter(
        (ProjectMember.project_id == queryProject.id) &
        (ProjectMember.user_id == current_user.id) &
        (ProjectMember.role == "Admin")
    ).first() is not None

    if not (is_author or is_owner or is_admin):
        raise HTTPException(
            status_code = 403,
            detail = "You do not have permission to delete this comment."
        )

    db.delete(queryComment)
    db.commit()