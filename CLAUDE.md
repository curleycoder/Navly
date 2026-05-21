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

---

## Navly Onboarding Questions by Status Group

Use this structure. It is simple, trackable, and strong for PR/citizenship planning.

**Important — as of March 25, 2025: job offers no longer add CRS points.** Do not say "adds 50–200 CRS points" anywhere. Job offers can still matter for PNP eligibility and work permit pathways. Use wording like: "A job offer may strengthen PNP eligibility. It no longer adds points to your Express Entry CRS score as of March 25, 2025."

---

### A. Outside Canada

| Section             | Question                                                               | Answer Type                                                    | Required?   | Why Navly Needs It                                 |
| ------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------- | ----------- | -------------------------------------------------- |
| Location            | Are you currently outside Canada?                                      | Yes/No                                                         | Yes         | Starts the correct flow                            |
| Goal                | What is your main goal?                                                | Study / Work / Express Entry PR / Family / Business / Not sure | Yes         | Determines pathway                                 |
| Country             | Country of citizenship                                                 | Country dropdown                                               | Yes         | Visa requirements, risk, country-specific patterns |
| Current country     | Which country are you currently living in?                             | Country dropdown                                               | Optional    | Document and visa-office planning                  |
| Age                 | What is your age?                                                      | Number                                                         | Yes         | CRS and FSW scoring                                |
| Marital status      | What is your marital status?                                           | Single / Married / Common-law                                  | Yes         | CRS and family-size calculation                    |
| Spouse coming       | Is your spouse/partner coming with you?                                | Yes/No                                                         | Conditional | Changes CRS calculation                            |
| Children            | Do you have dependent children? How many?                              | Number                                                         | Yes         | Settlement funds + family sponsorship planning     |
| Language test       | Have you taken an accepted language test?                              | IELTS General / CELPIP / PTE Core / TEF / TCF / None           | Yes         | CRS/FSW/PNP scoring                                |
| Test date           | What is the exact test date?                                           | Date                                                           | Conditional | Language tests expire after 2 years for EE        |
| Scores              | Reading, Writing, Listening, Speaking                                  | Number fields                                                  | Conditional | CRS/CLB calculation                                |
| Education           | Highest completed education                                            | Dropdown                                                       | Yes         | CRS/FSW scoring                                    |
| ECA                 | Do you have an ECA for foreign education?                              | Yes / No / In progress                                         | Conditional | Required for foreign education in Express Entry    |
| ECA date            | When was your ECA issued?                                              | Date                                                           | Conditional | ECA expiry tracking                                |
| Canadian education  | Have you studied in Canada before?                                     | Yes/No                                                         | Yes         | CRS and PNP matching                               |
| Work experience     | Do you have skilled work experience?                                   | Yes/No                                                         | Yes         | FSW/CRS/PNP                                        |
| NOC                 | Main NOC code                                                          | Text/search                                                    | Recommended | Required for accurate pathway matching             |
| TEER                | TEER level                                                             | 0/1/2/3/4/5                                                    | Yes         | Express Entry skilled work = TEER 0–3              |
| Foreign work years  | Years of skilled work outside Canada in last 10 years                  | Number                                                         | Yes         | CRS/FSW                                            |
| Canadian job offer  | Do you have a Canadian job offer?                                      | Yes/No                                                         | Yes         | PNP/work permit eligibility — not CRS points       |
| Province            | Which province do you prefer?                                          | Province dropdown / Any                                        | Yes         | PNP matching                                       |
| Relatives in Canada | Do you have close relatives in Canada?                                 | Yes/No + province                                              | Recommended | CRS sibling points + PNP ties                      |
| Settlement funds    | How much available settlement money do you have?                       | CAD number                                                     | Conditional | FSW/FST proof of funds — use dynamic table         |
| Refusals            | Any past visa refusals?                                                | Yes/No                                                         | Yes         | Risk flag                                          |
| Status issues       | Any removal order, inadmissibility, misrepresentation, criminal issue? | Yes/No                                                         | Yes         | Push to consultant/lawyer if yes                   |

**Business/Entrepreneur users** — add a premium flow:

| Question                                                   | Answer Type     | Required?           |
| ---------------------------------------------------------- | --------------- | ------------------- |
| How much investment capital do you have?                   | CAD range       | Yes                 |
| Do you own or manage a business?                           | Yes/No          | Yes                 |
| Years of ownership/management experience                   | Number          | Yes                 |
| Preferred province                                         | Dropdown        | Yes                 |
| Do you want to buy, start, or expand a business in Canada? | Multiple choice | Yes                 |
| Net worth range                                            | CAD range       | Optional but useful |

