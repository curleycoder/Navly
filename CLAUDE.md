@AGENTS.md

# AGENT.md — Navly App Agent Requirements

## Product Boundary

Navly is **not an immigration consultant** and does **not provide legal advice**.

Navly is a **data-based PR pathway screening and planning app**.

The app helps users:

- Understand possible Canadian PR pathways
- Estimate CRS / CLB / eligibility strength
- See what score or requirement they may need
- Track important Canada-based days
- Understand missing requirements
- Ask general questions through AI
- Get directed to certified Canadian immigration consultants when professional advice is needed

Navly does **not** collect or review legal documents.

Navly does **not** ask users to upload:

- Passport
- Birth certificate
- Marriage certificate
- Police certificate
- Medical exam
- Bank statements
- Work letters
- Tax documents
- Immigration forms
- Any official identity document

Navly only collects **user-entered data**.

---

## Core App Positioning

Use this wording:

> “Navly helps you understand possible Canadian PR pathways based on the information you enter. For legal advice or application review, we connect you with certified Canadian immigration consultants.”

Do not use:

> “Navly will get you PR.”
> “You qualify for PR.”
> “Upload your documents and we will review your case.”
> “We are your immigration consultant.”

---

## Consultant Advertising Boundary

Navly may advertise or recommend **certified Canadian immigration consultants**.

The app can show:

- Consultant profile
- Certification status
- Province/city
- Languages spoken
- Services offered
- Booking link
- Contact button
- Paid ad placement

The app must make clear:

```txt
Consultants are independent professionals.
Navly does not provide immigration consulting services.
Navly only helps users organize their data and understand possible options.
```

Navly must not pretend that the consultant is part of Navly unless there is a verified partnership.

---

## What Data Navly Collects

Navly collects profile data only.

### Identity-lite data

- First name
- Last name
- Email
- Phone number
- Country of citizenship
- Current country
- Current province, if inside Canada
- Date of arrival in Canada, if applicable

### Contact verification

Phone number is required to reduce fake accounts and duplicate accounts.

Use phone verification through SMS/OTP.

Required fields:

- Phone number
- Verification code
- Email address
- Password or magic link login

---

## No Duplicate Accounts Rule

A user cannot create two accounts.

Duplicate account detection should use:

- Phone number
- Email address
- Optional device/browser fingerprint
- Optional IP/device risk signal

Rules:

```txt
One phone number = one account
One email = one account
Duplicate profiles are invalid
```

If duplicate is detected, show:

```txt
An account already exists with this phone number or email.
Please log in instead.
```

Do not allow users to bypass this by changing small details.

---

## Onboarding Flow

Users should answer questions first, then sign up at the end.

This reduces friction and helps users see value before account creation.

### Flow

```txt
Landing page
→ Choose current location/status
→ Answer profile questions
→ See preview of possible pathways
→ Create account / verify phone
→ Unlock full result dashboard
```

### Why sign up at the end

- Better conversion
- User sees value first
- App collects enough data to personalize result
- Phone verification prevents fake duplicate accounts

---

## First Onboarding Question

Ask:

> “Where are you right now?”

Options:

- Outside Canada
- Inside Canada as visitor
- Inside Canada as student
- Inside Canada as worker
- Inside Canada as refugee/protected person
- Inside Canada with family sponsor
- Not sure

This controls the full app flow.

---

## Required Onboarding Questions

### Basic profile

- Age
- Marital status
- Spouse coming to Canada? yes/no
- Country of citizenship
- Current country
- Current province if inside Canada
- Intended province
- Do you intend to live in Quebec? yes/no

### Canada status

- Are you inside Canada? yes/no
- Date arrived in Canada
- Current status
- Permit type, if any
- Permit expiry date, if any
- Have you had previous refusals? yes/no
- Have you ever lost status or overstayed? yes/no

### Language

- Test type: IELTS General, CELPIP, PTE Core, TEF, TCF, not taken yet
- Test date
- Reading score
- Writing score
- Listening score
- Speaking score
- French test? yes/no

### Education

- Highest education
- Canadian education? yes/no
- Province of study
- Program length
- Program level
- Field of study
- ECA completed? yes/no

### Work

- Job title
- Main duties
- NOC code, if known
- TEER level, if known
- Years of foreign skilled work
- Years/months of Canadian skilled work
- Province of work
- Wage
- Hours per week
- Job offer? yes/no
- Employer designated/approved? yes/no
- Work start date

### Family

