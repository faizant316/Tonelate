
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  HelpCircle,
  BookOpen,
  Mail,
  MessageSquare,
  Sparkles,
  BarChart3,
  Settings,
  Zap,
  Globe,
  Brain,
  CheckCircle,
  ArrowRight,
  Send,
  Filter
} from "lucide-react";
import { SendEmail } from "@/integrations/Core";
import { User } from "@/entities/User";

const faqs = [
  {
    question: "How does the Smart Rewriter work?",
    answer: "The Smart Rewriter uses advanced AI to analyze your text and transform it into clear, professional communication. It detects slang, informal language, and non-English text, then rewrites it to match your desired tone level while preserving the original meaning.",
    category: "general"
  },
  {
    question: "What languages does Tonelate support?",
    answer: "Tonelate can detect and improve text in multiple languages including English, Spanish, Chinese, Arabic, French, German, Japanese, Portuguese, Russian, and many more. For non-English text, it provides both an improved version in the original language and an English translation.",
    category: "general"
  },
  {
    question: "How do I adjust the tone of my rewrites?",
    answer: "Use the tone slider in the Smart Rewriter. Move it from 1 (Very Casual) to 10 (Official) to control how formal or casual your rewritten text should be. The AI will adjust its output accordingly.",
    category: "features"
  },
  {
    question: "What's the difference between the AI models?",
    answer: "We offer multiple AI models: OpenAI GPT (general-purpose, versatile style) and Mistral AI (European business communication style, more nuanced formal writing). You can switch between them in the settings dropdown.",
    category: "features"
  },
  {
    question: "How many rewrites can I do per month?",
    answer: "Free users get 25 rewrites per month. Pro users get 2,000 rewrites per month with access to advanced AI models and priority support. Team plans offer 10,000 rewrites per month with team management features.",
    category: "billing"
  },
  {
    question: "Can I see my rewrite history?",
    answer: "Yes! Visit the History page in your dashboard to view all your past transformations. You can search, filter by status (accepted/dismissed), and copy previous results.",
    category: "features"
  },
  {
    question: "Why isn't the AI understanding my slang correctly?",
    answer: "The AI is trained on contextual slang interpretation, but if it misunderstands something, try providing a bit more context in your message. You can also adjust the detection sensitivity in Settings > AI Behavior.",
    category: "troubleshooting"
  },
  {
    question: "How do I upgrade my plan?",
    answer: "Go to Settings > Billing to see available plans and upgrade options. You can choose between Pro ($9.99/month) or Team ($29.99/month) plans based on your needs.",
    category: "billing"
  },
  {
    question: "Is my data secure?",
    answer: "Yes, your text is processed securely and never stored permanently on our servers. All data is encrypted in transit and at rest. You can control data saving preferences in Settings > Privacy.",
    category: "privacy"
  },
  {
    question: "Can I use Tonelate for business communications?",
    answer: "Absolutely! Tonelate is designed for professional communication improvement. It's particularly useful for international business, email correspondence, and ensuring clear communication across language barriers.",
    category: "general"
  },
  {
    question: "What if I reach my monthly limit?",
    answer: "When you reach your monthly rewrite limit, you'll be prompted to upgrade to a paid plan. Pro users get 2,000 rewrites per month, and Team users get 10,000 rewrites per month.",
    category: "billing"
  },
  {
    question: "How accurate is the language detection?",
    answer: "Our AI has high accuracy in detecting languages and understanding context. It can identify over 50 languages and distinguish between formal text and slang in each language.",
    category: "features"
  }
];

