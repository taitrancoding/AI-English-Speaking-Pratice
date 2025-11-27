import React, { useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { createAiSession } from '../services/api';

export default function VoiceInput({ learnerId }) {
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const [feedback, setFeedback] = useState('');
  const [topic, setTopic] = useState('');
  const [scenario, setScenario] = useState('');
  const [audioUrl, setAudioUrl] = useState(''); // nếu có upload audio

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <span>Browser không hỗ trợ Speech Recognition</span>;
  }

  const handleSubmit = async () => {
    const res = await createAiSession({
      learnerId,
      speech: transcript,
      topic,
      scenario,
      audioUrl
    });
    setFeedback(res.feedback);
  };

  return (
    <div>
      <input type="text" placeholder="Topic" value={topic} onChange={e => setTopic(e.target.value)} />
      <input type="text" placeholder="Scenario" value={scenario} onChange={e => setScenario(e.target.value)} />
      
      <button onClick={SpeechRecognition.startListening}>Start</button>
      <button onClick={SpeechRecognition.stopListening}>Stop</button>
      <button onClick={resetTranscript}>Reset</button>

      <p>Transcript: {transcript}</p>
      <button onClick={handleSubmit}>Submit for AI Feedback</button>

      {feedback && <p>AI Feedback: {feedback}</p>}
    </div>
  );
}
