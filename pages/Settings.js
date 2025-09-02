
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { User, Settings as SettingsEntity } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Settings as SettingsIcon,
  User as UserIcon,
  Brain,
  Zap,
  Shield,
  CreditCard,
  LogOut,
  Loader2,
  Sparkles,
  Check,
  Moon,
  Sun,
  Trash2,
  Download,
} from "lucide-react";
import { createPageUrl } from "@/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For personal use & occasional needs",
    features: [
      "25 rewrites/month",
      "Standard AI model",
      "Community support"
    ],
    isCurrent: (userPlan) => userPlan === 'free' || !userPlan,
    buttonText: "Your Current Plan"
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    description: "For professionals & heavy users",
    features: [
      "2,000 rewrites/month",
      "Advanced AI models",
      "Priority email support",
      "Team collaboration (soon)"
    ],
    isCurrent: (userPlan) => userPlan === 'pro',
    isPopular: true,
    buttonText: "Upgrade to Pro"
  },
  {
    name: "Team",
    price: "$29.99",
    period: "/month",
    description: "For collaborating teams",
    features: [
      "10,000 rewrites/month",
      "Centralized billing",
      "Team management",
      "Custom tone guidelines"
    ],
    isCurrent: (userPlan) => userPlan === 'team',
    buttonText: "Upgrade to Team"
  }
];

