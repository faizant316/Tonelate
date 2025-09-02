# Tonelate - AI Communication Assistant ✨

![Tonelate Screenshot](https://github.com/user-attachments/assets/8a02b57e-f88c-433b-8075-e016455521ea)

**Live Demo:**  
*(https://tonelate.base44.app/)*

---

## 💡 Overview

Tonelate is a **full-stack AI writing assistant** that helps users transform casual, slang, or shorthand text into clear and professional English in real time.
It’s designed for anyone who wants to improve clarity and tone in online communication — from students to professionals to global teams.

I built Tonelate with a strong emphasis on **usability, performance, and scalability**, handling both the user-facing interface and the backend logic that powers intelligent rewriting and language adaptation.

---

## 🎯 Project Goal

The goal of Tonelate was to design and build a full-stack, AI-powered application from the ground up. I wanted to tackle the challenge of real-time text processing, manage complex application state, and create a secure, multi-user system with a polished user experience. This project showcases my skills in frontend development with React, backend data modeling, and integrating advanced AI services into a practical tool.

---

## 🚀 Key Features

-   **Real-time rewriting** → Instantly converts slang or shorthand into professional, grammatically correct English.
-   **Tone & style control** → Adjust between casual, professional, or confident tones.
-   **Multi-language support** → Rewrites and translates across multiple languages.
-   **Context-aware AI** → Detects slang, shorthand, and cultural nuances automatically.
-   **User authentication** → Secure login, profile preferences, and private history.
-   **Dashboard analytics** → View rewrite history, activity charts, and communication insights.
-   **Responsive UI** → Minimalist, polished design with dark/light mode and mobile support.

---

## 🌍 Multi-Language in Action

Tonelate doesn’t just polish English — it can seamlessly **translate and rewrite across multiple languages**.
This ensures clarity and professionalism whether you’re messaging in English, French, Spanish, Arabic, or beyond.

Example below: English → Chinese → Confident (5/5) English back-translation.  

![Tonelate Multi-Language Demo](https://github.com/user-attachments/assets/04069f3a-9269-4e16-a9df-e32c84813497)

---

## 📈 Dashboard Preview

Track total rewrites and usage trends, view acceptance rate of AI suggestions, and monitor activity by tone, time, and platform.

![Dashboard Preview](https://github.com/user-attachments/assets/6ed716f8-bac1-4633-b7a9-d19ae43bcc10)

---

## 💻 Tech Stack & Architecture

### **Frontend**

-   **React.js**: Core of the component-based UI, managing complex application state with hooks.
-   **Tailwind CSS**: For a responsive and utility-first styling workflow.
-   **Shadcn UI**: For a set of high-quality, accessible, and reusable UI components.
-   **Lucide React**: Provided the clean and consistent icon system.
-   **Recharts**: Used to build the interactive graphs on the user dashboard.
-   **Framer Motion**: Implemented for smooth animations and micro-interactions.

### **Backend & Data Modeling**

-   **JSON Schema**: Defined the data models for `Users`, `Rewrites`, and `Settings` in the `/entities` directory. These schemas enforce the structure and rules for all data managed by the platform's backend.
-   **RESTful API Design**: Designed and consumed API endpoints for all core application logic, including text rewriting, user data management, and fetching analytics.
-   **Serverless Functions**: Leveraged the platform's environment for integrations, such as making secure calls to the OpenAI API.

### **AI Integration**

-   **OpenAI GPT Models**: The core engine for text rewriting, slang detection, and translation.
-   **Dynamic Prompt Engineering**: Created custom logic to build prompts that dynamically adapt to user-selected tone, style, and language.
-   **Structured JSON Output**: Enforced a strict JSON output from the AI to ensure reliable data handling and parsing on the frontend.

---

## 🔧 Project Setup

**This project cannot be run locally with `npm install` in the traditional sense.** The code in this repository represents the custom logic and frontend components built on top of the base44 platform.

-   **`/pages`**: Contains the main React components for each page of the application (e.g., Dashboard, History, Settings).
-   **`/components`**: Holds all reusable React components used across various pages, organized by feature (`dashboard`, `shared`, `smart`).
-   **`/entities`**: Defines the JSON schema for each database model. These schemas dictate the structure and rules for the data managed by the backend.

---

## 🚀 Future Plans

I am actively exploring the development of a **Chrome Extension** for Tonelate, aiming to bring its powerful rewriting capabilities directly into users' browsers and everyday online communication workflows.

---

## 📄 License

This project is licensed under the MIT License.

---

## 📧 Contact

-   **Author:** Faizan Tariq
-   **LinkedIn:** [linkedin.com/in/faizantariq](https://www.linkedin.com/in/faizantariq916/)
-   **GitHub:** [github.com/faizant316](https://github.com/faizant316)
