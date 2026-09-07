from app.database.session import SessionLocal
from app.utils.question_seed import seed_python_questions


def main():
    db = SessionLocal()

    try:
        
        quiz_id = 6

        questions = seed_python_questions(
            db=db,
            quiz_id=quiz_id,
        )

        print(
            f"Successfully created {len(questions)} Python questions."
        )

    except Exception as e:
        db.rollback()

        print("Error while seeding questions:")
        print(e)

    finally:
        db.close()


if __name__ == "__main__":
    main()