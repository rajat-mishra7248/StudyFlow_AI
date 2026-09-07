# backend/app/schemas/course_resource.py

from pydantic import BaseModel, ConfigDict


class CourseResourceCreate(BaseModel):

    course_name: str
    instructor: str
    platform: str
    url: str
    level: str


class CourseResourceResponse(BaseModel):

    id: int
    course_name: str
    instructor: str
    platform: str
    url: str
    level: str

    model_config = ConfigDict(
        from_attributes=True
    )