# Amartha Hackathon Chatbot

AI-powered WhatsApp chatbot for Amartha's financial literacy program, providing personalized business coaching to micro-entrepreneurs.

## Features

- **Context-Aware AI**: Personalized responses based on user profiles (business type, location, literacy level)
- **RAG Knowledge Base**: Retrieves relevant Amartha curriculum content (stock management, debt tracking, meeting reminders)
- **Multi-Modal Support**: Handles both text and image messages via WhatsApp
- **Gemini Integration**: Powered by Google's Gemini 2.5 Flash for intelligent coaching

## Tech Stack

- Node.js + Express
- Google Generative AI (Gemini)
- WhatsApp Business API
- Axios for HTTP requests

## Environment Variables

```bash
MY_VERIFY_TOKEN=your_verify_token
WHATSAPP_TOKEN=your_whatsapp_token
PHONE_NUMBER_ID=your_phone_number_id
GEMINI_API_KEY=your_gemini_api_key
PORT=8080
```

## Installation

```bash
npm install
```

## Usage

```bash
npm start
```

## Webhook Endpoints

- `GET /webhook` - Verification endpoint for WhatsApp
- `POST /webhook` - Receives incoming messages

## Architecture

- **User Database**: Mock in-memory store for user profiles (business type, majelis schedule, etc.)
- **Amartha Curriculum**: Simple keyword-based RAG for retrieving relevant financial tips
- **Dynamic Prompting**: Injects user context into Gemini prompts for personalized responses

## License

ISC
