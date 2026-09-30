# Acuity Vault Access

Plaintext
Build a professional, secure, and fully responsive React web application named "Acuity Repository Vault" for Acuity RISE Education Group (acuityriseeducation.solutions). The app functions as an academic record fulfillment and verification portal with two primary interfaces: a Requestor Portal and a password-protected Admin Console. Use Tailwind CSS, lucide-react icons, and clean, modern card layouts.

### 1. Requestor Portal Features:
* Role Selector: Allow users to select their profile type:
  - Student
  - Employer / Employment Verification Agency
  - Academic Institution
* Conditional Form Fields based on Profile:
  - Students: Option for name-change documentation trigger and specific student track details.
  - Employers / Agencies: Mandatory file upload simulation / trigger for FERPA/HIPAA signed release forms, plus Verification ID requirements.
  - All Profiles: Full contact info (Name, Department, Email, Phone).
* Document Selection & Pricing with Hardcoded PayPal Integration:
  - Transcript Only: $XX (PayPal Link: https://www.paypal.com/ncp/payment/QP3UJ7ARQDCW6)
  - Academic Verification Only: $XX (PayPal Link: https://www.paypal.com/ncp/payment/FAAVQD426LC9W)
  - Transcript & Academic Verification (Both): $XX (PayPal Link: https://www.paypal.com/ncp/payment/Y4WKUGFUDZUW6)
* Dissemination Method:
  - Choose between Digital Transfer (Secure Email) or USPS Registered Mail.
  - If USPS is selected, dynamically reveal full postal address intake fields.
* Submission & Tracking:
  - Upon submission, generate a unique Registry / Tracking ID (e.g., ARV-YYYY-XXXX).
  - Save requests to browser `localStorage` so they persist across sessions.
  - Provide a "Track Request" tab where users can enter their Tracking ID to view real-time status (Submitted, Processing, Fulfilled).

### 2. Admin Console Features:
* Secure Access: Password-protected login (PIN/Password: "1234").
* Service Request Tracker: Table displaying all submitted requests stored in `localStorage` with filtering by status and role.
* Actionable Controls: Ability to update request status (Pending -> Processing -> Fulfilled) and view uploaded attachments/release forms.
* Correspondence Suite (Template Generator):
  - Pre-loaded with official templates for Email and USPS transmissions.
  - Uses `compliance@acuityriseeducation.solutions` for registrar correspondence and `vault@acuityriseeducation.solutions` for document intake.
  - One-click copy buttons for generating customized email/USPS notifications dynamically populated with requestor and recipient details.

### UI / UX Design:
* Professional corporate aesthetic (clean whites, deep navy/slate accents, subtle borders).
* Fully mobile-responsive with clear step-by-step indicators.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/26bc2ab6-8a7f-4bbc-ac6d-94365ef7ea81).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
