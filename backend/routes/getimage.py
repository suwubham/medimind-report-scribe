import os
from dotenv import load_dotenv
from openai import OpenAI
from fastapi import APIRouter, FastAPI
from pydantic import BaseModel
import json

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()
route_process = APIRouter()

# Default conversation history
default_conversation_history = [
    {
        "role": "system",
        "content": [
            {
                "type": "text",
                "text": "You are an AI assistant for an app that helps health-illiterate people understand medical reports. "
                "You will be provided with a medical report, provide a clear and simple summary in Nepali at an 8th-grade reading level. "
                "Use patient-friendly language, avoid complex medical terms, and explain any necessary terms in a way that is easy to understand. "
                "Focus on the most important information, such as the health condition, what it means, and what the patient should do next."
                "Dont provide additional information like patient's details, date of report, or doctor name."
                "Provide the result in a paragraph format, not in bullet points or numbered lists."
            }
        ]
    }
]

print(default_conversation_history)
conversation_history = default_conversation_history.copy()

class ImageRequest(BaseModel):
    body: str
    first: str

class ExitRequest(BaseModel):
    exit: str

def chat_with_bot_first(image_url):
    conversation_history.append(
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": image_url,
                        "detail": "high"
                    },
                },
            ],
        }
    )

    response = client.chat.completions.create(
        model='gpt-4o-mini',
        messages=conversation_history,
        temperature=0.1,
        top_p=0.1
    )

    assistant_reply = response.choices[0].message.content
    conversation_history.append(
        {"role": "assistant", "content": [
            {"type": "text", "text": assistant_reply}]}
    )

    return conversation_history


def chat_with_bot(user_text):
    conversation_history.append(
        {"role": "user", "content": [{"type": "text", "text": user_text}]})

    response = client.chat.completions.create(
        model='gpt-4o',
        messages=conversation_history,
        temperature=0.1,
        top_p=0.1
    )

    assistant_reply = response.choices[0].message.content
    conversation_history.append(
        {"role": "assistant", "content": [
            {"type": "text", "text": assistant_reply}]}
    )

    return conversation_history


@route_process.post("/process")
def process(request: ImageRequest):
    if request.first == "1":
        chat_with_bot_first(request.body)
    else:
        chat_with_bot(request.body)
    return conversation_history


@route_process.get("/exit")
def reset_conversation():
    global conversation_history
    conversation_history = default_conversation_history.copy()
    return {"message": "Conversation history has been reset.", "conversation_history": conversation_history}


app.include_router(route_process)
