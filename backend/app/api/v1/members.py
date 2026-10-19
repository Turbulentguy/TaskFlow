from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.schema.members import MembersPostRequest, MemberPostResponse, MemberListResponse

from app.models.user import User
from app.models.members import ProjectMember
from app.models.project import Project

router = APIRouter(
    prefix = "/projects",
    tags = ["Members"]
)

@router.post("/{project_id}/members", response_model = MemberPostResponse, status_code = 201)
def addMember(
    project_id: int,
    member: MembersPostRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existingProject = db.query(Project).filter(
        Project.id == project_id
    ).first()


    if existingProject is None:
        raise HTTPException(
            status_code = 404,
            detail = "Project not found."
        )

    queryRole = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id
    ).first()

    if (existingProject.owner_id != current_user.id) and (queryRole.role != "Admin"):
        raise HTTPException(
            status_code = 403,
            detail = "Only the project owner or admin can add members."
        )

    queryUser = db.query(User).filter(
        User.email == member.email
    ).first()

    if queryUser is None:
        raise HTTPException(
            status_code = 404,
            detail = "User not found."
        )

    queryMember = db.query(ProjectMember).filter(
        (ProjectMember.user_id == queryUser.id) &
        (ProjectMember.project_id == project_id)
    ).first()

    if queryMember:
        raise HTTPException(
            status_code = 409,
            detail = "User is already a member of this project."
        )

    new_member = ProjectMember(
        project_id = project_id,
        user_id = queryUser.id,
    )

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return MemberPostResponse(
        user_id = queryUser.id,
        name = queryUser.name,
        email = queryUser.email,
        role = new_member.role,
        joined_at = new_member.joined_at
    )

@router.get("/{project_id}/members", response_model = MemberListResponse)
def getMembers(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existingProject = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if existingProject is None:
        raise HTTPException(
            status_code = 404,
            detail = "Project not found."
        )

    # Check if a member is a project member.
    if existingProject.owner_id != current_user.id:
        is_member = db.query(ProjectMember).filter(
            (ProjectMember.project_id == project_id) &
            (ProjectMember.user_id == current_user.id) 
        ).first()

        if is_member is None:
            raise HTTPException(
                status_code = 403,
                detail = "Access Denied."
            )

    owner = db.query(User).filter(
        User.id == existingProject.owner_id
    ).first()

    members = db.query(ProjectMember, User).join(
        User, ProjectMember.user_id == User.id
    ).filter(
        ProjectMember.project_id == project_id
    ).all()

    items = [{
        "user_id": owner.id,
        "name": owner.name,
        "email": owner.email,
        "role": "Owner",
        "joined_at": existingProject.created_at
    }]

    for member, user in members:
        items.append({
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "role": member.role,
            "joined_at": member.joined_at
        })

    return {
        "items": items,
        "total": len(items) 
    }

@router.patch("/{project_id}/members/{user_id}", response_model = MemberPostResponse)
def updateMember(
    project_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existingProject = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if existingProject is None:
        raise HTTPException(
            status_code = 404,
            detail = "Project not found."
        )

    if existingProject.owner_id != current_user.id:
        raise HTTPException(
            status_code = 403,
            detail = "Access Denied."
        )

    is_member = db.query(ProjectMember, User).join(
        User, ProjectMember.user_id == User.id
    ).filter(
        (ProjectMember.user_id == user_id) &
        (ProjectMember.project_id == project_id)
    ).first()

    if is_member is None:
        raise HTTPException(
            status_code = 400,
            detail = "This user is not a member of this project"
        )

    projectMember, queryUser = is_member
    projectMember.role = "Admin"

    db.commit()
    db.refresh(projectMember)

    return {
        "user_id": queryUser.id,
        "name": queryUser.name,
        "email": queryUser.email,
        "role": projectMember.role,
        "joined_at": projectMember.joined_at
    }

@router.delete("/{project_id}/members/{user_id}", status_code = 204)
def deleteMember(
    project_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existingProject = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if existingProject is None:
        raise HTTPException(
            status_code = 404,
            detail = "Project not found."
        )

    queryRole = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id
    ).first()

    if (existingProject.owner_id != current_user.id) and (queryRole.role != "Admin"):
        raise HTTPException(
            status_code = 403,
            detail = "Access denied."
        )

    queryUser = db.query(ProjectMember).filter(
        (ProjectMember.project_id == project_id) & 
        (ProjectMember.user_id == user_id)
    ).first()

    if queryUser is None:
        raise HTTPException(
            status_code = 404,
            detail = "User not found."
        )

    db.delete(queryUser)
    db.commit()