- Canadian spouse/partner? yes/no
- Canadian sibling? yes/no
- Parent/child sponsor? yes/no

### Funds

- Family size
- Available settlement funds in CAD
- Study budget, if planning to study

---

## Canada Days Counter

This is a core feature.

Users must enter:

```txt
Date of arrival in Canada
```

The app calculates:

```txt
Days physically in Canada
```

### Canada days logic

Track:

- Date arrived in Canada
- Current date
- Total days since arrival
- Days user confirms they were physically inside Canada
- Days outside Canada, if user reports travel
- Streak of daily check-ins

### Daily Canada Check-In

Users should come to the app daily and confirm:

```txt
I am in Canada today.
```

This creates a streak.

Show:

```txt
Canada presence streak: 48 days
Total confirmed Canada days: 132 days
```

### If user misses a day

Do not automatically count the missed day as confirmed.

Show:

```txt
You missed yesterday’s check-in.
Was this day spent inside Canada?
```

Options:

- Yes, I was inside Canada
- No, I was outside Canada
- I am not sure

### If user leaves Canada

Ask:

- Departure date
- Return date
- Country visited
- Reason for travel

Then subtract or separate those days from confirmed Canada presence.

### Important warning

Use this wording:

```txt
This tracker is for personal planning only.
Final physical presence or residence calculations depend on official government rules and documents.
```

Do not claim the streak is official proof.

---

## Score and Requirement Engine

The app should show users:

- Their current estimated score
- The score level they should target
- Missing requirements
- Best next action

Example:

```txt
Current CRS estimate: 421
Target improvement: CLB 9 language level
Best next action: Improve IELTS General before spending money on another pathway.
```

The app should not only say eligible or not eligible.

It should say:

```txt
Possible
Not ready yet
Weak path
Strong path
Missing requirement
Legal review recommended
```

---

## AI Agent Role

The AI agent is there to:

- Explain immigration terms in simple language
- Clarify what a field means
- Help users understand possible pathways
- Explain score changes
- Explain why a path is strong or weak
- Answer general questions
- Encourage users to contact a certified consultant for legal advice

The AI agent must not:

- Give legal advice
- Guarantee approval
- Review documents
- Ask for passport or birth certificate
- Tell users to hide information
- Tell users to submit false information
- Complete official immigration forms for the user
- Claim to be an RCIC, lawyer, or government officer

### AI safe wording

Use:

```txt
Based on the data you entered, this pathway may be possible.
A certified Canadian immigration consultant should review your case before you apply.
```

Avoid:

```txt
You qualify.
You will be approved.
Submit this application now.
```

---

## Result Dashboard

The result page should show:

### 1. Profile summary

- Location/status
- Age
- Language level
- Education
- Work experience
- Province
- Canada days count

### 2. Strongest pathways

Example:

```txt
Your strongest PR paths:
1. Canadian Experience Class
2. BC PNP
3. Federal Skilled Worker
```

### 3. Weak or unavailable pathways

Example:

```txt
Weak paths:
- AIP: no Atlantic job offer
- Rural pilot: no designated rural employer
- Family sponsorship: no sponsor
```

### 4. Missing requirements

Example:

```txt
Missing:
- 4 more months of skilled Canadian work
- IELTS General score improvement to CLB 9
- ECA not completed
```

### 5. Best next actions

Example:

```txt
Your next 3 actions:
1. Keep full-time TEER 1 work until you complete 12 months.
2. Improve IELTS General to CLB 9.
3. Check BC PNP stream based on NOC and wage.
```

### 6. Consultant CTA

Example:

```txt
Need professional review?
Connect with a certified Canadian immigration consultant.
```

---

## Daily Engagement System

Navly should use the Canada-days tracker as a daily retention feature.

### Daily tasks

- Confirm Canada presence
- Update work/study status
- Track permit expiry
- Update language test progress
- Check missing requirements
- Ask AI questions

### Streak examples

```txt
Canada presence streak: 21 days
Profile completion streak: 5 days
PR plan progress: 62%
```

### Notifications

Send reminders:

- Daily Canada check-in
- Permit expiry warning
- Language test reminder
- Missing profile data
- New draw update
- Consultant availability

---

## Account Creation Rules

At the end of onboarding, require:

- Email
- Phone number
- SMS verification
- Password or secure magic link
- Consent to terms
- Consent that Navly is not legal advice

### Required consent checkbox

