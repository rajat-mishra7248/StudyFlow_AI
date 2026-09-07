from pydantic import BaseModel, ConfigDict, EmailStr


# =====================================================
# SIGNUP
# =====================================================

class StudentCreate(BaseModel):

    full_name: str
    username: str
    email: EmailStr
    password: str


# =====================================================
# LOGIN
# =====================================================

class StudentLogin(BaseModel):

    email: EmailStr
    password: str


# =====================================================
# FORGOT PASSWORD
# =====================================================

class ForgotPasswordRequest(BaseModel):

    email: EmailStr


# =====================================================
# RESET PASSWORD
# =====================================================

class ResetPasswordRequest(BaseModel):

    token: str
    new_password: str


# =====================================================
# PROFILE UPDATE
# =====================================================

class StudentProfileUpdate(BaseModel):

    full_name: str

    study_goal: str | None = None

    target_exam: str | None = None

    learning_style: str | None = None

    daily_study_hours: int | None = None

    current_level: str | None = None

    dark_mode: bool = False


# =====================================================
# RESPONSE
# =====================================================

class StudentResponse(BaseModel):

    id: int

    full_name: str

    username: str

    email: EmailStr

    profile_image: str | None = None

    study_goal: str | None = None

    target_exam: str | None = None

    learning_style: str | None = None

    daily_study_hours: int | None = None

    current_level: str | None = None

    dark_mode: bool

    is_active: bool

    model_config = ConfigDict(
        from_attributes=True
    )