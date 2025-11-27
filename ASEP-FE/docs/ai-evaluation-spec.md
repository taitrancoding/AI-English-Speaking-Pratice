## AI Speaking Evaluation Flow

### 1. Frontend (React)
- Record microphone audio via `MediaRecorder` (WebM/Opus). Fallback: upload existing audio.
- Collect metadata: learnerId, topic, scenario, targetLevel, optional reference text.
- POST multipart payload to `/api/v1/ai-evaluations`:
  - `audio` (binary)
  - `learnerId`, `topic`, `targetLevel`, `scenario`, `referenceText`
  - `audioFormat` (mime)
- Display response (transcript, feedback, score, rubric) and play back returned `ttsAudioBase64`.
- Persist final practice session by calling `/practice-sessions` when needed.

### 2. Backend Pipeline
1. **Receive audio** → normalise to 16kHz WAV.
2. **STT** (Gemini/Whisper/Web Speech). Store transcript.
3. **Prompt engineering** for evaluation:
   ```text
   You are a CEFR speaking examiner.
   Target level: {{targetLevel}}
   Topic: {{topic}}
   Scenario: {{scenario}}
   Reference text (optional for context):
   """
   {{referenceText}}
   """
   Transcript (from learner):
   """
   {{transcript}}
   """
   Evaluate pronunciation, grammar, vocabulary, fluency (0-10), then give actionable feedback in Vietnamese and English.
   Respond ONLY with JSON:
   {
     "score": <0-100>,
     "rubric": {
       "pronunciation": <0-10>,
       "grammar": <0-10>,
       "vocabulary": <0-10>,
       "fluency": <0-10>
     },
     "feedback": "<multi-paragraph guidance>",
     "suggestedFocus": ["string", "..."]
   }
   ```
4. **LLM call** (Gemini / GPT-4o / DeepSeek). Validate JSON strictly. On failure, retry with `"Respond in valid JSON"` reminder.
5. **TTS**: synthesize spoken feedback (Google/Edge/ElevenLabs). Return base64 audio string.
6. **Response object** back to FE:
   ```json
   {
     "transcript": "...",
     "feedback": "...",
     "score": 82.5,
     "rubric": {
       "pronunciation": 8.0,
       "grammar": 7.5,
       "vocabulary": 8.5,
       "fluency": 7.0
     },
     "ttsAudioBase64": "UklGRiQAAABXQVZFZm10IBAAAAABAAEA...",
     "practiceSessionId": 123
   }
   ```

### 3. Error Handling
- Validate JSON schema; fallback with `"evaluationStatus": "FAILED"` detail if LLM output invalid.
- Return 422 for malformed audio, 503 for upstream AI failures.
- Store raw transcript + scores for audit in `AiPracticeSession`.

### 4. Real-time Conversation
- FE opens WebSocket `VITE_AI_CHAT_WS_URL`, streams `{ type: "text" | "audio", content }`.
- Audio payload = base64 chunk from `MediaRecorder`. Backend decodes → STT → send transcript to LLM.
- Backend streams tokens as `{ type: "partial", content }` for live UI updates, then sends `{ role: "assistant", content }` when complete.
- Optional: attach `tts` field per turn (`base64`) for instant playback.
- Persist session summary (topic, transcript, feedback) just like async evaluation to keep learner history consistent.
