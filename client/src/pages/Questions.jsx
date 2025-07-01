// client/src/pages/Questions.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../api";
import { testGeminiAPI } from '../utils/gemini';
import { 
  getIdealAnswer, 
  getMatchScore, 
  analyzeSkills, 
  checkAnswerRelevance, 
  generateDetailedFeedback, 
  categorizeSkill 
} from '../utils/aiAnalysis';
import PreTest from '../components/PreTest';
import InterviewReport from '../components/InterviewReport';
import InterviewSession from '../components/InterviewSession';

const Questions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preTest, setPreTest] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState([]);
  const [overallScore, setOverallScore] = useState(0);
  const [reportLoading, setReportLoading] = useState(false);
  
  // Media and recording state
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [videoChunks, setVideoChunks] = useState([]);
  const [audioURL, setAudioURL] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  
  // Speech recognition state
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [speechError, setSpeechError] = useState("");
  
  // UI state
  const [textAnswer, setTextAnswer] = useState("");
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [startWarning, setStartWarning] = useState("");
  const [showExitModal, setShowExitModal] = useState(false);
  const [modalAction, setModalAction] = useState('');

  // Initialize camera stream
  const initializeCamera = async () => {
    try {
      console.log('Initializing camera...');
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }
      
      // Check permissions first
      if (navigator.permissions) {
        try {
          const permission = await navigator.permissions.query({ name: 'camera' });
          console.log('Camera permission status:', permission.state);
          if (permission.state === 'denied') {
            throw new Error('Camera permission denied. Please enable camera access in your browser settings.');
          }
        } catch (permError) {
          console.log('Permission check failed, proceeding with getUserMedia:', permError);
        }
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }, 
        audio: true 
      });
      
      console.log('Camera stream obtained:', stream);
      console.log('Video tracks:', stream.getVideoTracks());
      console.log('Audio tracks:', stream.getAudioTracks());
      
      setCameraStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error('Video play error:', e));
      }
      
      setCameraOn(true);
      setMicOn(true);
      setStartWarning(""); // Clear any previous warnings
      return stream;
    } catch (error) {
      console.error('Failed to initialize camera:', error);
      let errorMessage = 'Failed to access camera/microphone. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Permission denied. Please allow camera and microphone access and refresh the page.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera or microphone found. Please check your device.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Camera or microphone is already in use by another application.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage += 'Camera does not meet the required constraints.';
      } else {
        errorMessage += error.message;
      }
      
      setStartWarning(errorMessage);
      throw error;
    }
  };

  // Cleanup camera stream
  const cleanupCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => {
        track.stop();
      });
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
    setMicOn(false);
  };

  // Test API functionality
  const testAPI = async () => {
    try {
      const checkAIStatus = async () => {
        try {
          const result = await testGeminiAPI();
          console.log('Gemini API test result:', result);
          return true;
        } catch (error) {
          console.error('Gemini API test failed:', error);
          return false;
        }
      };

      const fetchInterview = async () => {
        try {
          const response = await API.get(`/interviews/${id}`);
          console.log('Interview data:', response.data);
          setInterview(response.data);
          setLoading(false);
        } catch (error) {
          console.error('Failed to fetch interview:', error);
          setError('Failed to load interview. Please try again.');
          setLoading(false);
        }
      };

      // Check AI status first
      const aiWorking = await checkAIStatus();
      if (!aiWorking) {
        console.warn('AI service may not be working properly');
      }

      // Fetch interview data
      await fetchInterview();
    } catch (error) {
      console.error('Test API error:', error);
      setError('Failed to initialize interview. Please try again.');
      setLoading(false);
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError("");
      };
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscribedText(finalTranscript + interimTranscript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setSpeechError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      setSpeechRecognition(recognition);
      setSpeechRecognitionSupported(true);
    } else {
      console.log('Speech recognition not supported');
      setSpeechRecognitionSupported(false);
    }
  }, []);

  // Initialize interview
  useEffect(() => {
    testAPI();
  }, [id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupCamera();
    };
  }, []);

  // Handle page unload/visibility change
  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanupCamera();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cleanupCamera();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Ensure camera stream is connected to video element when interview starts
  useEffect(() => {
    if (!preTest && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(e => console.error('Video play error:', e));
    }
  }, [preTest, cameraStream]);

  // Handle media toggle
  const handleToggleMedia = async (type) => {
    try {
      if (type === "camera") {
        if (!cameraOn) {
          await initializeCamera();
        } else {
          cleanupCamera();
        }
      } else if (type === "mic") {
        if (!micOn) {
          // If camera is not on, initialize both camera and mic
          if (!cameraOn) {
            await initializeCamera();
          } else {
            // Just enable mic if camera is already on
            setMicOn(true);
          }
        } else {
          setMicOn(false);
        }
      }
    } catch (error) {
      console.error(`Failed to ${type === "camera" ? "access camera" : "access microphone"}:`, error);
      setStartWarning(`Failed to access ${type === "camera" ? "camera" : "microphone"}. Please check permissions.`);
    }
  };

  // Handle test start
  const handleTestStart = async () => {
    try {
      // Initialize camera if not already done
      if (!cameraOn) {
        await initializeCamera();
      }
      setPreTest(false);
    } catch (error) {
      console.error('Failed to start test:', error);
      setStartWarning('Failed to initialize camera. Please check permissions and try again.');
    }
  };

  // Handle exit
  const handleExit = () => {
    cleanupCamera();
    navigate('/interviews');
  };

  // Handle microphone recording
  const handleMic = () => {
    if (!recording) {
      // Start recording
      if (!cameraStream) {
        // Try to initialize camera automatically
        initializeCamera().then(() => {
          // Retry recording after camera is initialized
          setTimeout(() => handleMic(), 1000);
        }).catch(error => {
          console.error('Failed to initialize camera for recording:', error);
          setStartWarning('Camera not initialized. Please enable camera first.');
        });
        return;
      }

      const chunks = [];
      const videoChunks = [];
      
      const recorder = new MediaRecorder(cameraStream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
          videoChunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const videoBlob = new Blob(videoChunks, { type: 'video/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const videoUrl = URL.createObjectURL(videoBlob);
        setAudioURL(audioUrl);
        setVideoURL(videoUrl);
        setAudioChunks(chunks);
        setVideoChunks(videoChunks);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      
      // Start speech recognition if supported
      if (speechRecognitionSupported && speechRecognition) {
        try {
          speechRecognition.start();
          setTranscribedText(""); // Clear previous transcription
        } catch (error) {
          console.error('Failed to start speech recognition:', error);
        }
      }
    } else {
      // Stop recording
      if (mediaRecorder) {
        mediaRecorder.stop();
        setRecording(false);
      }
      
      // Stop speech recognition
      if (speechRecognitionSupported && speechRecognition && isListening) {
        try {
          speechRecognition.stop();
        } catch (error) {
          console.error('Failed to stop speech recognition:', error);
        }
      }
    }
  };

  // Generate report after last question
  useEffect(() => {
    if (showReport && interview && userAnswers.length === (interview.questions?.length || 0)) {
      // Cleanup camera when showing report
      cleanupCamera();
      
      (async () => {
        setReportLoading(true);
        const results = [];
        let total = 0;
        let aiErrors = 0;
        const skillsList = interview.skills && interview.skills.length ? interview.skills : [];
        
        for (let i = 0; i < interview.questions.length; i++) {
          const q = interview.questions[i].text || interview.questions[i];
          // Use transcribed text if available, otherwise use typed text
          const user = userAnswers[i]?.transcribedText || userAnswers[i]?.text || '';
          let ideal = '';
          let score = 0;
          let skill = '';
          let relevanceScore = 5; // Default relevance score
          let skillAnalysis = {
            communication: 5,
            grammar: 5,
            attitude: 5,
            softSkills: 5
          };
          
          // Get ideal answer
          try {
            ideal = await getIdealAnswer(q);
          } catch (e) {
            console.error('Ideal answer generation failed for question:', q, e);
            ideal = 'Unable to generate ideal answer at this time.';
            aiErrors++;
          }
          
          // Get match score
          try {
            // First check relevance
            const relevanceScore = await checkAnswerRelevance(q, user);
            
            // If answer is completely irrelevant, give very low score
            if (relevanceScore <= 2) {
              score = Math.max(0, relevanceScore);
            } else {
              // Get detailed match score only if answer is somewhat relevant
              score = await getMatchScore(q, ideal, user);
              
              // Adjust score based on relevance
              if (relevanceScore < 5) {
                score = Math.min(score, relevanceScore + 1); // Cap score based on relevance
              }
            }
          } catch (e) {
            console.error('Score calculation failed for question:', q, e);
            // Use a basic score based on answer length if AI fails
            score = user.length > 10 ? Math.min(7, Math.floor(user.length / 10)) : 3;
            aiErrors++;
          }
          
          // Enhanced skill analysis
          try {
            skillAnalysis = await analyzeSkills(user, q, userAnswers[i]?.audio);
            
            // Adjust skill scores based on relevance
            if (relevanceScore <= 2) {
              // For completely irrelevant answers, significantly reduce communication and soft skills
              skillAnalysis.communication = Math.max(1, skillAnalysis.communication - 3);
              skillAnalysis.softSkills = Math.max(1, skillAnalysis.softSkills - 3);
            } else if (relevanceScore < 5) {
              // For somewhat irrelevant answers, moderately reduce scores
              skillAnalysis.communication = Math.max(2, skillAnalysis.communication - 2);
              skillAnalysis.softSkills = Math.max(2, skillAnalysis.softSkills - 2);
            }
          } catch (e) {
            console.error('Skill analysis failed for question:', q, e);
            // Keep default values if AI fails
            aiErrors++;
          }
          
          // Use AI to map question to skill
          if (skillsList.length > 0) {
            try {
              const skillPrompt = `Given these skills: ${skillsList.join(', ')}. Which skill does this question assess?\nQuestion: ${q}\nReturn only the skill name from the list.`;
              const skillAI = await generateDetailedFeedback(q, user, ideal, score, relevanceScore);
              skill = skillAI.split('\n')[0].trim();
            } catch (e) {
              console.error('Skill mapping failed for question:', q, e);
              skill = 'General';
              aiErrors++;
            }
          }
          
          // Generate detailed feedback
          let detailedFeedback = '';
          try {
            detailedFeedback = await generateDetailedFeedback(q, user, ideal, score, relevanceScore);
          } catch (e) {
            console.error('Feedback generation failed for question:', q, e);
            // Use basic feedback based on score
            if (score <= 2) {
              detailedFeedback = "This answer doesn't address the question properly. Please focus on providing relevant information that directly answers what was asked.";
            } else if (score <= 5) {
              detailedFeedback = "The answer needs improvement. Try to be more specific and provide more detailed information related to the question.";
            } else {
              detailedFeedback = "Good effort! Consider adding more specific examples or details to strengthen your response.";
            }
            aiErrors++;
          }
          
          total += score;
          results.push({ 
            question: q, 
            user, 
            ideal, 
            score, 
            skill, 
            audio: userAnswers[i]?.audio,
            video: userAnswers[i]?.video,
            transcribedText: userAnswers[i]?.transcribedText,
            skillAnalysis,
            relevanceScore,
            feedback: detailedFeedback
          });
        }
        
        setReport(results);
        setOverallScore(results.length ? Math.round((total / results.length) * 10) / 10 : 0);
        setReportLoading(false);
        
        // Save to backend
        try {
          await API.post(`/interviews/${id}/report`, { 
            report: results, 
            overallScore: results.length ? Math.round((total / results.length) * 10) / 10 : 0,
            skillAnalysis: results.reduce((acc, item) => {
              acc.communication += item.skillAnalysis.communication;
              acc.grammar += item.skillAnalysis.grammar;
              acc.attitude += item.skillAnalysis.attitude;
              acc.softSkills += item.skillAnalysis.softSkills;
              return acc;
            }, { communication: 0, grammar: 0, attitude: 0, softSkills: 0 })
          });
        } catch (e) {
          console.error('Failed to save report to backend:', e);
          // Don't show error to user for backend issues
        }
        
        // Ensure we always have a report, even if AI completely fails
        if (results.length === 0) {
          console.log('Creating fallback report due to AI failures');
          const fallbackResults = interview.questions.map((q, i) => {
            const userAnswer = userAnswers[i]?.transcribedText || userAnswers[i]?.text || '';
            const text = userAnswer.trim().toLowerCase();
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
            
            // Calculate basic skill scores
            const avgSentenceLength = sentences.length > 0 ? sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length : 0;
            const communication = Math.min(8, Math.max(2, sentences.length * 0.5 + (avgSentenceLength > 20 ? 2 : 1)));
            const hasProperStructure = sentences.length > 1 && avgSentenceLength > 10;
            const grammar = hasProperStructure ? 6 : 4;
            const softSkills = Math.min(7, Math.max(3, communication * 0.8 + (hasProperStructure ? 1 : 0)));
            
            return {
              question: q.text || q,
              user: userAnswer || 'No answer provided',
              ideal: 'AI analysis temporarily unavailable',
              score: userAnswer.length > 20 ? 6 : userAnswer.length > 10 ? 4 : 2,
              skill: 'General',
              audio: userAnswers[i]?.audio,
              video: userAnswers[i]?.video,
              transcribedText: userAnswers[i]?.transcribedText,
              skillAnalysis: {
                communication: Math.round(communication),
                grammar: Math.round(grammar),
                attitude: 5,
                softSkills: Math.round(softSkills)
              },
              relevanceScore: userAnswer.length > 0 ? 5 : 0,
              feedback: userAnswer.length > 0 ? 
                "Basic analysis available. Consider providing more detailed responses for better evaluation." : 
                "No answer provided. Please provide a detailed response to the question."
            };
          });
          setReport(fallbackResults);
          setOverallScore(fallbackResults.reduce((sum, item) => sum + item.score, 0) / fallbackResults.length);
          setReportLoading(false);
        }
        
        // Only show error if no results were generated at all after fallback
        if (aiErrors > interview.questions.length * 0.7 && results.length === 0) {
          setError("Some answers could not be scored due to an AI error. Please try again later.");
        }
      })();
    }
    // eslint-disable-next-line
  }, [showReport]);

  // Cleanup camera/mic on route change (when leaving Questions page)
  useEffect(() => {
    // Only run cleanup if the path does not include '/questions'
    if (!location.pathname.includes('/questions')) {
      cleanupCamera();
    }
    // No return cleanup here, handled by unmount
  }, [location.pathname]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center"><div className="bg-white p-8 rounded-xl shadow text-red-600 text-lg font-semibold">{error}</div></div>;
  if (!interview) return <div>No interview found.</div>;

  // Pre-test screen
  if (preTest) {
    return (
      <PreTest
        interview={interview}
        cameraOn={cameraOn}
        micOn={micOn}
        videoRef={videoRef}
        handleToggleMedia={handleToggleMedia}
        handleTestStart={handleTestStart}
        startWarning={startWarning}
        showExitModal={showExitModal}
        modalAction={modalAction}
        setShowExitModal={setShowExitModal}
        setModalAction={setModalAction}
        setStartWarning={setStartWarning}
        setPreTest={setPreTest}
        navigate={navigate}
      />
    );
  }

  // Main test flow
  const question = interview.questions && interview.questions[currentQ] ? (interview.questions[currentQ].text || interview.questions[currentQ]) : '';
  const totalQ = interview.questions ? interview.questions.length : 0;

  if (showReport) {
    return (
      <InterviewReport
        report={report}
        overallScore={overallScore}
        reportLoading={reportLoading}
        interview={interview}
      />
    );
  }

  return (
    <InterviewSession
      currentQ={currentQ}
      totalQ={totalQ}
      question={question}
      aiSpeaking={aiSpeaking}
      videoRef={videoRef}
      speechRecognitionSupported={speechRecognitionSupported}
      isListening={isListening}
      transcribedText={transcribedText}
      speechError={speechError}
      recording={recording}
      textAnswer={textAnswer}
      setTextAnswer={setTextAnswer}
      setTranscribedText={setTranscribedText}
      setSpeechError={setSpeechError}
      setAudioURL={setAudioURL}
      setVideoURL={setVideoURL}
      audioURL={audioURL}
      videoURL={videoURL}
      handleMic={handleMic}
      userAnswers={userAnswers}
      setUserAnswers={setUserAnswers}
      setCurrentQ={setCurrentQ}
      setShowReport={setShowReport}
      cleanupCamera={cleanupCamera}
    />
  );
};

export default Questions;