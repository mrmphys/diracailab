---
title: "How to Build an AI Agent with Python and Claude in 30 Minutes"
description: "A step-by-step guide to building your first production-ready AI agent using Python, FastAPI, and Anthropic's Claude API."
pubDate: 2026-04-02
tags: ["ai-agents", "python", "claude", "fastapi", "tutorial"]
---

AI agents are software that can reason, plan, and take actions — not just answer questions. In this guide, you'll build a working AI agent from scratch using Python, FastAPI, and Claude by Anthropic.

## What We're Building

A simple AI agent that can:
- Receive a task from a user
- Decide which tool to use
- Execute the tool
- Return a structured result

By the end, you'll have a working API endpoint that behaves like a real agent.

## Prerequisites

- Python 3.11+
- An Anthropic API key (get one at console.anthropic.com)
- Basic FastAPI knowledge

## Step 1 — Install Dependencies

```bash
pip install fastapi uvicorn anthropic pydantic
```

## Step 2 — Define Your Tools

Tools are functions your agent can call. Here we define two: one to search the web and one to get the current time.

```python
import anthropic
from datetime import datetime

tools = [
    {
        "name": "get_current_time",
        "description": "Returns the current date and time.",
        "input_schema": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    {
        "name": "calculate",
        "description": "Evaluates a simple math expression.",
        "input_schema": {
            "type": "object",
            "properties": {
                "expression": {
                    "type": "string",
                    "description": "A math expression like '2 + 2' or '100 * 0.15'"
                }
            },
            "required": ["expression"]
        }
    }
]

def run_tool(name: str, inputs: dict) -> str:
    if name == "get_current_time":
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    elif name == "calculate":
        try:
            return str(eval(inputs["expression"]))
        except Exception as e:
            return f"Error: {e}"
    return "Unknown tool"
```

## Step 3 — Build the Agent Loop

The core of any agent is an agentic loop — it keeps running until Claude says it's done.

```python
client = anthropic.Anthropic()

def run_agent(user_message: str) -> str:
    messages = [{"role": "user", "content": user_message}]
    
    while True:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            tools=tools,
            messages=messages
        )
        
        # If Claude is done, return the final text
        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
        
        # If Claude wants to use a tool, run it
        if response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})
            tool_results = []
            
            for block in response.content:
                if block.type == "tool_use":
                    result = run_tool(block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result
                    })
            
            messages.append({"role": "user", "content": tool_results})
        else:
            break
    
    return "Agent completed."
```

## Step 4 — Wrap It in FastAPI

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class AgentRequest(BaseModel):
    message: str

@app.post("/agent")
async def agent_endpoint(request: AgentRequest):
    result = run_agent(request.message)
    return {"response": result}
```

## Step 5 — Run It

```bash
uvicorn main:app --reload
```

Then test it:

```bash
curl -X POST http://localhost:8000/agent \
  -H "Content-Type: application/json" \
  -d '{"message": "What time is it and what is 15% of 847?"}'
```

Claude will automatically call both tools and return a combined answer.

## What's Next

This is a minimal agent. In production you'd add:
- **Persistent memory** — store conversation history in a database
- **More powerful tools** — web search, calendar booking, email sending
- **Error handling** — retry logic, fallbacks
- **Streaming** — stream responses back to users in real time

## Need This Built for Your Business?

At Dirac AI Lab, we build production AI agents for real businesses — from voice booking bots to intelligent dashboards. [Let's talk →](https://diracailab.com#contact)