---

### B. Temporary Resident in Canada (Student / Worker / PGWP / Visitor)

#### Shared questions for all temporary residents

| Section                | Question                                    | Answer Type                                                     | Required?          | Why Navly Needs It                |
| ---------------------- | ------------------------------------------- | --------------------------------------------------------------- | ------------------ | --------------------------------- |
| Location               | Are you currently in Canada?                | Yes/No                                                          | Yes                | Starts inside-Canada flow         |
| Status                 | What is your current status?                | Student / Worker / PGWP / Visitor / TRP / Other                 | Yes                | Determines tracking type          |
| Province               | Which province/territory are you living in? | Dropdown                                                        | Yes                | PNP tracking                      |
| Arrival date           | When did you first arrive in Canada?        | Date                                                            | Yes                | Presence/timeline estimate        |
| Current permit expiry  | When does your current status expire?       | Date                                                            | Yes                | Renewal reminders                 |
| Goal                   | What is your main goal?                     | PR / extend permit / study / work / citizenship later / compare | Yes                | Dashboard focus                   |
| Country of citizenship | Country of citizenship                      | Country dropdown                                                | Yes                | Eligibility and document planning |
| Age                    | What is your age?                           | Number                                                          | Yes                | CRS/FSW                           |
| Marital status         | Marital status                              | Dropdown                                                        | Yes                | CRS/family size                   |
| Spouse in Canada       | Is your spouse/partner in Canada with you?  | Yes/No                                                          | Conditional        | CRS + permit planning             |
| Language test          | Accepted language test and scores           | Test + scores                                                   | Yes for PR tracker | CRS/CEC/PNP                       |
| Education              | Highest education completed                 | Dropdown                                                        | Yes                | CRS                               |
| Canadian education     | Have you completed Canadian education?      | Yes/No + program                                                | Yes                | CRS/PGWP/PNP                      |
| ECA                    | ECA for foreign education?                  | Yes / No / In progress                                          | Conditional        | Express Entry                     |
| NOC/TEER               | Main occupation NOC and TEER                | Search/dropdown                                                 | Yes if working     | CEC/PNP                           |
| Job offer              | Do you have a job offer?                    | Yes/No                                                          | Yes                | PNP/work permit matching          |
| Refusals               | Any previous refusals?                      | Yes/No                                                          | Yes                | Risk                              |
| Lost status            | Ever overstayed or lost status?             | Yes/No                                                          | Yes                | Risk flag                         |

#### B1. International Student Questions

| Question                            | Answer Type                                             | Required?   | Why Navly Needs It       |
| ----------------------------------- | ------------------------------------------------------- | ----------- | ------------------------ |
| School name                         | Text                                                    | Yes         | DLI/program tracking     |
| DLI number                          | Text/search                                             | Recommended | PGWP eligibility support |
| Program level                       | Certificate / Diploma / Bachelor / Master / PhD / Other | Yes         | PGWP + PNP matching      |
| Program length                      | Months                                                  | Yes         | PGWP planning            |
| Program start date                  | Date                                                    | Yes         | Timeline                 |
| Expected graduation date            | Month/year                                              | Yes         | PGWP countdown           |
| Are you studying full-time?         | Yes/No                                                  | Yes         | PGWP risk                |
| Any part-time semester?             | Yes/No                                                  | Yes         | PGWP risk flag           |
| Have you taken unauthorized breaks? | Yes/No                                                  | Yes         | Risk flag                |
| Do you work while studying?         | Yes/No                                                  | Optional    | Work compliance tracker  |
| Do you have a co-op work permit?    | Yes/No                                                  | Conditional | Co-op compliance         |
| Do you plan to apply for PGWP?      | Yes/No                                                  | Yes         | Main student-to-PR path  |
| Have you applied for PGWP?          | Not yet / Applied / Approved / Refused                  | Conditional | Tracker status           |

**Critical wording rule for students:** Work gained while studying full-time does not count toward CEC minimum requirements. IRCC explicitly excludes student/co-op work during full-time study. Work after graduation on PGWP may count if it meets CEC rules. Never say co-op work counts for CEC.

#### B2. Worker / PGWP Questions

