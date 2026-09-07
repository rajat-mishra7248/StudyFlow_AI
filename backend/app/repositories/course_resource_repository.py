# backend/app/repositories/course_resource_repository.py

from sqlalchemy.orm import Session

from app.models.course_resource import CourseResource


class CourseResourceRepository:

    @staticmethod
    def get_all(
        db: Session,
    ):
        return (
            db.query(CourseResource)
            .order_by(CourseResource.course_name.asc())
            .all()
        )

    @staticmethod
    def get_by_course(
        db: Session,
        course_name: str,
    ):
        return (
            db.query(CourseResource)
            .filter(
                CourseResource.course_name.ilike(
                    course_name
                )
            )
            .all()
        )

    @staticmethod
    def create(
        db: Session,
        course_name: str,
        instructor: str,
        platform: str,
        url: str,
        level: str,
    ):
        resource = CourseResource(
            course_name=course_name,
            instructor=instructor,
            platform=platform,
            url=url,
            level=level,
        )

        db.add(resource)
        db.commit()
        db.refresh(resource)

        return resource