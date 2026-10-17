from fastapi import APIRouter

router = APIRouter(
    tags = ["Health"]
)

@router.get("/api/v1/health")
def Health():
    return {
        "status": "okay",
        "message": "TaskFlow is running."
    }