export default function Settings() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  // Removed commonPartners and partnerInput states as the section is removed

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab('profile');
    }
  }, [location.search]);

  // Removed useEffect for common_partners as it's no longer managed

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    setHasUnsavedChanges(false); // Reset unsaved changes on data load
    setPendingChanges({}); // Clear pending changes on data load
    try {
      const userData = await User.me();
      setUser(userData);
      // Removed common_partners initialization as the section is removed

      const userSettings = await SettingsEntity.filter({ created_by: userData.email });
      const settingsMap = {};
      userSettings.forEach(setting => {
        settingsMap[setting.setting_key] = setting.setting_value;
      });
      setSettings(settingsMap);
      
      // Initialize dark mode state based on settings from DB or localStorage
      const storedDarkMode = localStorage.getItem('darkMode');
      if (storedDarkMode !== null) {
        setDarkMode(storedDarkMode === 'true');
        if (storedDarkMode === 'true') {
          document.documentElement.classList.add('dark');
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.setAttribute('data-theme', 'light');
        }
      } else {
        setDarkMode(settingsMap.dark_mode_enabled === 'true');
        if (settingsMap.dark_mode_enabled === 'true') {
          document.documentElement.classList.add('dark');
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.setAttribute('data-theme', 'light');
        }
      }

    } catch (e) {
      console.error("Error loading settings:", e);
      if (e.message?.includes("Network Error")) {
        setError("Could not load your settings. Please check your internet connection and ensure 'Core' integration is enabled.");
      } else {
        setError("An unexpected error occurred while loading your settings.");
      }
    }
    setIsLoading(false);
  };

  const saveSetting = async (key, value, type = "string", category = "ui_preferences") => {
    // Mark as having unsaved changes and store the pending change
    setHasUnsavedChanges(true);
    setPendingChanges(prev => ({ ...prev, [key]: { value, type, category } }));
    
    // Update UI immediately for responsiveness
    setSettings(prev => ({ ...prev, [key]: value.toString() }));
    
    // If dark mode setting changed, apply immediately
    if (key === 'dark_mode_enabled') {
      setDarkMode(value);
      localStorage.setItem('darkMode', value.toString());
      
      if (value) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
  };

  const saveAllPendingChanges = async () => {
    setIsSaving(true);
    try {
      for (const [key, { value, type, category }] of Object.entries(pendingChanges)) {
        const existingSetting = await SettingsEntity.filter({
          setting_key: key,
          created_by: user.email
        });

        if (existingSetting.length > 0) {
          await SettingsEntity.update(existingSetting[0].id, {
            setting_value: value.toString(),
            setting_type: type
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
      }
      
      setHasUnsavedChanges(false);
      setPendingChanges({});
    } catch (error) {
      console.error("Error saving settings:", error);
      // Revert UI if save fails
      try {
        const userSettings = await SettingsEntity.filter({ created_by: user.email });
        const settingsMap = {};
        userSettings.forEach(setting => {
          settingsMap[setting.setting_key] = setting.setting_value;
        });
        setSettings(settingsMap);
      } catch (revertError) {
        console.error("Error reverting settings:", revertError);
      }
    } finally {
      setTimeout(() => setIsSaving(false), 300);
    }
  };

  const saveUserProfile = async (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
    setIsSaving(true);
    
    try {
      // Removed common_partners handling as the section is removed
      await User.updateMyUserData(updates);
    } catch (error) {
      console.error("Error updating profile:", error);
      try {
        const userData = await User.me();
        setUser(userData);
        // Removed common_partners handling as the section is removed
      } catch (revertError) {
        console.error("Error reverting user data:", revertError);
      }
    } finally {
      setTimeout(() => setIsSaving(false), 300);
    }
  };

  // Removed handlers for common partners: handlePartnerInputKeydown, removePartner
  
  const handleDataRequest = (type) => {
    alert(`A request to ${type} your data has been received. This functionality is a placeholder. In a real application, this would trigger a backend process.`);
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      window.location.href = createPageUrl("Home");
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  const handleUpgrade = (planName) => {
    console.log(`Upgrading to ${planName}`);
    alert(`Upgrade to ${planName} functionality would be implemented here`);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">Settings</h1>
              <p className="text-[var(--text-secondary)] mt-1">
                Customize your communication assistant
              </p>
            </div>
            {hasUnsavedChanges && (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[var(--warning)] rounded-full animate-pulse"></div>
                <span className="text-sm text-[var(--warning)]">Unsaved changes</span>
                <Button
                  onClick={saveAllPendingChanges}
                  disabled={isSaving}
                  className="bg-[var(--accent-primary)] hover:opacity-90 text-white"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <span className="font-medium">Connection Issue:</span>
              <span>{error}</span>
            </div>
            <button 
              onClick={loadData}
              className="mt-2 text-sm text-red-600 underline hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(tab) => { setActiveTab(tab); }} className="space-y-8">
          {/* Mobile: Scrollable horizontal tabs */}
          <div className="block md:hidden pb-24">
            <div className="overflow-x-auto scrollbar-hide">
              <TabsList className="inline-flex h-12 p-1 rounded-xl bg-[var(--bg-tertiary)] min-w-max">
                <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] text-[var(--text-secondary)] rounded-lg px-3 py-2 font-medium text-sm whitespace-nowrap">
                  <UserIcon className="w-4 h-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex items-center gap-2 data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] text-[var(--text-secondary)] rounded-lg px-3 py-2 font-medium text-sm whitespace-nowrap">
                  <Moon className="w-4 h-4" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center gap-2 data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] text-[var(--text-secondary)] rounded-lg px-3 py-2 font-medium text-sm whitespace-nowrap">
                  <Brain className="w-4 h-4" />
                  AI Behavior
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-2 data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] text-[var(--text-secondary)] rounded-lg px-3 py-2 font-medium text-sm whitespace-nowrap">
                  <Shield className="w-4 h-4" />
                  Privacy
                </TabsTrigger>
                <TabsTrigger value="billing" className="flex items-center gap-2 data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] text-[var(--text-secondary)] rounded-lg px-3 py-2 font-medium text-sm whitespace-nowrap">
                  <CreditCard className="w-4 h-4" />
                  Billing
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Desktop: Full width grid */}
          <div className="hidden md:block">
            <TabsList className="grid w-full grid-cols-5 h-14 p-1 rounded-xl bg-[var(--bg-tertiary)]">
              <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] text-[var(--text-secondary)] rounded-lg px-2 py-2 font-medium text-sm">
                <UserIcon className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2 data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] text-[var(--text-secondary)] rounded-lg px-2 py-2 font-medium text-sm">
                <Moon className="w-4 h-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2 data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] text-[var(--text-secondary)] rounded-lg px-2 py-2 font-medium text-sm">
                <Brain className="w-4 h-4" />
                AI Behavior
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2 data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] text-[var(--text-secondary)] rounded-lg px-2 py-2 font-medium text-sm">
                <Shield className="w-4 h-4" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2 data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] text-[var(--text-secondary)] rounded-lg px-2 py-2 font-medium text-sm">
                <CreditCard className="w-4 h-4" />
                Billing
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <div className="grid gap-6">
              <Card className="border-[var(--border-primary)] shadow-sm bg-[var(--bg-card)]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-[var(--text-primary)]">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-[var(--accent-primary)]" />
                      Profile Information
                    </div>
                    {isSaving && (
                      <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-[var(--text-primary)]">Full Name</Label>
                      <Input
                        id="fullName"
                        defaultValue={user?.full_name || ''}
                        onBlur={(e) => { saveUserProfile({ full_name: e.target.value }); }}
                        placeholder="Your full name"
                        className="bg-[var(--bg-input)] border-[var(--border-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]"
                        disabled={isSaving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[var(--text-primary)]">Email</Label>
                      <Input
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-[var(--bg-tertiary)] border-[var(--border-secondary)] text-[var(--text-secondary)]"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="industry" className="text-[var(--text-primary)]">Industry</Label>
                      <Select
                        value={user?.industry || ''}
                        onValueChange={(value) => { saveUserProfile({ industry: value }); }}
                        disabled={isSaving}
                      >
                        <SelectTrigger className="bg-[var(--bg-input)] border-[var(--border-secondary)] text-[var(--text-primary)]">
                          <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                        <SelectContent className="bg-[var(--bg-secondary)] border-[var(--border-primary)] shadow-lg max-h-60 overflow-y-auto">
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="consulting">Consulting</SelectItem>
                          <SelectItem value="import_export">Import/Export</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nativeLanguage" className="text-[var(--text-primary)]">Native Language</Label>
                      <Select
                        value={user?.native_language || ''}
                        onValueChange={(value) => { saveUserProfile({ native_language: value }); }}
                        disabled={isSaving}
                      >
                        <SelectTrigger className="bg-[var(--bg-input)] border-[var(--border-secondary)] text-[var(--text-primary)]">
                          <SelectValue placeholder="Select your native language" />
                        </SelectTrigger>
                        <SelectContent className="bg-[var(--bg-secondary)] border-[var(--border-primary)] shadow-lg max-h-60 overflow-y-auto">
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="spanish">Spanish</SelectItem>
                          <SelectItem value="chinese">Chinese (Mandarin)</SelectItem>
                          <SelectItem value="hindi">Hindi</SelectItem>
                          <SelectItem value="arabic">Arabic</SelectItem>
                          <SelectItem value="portuguese">Portuguese</SelectItem>
                          <SelectItem value="russian">Russian</SelectItem>
                          <SelectItem value="japanese">Japanese</SelectItem>
                          <SelectItem value="french">French</SelectItem>
                          <SelectItem value="german">German</SelectItem>
                          <SelectItem value="korean">Korean</SelectItem>
                          <SelectItem value="turkish">Turkish</SelectItem>
                          <SelectItem value="vietnamese">Vietnamese</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data & Privacy Card */}
              <Card className="border-[var(--border-primary)] shadow-sm bg-[var(--bg-card)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
                    <Shield className="w-5 h-5 text-green-600" />
                    Data & Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-[var(--text-secondary)]">Manage your personal data stored on Tonelate.</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button variant="outline" className="w-full sm:w-auto border-[var(--border-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]" onClick={() => handleDataRequest('export')}>
                            <Download className="mr-2 h-4 w-4"/>
                            Export My Data
                        </Button>
                    </div>
                </CardContent>
              </Card>

              <Card className="border-[var(--error)] shadow-sm bg-red-50 dark:bg-red-900/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <LogOut className="w-5 h-5" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="w-full sm:w-auto border-[var(--border-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out of this Device
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDataRequest('delete')}
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete My Account
                    </Button>
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-500">
                      Account deletion is permanent and cannot be undone.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* NEW Appearance Settings */}
          <TabsContent value="appearance">
            <Card className="border-[var(--border-primary)] shadow-sm bg-[var(--bg-card)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
                  <Moon className="w-5 h-5 text-[var(--accent-secondary)]" />
                  Appearance Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div className="space-y-0.5 mb-2 sm:mb-0">
                    <Label className="text-[var(--text-primary)] flex items-center gap-2">
                      {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      Dark Mode
                    </Label>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={darkMode}
                      onCheckedChange={(checked) => {
                        setDarkMode(checked); // Optimistic update
                        saveSetting('dark_mode_enabled', checked, 'boolean', 'ui_preferences');
                      }}
                    />
                  </div>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--info)', borderColor: 'var(--info-border)', color: 'var(--info-text)' }}>
                  <h4 className="font-medium mb-2 text-[var(--info-text)]">Theme Preview</h4>
                  <p className="text-sm text-[var(--info-text)]">
                    {darkMode 
                      ? "Dark mode provides a sleek, modern experience that's easier on the eyes during extended use." 
                      : "Light mode offers a clean, bright interface perfect for daytime productivity."
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* AI Behavior Settings */}
          <TabsContent value="ai">
            <div className="space-y-6">
              <Card className="border-[var(--border-primary)] shadow-sm bg-[var(--bg-card)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
                    <Brain className="w-5 h-5 text-[var(--accent-secondary)]" />
                    AI Writing Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="preferredTone" className="text-[var(--text-primary)]">Default Writing Tone</Label>
                        <Select
                          value={user?.preferred_tone || 'professional'}
                          onValueChange={(value) => {
                            saveUserProfile({ preferred_tone: value });
                          }}
                        >
                          <SelectTrigger className="bg-[var(--bg-input)] border-[var(--border-secondary)] text-[var(--text-primary)]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="friendly">Friendly</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="formal">Formal</SelectItem>
                            <SelectItem value="confident">Confident</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="outputLength" className="text-[var(--text-primary)]">Preferred Output Length</Label>
                        <Select
                          value={settings.output_length || 'standard'}
                          onValueChange={(value) => { saveSetting('output_length', value, 'string', 'ai_behavior'); }}
                        >
                          <SelectTrigger className="bg-[var(--bg-input)] border-[var(--border-secondary)] text-[var(--text-primary)]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                            <SelectItem value="concise">Concise</SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="descriptive">Descriptive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div className="space-y-0.5 mb-2 sm:mb-0">
                        <Label className="text-[var(--text-primary)]">Auto-suggest rewrites</Label>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Automatically suggest rewrites for detected slang
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={settings.auto_suggest_rewrites !== 'false'}
                          onCheckedChange={(checked) => { saveSetting('auto_suggest_rewrites', checked, 'boolean', 'ai_behavior'); }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div className="space-y-0.5 mb-2 sm:mb-0">
                        <Label className="text-[var(--text-primary)]">Context awareness</Label>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Adjust tone based on website/platform
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={settings.context_aware !== 'false'}
                          onCheckedChange={(checked) => { saveSetting('context_aware', checked, 'boolean', 'ai_behavior'); }}
                        />
                      </div>
                    </div>

                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div className="space-y-0.5 mb-2 sm:mb-0">
                        <Label className="text-[var(--text-primary)]">Allow Emojis</Label>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Permit the AI to use appropriate emojis in rewrites
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={settings.allow_emojis === 'true'}
                          onCheckedChange={(checked) => { saveSetting('allow_emojis', checked, 'boolean', 'ai_behavior'); }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sensitivity" className="text-[var(--text-primary)]">Detection Sensitivity</Label>
                    <Select
                      value={settings.detection_sensitivity || 'medium'}
                      onValueChange={(value) => { saveSetting('detection_sensitivity', value, 'string', 'ai_behavior'); }}
                    >
                      <SelectTrigger className="bg-[var(--bg-input)] border-[var(--border-secondary)] text-[var(--text-primary)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                        <SelectItem value="low">Low - Only obvious slang</SelectItem>
                        <SelectItem value="medium">Medium - Balanced detection</SelectItem>
                        <SelectItem value="high">High - Detect subtle issues</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[var(--border-primary)] shadow-sm bg-[var(--bg-card)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
                    <Zap className="w-5 h-5 text-[var(--accent-primary)]" />
                    AI Engine Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="aiModel" className="text-[var(--text-primary)]">Preferred AI Model</Label>
                    <Select
                      value={settings.preferred_ai_model || 'openai'}
                      onValueChange={(value) => { saveSetting('preferred_ai_model', value, 'string', 'integrations'); }}
                    >
                      <SelectTrigger className="bg-[var(--bg-input)] border-[var(--border-secondary)] text-[var(--text-primary)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                        <SelectItem value="openai">OpenAI GPT (Default)</SelectItem>
                        <SelectItem value="mistral">Mistral AI (European Style)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Different AI models have unique communication styles and strengths
                    </p>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--info)', borderColor: 'var(--info-border)' }}>
                    <h4 className="font-medium mb-2 flex items-center gap-2 text-[var(--info-text)]">
                      <Sparkles className="w-4 h-4" />
                      AI Model Differences
                    </h4>
                    <div className="space-y-2 text-sm text-[var(--info-text)]">
                      <div className="flex items-center gap-2">
                        <span>•</span>
                        <span><strong>OpenAI GPT:</strong> General-purpose, versatile communication style, great for most use cases</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>•</span>
                        <span><strong>Mistral AI:</strong> European business communication style, nuanced formal writing</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card className="border-[var(--border-primary)] shadow-sm bg-[var(--bg-card)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
                  <Shield className="w-5 h-5 text-green-600" />
                  Privacy & Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <div className="space-y-0.5 mb-2 sm:mb-0">
                      <Label className="text-[var(--text-primary)]">Save rewrite history</Label>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Store your rewrites for analytics and improvement
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={settings.save_history !== 'false'}
                        onCheckedChange={(checked) => { saveSetting('save_history', checked, 'boolean', 'triggers'); }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <div className="space-y-0.5 mb-2 sm:mb-0">
                      <Label className="text-[var(--text-primary)]">Anonymous analytics</Label>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Help improve the service with anonymous usage data
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={settings.anonymous_analytics !== 'false'}
                        onCheckedChange={(checked) => { saveSetting('anonymous_analytics', checked, 'boolean', 'triggers'); }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50">
                  <h4 className="font-medium mb-2 text-green-800 dark:text-green-300">Data Security</h4>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Your text is processed securely and never stored permanently on our servers.
                    All data is encrypted in transit and at rest.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Settings */}
          <TabsContent value="billing" className="space-y-8 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <div key={index} className="relative">
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)] text-white px-4 py-2 text-sm font-medium">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <Card 
                    className={`flex flex-col h-full ${plan.isPopular ? 'border-[var(--accent-primary)] border-2 shadow-xl pt-6' : 'border-[var(--border-primary)] shadow-sm'} bg-[var(--bg-card)]`}
                  >
                    <CardHeader className="text-center pb-4">
                      <CardTitle className={`text-xl font-bold ${plan.isPopular ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`}>{plan.name}</CardTitle>
                      <p className="text-sm text-[var(--text-secondary)]">{plan.description}</p>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="text-center mb-6">
                          <span className="text-3xl font-extrabold text-[var(--text-primary)]">{plan.price}</span>
                          {plan.period && (
                            <span className="text-sm text-[var(--text-secondary)]">{plan.period}</span>
                          )}
                        </div>
                        <ul className="space-y-3">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <Check className="w-5 h-5 text-[var(--success)] mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-[var(--text-primary)]">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button 
                        className={`w-full mt-8 ${plan.isCurrent(user?.subscription_plan) ? 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] cursor-not-allowed' : plan.isPopular ? 'bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)]' : 'bg-[var(--text-primary-button)] hover:bg-[var(--text-primary-button-hover)]'}`}
                        disabled={plan.isCurrent(user?.subscription_plan)}
                        onClick={() => {
                          if (!plan.isCurrent(user?.subscription_plan)) {
                            handleUpgrade(plan.name);
                          }
                        }}
                      >
                        {plan.isCurrent(user?.subscription_plan) ? 'Your Current Plan' : plan.buttonText}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            <Card className="border-[var(--border-primary)] shadow-sm bg-[var(--bg-card)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
                  <Zap className="w-5 h-5 text-[var(--accent-primary)]" />
                  Current Usage Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-[var(--text-primary)] mb-2">This Month</h4>
                    <p className="text-2xl font-bold text-[var(--accent-primary)]">{user?.monthly_rewrites_used || 0} / {user?.monthly_rewrite_limit || 25}</p>
                    <p className="text-sm text-[var(--text-secondary)]">Rewrites used</p>
                    <div className="w-full rounded-full h-2 mt-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div 
                        className="h-2 rounded-full" 
                        style={{width: `${Math.min(((user?.monthly_rewrites_used || 0) / (user?.monthly_rewrite_limit || 25)) * 100, 100)}%`, backgroundColor: 'var(--accent-primary)'}}
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--text-primary)] mb-2">Plan Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between text-[var(--text-primary)]">
                        <span>Current Plan:</span>
                        <Badge variant="outline" className="border-[var(--border-secondary)] text-[var(--text-primary)]">{user?.subscription_plan || 'Free'}</Badge>
                      </div>
                      <div className="flex justify-between text-[var(--text-primary)]">
                        <span>Monthly Limit:</span>
                        <span>{user?.monthly_rewrite_limit || 25} rewrites</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
