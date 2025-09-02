
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { InvokeLLM } from "@/integrations/Core";
import { User } from "@/entities/User";
import { Settings as SettingsEntity } from "@/entities/Settings"; // Assuming Settings entity is defined here
import {
  Brain,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Copy,
  CheckCircle,
  Settings,
  Globe,
  HelpCircle,
  LogOut,
  User as UserIcon,
  X,
  Moon,
  Sun,
  ChevronDown,
  ThumbsUp, // Added ThumbsUp
  ThumbsDown, // Added ThumbsDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils";

const allSampleTexts = [
  {
    text: "你好朋友，希望你一切都好。我对你的产品很感兴趣。请发给我最好的价格和最小订购量。",
    description: "Chinese supplier inquiry"
  },
  {
    text: "yo u tryna get some grub later or nah lw hella hungry",
    description: "Casual slang message"
  },
  {
    text: "We can provide good quality product with competitive price. Please kindly let me know your target price and we can discuss further.",
    description: "Professional polish"
  },
  {
    text: "¿Me puedes enviar el tracking del pedido? No lo encuentro en mi correo.",
    description: "Spanish customer support"
  },
  {
    text: "thx for the quick response! super helpful. will def be in touch soon about next steps",
    description: "Quick acknowledgment"
  },
  // New Additions
  {
    text: "hey just circling back on this - any updates? eod deadline is approaching.",
    description: "Corporate urgency"
  },
  {
    text: "Dears, we have received your inquiry. We are checking and will revert soon. Thanks.",
    description: "Common business English"
  },
  {
    text: "This is cap, I'm not going.",
    description: "Gen Z slang"
  },
  {
    text: "As per my last email, the attachment is on the shared drive.",
    description: "Passive-aggressive tone"
  },
  {
    text: "こにちは、お見積もりをお願いできますでしょうか？",
    description: "Japanese price request"
  },
  {
    text: "I would be most grateful if you could provide the aforementioned documentation at your earliest convenience.",
    description: "Overly formal text"
  },
  {
    text: "Bro, the new update is literally so bugged, it's unusable.",
    description: "Gaming/Tech slang"
  },
  {
    text: "Can we pls sync up offline to discuss the synergies and action items moving forward?",
    description: "Business buzzwords"
  },
  {
    text: "Hallo, ich wollte fragen, ob die Rechnung #12345 schon bezahlt wurde. Vielen Dank!",
    description: "German payment query"
  }
];

// Function to get 3 unique random samples
const getRandomSamples = () => {
  const shuffled = [...allSampleTexts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
};

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [englishTranslation, setEnglishTranslation] = useState("");
  const [transliteration, setTransliteration] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toneLevel, setToneLevel] = useState([3]); // Default to Professional (level 3)
  const [outputLanguage, setOutputLanguage] = useState('english');

  // AI Analysis State
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [confidenceScore, setConfidenceScore] = useState(0);
  // Track the actual tone used for processing (not the current slider value)
  const [processedToneLevel, setProcessedToneLevel] = useState(3); // Default to Professional (level 3)

  // UI State
  const [copySuccess, setCopySuccess] = useState('');
  const [displayedSamples, setDisplayedSamples] = useState(getRandomSamples());
  const [error, setError] = useState(null);
  const [userFeedback, setUserFeedback] = useState(null); // Added state for user feedback

  // New states for user settings
  const [currentUser, setCurrentUser] = useState(null); // To store logged-in user
  const [userSettings, setUserSettings] = useState({}); // Stores settings fetched from backend
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Add loading state for auth check

  // Add a ref to store the latest tone level, to be used by effects that shouldn't re-run on toneLevel changes
  const latestToneLevelRef = useRef(toneLevel[0]);

  // Effect to keep latestToneLevelRef always updated with the current toneLevel
  useEffect(() => {
    latestToneLevelRef.current = toneLevel[0];
  }, [toneLevel]); // This effect correctly depends on toneLevel

  const [darkMode, setDarkMode] = React.useState(() => {
    try {
      const savedMode = localStorage.getItem('darkMode');
      // If no saved mode, default to system preference or false (light)
      if (savedMode === null) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return savedMode === 'true';
    } catch (e) {
      // Fallback for environments where localStorage might not be available
      console.warn("localStorage not available, defaulting to light mode.");
      return false;
    }
  });

  // Language options for the dropdown
  const languageOptions = [
    { value: 'english', label: 'English', flag: '🇺🇸' },
    { value: 'spanish', label: 'Spanish', flag: '🇪🇸' },
    { value: 'french', label: 'French', flag: '🇫🇷' },
    { value: 'german', label: 'German', flag: '🇩🇪' },
    { value: 'hindi', label: 'Hindi', flag: '🇮🇳' },
    { value: 'chinese_simplified', label: 'Chinese (Simplified)', flag: '🇨🇳' },
    { value: 'japanese', label: 'Japanese', flag: '🇯🇵' },
    { value: 'arabic', label: 'Arabic', flag: '🇸🇦' },
    { value: 'portuguese', label: 'Portuguese', flag: '🇵🇹' },
    { value: 'italian', label: 'Italian', flag: '🇮🇹' },
    { value: 'russian', label: 'Russian', flag: '🇷🇺' },
    { value: 'korean', label: 'Korean', flag: '🇰🇷'},
    { value: 'urdu', label: 'Urdu', flag: '🇵🇰' },
    { value: 'punjabi', label: 'Punjabi', flag: '🇮🇳' }
  ];

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    try {
      localStorage.setItem('darkMode', darkMode.toString());
    } catch (e) {
      console.warn("localStorage not available, dark mode preference not saved.");
    }
  }, [darkMode]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDisplayedSamples(getRandomSamples());
    }, 4000); // Cycle every 4 seconds

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);

  // Check if user is logged in and redirect to main app
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      setIsCheckingAuth(true);
      try {
        const userData = await User.me();
        if (userData && userData.email) {
          // User is logged in, redirect to the main app (Tonelater page)
          window.location.href = createPageUrl("Tonelater");
          return; // Don't set isCheckingAuth to false since we're redirecting
        }
      } catch (error) {
        // User is not logged in, stay on homepage
        console.log("User not logged in, staying on homepage");
      }
      setIsCheckingAuth(false); // Only show homepage if user is not logged in
    };
    
    checkAuthAndRedirect();
  }, []); // Run once on component mount

  // Load user settings
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const userData = await User.me();
        setCurrentUser(userData); // Set the current user

        const settings = await SettingsEntity.filter({ created_by: userData.email });
        const settingsMap = {};
        settings.forEach(setting => {
          settingsMap[setting.setting_key] = setting.setting_value;
        });
        setUserSettings(settingsMap);
      } catch (error) {
        // User not logged in or error fetching settings, use default settings
        setCurrentUser(null); // Ensure current user is null
        setUserSettings({});
        console.warn("Could not load user settings or user not logged in.", error);
      }
    };
    
    // Only attempt to load settings if auth check is complete and no redirect occurred.
    // This effect runs independently of the auth check, but its data might be less relevant if user redirects.
    // For this specific use case (homepage for logged out users), we don't strictly need user settings here
    // But keeping the original logic for now as it doesn't break anything.
    if (!isCheckingAuth) {
      loadUserSettings();
    }
  }, [isCheckingAuth]); // Run when isCheckingAuth changes, to ensure it doesn't run during initial check/redirect.


  // Auto-clear output when input is empty
  useEffect(() => {
    if (!inputText.trim()) {
      setOutputText("");
      setEnglishTranslation("");
      setTransliteration(""); // Clear transliteration too
      setDetectedLanguage("");
      setConfidenceScore(0);
      setCopySuccess(''); // Reset to empty string
      setError(null); // Clear error when input is cleared
      setUserFeedback(null); // Clear user feedback
      // Reset processed tone level to current when clearing, using the ref
      setProcessedToneLevel(latestToneLevelRef.current);
    }
  }, [inputText]);

  const handleAuth = async () => {
    try {
      // Use loginWithRedirect for published apps - this is the correct method for production
      const currentUrl = window.location.href;
      await User.loginWithRedirect(currentUrl);
      // After loginWithRedirect, the page will reload, and the useEffect will handle fetching user data.
    } catch (error) {
      console.error("Error with authentication:", error);
      // Fallback: redirect to base44 login page manually if needed
      window.location.href = '/auth/login';
    }
  };

  // Helper function to get the display name of a language
  const getOutputLanguageName = (outputLang) => {
    const languageMap = {
      'english': 'English',
      'spanish': 'Spanish',
      'french': 'French',
      'german': 'German',
      'hindi': 'Hindi',
      'chinese_simplified': 'Chinese (Simplified)',
      'japanese': 'Japanese',
      'arabic': 'Arabic',
      'portuguese': 'Portuguese',
      'italian': 'Italian',
      'russian': 'Russian',
      'korean': 'Korean',
      'urdu': 'Urdu',
      'punjabi': 'Punjabi'
    };
    return languageMap[outputLang] || 'English'; // Default to English name if not found
  };

  const getToneLabel = (level) => {
    const toneLabels = {
      1: "Casual",
      2: "Friendly", 
      3: "Professional",
      4: "Formal",
      5: "Confident"
    };
    return toneLabels[level] || "Professional";
  };

  // Helper function to get detailed language instructions for the LLM
  const getLanguageInstructions = (outputLang) => {
    const languageMap = {
      'english': 'English',
      'spanish': 'Spanish',
      'french': 'French', 
      'german': 'German',
      'chinese_simplified': 'Chinese (Simplified)',
      'japanese': 'Japanese',
      'arabic': 'Arabic',
      'portuguese': 'Portuguese',
      'italian': 'Italian',
      'russian': 'Russian',
      'korean': 'Korean',
      'hindi': 'Hindi',
      'urdu': 'Urdu',
      'punjabi': 'Punjabi'
    };

    const targetLanguage = languageMap[outputLang] || 'English';
    
    return `CRITICAL: You MUST rewrite and translate the text to ${targetLanguage}. The final output must be in ${targetLanguage}, not in the original language. Also provide an English translation of the rewritten text.`;
  };

  // Function to save user settings
  // This function is no longer needed on this page, and its associated UI/state is removed.
  // const handleSaveSettings = async () => { ... };

  const processText = async (langOverride = null) => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setOutputText("");
    setEnglishTranslation("");
    setTransliteration("");
    setDetectedLanguage("");
    setConfidenceScore(0);
    setCopySuccess('');
    setError(null);
    setUserFeedback(null);

    // Use the override if provided, otherwise use current state
    const currentOutputLanguage = langOverride || outputLanguage;

    // Store the tone level that will be used for processing
    const currentTone = toneLevel[0];
    setProcessedToneLevel(currentTone);

    // Check if current output language needs transliteration
    const nonLatinLanguages = ['hindi', 'chinese_simplified', 'japanese', 'arabic', 'russian', 'korean', 'urdu', 'punjabi'];
    const needsTransliteration = nonLatinLanguages.includes(currentOutputLanguage);
    
    try {
      const toneDesc = getToneLabel(currentTone);
      const languageInstructions = getLanguageInstructions(currentOutputLanguage);
      
      const prompt = `You are an expert communication assistant. Your task is to analyze and rewrite text based on specific instructions.

      INPUT TEXT: "${inputText}"

      Your process must follow these steps in no particular order:
      1.  **DETECT LANGUAGE:** First, accurately identify the language of the INPUT TEXT.
      2.  **REWRITE:** Next, rewrite the INPUT TEXT based on the following rules:
          - **TONE GOAL:** ${toneDesc} (Level: ${currentTone}/5). Your output must strictly match this tone.
          - **PRESERVE MEANING:** The core meaning of the original message must be perfectly preserved.
          - **LANGUAGE OUTPUT:** ${languageInstructions}
      ${needsTransliteration ? `
      3.  **TRANSLITERATION:** Provide a phonetic transliteration of your rewritten text using Latin characters to help with pronunciation.` : ''}

      Return your response in the following JSON format:
      {
        "polished_text": "The final rewritten text, in the correct output language as per the instructions.",
        "english_translation": "A clear English translation of the rewritten 'polished_text'. ALWAYS provide this.",
        "detected_language": "The language you detected in Step 1 (e.g., 'Spanish', 'Chinese').",
        "output_language": "The language of the 'polished_text' (e.g., 'Spanish', 'Korean').",${needsTransliteration ? `
        "transliteration": "Phonetic transliteration of the polished_text using Latin characters for pronunciation guidance.",` : ''}
        "confidence": "A confidence score from 0.0 to 1.0 for the quality of your rewrite and translation."
      }`;
      
      const schemaProperties = {
        polished_text: { type: "string" },
        english_translation: { type: "string" },
        detected_language: { type: "string" },
        output_language: { type: "string" },
        confidence: { type: "number" }
      };

      if (needsTransliteration) {
        schemaProperties.transliteration = { type: "string" };
      }

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: schemaProperties
        }
      });
      
      // Update state with new results
      setOutputText(result.polished_text);
      
      // Only display englishTranslation if it's different from polished_text
      if (result.polished_text !== result.english_translation) {
        setEnglishTranslation(result.english_translation);
      } else {
        setEnglishTranslation("");
      }

      // Set transliteration if available
      setTransliteration(result.transliteration || "");

      setDetectedLanguage(result.detected_language || "English");
      setConfidenceScore(Math.round((result.confidence || 0.9) * 100));

    } catch (err) {
      console.error("Error processing text:", err);
      let friendlyMessage = "Something went wrong. Please try again.";
      
      if (err.code === 'NETWORK_ERROR' || err.message?.includes("Network Error")) {
        friendlyMessage = "⚠️ Connection Issue: Please check that the 'Core' integration is enabled in your project settings.";
      } else if (err.response?.status === 503) {
        friendlyMessage = "🔧 AI service is temporarily unavailable. Please try again in a few minutes.";
      } else if (err.response?.status === 401) {
        friendlyMessage = "🔑 Authentication error. Please sign in for full access to AI features.";
      } else if (err.response?.status === 429) {
        friendlyMessage = "⏳ Too many requests. Please wait a moment before trying again.";
      } else if (err.response?.status >= 500) {
        friendlyMessage = "🔧 Server error. Please try again later.";
      } else if (err.response?.data?.message) {
        friendlyMessage = `❌ ${err.response.data.message}`;
      } else if (err.message) {
        friendlyMessage = `❌ ${err.message}`;
      }
      
      setError(friendlyMessage);
      setOutputText("");
    }

    setIsProcessing(false);
  };
  
  const clearAll = () => {
    setInputText("");
    setOutputText("");
    setEnglishTranslation("");
    setTransliteration("");
    setDetectedLanguage("");
    setConfidenceScore(0);
    setCopySuccess(''); // Reset copy state
    setError(null); // Clear error on manual clear
    setUserFeedback(null); // Clear user feedback
  };

  const clearOutput = () => {
    setOutputText("");
    setEnglishTranslation("");
    setTransliteration(""); // Clear transliteration
    setDetectedLanguage("");
    setConfidenceScore(0);
    setCopySuccess(''); // Reset copy state
    setError(null);
    setUserFeedback(null); // Clear user feedback
  };

  const handleOutputLanguageChange = (newLanguage) => {
    setOutputLanguage(newLanguage);
    // Re-process text if input exists and not currently processing
    if (inputText.trim() && !isProcessing) {
      processText(newLanguage);
    }
  };

  // Handle Enter key press for transforming text
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() && !isProcessing) {
        processText();
      }
    }
  };
  
  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <style>{`
          :root[data-theme="light"], :root {
            --bg-primary: #f8fafc;
            --text-primary: #1e293b;
            --text-secondary: #64748b;
          }
          :root[data-theme="dark"] {
            --bg-primary: #0d1117;
            --text-primary: #f0f6fc;
            --text-secondary: #8b949e;
          }
        `}</style>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-[var(--text-secondary)] text-sm">Loading Tonelate...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <style>{`
        :root[data-theme="light"], :root {
          /* Light Theme Colors (Default) */
          --bg-primary: #f8fafc;
          --bg-secondary: #ffffff;
          --bg-tertiary: #f1f5f9;
          --bg-sidebar: rgba(255, 255, 255, 0.8);
          --bg-card: rgba(255, 255, 255, 0.8);
          --bg-input: #ffffff;
          --bg-hover: #f1f5f9;
          --bg-active: #dbeafe;
          
          --text-primary: #1e293b;
          --text-secondary: #64748b;
          --text-tertiary: #94a3b8;
          --text-placeholder: #9ca3af;
          
          --border-primary: rgba(226, 232, 240, 0.6);
          --border-secondary: #e2e8f0;
          --border-hover: #cbd5e1;
          
          --accent-primary: #3b82f6;
          --accent-secondary: #6366f1;
          --success: #10b981;
          --warning: #f59e0b;
          --error: #ef4444;
          --info: #dbeafe;
          --info-border: #93c5fd;
          --info-text: #1d4ed8;
          --success-border: #86efac;
          --success-text: #166534;
          
          /* Light Mode Slider Variables */
          --slider-track: #e2e8f0;
          --slider-range: #3b82f6;
          --slider-thumb: #ffffff;
          --slider-thumb-border: #3b82f6;
          --slider-thumb-shadow: 0 1px 3px rgb(0 0 0 / 0.1), 0 1px 2px rgb(0 0 0 / 0.06);
          
          --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }

        :root[data-theme="dark"] {
          /* Dark Theme Colors - ChatGPT Inspired */
          --bg-primary: #0d1117;
          --bg-secondary: #21262d;
          --bg-tertiary: #30363d;
          --bg-sidebar: rgba(13, 17, 23, 0.8);
          --bg-card: #21262d;
          --bg-input: #30363d;
          --bg-hover: #262c36;
          --bg-active: #1f6feb33;
          
          --text-primary: #f0f6fc;
          --text-secondary: #8b949e;
          --text-tertiary: #6e7681;
          --text-placeholder: #656d76;
          
          --border-primary: #30363d;
          --border-secondary: #21262d;
          --border-hover: #444c56;
          
          --accent-primary: #1f6feb;
          --accent-secondary: #8b5cf6;
          --success: #238636;
          --warning: #d29922;
          --error: #f85149;
          --info: #1f6feb33;
          --info-border: #1f6feb;
          --info-text: #79c0ff;
          --success-border: #238636;
          --success-text: #7ee787;
          
          /* Dark Mode Slider Variables */
          --slider-track: #21262d;
          --slider-range: #58a6ff;
          --slider-thumb: #8b949e;
          --slider-thumb-border: #58a6ff;
          --slider-thumb-shadow: 0 2px 8px rgb(0 0 0 / 0.6), 0 0 0 1px rgb(88 166 255 / 0.3);
          
          --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
          --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4);
        }

        /* Enhanced Slider Styling */
        .custom-slider [data-radix-collection-item] { /* Added custom class to prevent global override */
          background-color: var(--slider-track) !important;
          border-radius: 6px;
          height: 6px;
        }

        .custom-slider [data-radix-collection-item] [data-orientation="horizontal"] { /* Added custom class */
          background-color: var(--slider-range) !important;
          border-radius: 6px;
          height: 100%;
        }

        .custom-slider [role="slider"] { /* Added custom class */
          background-color: var(--slider-thumb) !important;
          border: 2px solid var(--slider-thumb-border) !important;
          box-shadow: var(--slider-thumb-shadow) !important;
          width: 20px !important;
          height: 20px !important;
          border-radius: 50% !important;
          transition: all 0.2s ease !important;
        }

        .custom-slider [role="slider"]:hover { /* Added custom class */
          transform: scale(1.1);
          box-shadow: var(--slider-thumb-shadow), 0 0 0 4px rgb(88 166 255 / 0.15) !important;
        }

        .custom-slider [role="slider"]:focus { /* Added custom class */
          outline: none;
          box-shadow: var(--slider-thumb-shadow), 0 0 0 4px rgb(88 166 255 / 0.25) !important;
        }


        /* Enhanced Switch Styling for Dark Mode */
        :root[data-theme="dark"] [role="switch"] {
            --switch-bg: #30363d;
            --switch-bg-checked: #1f6feb;
            --switch-thumb-bg: #f0f6fc;
            background-color: var(--switch-bg) !important;
        }
        :root[data-theme="dark"] [role="switch"][data-state="checked"] {
            background-color: var(--switch-bg-checked) !important;
        }
        :root[data-theme="dark"] [role="switch"] > span {
            background-color: var(--switch-thumb-bg) !important;
        }

        /* Custom Scrollbar Styles */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px; /* For vertical scrollbars */
          height: 8px; /* For horizontal scrollbars */
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; /* Or a subtle background */
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: var(--text-tertiary); /* Color of the scroll thumb */
          border-radius: 10px;
          border: 2px solid transparent; /* To create some padding around the thumb */
          background-clip: padding-box; /* Important for the border to create padding */
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: var(--text-secondary); /* Darker thumb on hover */
        }

        /* Ensure smooth transitions */
        * {
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }
      `}</style>
      {/* Compact Header */}
      <header className="w-full px-6 py-3 sticky top-0 z-20 bg-[var(--bg-sidebar)] backdrop-blur-sm border-b border-[var(--border-primary)]">
        <div className="flex items-center justify-between mx-auto max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-[var(--text-primary)]">Tonelate</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleAuth} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]">
              Sign In
            </Button>
            <Button size="sm" onClick={handleAuth} className="bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg-primary)]">
              Start for Free
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]">
                  <Settings className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[var(--bg-secondary)] border-[var(--border-primary)] p-2">
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl("Help")} className="flex items-center cursor-pointer text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-md px-2 py-1.5">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-[var(--border-secondary)]"/>
                <div className="p-2">
                  <Label htmlFor="dark-mode-toggle" className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2 text-[var(--text-primary)]">
                      {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      <span className="text-sm">Dark Mode</span>
                    </div>
                    <Switch
                      id="dark-mode-toggle"
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                    />
                  </Label>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content Area - Perfectly Centered */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 pb-24 sm:pb-4">
        <div className="w-full max-w-6xl space-y-6 md:space-y-8">
          {/* Compact Title */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] flex items-center justify-center gap-3">
              Tonelate
            </h1>
            <p className="text-[var(--text-secondary)] mt-2 text-sm md:text-base max-w-2xl mx-auto">
              Transform any message into clear, effective communication—instantly.
            </p>
          </motion.div>

          {/* Core Rewriter Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid lg:grid-cols-2 gap-4 md:gap-6"
          >
            {/* Input Card */}
            <Card className="shadow-md border-[var(--border-primary)] bg-[var(--bg-card)] flex flex-col">
              <CardHeader className="pb-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
                      <Brain className="w-4 h-4 text-blue-500" />
                      Your Message
                    </CardTitle>
                    {inputText && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={clearAll}
                        className="w-5 h-5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                      >
                        <X className="w-2 h-2" />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] h-5">
                    <span>Any language, any style</span>
                     {detectedLanguage && (
                      <Badge variant="outline" className="flex items-center gap-1 text-xs border-[var(--border-secondary)] text-[var(--text-secondary)]">
                        <Globe className="w-2 h-2" />
                        {detectedLanguage}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 flex flex-col flex-grow">
                <Textarea
                  placeholder="Type your message here... (Press Enter to transform)"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="min-h-24 text-sm resize-none bg-[var(--bg-input)] border-[var(--border-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] custom-scrollbar"
                  dir="auto"
                />
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[var(--text-primary)]">
                      Tone: {getToneLabel(toneLevel[0])}
                    </label>
                    <Badge variant="outline" className="text-xs border-[var(--border-secondary)] text-[var(--text-secondary)]">{toneLevel[0]}/5</Badge>
                  </div>
                  <div className="px-1">
                    <Slider
                      value={toneLevel}
                      onValueChange={setToneLevel}
                      max={5} 
                      min={1} 
                      step={1}
                      className="w-full custom-slider"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] md:text-xs text-[var(--text-tertiary)] px-1 leading-tight">
                    <span className="text-center">Casual</span>
                    <span className="text-center">Friendly</span>
                    <span className="text-center">Professional</span>
                    <span className="text-center">Formal</span>
                    <span className="text-center">Confident</span>
                  </div>
                </div>
                <div className="pt-2 mt-auto">
                    <Button
                      onClick={() => {
                        processText();
                      }}
                      disabled={!inputText.trim() || isProcessing}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white h-10"
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      Transform
                    </Button>
                </div>
              </CardContent>
            </Card>

            {/* Output Card */}
            <Card className="shadow-md border-[var(--border-primary)] bg-[var(--bg-card)] flex flex-col">
              <CardHeader className="pb-4">
                <div className="space-y-3">
                  {/* First Row: Title and Close Button */}
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Perfect Result
                    </CardTitle>
                    {(outputText || englishTranslation || error || transliteration) && (
                      <Button variant="ghost" size="icon" onClick={clearOutput} className="w-5 h-5" style={{ color: 'var(--text-tertiary)', '--hover-bg': 'var(--bg-hover)' }}>
                        <X className="w-2 h-2" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Second Row: Tone Description and Controls */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs capitalize truncate" style={{ color: 'var(--text-secondary)' }}>
                      {getToneLabel(processedToneLevel)} & clear
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Language Selection Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2 text-xs flex items-center gap-1.5 rounded-lg hover:bg-[var(--bg-hover)]"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {languageOptions.find(lang => lang.value === outputLanguage)?.flag || '🇺🇸'}
                            <span className="hidden sm:inline text-xs">{languageOptions.find(lang => lang.value === outputLanguage)?.label || 'English'}</span>
                            <ChevronDown className="w-3 h-3 ml-auto text-[var(--text-tertiary)]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-[var(--bg-secondary)] border-[var(--border-primary)] max-h-64 overflow-y-auto">
                          {languageOptions.map((language) => (
                            <DropdownMenuItem
                              key={language.value}
                              onClick={() => handleOutputLanguageChange(language.value)}
                              className="cursor-pointer flex items-center gap-2 px-3 py-2 hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
                            >
                              <span className="text-base">{language.flag}</span>
                              <span className="text-sm">{language.label}</span>
                              {outputLanguage === language.value && (
                                <CheckCircle className="w-4 h-4 ml-auto text-gray-500" />
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {confidenceScore > 0 && (
                        <Badge className="bg-green-100 text-green-700 text-xs px-2 py-1">
                          {confidenceScore}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                {isProcessing ? (
                  <div className="m-auto text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-3"></div>
                    <p className="text-[var(--text-secondary)] text-sm">AI is working...</p>
                  </div>
                ) : error ? (
                  <div className="m-auto text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                ) : outputText ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="p-4 bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-lg relative">
                      <p className="text-[var(--text-primary)] leading-relaxed text-sm font-medium break-words whitespace-pre-wrap pr-8 pb-8">
                        {outputText}
                      </p>
                      {transliteration && (
                        <p className="mt-2 text-xs italic pb-8" style={{ color: 'var(--text-secondary)' }}>
                          {transliteration}
                        </p>
                      )}
                       <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(outputText);
                          setCopySuccess('output');
                          setTimeout(() => setCopySuccess(''), 2000);
                        }}
                        className="absolute bottom-2 right-2 w-6 h-6 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                      >
                        {copySuccess === 'output' ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                    
                    {englishTranslation && (
                      <div className="p-4 rounded-lg border relative" style={{ backgroundColor: 'var(--info)', borderColor: 'var(--info-border)' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="w-3 h-3" style={{ color: 'var(--info-text)' }} />
                          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--info-text)' }}>Professional English Translation</p>
                        </div>
                        <p className="leading-relaxed text-sm font-medium break-words pr-8 pb-8" style={{ color: 'var(--info-text)' }}>
                          {englishTranslation}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(englishTranslation);
                            setCopySuccess('translation');
                            setTimeout(() => setCopySuccess(''), 2000);
                          }}
                          className="absolute bottom-2 right-2 w-6 h-6"
                          style={{ color: 'var(--info-text)', opacity: '0.7' }}
                        >
                          {copySuccess === 'translation' ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-end gap-3 pt-1">
                      <button
                        onClick={() => {
                          setUserFeedback('positive');
                        }}
                        className="p-2 hover:bg-[var(--bg-hover)] rounded-md transition-colors duration-150 focus:outline-none"
                        aria-label="Like result"
                      >
                        <ThumbsUp
                          className={`w-4 h-4 transition-colors duration-150 ${
                            userFeedback === 'positive'
                              ? 'text-green-500'
                              : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                          }`}
                          fill={userFeedback === 'positive' ? 'currentColor' : 'none'}
                        />
                      </button>
                      <button
                        onClick={() => {
                          setUserFeedback('negative');
                        }}
                        className="p-2 hover:bg-[var(--bg-hover)] rounded-md transition-colors duration-150 focus:outline-none"
                        aria-label="Dislike result"
                      >
                        <ThumbsDown
                          className={`w-4 h-4 transition-colors duration-150 ${
                            userFeedback === 'negative'
                              ? 'text-red-500'
                              : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                          }`}
                          fill={userFeedback === 'negative' ? 'currentColor' : 'none'}
                        />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="m-auto text-center text-[var(--text-secondary)]">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-sm">Your transformed message will appear here</p>
                    <p className="text-xs mt-1">Ready to refine your communication</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Smooth Transitioning Examples */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center"
          >
            <p className="text-[var(--text-secondary)] mb-3 font-medium text-sm">Or, get started with an example:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayedSamples.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInputText(sample.text);
                  }}
                  className="text-left p-4 bg-[var(--bg-secondary)] border border-[var(--border-secondary)] rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 w-full min-h-[90px] flex flex-col justify-between hover:scale-[1.01]"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${sample.text}-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="flex flex-col justify-between h-full"
                    >
                      <Badge variant="secondary" className="text-xs w-fit mb-3 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-secondary)]">
                        {sample.description}
                      </Badge>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed break-words flex-1">
                        "{sample.text.length > 100 
                          ? sample.text.substring(0, 100) + '...' 
                          : sample.text}"
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Compact Footer */}
      <footer className="w-full text-center py-4 border-t border-[var(--border-primary)]">
        <p className="text-xs text-[var(--text-tertiary)]">
          © 2025 Tonelate. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