```txt
I understand that Navly is a planning and information tool only.
Navly does not provide legal advice or immigration consulting.
For legal advice, I should contact a certified Canadian immigration consultant or lawyer.
```

---

## Privacy Rules

Because Navly handles sensitive immigration-related data, keep the data collection minimal.

Collect only what is needed to calculate possible pathways and scores.

Do not collect documents.

Do not collect passport numbers.

Do not collect government ID numbers.

Do not collect birth certificates.

Do not collect SIN numbers.

Do not collect bank statements.

Do not collect medical documents.

Do not collect police certificates.

Use clear language:

```txt
Navly only asks for profile information.
We do not ask you to upload passports, birth certificates, or immigration documents.
```

---

## Admin / Consultant Ads System

Admin should be able to manage:

- Consultant listings
- Consultant certification status
- Consultant location
- Consultant language
- Consultant service category
- Sponsored placement status
- Active/inactive profile
- Booking/contact link

Consultant listing fields:

- Full name
- Business name
- Certification type
- License/registration number, if public
- Province
- City
- Languages
- Services
- Website
- Booking link
- Contact email
- Phone number
- Sponsored listing yes/no
- Verification status

---

## Monetization

### Applicant side

| Offer | Price idea |
|---|---:|
| Free profile screening | Free |
| Full personalized report | $19–$49 |
| Document readiness checklist without uploads | $19–$39 |
| Monthly tracking | $9–$19/month |
| Consultant booking lead | Referral/ad revenue |

### Consultant advertising

| Offer | Price idea |
|---|---:|
| Basic listing | Free or low cost |
| Verified profile | Monthly fee |
| Sponsored placement | Higher monthly fee |
| Lead generation | Pay-per-lead or monthly package |

Keep consultant monetization separate from legal service delivery.

---

## MVP Requirements

Build only what is necessary first.

### MVP must include

1. Location/status onboarding
2. User profile intake
3. Phone verification
4. No duplicate account rule
5. Canada arrival date
6. Canada days counter
7. Daily Canada presence check-in
8. IELTS/CLB converter
9. CRS estimate
10. FSW 67-point checker
11. Student route checker
12. Worker route checker
13. Visitor reality branch
14. Province/pathway matcher
15. Missing requirements
16. Best next action
17. AI question assistant
18. Consultant CTA / ad placement
19. Legal disclaimer
20. Privacy boundary: no document collection

### Do not build first

- Document upload
- Consultant client portal
- Official form preparation
- Complex H&C scoring
- Refugee legal workflow
- Entrepreneur route engine
- Full PNP scoring for every province
- Paid legal consultation inside the app

---

## Simple Technical Data Model

```txt
User
→ id
→ email
→ phone
→ phoneVerified
→ duplicateStatus
→ createdAt

Profile
→ userId
→ locationStatus
→ currentCountry
→ currentProvince
→ intendedProvince
→ age
→ maritalStatus
→ spouseComing
→ citizenship
→ quebecIntent

CanadaPresence
→ userId
→ arrivalDate
→ totalDaysSinceArrival
→ confirmedCanadaDays
→ currentStreak
→ missedDays
→ travelOutsideCanada[]

Language
→ userId
→ testType
→ testDate
→ reading
→ writing
→ listening
→ speaking
→ clbBySkill
→ overallCLB

Education
→ userId
→ highestEducation
→ canadianEducation
→ provinceOfStudy
→ programLength
→ programLevel
→ fieldOfStudy
→ ecaCompleted

Work
→ userId
→ jobTitle
→ mainDuties
→ noc
→ teer
→ foreignWorkYears
→ canadianWorkMonths
→ provinceOfWork
→ wage
→ hoursPerWeek
→ jobOffer
→ employerDesignated

PathwayResult
→ userId
→ crsEstimate
→ fswScore
→ possiblePathways[]
→ weakPathways[]
→ missingRequirements[]
→ bestNextActions[]
→ riskFlags[]

ConsultantListing
→ id
→ name
→ businessName
→ certificationType
→ licenseNumber
→ city
→ province
→ languages[]
→ services[]
→ bookingLink
→ sponsored
→ verified
```

---

## Final Product Rule

Navly should be simple:

```txt
Ask smart questions
→ Calculate possible pathways
→ Track Canada days
→ Show missing requirements
→ Explain with AI
→ Send serious users to certified consultants
```

Do not overbuild.

The money feature is not document review.

The money feature is:

```txt
Clear pathway estimate
+ Canada-days tracking
+ Score improvement plan
+ Consultant connection
```