const guides = [
  {
    title: "Getting Started with Smart Rewriter",
    description: "Learn the basics of transforming your messages",
    icon: Sparkles,
    steps: [
      "Type or paste your message in the input box",
      "Adjust the tone slider to your desired level (1-10)",
      "Choose your preferred AI model from the settings menu (if logged in)",
      "Click 'Transform' or press Enter to process",
      "Copy the result and provide feedback to improve future suggestions"
    ]
  },
  {
    title: "Understanding Your Dashboard",
    description: "Make sense of your usage statistics and analytics",
    icon: BarChart3,
    steps: [
      "View your total rewrites and monthly usage",
      "Check your acceptance rate to see how often you use suggestions",
      "Monitor your 7-day activity chart",
      "See which websites you use Tonelate on most frequently",
      "Track your primary communication tone"
    ]
  },
  {
    title: "Customizing AI Behavior",
    description: "Tailor Tonelate to your communication style",
    icon: Brain,
    steps: [
      "Go to Settings > AI Behavior",
      "Set your default writing tone preference",
      "Choose your preferred output length (concise/standard/descriptive)",
      "Enable or disable auto-suggestions and context awareness",
      "Adjust detection sensitivity based on your needs",
      "Select your preferred AI model for different communication styles"
    ]
  },
  {
    title: "Managing Your Account",
    description: "Profile settings and subscription management",
    icon: Settings,
    steps: [
      "Update your profile information in Settings > Profile",
      "Set your industry and native language for better AI assistance",
      "Configure privacy settings and data preferences",
      "Monitor your usage and upgrade plans in the Billing section",
      "Enable or disable dark mode in Appearance settings"
    ]
  }
];