| Question                                                              | Answer Type                                        | Required?   | Why Navly Needs It       |
| --------------------------------------------------------------------- | -------------------------------------------------- | ----------- | ------------------------ |
| Work permit type                                                      | PGWP / LMIA / LMIA-exempt / Open / Spousal / Other | Yes         | Work pathway             |
| Work permit issue date                                                | Date                                               | Recommended | Timeline                 |
| Work permit expiry date                                               | Date                                               | Yes         | Renewal/PR deadline      |
| Are you currently employed?                                           | Yes/No                                             | Yes         | CEC/PNP                  |
| Employer name                                                         | Text                                               | Recommended | PNP/job offer            |
| Job title                                                             | Text                                               | Yes         | NOC matching             |
| NOC code                                                              | Text/search                                        | Yes         | Core eligibility         |
| TEER level                                                            | 0–5                                                | Yes         | Skilled work check       |
| Province of employment                                                | Dropdown                                           | Yes         | PNP matching             |
| Job start date                                                        | Date                                               | Yes         | CEC month counter        |
| Weekly hours                                                          | Number                                             | Yes         | CEC full-time equivalent |
| Full-time or part-time                                                | Dropdown                                           | Yes         | CEC calculation          |
| Is the job paid?                                                      | Yes/No                                             | Yes         | Eligibility              |
| Are you self-employed?                                                | Yes/No                                             | Yes         | CEC risk flag            |
| Months of skilled Canadian work in last 3 years                       | Number                                             | Yes         | CEC eligibility          |
| Foreign skilled work experience                                       | Years                                              | Recommended | CRS/FSW                  |
| Employer support for PNP?                                             | Yes / No / Not sure                                | Yes         | PNP matching             |
| Is the job permanent/non-seasonal?                                    | Yes/No                                             | Recommended | PNP/job offer strength   |
| Wage or hourly rate                                                   | Number                                             | Optional    | PNP accuracy             |

**Job offer wording rule:** A qualifying arranged employment offer may strengthen PNP eligibility, but many job offers do not qualify. Job offers no longer add CRS points as of March 25, 2025.

#### B3. Visitor / TRV / eTA / TRP Questions

| Question                                                  | Answer Type                                 | Required?   | Why Navly Needs It             |
| --------------------------------------------------------- | ------------------------------------------- | ----------- | ------------------------------ |
| Visitor status type                                       | TRV / eTA / Visitor Record / TRP / Not sure | Yes         | Legal-status tracking          |
| Entry date to Canada                                      | Date                                        | Yes         | Status timeline                |
| Visitor status expiry                                     | Date                                        | Yes         | Extension reminder             |
| Applied to extend visitor status?                         | Yes/No                                      | Conditional | Maintained-status tracking     |
| Canadian spouse/partner?                                  | Yes/No                                      | Yes         | Family sponsorship possibility |
| Canadian job offer?                                       | Yes/No                                      | Yes         | Work permit/PNP possibility    |
| Planning to study?                                        | Yes/No                                      | Yes         | Study permit pathway           |
| Eligible for Express Entry from outside Canada?           | Not sure / Yes / No                         | Yes         | PR realism check               |
| Understand visitor status is not a direct PR path?        | Checkbox                                    | Yes         | Legal-risk control             |

Show this warning for all visitors:

> Visitor status alone does not create a direct PR pathway. Navly can show possible routes, but most users need Express Entry eligibility, family sponsorship, study, or work authorization.

---

### C. Permanent Resident

PR users are not tracking CRS. They are tracking **citizenship, PR card, residency obligation, and family sponsorship.**

IRCC citizenship rule: at least **1,095 days in Canada in the 5-year eligibility period**. Temporary resident / protected person days before PR count as half-days, up to a maximum of 365 days credit.

IRCC PR residency obligation: at least **730 days physically in Canada in the last 5 years** to maintain PR status.

#### PR Onboarding Questions

