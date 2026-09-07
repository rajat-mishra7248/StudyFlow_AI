from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
)


class AchievementResponse(BaseModel):

    id: int

    badge_name: str

    badge_icon: str

    description: str

    earned_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )