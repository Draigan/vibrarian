# vibrarian

## Voice Transcription

To enable the in-chat voice recording button, add the following to `server/.env`:

```
OPENAI_API_KEY=your_openai_api_key
# Optional: override the default transcription model
# OPENAI_TRANSCRIPTION_MODEL=gpt-4o-mini-transcribe
# Optional: set when using project-scoped API keys (prefix sk-proj-)
# OPENAI_PROJECT_ID=your_openai_project_id
# Optional: include organization scope when required
# OPENAI_ORG_ID=org_XXXXXXXXXXXX
```

Restart the Express server after updating the environment file so it can pick up the new configuration.
