---
title: "Build a Voice Booking Bot with Vapi and Claude in Under an Hour"
description: "How to create a phone-based AI assistant that books appointments, handles objections, and integrates with your calendar — step by step."
pubDate: 2026-04-02
tags: ["voice-ai", "vapi", "claude", "booking-bot", "tutorial"]
---

Voice AI is no longer just for big enterprises. With tools like Vapi and Claude, you can build a fully functional phone booking bot in under an hour — no machine learning experience required.

In this guide we'll build a bot that:
- Answers inbound calls
- Collects caller name, service needed, and preferred time
- Checks availability
- Books the appointment
- Sends a confirmation

This is exactly what we built for HinaLab, a home services company. Their AI assistant now handles 100% of inbound booking calls.

## The Architecture

```
Caller → Phone Number (Vapi) → Voice AI (Claude) → Your API → Calendar
```

Vapi handles the telephony layer (audio in/out, STT, TTS). Claude handles the conversation. Your backend handles the business logic.

## Step 1 — Set Up Vapi

1. Create an account at [vapi.ai](https://vapi.ai)
2. Go to **Phone Numbers** → Buy a number
3. Go to **Assistants** → Create new assistant
4. Set the model to Claude (Anthropic)
5. Write your system prompt (see below)

## Step 2 — Write the System Prompt

This is the most important part. Be specific.

```
You are a friendly scheduling assistant for [Business Name]. 
Your job is to book 2-hour appointments for home services.

When someone calls:
1. Greet them warmly
2. Ask for their name
3. Ask what service they need (roofing, solar, or windows)
4. Ask for their preferred date and time
5. Call the check_availability tool to verify the slot
6. If available, call book_appointment to confirm
7. Confirm the booking and tell them what to expect

Keep responses short — under 2 sentences. This is a phone call.
Never ask more than one question at a time.
```

## Step 3 — Define Your Tools

In Vapi, go to your assistant → **Tools** → add these:

**check_availability:**
```json
{
  "name": "check_availability",
  "description": "Check if a time slot is available for booking",
  "parameters": {
    "type": "object",
    "properties": {
      "date": { "type": "string", "description": "Date in YYYY-MM-DD format" },
      "time": { "type": "string", "description": "Time in HH:MM format" }
    },
    "required": ["date", "time"]
  }
}
```

**book_appointment:**
```json
{
  "name": "book_appointment",
  "description": "Book an appointment for the caller",
  "parameters": {
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "service": { "type": "string" },
      "date": { "type": "string" },
      "time": { "type": "string" },
      "phone": { "type": "string" }
    },
    "required": ["name", "service", "date", "time"]
  }
}
```

Set the **Server URL** to your backend API endpoint.

## Step 4 — Build the Backend

```python
from fastapi import FastAPI, Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from datetime import datetime, timedelta

app = FastAPI()

@app.post("/vapi-tools")
async def handle_tool(request: Request):
    body = await request.json()
    tool_name = body["message"]["toolCalls"][0]["function"]["name"]
    args = body["message"]["toolCalls"][0]["function"]["arguments"]
    
    if tool_name == "check_availability":
        # Check Google Calendar
        available = check_google_calendar(args["date"], args["time"])
        return {"result": "Available" if available else "Not available, please suggest another time"}
    
    elif tool_name == "book_appointment":
        # Create calendar event
        event_id = create_calendar_event(args)
        return {"result": f"Appointment booked for {args['date']} at {args['time']}. Confirmation ID: {event_id}"}
    
    return {"result": "Unknown tool"}
```

## Step 5 — Connect to Google Calendar

```python
def check_google_calendar(date: str, time: str) -> bool:
    # Load credentials from env
    creds = Credentials.from_authorized_user_info(json.loads(os.environ["GOOGLE_TOKEN_JSON"]))
    service = build("calendar", "v3", credentials=creds)
    
    start = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
    end = start + timedelta(hours=2)
    
    events = service.events().list(
        calendarId="primary",
        timeMin=start.isoformat() + "Z",
        timeMax=end.isoformat() + "Z",
        singleEvents=True
    ).execute()
    
    return len(events.get("items", [])) == 0
```

## Step 6 — Deploy and Test

1. Deploy your backend to Railway or any cloud platform
2. Update the Vapi tool server URL to your deployed endpoint
3. Call your Vapi phone number
4. Talk to your bot

## Common Mistakes

**Bot talks too much:** Keep system prompt responses under 2 sentences. Phone calls need brevity.

**Tool calls fail silently:** Always return a plain string result from your tool endpoint. Vapi needs a simple text response.

**Timezone issues:** Store and compare all times in UTC. Convert to local time only when speaking to the caller.

## The Result

A voice bot that handles inbound calls 24/7, books appointments automatically, and never gets tired or takes a sick day. One of our clients went from manually answering every call to zero calls — the bot handles everything.

## Want This for Your Business?

We build and deploy voice AI bots for home services, healthcare, and hospitality. [Contact us at Dirac AI Lab →](https://diracailab.com#contact)
