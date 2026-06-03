import getpass

from backend.auth import get_password_hash
from backend.database import SessionLocal
from backend.models import User


def main():
    password = getpass.getpass("New admin password: ")
    if len(password) < 8:
        raise SystemExit("Password must be at least 8 characters.")

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == "admin").first()
        if not user:
            raise SystemExit("Admin user does not exist.")
        user.hashed_password = get_password_hash(password)
        db.commit()
        print("Admin password updated.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
