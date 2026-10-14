**Sanjeevani AI**

**AI-powered healthcare companion for rural India
Sanjeevani AI is designed to make essential healthcare information easier to access in rural and underserved communities. The product vision focuses on a simple, multilingual experience that can support users with limited or unreliable internet access.**
> **Important:** Sanjeevani AI is an information and navigation aid, not a replacement for a qualified healthcare professional. AI-generated information must not be treated as a diagnosis or prescription. In an emergency, contact local emergency services or visit the nearest health facility.
Key capabilities
Offline-first access: Make selected saved information and core screens available when connectivity is limited.
Emergency access: Quick access to configured emergency contacts and nearby health-centre information when data is available.
SOS workflow: A simple emergency alert flow, with phone-shake activation only if supported and explicitly enabled by the user.
Multilingual interaction: Present essential information in local languages, with accessible language switching.
AI first-aid information: Provide carefully scoped, safety-reviewed first-aid guidance and escalation to professional care.
Patient information: Keep relevant records and government-scheme information organised in one place, subject to user consent and applicable privacy requirements.
Prescription scanning (in progress): Extract prescription text for review. Users must confirm extracted information; the feature must not independently recommend medication or dosage.
Repository status
This repository contains the Sanjeevani AI project. Update the sections marked TODO to match the implementation in this repository before publishing or submitting the project.
Tech stack
TODO: Replace this list with the actual technologies used.
Mobile application: `[e.g., Flutter / React Native / Android native]`
Backend/API: `[e.g., Node.js / Python / Firebase / Supabase / none]`
Database/storage: `[e.g., SQLite / Room / PostgreSQL / Firestore]`
AI provider/model: `[provider/model, or local model]`
OCR for prescription scanning: `[library/service, if implemented]`
Notifications/SOS delivery: `[SMS / push / backend service, as implemented]`
Prerequisites
Install the tools required by your actual stack. Common prerequisites may include:
Git
The relevant mobile SDK and IDE (for example, Android Studio)
The language/package manager used by the project
Access credentials for any external services used by the app
Setup
Clone the repository:
```bash
   git clone <YOUR_GITHUB_REPOSITORY_URL>
   cd <YOUR_REPOSITORY_FOLDER>
   ```
Install dependencies using the command for your project.
Examples — use only the command that matches the files in your repository:
```bash
   # Flutter
   flutter pub get

   # Node.js
   npm install

   # Python
   python -m pip install -r requirements.txt
   ```
Configure environment variables (see below). Never commit real API keys, access tokens, signing keys, or production credentials.
Start the required backend/services, if any.
Run the application using the command for your stack:
```bash
   # Flutter
   flutter run

   # Node.js web application
   npm run dev
   ```
Run the available tests:
```bash
   # Flutter
   flutter test

   # Node.js
   npm test

   # Python
   pytest
   ```
TODO: Remove irrelevant examples and replace them with the exact install, run, build, and test commands for this repository.
Environment variables
Create a local `.env` file only if your stack supports it. If the app uses build-time configuration or a platform-specific secrets manager, configure values using that system instead.
Example `.env.example` (placeholders only):
```dotenv
# App
APP_ENV=development
APP_NAME=Sanjeevani AI
APP_BASE_URL=http://localhost:3000

# Backend/API (leave unset if not used)
API_BASE_URL=http://localhost:8000

# AI service (server-side only; never expose private keys in a mobile client)
AI_PROVIDER=
AI_MODEL=
AI_API_KEY=

# Optional OCR service
OCR_PROVIDER=
OCR_API_KEY=

# Optional messaging/notification service
SMS_PROVIDER=
SMS_API_KEY=
SMS_SENDER_ID=

# Optional analytics / crash reporting
ANALYTICS_ENABLED=false
CRASH_REPORTING_ENABLED=false
```
Only define variables that the implementation actually reads. Keep `.env` out of version control and commit `.env.example` with empty or safe sample values. Do not put private AI, SMS, database, or cloud-service secrets inside a mobile app bundle. Route privileged calls through a secured backend.
Offline and emergency behaviour
Document the exact behaviour implemented by the app. At minimum, verify:
Which screens and records remain available offline.
How unsent alerts are queued, retried, and shown to the user.
What happens if an SOS cannot be delivered.
Whether nearby health-centre data is cached or requires connectivity/location permission.
Which phone models and OS versions support the emergency gesture.
How the app prevents accidental SOS activation and communicates the alert status.
Do not describe an alert as sent until the app receives confirmation from the delivery mechanism. SMS, location, background execution, and feature-phone support vary by device, carrier, permissions, and region.
Privacy and safety
Collect only the personal data needed for the stated feature.
Obtain clear consent before collecting, storing, or sharing health or location information.
Encrypt sensitive data in transit and at rest where supported.
Restrict access to patient records and keep secrets on trusted server infrastructure.
Provide a way to correct or delete data where required.
Do not use real patient records in sample data, screenshots, or tests.
Clearly identify AI-generated content and provide escalation to a health professional.
Review applicable Indian privacy, health-data, medical-device, and telemedicine requirements before public deployment.
Documentation
Technical Design Document
Sample Data
Test Cases
License
Contributing
Create a feature branch.
Keep changes small and document new configuration values.
Add or update tests for changed behaviour.
Never commit credentials or real patient information.
Open a pull request with a summary, test results, and screenshots where relevant.
**Team name: SPARC  
Team ID: HSC|AP|00072  
State/UT: Andhra Pradesh
Sai Pradeep Sathapathi — Lead Designer
Ramyasri Swarna — Lead Software Developer**
Founded in 2025; pilot testing has been carried out in selected semi-rural areas of Andhra Pradesh, according to the project team.
Disclaimer
This project is intended to improve access to health information and services. It does not replace medical advice, diagnosis, or treatment. Features and availability depend on the actual implementation, device capabilities, network coverage, permissions, and service-provider availability. 

**Test Cases:**

<img width="2400" height="2686" alt="Sanjeevani_AI_Test_Cases" src="https://github.com/user-attachments/assets/348287b3-786c-47ee-8935-3294c206996e" />
Sample test data
See `../sample_data/sample_data.json`. All people, contact numbers, centre names, and record contents must be synthetic placeholders. Do not send test SOS alerts to real emergency services or real contacts.


**Technical Design**

<img width="2400" height="2505" alt="Sanjeevani_AI_Technical_Design_Part1" src="https://github.com/user-attachments/assets/fbbb1c78-bfba-4ceb-b4e5-ebddd654103b" />
<img width="2400" height="1857" alt="Sanjeevani_AI_Technical_Design_Part2" src="https://github.com/user-attachments/assets/f040fa04-d610-49b2-80dd-24c0a86eb716" />
<img width="2400" height="2468" alt="Sanjeevani_AI_Technical_Design_Part3" src="https://github.com/user-attachments/assets/1f1fa725-bc87-4d59-9c8a-699e96442a23" />
<img width="2400" height="1918" alt="Sanjeevani_AI_Technical_Design_Part4" src="https://github.com/user-attachments/assets/37fe377a-d674-4932-8b4a-7c707feca3dc" />