export default function Help() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const user = await User.me();
      await SendEmail({
        to: "support@tonelate.com", // Updated email
        subject: `Support Request: ${contactForm.subject}`,
        body: `
          Support Request from: ${contactForm.name} (${contactForm.email})
          User ID: ${user.email}
          
          Subject: ${contactForm.subject}
          
          Message:
          ${contactForm.message}
        `
      });
      
      setSubmitSuccess(true);
      setContactForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error sending support email:", error);
      alert("Failed to send message. Please try again or email us directly at support@tonelate.com");
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="p-6 md:p-8" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <HelpCircle className="w-8 h-8 text-blue-500" />
            Help & Support
          </h1>
          <p className="mt-2 text-base max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Everything you need to know about using Tonelate effectively
          </p>
        </div>

        <Tabs defaultValue="faq" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 h-14 p-1 rounded-xl bg-[var(--bg-tertiary)]">
            <TabsTrigger value="faq" className="flex items-center gap-2 data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] text-[var(--text-secondary)] rounded-lg px-3 py-2 font-medium">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="guides" className="flex items-center gap-2 data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] text-[var(--text-secondary)] rounded-lg px-3 py-2 font-medium">
              <BookOpen className="w-4 h-4" />
              Guides
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2 data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--text-primary)] text-[var(--text-secondary)] rounded-lg px-3 py-2 font-medium">
              <Mail className="w-4 h-4" />
              Contact
            </TabsTrigger>
          </TabsList>

          {/* FAQ Section */}
          <TabsContent value="faq">
            <div className="space-y-6">
              {/* Search and Filter */}
              <Card className="shadow-sm border-[var(--border-primary)]" style={{ backgroundColor: 'var(--bg-card)' }}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search frequently asked questions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[var(--bg-input)] border-[var(--border-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]"
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant={activeCategory === "all" ? "default" : "outline"}
                        onClick={() => setActiveCategory("all")}
                        size="sm"
                        className={activeCategory === "all" ? "bg-[var(--accent-primary)] text-white" : "border-[var(--border-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"}
                      >
                        All
                      </Button>
                      <Button
                        variant={activeCategory === "general" ? "default" : "outline"}
                        onClick={() => setActiveCategory("general")}
                        size="sm"
                        className={activeCategory === "general" ? "bg-[var(--accent-primary)] text-white" : "border-[var(--border-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"}
                      >
                        General
                      </Button>
                      <Button
                        variant={activeCategory === "features" ? "default" : "outline"}
                        onClick={() => setActiveCategory("features")}
                        size="sm"
                        className={activeCategory === "features" ? "bg-[var(--accent-primary)] text-white" : "border-[var(--border-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"}
                      >
                        Features
                      </Button>
                      <Button
                        variant={activeCategory === "billing" ? "default" : "outline"}
                        onClick={() => setActiveCategory("billing")}
                        size="sm"
                        className={activeCategory === "billing" ? "bg-[var(--accent-primary)] text-white" : "border-[var(--border-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"}
                      >
                        Billing
                      </Button>
                      <Button
                        variant={activeCategory === "troubleshooting" ? "default" : "outline"}
                        onClick={() => setActiveCategory("troubleshooting")}
                        size="sm"
                        className={activeCategory === "troubleshooting" ? "bg-[var(--accent-primary)] text-white" : "border-[var(--border-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"}
                      >
                        Troubleshooting
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ List */}
              <Card className="shadow-sm border-[var(--border-primary)]" style={{ backgroundColor: 'var(--bg-card)' }}>
                <CardContent className="p-6">
                  {filteredFaqs.length === 0 ? (
                    <div className="text-center py-8">
                      <HelpCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
                      <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No FAQs found matching your search.</p>
                    </div>
                  ) : (
                    <Accordion type="single" collapsible className="w-full">
                      {filteredFaqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="border-b border-solid border-[var(--border-secondary)] last:border-none">
                          <AccordionTrigger className="text-left font-medium hover:no-underline py-5" style={{ color: 'var(--text-primary)' }}>
                            <div className="flex items-center gap-4">
                              <Badge variant="outline" className="text-xs capitalize border-[var(--border-secondary)] px-2 py-1" style={{ color: 'var(--text-secondary)' }}>
                                {faq.category}
                              </Badge>
                              <span>{faq.question}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pb-4" style={{ color: 'var(--text-secondary)' }}>
                            <p className="leading-relaxed">{faq.answer}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Guides Section */}
          <TabsContent value="guides">
            <div className="grid gap-6 md:grid-cols-2">
              {guides.map((guide, index) => (
                <Card key={index} className="shadow-sm border-[var(--border-primary)] hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--bg-card)' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <guide.icon className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{guide.title}</h3>
                        <p className="text-sm font-normal" style={{ color: 'var(--text-secondary)' }}>{guide.description}</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-3">
                      {guide.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {stepIndex + 1}
                          </span>
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contact Section */}
          <TabsContent value="contact">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Contact Form */}
              <Card className="shadow-sm border-[var(--border-primary)]" style={{ backgroundColor: 'var(--bg-card)' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {submitSuccess ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                      <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Message Sent!</h3>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>We'll get back to you within 24 hours.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Name</label>
                          <Input
                            required
                            value={contactForm.name}
                            onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Your name"
                            className="bg-[var(--bg-input)] border-[var(--border-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Email</label>
                          <Input
                            type="email"
                            required
                            value={contactForm.email}
                            onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="your@email.com"
                            className="bg-[var(--bg-input)] border-[var(--border-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Subject</label>
                        <Input
                          required
                          value={contactForm.subject}
                          onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="How can we help?"
                          className="bg-[var(--bg-input)] border-[var(--border-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Message</label>
                        <Textarea
                          required
                          value={contactForm.message}
                          onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Describe your issue or question..."
                          className="h-32 bg-[var(--bg-input)] border-[var(--border-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[var(--accent-primary)] hover:opacity-90 text-white"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Contact Info */}
              <div className="space-y-6">
                <Card className="shadow-sm border-[var(--border-primary)]" style={{ backgroundColor: 'var(--bg-card)' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                      <Mail className="w-5 h-5 text-blue-500" />
                      Other Ways to Reach Us
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <Mail className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Email Support</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>support@tonelate.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <Globe className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Response Time</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Within 24 hours</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-blue-200" style={{ background: 'linear-gradient(to right, var(--bg-tertiary), var(--bg-card))' }}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Quick Tips</h3>
                    </div>
                    <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <li className="flex items-center gap-2">
                        <ArrowRight className="w-3 h-3 text-blue-500" />
                        Try different tone levels for varied results
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowRight className="w-3 h-3 text-blue-500" />
                        Provide context for better AI understanding
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowRight className="w-3 h-3 text-blue-500" />
                        Check your History page for past rewrites
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
