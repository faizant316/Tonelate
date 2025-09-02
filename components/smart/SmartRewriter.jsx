
import React, { useState, useRef, useEffect } from "react";
import { InvokeLLM } from "@/integrations/Core";
import { Rewrite, User, Settings as SettingsEntity } from "@/entities/all"; // Renamed Settings to SettingsEntity
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import UpgradeModal from "../shared/UpgradeModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BrainCircuit,
  RefreshCw,
  Copy,
  CheckCircle,
  Globe,
  MessageSquare,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  X,
  History,
  Settings as SettingsIcon,
  ArrowRight,
  ChevronDown,
  Brain // Added Brain icon import
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Switch } from "@/components/ui/switch"; // Import Switch component
import { Label } from "@/components/ui/label"; // Import Label component


// The original CopyButton component is no longer used directly as per outline.
// Its functionality (copy + visual feedback) is now inlined where needed.

export default function SmartRewriter() {
  // Core State
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [englishTranslation, setEnglishTranslation] = useState("");
  const [transliteration, setTransliteration] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Enhanced AI State
  const [selectedAIModel, setSelectedAIModel] = useState('openai');
  const [processedAIModel, setProcessedAIModel] = useState('openai');

  // AI Analysis State
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [confidenceScore, setConfidenceScore] = useState(0);

  // User Control State
  const [toneLevel, setToneLevel] = useState([3]); // Default to Professional (new 3)
  const [outputLength, setOutputLength] = useState('standard');
  const [outputLanguage, setOutputLanguage] = useState('english'); // Changed default to 'english'
  const [processedToneLevel, setProcessedToneLevel] = useState(3); // Default to Professional (new 3)
  const [processedOutputLanguage, setProcessedOutputLanguage] = useState('english');
  const [userFeedback, setUserFeedback] = useState(null);

  // UI State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(''); // New state for copy success feedback

  // Learning & Personalization
  const [user, setUser] = useState(null);
  const [userSettings, setUserSettings] = useState({}); // New state for user settings
  const [isSavingSettings, setIsSavingSettings] = useState(false); // New state for saving status

  // Refs
  const textareaRef = useRef(null);

  // Rate Limiting State
  const [lastRequestTime, setLastRequestTime] = useState(0);

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

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      try {
        const userSettingsList = await SettingsEntity.filter({ created_by: userData.email });
        const userSettingsMap = userSettingsList.reduce((acc, setting) => {
            acc[setting.setting_key] = setting.setting_value;
            return acc;
        }, {});

        setUserSettings(userSettingsMap); // Set the new state

        setOutputLength(userSettingsMap.output_length || 'standard');
        setSelectedAIModel(userSettingsMap.preferred_ai_model || 'openai');
        setOutputLanguage(userSettingsMap.preferred_output_language || 'english');

        const toneMapping = {
            casual: 1,
            friendly: 2,
            professional: 3,
            formal: 4,
            confident: 5,
        };
        const defaultTone = toneMapping[userSettingsMap.preferred_tone] || 3;
        setToneLevel([defaultTone]);
      } catch (settingsError) {
        console.warn("Could not load user settings, using defaults:", settingsError);
        // Ensure userSettings is set to defaults if loading fails
        setUserSettings({});
        setOutputLength('standard');
        setSelectedAIModel('openai');
        setOutputLanguage('english');
        setToneLevel([3]);
      }

    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.warn("User not authenticated, using default settings");
      } else {
        console.warn("Could not load user data, using defaults:", error);
      }
      setUser(null);
      // Ensure userSettings is set to defaults if user loading fails
      setUserSettings({});
      setOutputLength('standard');
      setSelectedAIModel('openai');
      setOutputLanguage('english');
      setToneLevel([3]);
    }
  };

  const saveSetting = async (key, value, type = "string", category = "ui_preferences") => {
    if (!user) {
      console.warn("Cannot save setting: user not logged in");
      return;
    }
    try {
      const existingSetting = await SettingsEntity.filter({
        setting_key: key,
        created_by: user.email
      });

      if (existingSetting.length > 0) {
        await SettingsEntity.update(existingSetting[0].id, {
          setting_value: value.toString(),
        });
      } else {
        await SettingsEntity.create({
          setting_key: key,
          setting_value: value.toString(),
          setting_type: type,
          category: category,
          description: `User preference for ${key}`
        });
      }
    } catch (error) {
      console.warn("Error saving setting:", error);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    // Update the local userSettings state before saving
    await saveSetting('allow_emojis', userSettings.allow_emojis, 'boolean', 'ai_behavior');
    setIsSavingSettings(false);
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

    return `CRITICAL: You MUST rewrite and translate the text to ${targetLanguage}. The final output must be in ${targetLanguage, 'not in the original language. Also provide an English translation of the rewritten text.'}`;
  };

  const processText = async (langOverride = null) => {
    if (!inputText.trim()) return;
    const startTime = Date.now();

    const now = Date.now();
    if (now - lastRequestTime < 1000) {
      console.log("Request throttled");
      return;
    }

    setLastRequestTime(now);

    setIsProcessing(true);
    setError(null);
    setUserFeedback(null);
    setOutputText("");
    setEnglishTranslation("");
    setTransliteration("");
    setDetectedLanguage("");
    setConfidenceScore(0);
    setCopySuccess(''); // Clear copy success state on new processing

    const currentTone = toneLevel[0];
    const currentOutputLanguage = langOverride !== null ? langOverride : outputLanguage;

    setProcessedToneLevel(currentTone);
    setProcessedAIModel(selectedAIModel);
    setProcessedOutputLanguage(currentOutputLanguage);

    const nonLatinLanguages = ['hindi', 'chinese_simplified', 'japanese', 'arabic', 'russian', 'korean', 'urdu', 'punjabi'];
    const needsTransliteration = nonLatinLanguages.includes(currentOutputLanguage);

    // Check emoji setting from userSettings state
    const allowEmojis = userSettings.allow_emojis === 'true'; // Stored as string 'true' or 'false'

    try {
      let currentUser = user;
      if (!currentUser) {
        try {
          currentUser = await User.me();
          setUser(currentUser);
        } catch (e) {
            console.warn("Could not re-fetch user data for subscription check:", e);
        }
      }

      const toneDesc = getToneLabel(currentTone);
      const languageInstructions = getLanguageInstructions(currentOutputLanguage);

      const prompt = `You are an expert communication assistant. Your task is to analyze and rewrite text based on specific instructions.

      INPUT TEXT: "${inputText}"

      Your process must follow these steps in order:
      1.  **DETECT LANGUAGE:** First, accurately identify the language of the INPUT TEXT.
      2.  **REWRITE:** Next, rewrite the INPUT TEXT based on the following rules:
          - **TONE GOAL:** ${toneDesc} (Level: ${currentTone}/5). Your output must strictly match this tone.
          - **OUTPUT LENGTH:** ${outputLength}
          - **PRESERVE MEANING:** The core meaning of the original message must be perfectly preserved.
          - ${languageInstructions}
          - **EMOJI USAGE:** ${allowEmojis ? 'You MAY use appropriate emojis to enhance the message when they add value and fit the tone.' : 'Do NOT use any emojis in your rewrite. Keep the text emoji-free.'}
      ${needsTransliteration ? `
      3.  **TRANSLITERATION:** Provide a phonetic transliteration of your rewritten text using Latin characters to help with pronunciation.` : ''}

      Return your response in the following JSON format:
      {
        "polished_text": "The final rewritten text, in ${getLanguageInstructions(currentOutputLanguage).replace(/CRITICAL: You MUST rewrite and translate the text to (.*?)\..*/s, '$1').replace('The final output must be in', '').trim()}.",
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
          properties: schemaProperties,
          required: ["polished_text", "english_translation", "detected_language", "output_language", "confidence"]
        }
      });

      setOutputText(result.polished_text);

      if (result.polished_text !== result.english_translation) {
        setEnglishTranslation(result.english_translation);
      } else {
        setEnglishTranslation("");
      }

      setTransliteration(result.transliteration || "");

      setDetectedLanguage(result.detected_language || "English");
      setConfidenceScore(Math.round((result.confidence || 0.9) * 100));

      if (langOverride === null && currentUser) {
          const processingTime = Date.now() - startTime;
          try {
            await Rewrite.create({
              original_text: inputText,
              rewritten_text: result.polished_text,
              output_language: currentOutputLanguage,
              context_type: 'other',
              confidence_score: result.confidence || 0.9,
              processing_time: processingTime,
              word_count: inputText.split(' ').length,
              user_action: 'generated',
              website: 'Tonelater'
            });
          } catch (historyError) {
            console.warn("Failed to save to history:", historyError);
          }
      }

    } catch (e) {
      console.error("Error processing text:", e);
      let friendlyMessage = "Something went wrong. Please try again.";
      if (e.code === 'NETWORK_ERROR' || e.message?.includes("Network Error")) {
        friendlyMessage = "⚠️ Connection Issue: Please check that the 'Core' integration is enabled in your project settings (Dashboard → Integrations → Core). If it's already enabled, please try again in a moment.";
      } else if (e.response?.status === 503) {
        friendlyMessage = "🔧 AI service is temporarily unavailable. Please try again in a few minutes.";
      } else if (e.response?.status === 401) {
        friendlyMessage = "🔑 Authentication error. Please sign in for full access to AI features.";
      } else if (e.response?.status === 429) {
        friendlyMessage = "⏳ Too many requests. Please wait a moment before trying again.";
      } else if (e.response?.status >= 500) {
        friendlyMessage = "🔧 Server error. Our team has been notified. Please try again later.";
      } else if (e.response?.data?.message) {
        friendlyMessage = `❌ ${e.response.data.message}`;
      } else if (e.message) {
        friendlyMessage = `❌ ${e.message}`;
      }

      setError(friendlyMessage);
      setOutputText("");
      setEnglishTranslation("");
      setTransliteration("");
      setDetectedLanguage("");
      setConfidenceScore(0);
      setUserFeedback(null);
      setCopySuccess(''); // Clear copy success state on error
    } finally {
        setIsProcessing(false);
    }
  };

  const handleModelChange = (newModel) => {
    if (newModel) {
      setSelectedAIModel(newModel);
      if (user) {
        saveSetting('preferred_ai_model', newModel, 'string', 'integrations');
      }
    }
  };

  const handleOutputLanguageChange = (newLanguage) => {
    setOutputLanguage(newLanguage);
    if (user) {
      saveSetting('preferred_output_language', newLanguage, 'string', 'ai_behavior');
    }
    if (inputText.trim() && !isProcessing) {
      processText(newLanguage);
    }
  };

  const handleFeedback = async (feedback) => {
    setUserFeedback(feedback);
  };

  const clearOutput = () => {
    setOutputText("");
    setEnglishTranslation("");
    setTransliteration("");
    setDetectedLanguage("");
    setConfidenceScore(0);
    setUserFeedback(null);
    setProcessedToneLevel(toneLevel[0]);
    setProcessedAIModel(selectedAIModel);
    setProcessedOutputLanguage(outputLanguage);
    setError(null);
    setCopySuccess(''); // Clear copy success state on clear
  };

  const clearAll = () => {
    setInputText("");
    clearOutput();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim()) {
        processText();
      }
    }
  };

  useEffect(() => {
    if (!inputText.trim()) {
      setOutputText("");
      setEnglishTranslation("");
      setTransliteration("");
      setDetectedLanguage("");
      setConfidenceScore(0);
      setError(null);
      setUserFeedback(null);
      setCopySuccess(''); // Clear copy success state when input is cleared
    }
  }, [inputText, setOutputText, setEnglishTranslation, setTransliteration, setDetectedLanguage, setConfidenceScore, setError, setUserFeedback]);

  const getFirstName = (fullName) => {
    if (!fullName) return "there";
    return fullName.split(' ')[0];
  };

  const modelDisplayNames = {
    openai: "GPT-4",
    mistral: "Mistral",
  };

  const handleRegenerate = () => {
    processText();
  };

  return (
    <>
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      <motion.div
        className="w-full"
      >
        <div className="max-w-6xl mx-auto space-y-4 md:space-y-6 px-4 md:px-0 pb-24 sm:pb-8"> {/* Added bottom padding for mobile cutoff fix */}
          {user && (
            <div className="text-center mb-2">
              <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                Welcome back, {getFirstName(user.full_name)}!
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Input Card */}
            <Card className="shadow-md border-[var(--border-primary)] bg-[var(--bg-card)]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-baseline gap-2 flex-wrap" style={{ color: 'var(--text-primary)' }}>
                    <Brain className="w-4 h-4 text-blue-500" />
                    <span>Your Message</span>
                    <Badge className="font-medium text-xs px-2 py-[1px] rounded-full border cursor-default" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-secondary)' }}>
                      {modelDisplayNames[selectedAIModel]}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {detectedLanguage && (
                      <Badge variant="outline" className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-secondary)' }}>
                        <Globe className="w-2 h-2" />
                        {detectedLanguage}
                      </Badge>
                    )}
                    {inputText && (
                      <Button variant="ghost" size="icon" onClick={clearAll} className="w-5 h-5" style={{ color: 'var(--text-tertiary)', '--hover-bg': 'var(--bg-hover)' }}>
                        <X className="w-2 h-2" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Any language, any style</p>
              </CardHeader>
              <CardContent className="space-y-3 flex flex-col min-h-[260px] md:min-h-[295px]">
                <Textarea
                  ref={textareaRef}
                  placeholder="Type your message here... (Press Enter to transform)"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="min-h-24 text-sm resize-none bg-[var(--bg-input)] border-[var(--border-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)] custom-scrollbar"
                  dir="auto"
                />

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                      Tone: {getToneLabel(toneLevel[0])}
                    </label>
                    <Badge variant="outline" className="text-xs" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-secondary)' }}>{toneLevel[0]}/5</Badge>
                  </div>
                  <div className="px-1">
                    <Slider
                      value={toneLevel}
                      onValueChange={(value) => {
                        setToneLevel(value);
                      }}
                      max={5} min={1} step={1}
                      className="w-full custom-slider"
                    />
                    <div className="flex justify-between text-[10px] md:text-xs text-[var(--text-tertiary)] px-1 mt-1.5 leading-tight">
                      <span className="text-center">Casual</span>
                      <span className="text-center">Friendly</span>
                      <span className="text-center">Professional</span>
                      <span className="text-center">Formal</span>
                      <span className="text-center">Confident</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 mt-auto">
                  <Button
                    onClick={() => {
                      processText();
                    }}
                    disabled={!inputText.trim() || isProcessing}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white h-10 flex-1"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span className="hidden sm:inline">Transforming...</span>
                      </div>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Transform
                      </>
                    )}
                  </Button>
                  <DropdownMenu onOpenChange={setIsMenuOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-10 w-10 p-0 flex-shrink-0 rounded-lg" style={{ '--hover-bg': 'var(--bg-hover)' }}>
                        <SettingsIcon className={`w-5 h-5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : 'rotate-0'}`} style={{ color: 'var(--text-secondary)' }} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 rounded-xl shadow-lg p-3 bg-[var(--bg-secondary)] border-[var(--border-primary)]">
                      <DropdownMenuItem onClick={() => handleModelChange('openai')} className="cursor-pointer p-4 flex justify-between items-start rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-primary)] mb-2">
                        <div className="flex flex-col flex-1">
                          <span className="font-semibold text-sm text-[var(--text-primary)] mb-1">OpenAI GPT</span>
                          <span className="text-xs text-[var(--text-secondary)] leading-relaxed">General-purpose, versatile style.</span>
                        </div>
                        {selectedAIModel === 'openai' && <CheckCircle className="w-4 h-4 text-gray-500 mt-0.5 ml-3" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleModelChange('mistral')} className="cursor-pointer p-4 flex justify-between items-start rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-primary)]">
                        <div className="flex flex-col flex-1">
                          <span className="font-semibold text-sm text-[var(--text-primary)] mb-1">Mistral AI</span>
                          <span className="text-xs text-[var(--text-secondary)] leading-relaxed">European business style, nuanced.</span>
                        </div>
                        {selectedAIModel === 'mistral' && <CheckCircle className="w-4 h-4 text-gray-500 mt-0.5 ml-3" />}
                      </DropdownMenuItem>

                      {/* New: Emoji Setting */}
                      <DropdownMenuSeparator />
                      <div className="p-3">
                        <div className="flex items-center justify-between space-x-2 mb-3">
                          <Label htmlFor="allow-emojis" className="text-sm font-semibold text-[var(--text-primary)] cursor-pointer">
                            Allow Emojis
                          </Label>
                          <Switch
                            id="allow-emojis"
                            checked={userSettings.allow_emojis === 'true'}
                            onCheckedChange={(checked) => {
                              setUserSettings(prev => ({ ...prev, allow_emojis: checked.toString() }));
                            }}
                            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-[var(--border-secondary)]"
                          />
                        </div>
                        <Button
                          onClick={handleSaveSettings}
                          disabled={isSavingSettings || !user}
                          className="w-full text-xs py-1 h-8"
                          style={{
                            backgroundColor: 'var(--accent-primary)',
                            color: 'white',
                            borderColor: 'var(--accent-primary)',
                            '--hover-bg': 'var(--accent-secondary)'
                          }}
                        >
                          {isSavingSettings ? 'Saving...' : 'Save Settings'}
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>

            {/* Output Card */}
            <Card className="shadow-md border-[var(--border-primary)] bg-[var(--bg-card)]">
              <CardHeader className="pb-3">
                <div className="space-y-2">
                  {/* First Row: Title and Close Button */}
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Perfect Result
                    </CardTitle>
                    {(outputText || englishTranslation || transliteration || error) && (
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
                            <ChevronDown className="w-3 h-3 ml-1 text-[var(--text-tertiary)]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-[var(--bg-secondary)] border-[var(--border-primary)] max-h-64 overflow-y-auto">
                          {languageOptions.map((language) => (
                            <DropdownMenuItem
                              key={language.value}
                              onClick={() => {
                                handleOutputLanguageChange(language.value);
                              }}
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
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs px-2 py-1 font-medium">
                          {confidenceScore}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col min-h-[260px] md:min-h-[295px]">
                {isProcessing ? (
                  <div className="m-auto text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--accent-primary)] mx-auto mb-3"></div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI is working...</p>
                  </div>
                ) : error ? (
                  <div className="m-auto text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                ) : outputText ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3 flex-1 flex flex-col"
                  >
                    <div className="p-3 border rounded-lg flex-1 relative" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-secondary)' }}>
                      <p className="leading-relaxed text-sm font-medium break-words pr-8 pb-8 whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                        {outputText}
                      </p>
                      {transliteration && (
                          <p className="mt-2 text-xs italic pb-8" style={{ color: 'var(--text-secondary)' }}>
                              {transliteration}
                          </p>
                      )}
                      {/* Replaced CopyButton with inline logic for haptic feedback and copySuccess state */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(outputText);
                          setCopySuccess('output');
                          setTimeout(() => setCopySuccess(''), 2000);
                        }}
                        className="absolute bottom-2 right-2 w-6 h-6 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
                      >
                        {copySuccess === 'output' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>

                    {englishTranslation && (
                      <div className="p-3 rounded-lg border relative" style={{ backgroundColor: 'var(--info)', borderColor: 'var(--info-border)' }}>
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="w-3 h-3" style={{ color: 'var(--info-text)' }} />
                          <p className="text-xs font-semibold capitalize" style={{ color: 'var(--info-text)' }}>{getToneLabel(processedToneLevel)} English Translation</p>
                        </div>
                        <p className="leading-relaxed text-sm font-medium break-words pr-8 pb-8" style={{ color: 'var(--info-text)' }}>
                          {englishTranslation}
                        </p>
                        {/* Replaced CopyButton with inline logic for haptic feedback and copySuccess state */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(englishTranslation);
                            setCopySuccess('translation');
                            setTimeout(() => setCopySuccess(''), 2000);
                          }}
                          className="absolute bottom-2 right-2 w-6 h-6 hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
                          style={{ color: 'var(--info-text)', opacity: '0.7' }}
                        >
                          {copySuccess === 'translation' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      onClick={() => {
                        handleFeedback('positive');
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
                        handleFeedback('negative');
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
                  <div className="m-auto text-center" style={{ color: 'var(--text-secondary)' }}>
                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-sm">Your transformed message will appear here</p>
                    <p className="text-xs mt-1">Let's refine your communication.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </>
  );
}