| Section                           | Question                                                               | Answer Type                                           | Required?    | Why Navly Needs It                 |
| --------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------- | ------------ | ---------------------------------- |
| Status                            | Are you a permanent resident?                                          | Yes/No                                                | Yes          | Starts PR flow                     |
| PR date                           | What date did you become a PR?                                         | Date                                                  | Yes          | Citizenship + residency obligation |
| PR card expiry                    | When does your PR card expire?                                         | Date                                                  | Yes          | Renewal reminder                   |
| Current location                  | Are you currently in Canada?                                           | Yes/No                                                | Yes          | Residency tracking                 |
| Province                          | Which province do you live in?                                         | Dropdown                                              | Recommended  | Local reminders/resources          |
| Citizenship goal                  | Are you planning to apply for citizenship?                             | Yes / No / Not sure                                   | Yes          | Dashboard focus                    |
| Travel history                    | Have you travelled outside Canada since becoming PR?                   | Yes/No                                                | Yes          | Presence calculation               |
| Trips outside Canada              | Each trip: departure date, return date, country                        | Repeating date fields                                 | Yes          | Citizenship + PR obligation        |
| Temporary resident days before PR | Were you in Canada before becoming PR within the last 5 years?         | Yes/No                                                | Recommended  | Citizenship half-day credit        |
| Pre-PR status                     | Status before PR                                                       | Student / Worker / Visitor / Protected person / Other | Conditional  | Citizenship calculation            |
| Tax filing                        | Filed taxes for required years?                                        | Year checklist                                        | Yes          | Citizenship readiness              |
| Language proof                    | English/French proof available?                                        | Yes/No                                                | Conditional  | Citizenship applicants age 18–54   |
| Prohibitions                      | Any criminal charge, probation, removal order, or citizenship refusal? | Yes/No                                                | Yes          | Legal-risk flag                    |
| Family sponsorship                | Want to sponsor a family member?                                       | Yes/No                                                | Optional     | Upsell/future flow                 |

#### PR Residency Obligation Questions

| Question                                                                   | Answer Type          | Required?   | Why Navly Needs It          |
| -------------------------------------------------------------------------- | -------------------- | ----------- | --------------------------- |
| Days outside Canada in the last 5 years                                    | Auto from travel log | Yes         | PR obligation               |
| Outside Canada with a Canadian citizen spouse/common-law partner?          | Yes/No               | Conditional | May count for PR obligation |
| Employed abroad by a Canadian business/public service?                     | Yes/No               | Conditional | May count for PR obligation |
| Received a residency questionnaire or PRTD issue?                          | Yes/No               | Recommended | Risk flag                   |

---

### D. Special / High-Risk Cases

These users should not go through a normal DIY tracker. Show a **limited dashboard + professional-review warning**.

| Question                                                                         | Answer Type   | Required?   | Product Action                      |
| -------------------------------------------------------------------------------- | ------------- | ----------- | ----------------------------------- |
| Currently out of status in Canada?                                               | Yes/No        | Yes         | Flag: professional review           |
| Permit expired?                                                                  | Yes/No + date | Conditional | Restoration/urgent deadline warning |
| Received a removal order?                                                        | Yes/No        | Yes         | Stop normal flow                    |
| Refused a visa, permit, PR, or entry to Canada or another country?               | Yes/No        | Yes         | Risk flag                           |
| Accused of misrepresentation?                                                    | Yes/No        | Yes         | Stop normal flow                    |
| Charged or convicted of a crime?                                                 | Yes/No        | Yes         | Stop normal flow                    |
| Medical inadmissibility issue?                                                   | Yes/No        | Recommended | Risk flag                           |
| Refugee claimant or protected person?                                            | Yes/No        | Yes         | Separate flow                       |
| Received a procedural fairness letter?                                           | Yes/No        | Recommended | Urgent consultant/lawyer flag       |
| Already have a lawyer/consultant?                                                | Yes/No        | Optional    | Route safely                        |

| Risk Level  | Dashboard Result                                            |
| ----------- | ----------------------------------------------------------- |
| Low risk    | Normal tracker                                              |
| Medium risk | Tracker + warning + consultant option                       |
| High risk   | Stop eligibility estimate — show "Needs professional review" |
| Urgent risk | Deadline/task tracker only, no pathway recommendation       |

Use this wording for high-risk users:

> Navly can help organize your dates and deadlines. Because your case includes a legal-risk factor, eligibility strategy should be reviewed by a licensed immigration consultant or lawyer.

---

### Key Wording Rules (apply everywhere in the app)

| Topic              | Do NOT say                                | Say instead                                                                                         |
| ------------------ | ----------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Job offer CRS      | "Adds 50–200 CRS points"                  | "A job offer no longer adds CRS points as of March 25, 2025. It may still strengthen PNP streams." |
| Student work       | "Co-ops and part-time work count for CEC" | "Work while studying full-time does not count for CEC. Post-graduation PGWP work may count."        |
| Eligibility        | "You qualify" / "You will be approved"    | "Based on your data, this pathway may be possible."                                                 |
| Settlement funds   | Hard-coded numbers                        | Always use `lib/settlement-funds.ts` and show last-verified date                                    |
