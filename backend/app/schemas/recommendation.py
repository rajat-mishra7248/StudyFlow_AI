from pydantic import BaseModel


class RecommendationResponse(BaseModel):

    title: str

    recommendation: str