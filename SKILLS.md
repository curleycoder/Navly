# Navly Skills / Product Logic

## Core Product Idea

Navly should not tell users:

> “You need X score for Canada.”

That is weak and legally risky.

Navly should tell users:

> “Based on your profile, these are your possible PR pathways, your missing requirements, and your strongest next move.”

The product is a **PR pathway matcher + eligibility checker + risk warning system**, not just a CRS calculator.

---

## 1. Core User Types

Navly should split users by **location + current status**.

### Main user types

| User type | App goal |
|---|---|
| Outside Canada applicant | Find the best entry-to-PR strategy |
| Inside Canada applicant | Convert current status to PR before deadline |
| Consultant | Manage client cases and generate reports |

### First question

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

This first answer controls the whole app flow.

---

## 2. Main PR Pathways to Cover

### Core pathways

| Category | Pathway | Score system? | Main user type |
|---|---|---:|---|
| Federal skilled | Express Entry — FSW | CRS + 67/100 eligibility | Skilled worker inside/outside Canada |
| Canadian work | Express Entry — CEC | CRS | Worker with Canadian experience |
| Trades | Express Entry — FST | CRS | Skilled trades worker |
| Provincial | PNP Express Entry | Province + CRS | Province-targeted applicants |
| Provincial | PNP Non-Express Entry | Province rules | Job offer / local connection |
| Atlantic | AIP | No CRS | Atlantic job offer |
| Rural | RCIP | Community recommendation | Rural job offer |
| Francophone | FCIP | Community recommendation | French-speaking applicant |
| Quebec | Quebec skilled/business | Quebec system | People settling in Quebec |
| Family | Spouse/child/parent sponsorship | No CRS | Sponsored by family |
| Caregiver | Home Care Worker pilots | Program requirements | Child care / home support |
| Business | Start-up Visa / entrepreneur | Program requirements | Founder / business owner |
| Special | Protected person / H&C | Case-based | Humanitarian or protection cases |

Do not mix family sponsorship, protected person, H&C, or Quebec logic with CRS.

---

## 3. Outside Canada Flow

Dashboard name:

> **Your Canada Entry-to-PR Plan**

Outside Canada users need two things:

1. **Direct PR options**
2. **Entry strategy options**

### Flow

```txt
Outside Canada
→ CRS estimate
→ FSW 67/100 check
→ Express Entry category check
→ French advantage check
→ PNP/job-offer options
→ Study route check
→ Work permit route check
→ Best entry-to-PR plan
```

### Show these pathway groups

| Pathway | Show? | Notes |
|---|---:|---|
| Express Entry — FSW | Yes | Direct PR from outside Canada |
| Express Entry — FST | Yes | If trade profile fits |
| PNP job-offer streams | Yes | Some can apply from outside with job offer |
| AIP | Yes | Needs Atlantic job offer |
| Rural/Francophone pilots | Yes | Needs designated employer/community |
| Study permit → PGWP → PR | Yes | Long-term strategy |
| Work permit → Canadian experience → PR | Yes | Needs job offer/LMIA/permit route |
| Family sponsorship | Yes | If eligible sponsor exists |
| Quebec | Yes | If user intends to live in Quebec |
| Start-up / entrepreneur | Later | Advanced module |

### Result example

```txt
Your best Canada plan

Direct PR:
Possible, but not strong yet.
Estimated CRS: 421
Federal Skilled Worker: Eligible
Recent CRS competitiveness: Low

Best route:
Study route or employer-supported work permit.

Recommended plan:
1. Improve IELTS to CLB 9.
2. Complete ECA.
3. Apply to PGWP-eligible programs or target Atlantic employers.
4. Recalculate after job offer or Canadian education.
```

---

## 4. Inside Canada Flow

Dashboard name:

> **Your Status-to-PR Plan**

Inside Canada users need urgency tracking:

- Current permit
- Permit expiry date
- Canadian work/study history
- Risk of losing status
- PR pathway before permit expires

### Student flow

```txt
Study Permit
→ PGWP eligibility
→ PGWP length risk
→ Field-of-study risk
→ Canadian work plan
→ CEC / PNP / AIP / rural path
```

Student result should show:

- PGWP eligibility risk
- Possible PGWP length
- Province-based PR options
- Target NOC/TEER after graduation
- Months until PR-ready

### Worker flow

```txt
Work Permit
→ Canadian skilled work months
→ CEC eligibility
→ PNP eligibility
→ Employer-supported PR
→ Permit expiry risk
```

Worker result should show:

- Months of skilled Canadian work completed
- Whether NOC/TEER qualifies
- Whether wage/job offer helps PNP
- Employer support options
- Permit expiry risk

### Visitor flow

Show reality clearly:

```txt
Visitor status does not create a direct PR pathway.
Realistic options:
- Express Entry based on profile
- Study permit
- Work permit/job offer
- Family sponsorship
- Humanitarian/special case if applicable
```

Do not create false hope for visitors.

---

## 5. IELTS / CLB Logic

For PR, use **IELTS General Training**, not IELTS Academic.

### IELTS General to CLB

| CLB | Reading | Writing | Listening | Speaking |
|---:|---:|---:|---:|---:|
| CLB 10 | 8.0 | 7.5 | 8.5 | 7.5 |
| CLB 9 | 7.0 | 7.0 | 8.0 | 7.0 |
| CLB 8 | 6.5 | 6.5 | 7.5 | 6.5 |
| CLB 7 | 6.0 | 6.0 | 6.0 | 6.0 |
| CLB 6 | 5.0 | 5.5 | 5.5 | 5.5 |
| CLB 5 | 4.0 | 5.0 | 5.0 | 5.0 |
| CLB 4 | 3.5 | 4.0 | 4.5 | 4.0 |

IELTS does not directly give CRS points.

Logic:

```txt
IELTS score
→ CLB level
→ CRS language points
→ Eligibility/pathway impact
```

---

## 6. Express Entry Rules

### Minimum language requirements

| Program | Minimum language |
|---|---:|
| Federal Skilled Worker | CLB 7 in all 4 skills |
| Canadian Experience Class — TEER 0 or 1 | CLB 7 |
| Canadian Experience Class — TEER 2 or 3 | CLB 5 |
| Federal Skilled Trades | CLB 5 speaking/listening + CLB 4 reading/writing |

### FSW 67/100 grid

| Factor | Max points |
|---|---:|
| Language | 28 |
| Education | 25 |
| Work experience | 15 |
| Age | 12 |
| Job offer | 10 |
| Adaptability | 10 |
| Total | 100 |
| Pass mark | 67 |

### FSW language points

| CLB | Points per ability |
|---:|---:|
| CLB 9+ | 6 |
| CLB 8 | 5 |
| CLB 7 | 4 |
| Below CLB 7 | Not eligible |

---

## 7. 2026 Express Entry Category Checks

Add category-based selection, but only after Express Entry eligibility is confirmed.

### 2026 categories to check

| Category | App should collect |
|---|---|
| French-language proficiency | French test type + NCLC score |
| Healthcare and social services | NOC + 1 year eligible experience |
| STEM | NOC + 1 year eligible experience |
| Trades | NOC + 1 year eligible experience |
| Education occupations | NOC + 1 year eligible experience |
| Transport occupations | NOC + 1 year eligible experience |
| Physicians with Canadian work experience | NOC + Canadian work history |
| Senior managers with Canadian work experience | NOC + Canadian work history |
| Researchers with Canadian work experience | NOC + Canadian work history |
| Skilled military recruits | Canadian Armed Forces job offer |

### Logic

```txt
Is user eligible for Express Entry?
→ If yes, check category eligibility
→ If category eligible, compare CRS against category draw history
→ If not, show missing factor
```

Do not show category eligibility before Express Entry eligibility.

---

## 8. Province / Area Logic

Canada has 13 major areas:

| Area | Immigration role |
|---|---|
| British Columbia | BC PNP |
| Alberta | AAIP |
| Saskatchewan | SINP |
| Manitoba | MPNP |
| Ontario | OINP |
| Quebec | Separate Quebec system |
| New Brunswick | NBPNP + AIP |
| Nova Scotia | NSNP + AIP |
| Prince Edward Island | PEI PNP + AIP |
| Newfoundland and Labrador | NLPNP + AIP |
| Yukon | Yukon Nominee Program |
| Northwest Territories | NTNP |
| Nunavut | No regular PNP |

Do not hard-code one score per province.

Bad logic:

```txt
BC = 130
Ontario = 60
Alberta = 300
```

Better logic:

```txt
Province
→ Stream
→ Occupation/NOC
→ Job offer?
→ Wage?
→ Local study?
→ Local work?
→ Language?
→ Draw history / cutoff
→ Eligibility status
```

---

## 9. Atlantic, Rural, and Francophone Programs

### Atlantic Immigration Program

Applies to:

- Nova Scotia
- New Brunswick
- Prince Edward Island
- Newfoundland and Labrador

Core requirement:

```txt
Designated Atlantic employer
→ Valid job offer
→ Language/education/work/funds checks
→ PR pathway
```

### Rural and Francophone pilots

Core requirement:

```txt
Selected community
→ Designated/approved employer
→ Job offer
→ Priority sector check
→ Community recommendation
→ PR application
```

App should collect:

- Community
- Employer designation/approval
- Job offer NOC/TEER
- Priority sector
- Language score
- Work experience
- Education
- Settlement funds
- Community recommendation status

---

## 10. Student / PGWP Route

Student is not PR directly.

```txt
Study Permit
→ Canadian study
→ PGWP
→ Canadian skilled work
→ CEC / PNP / AIP / Rural / Francophone
→ PR
```

### Student fields

- Current status
- School name
- DLI number
- Program length
- Program level
- Public/private institution
- Field of study / CIP code
- Graduation date
- Full-time status
- Co-op component
- PGWP applied? yes/no
- Language score
- Province of study
- Intended province
- Canadian work experience after graduation
- Unauthorized work risk

### Output wording

```txt
You are not PR-ready yet.
Your strongest route is PGWP → 1 year skilled Canadian work → CEC or PNP.
```

Add warning:

```txt
Study route is not a PR guarantee.
Your PR strength depends on PGWP length, skilled work, language, and province.
```

---

## 11. Work Permit Route

Work permit is not PR directly.

```txt
Work Permit
→ Canadian skilled work
→ CEC / PNP / AIP / Rural / Francophone / Caregiver
→ PR
```

### Work permit fields

- Permit type
- Permit expiry
- Province of job
- Job title
- Job duties
- NOC code
- TEER level
- Wage
- Hours per week
- Start date
- Employer name
- Employer designation status
- Permanent/full-time/non-seasonal job offer
- Intended province/community

### App should calculate

- CEC eligibility
- PNP eligibility
- AIP eligibility
- Rural/community eligibility
- CRS estimate
- Missing months of Canadian work
- Permit expiry risk

---

## 12. Family Sponsorship

Family sponsorship does not use IELTS or CRS.

### Main routes

- Spouse/common-law sponsorship
- Dependent child
- Parent/grandparent
- Some orphaned relatives
- Other relative rule, later only

### Sponsor checks

- Sponsor age 18+
- Canadian citizen / PR / eligible status
- PR sponsor lives in Canada
- Previous sponsorship undertaking
- Social assistance issue
- Bankruptcy issue
- Criminal/family violence issue
- Income requirement where relevant

Keep sponsorship separate from CRS.

---

## 13. Quebec Branch

Quebec must be separate.

Logic:

```txt
Does user intend to live in Quebec?
→ Yes: do not show Express Entry/PNP as primary route
→ Show Quebec Skilled Worker / PSTQ / CSQ route
→ Then federal PR after Quebec selection
```

### Quebec fields

- Intention to live in Quebec
- Arrima profile
- Quebec invitation received
- CSQ received
- PSTQ application submitted
- Quebec employer/job offer
- French level
- Work permit expiry

---

## 14. Special Case Pathways

Do not build these first, but include them in the system.

### Protected Person pathway

Fields:

- Protected person status
- Date status granted
- Dependants in Canada
- Dependants outside Canada
- PR application submitted
- Biometrics status
- Medical status

### Humanitarian & Compassionate pathway

Fields:

- Years in Canada
- Family in Canada
- Children affected
- Work history
- Community support
- Hardship if removed
- Previous refusals/removal order

Output:

```txt
This is a complex humanitarian pathway.
The app can screen basic factors, but legal review is recommended.
```

Do not score H&C like CRS.

---

## 15. Closed Program Handling

The app must filter closed/inactive programs.

| Program | Status | App action |
|---|---|---|
| Agri-Food Pilot | Closed May 14, 2025 | Show only if user already applied |
| Economic Mobility Pathways Pilot | Closed | Show only historical/review status |
| Old Rural and Northern Immigration Pilot | Replaced | Do not recommend as active pathway |

Logic:

```txt
If program status = closed:
→ Do not recommend as a new pathway
→ Ask: “Did you apply before closure?”
```

---

## 16. Risk Screening

Eligibility is not enough. Add inadmissibility/risk checks.

| Risk | App question |
|---|---|
| Criminality | Any charges or convictions? |
| Medical | Any medical inadmissibility concern? |
| Misrepresentation | Any incorrect info submitted before? |
| Previous refusal | Any visa/study/work/PR refusal? |
| Removal order | Ever asked to leave Canada? |
| Overstay | Any period without valid status? |
| Security | Any military/government/security issue? |

Output:

```txt
Legal review recommended before applying.
```

---

## 17. Document Checklist Engine

This is a strong paid feature.

| Area | Documents |
|---|---|
| Identity | Passport, birth certificate, marriage/divorce docs |
| Language | IELTS General, CELPIP, PTE Core, TEF, TCF |
| Education | ECA, transcripts, diplomas |
| Work | Reference letters, pay stubs, tax slips, contracts |
| Canada work | T4, NOA, ROE, pay slips, work permit |
| Job offer | Offer letter, employer forms, LMIA if applicable |
| Funds | Bank statements |
| Medical | Immigration medical exam |
| Police | Police certificates |
| Family | Spouse/dependent documents |

Monetization:

- Free: eligibility estimate
- Paid: document checklist
- Premium: personalized action plan

---

## 18. NOC / TEER Validation

Do not match only by job title.

Better logic:

```txt
Job title
→ Main duties
→ Industry
→ NOC code
→ TEER level
→ Eligible programs
→ Category-based draw match
→ PNP match
```

Required fields:

- Job title
- Main duties
- Industry
- Seniority
- Number of employees managed
- Wage
- Province
- Full-time/part-time
- Paid/unpaid
- Self-employed yes/no

---

## 19. Settlement Funds Calculator

Not everyone needs funds.

| User type | Funds usually needed? |
|---|---|
| FSW outside Canada | Yes |
| FST outside Canada | Usually yes |
| CEC | Usually no |
| Valid job offer + authorized work | May reduce/remove need |
| PNP | Depends on stream |
| AIP / rural pilots | Usually settlement proof needed |
| Family sponsorship | Different financial rules |

Add funds calculator by family size.

---

## 20. Spouse Strategy

For married applicants, check:

```txt
Who should be principal applicant?
```

Compare:

- Age
- Education
- Language
- Canadian work
- Foreign work
- NOC/category
- French
- Provincial connection

Output:

```txt
Recommended principal applicant: Spouse A
Reason: Higher language score + Canadian work experience + younger age.
```

---

## 21. Live Draw History Tracker

Static calculators are not enough.

Track:

- Program
- Date
- CRS cutoff
- Number invited
- Tie-breaking rule
- Category
- Province if PNP
- NOC if targeted
- Minimum provincial score

Output example:

```txt
Your CRS: 462
Recent similar draw range: 430–510
Competitiveness: Medium
```

---

## 22. Best Next Action Engine

This is the money feature.

Do not only show eligibility. Show the highest-leverage move.

| User profile | Best action |
|---|---|
| CRS 470, IELTS CLB 8 | Improve IELTS to CLB 9 |
| Student graduating soon | Protect PGWP eligibility |
| Worker in BC with low wage | Improve wage/job offer before BC PNP |
| French speaker NCLC 7 | Target French category |
| Married applicant | Compare principal applicant |
| Visitor | Get valid job/study/family route; no direct PR |

Result format:

```txt
Your strongest PR paths:
1. Canadian Experience Class
2. BC PNP
3. Federal Skilled Worker

Your weak paths:
- AIP: no Atlantic job offer
- Rural pilot: no designated rural employer
- Family sponsorship: no sponsor

Your next 3 actions:
1. Get IELTS General to CLB 9.
2. Complete 12 months skilled Canadian work.
3. Check BC PNP stream based on your NOC and wage.
```

---

## 23. Legal Disclaimer and RCIC Boundary

Never say:

```txt
You qualify for PR.
You will get PR.
Apply now and you will be accepted.
```

Use:

```txt
Based on the information provided, you may be eligible for these pathways.
Final eligibility depends on official program rules, document review, and government decisions.
This tool does not provide legal advice.
```

For consultants, use:

```txt
Case screening support tool.
Document organization.
Eligibility estimate.
```

Do not market Navly as replacing a licensed consultant.

---

## 24. MVP Build Order

Do not build all immigration law first. That will slow the project and increase legal risk.

### Phase 1 — Applicant MVP

Build:

1. Outside Canada flow
2. Inside Canada flow
3. IELTS/CLB converter
4. CRS calculator
5. FSW 67-point checker
6. Express Entry category checker
7. Student / PGWP checker
8. Work permit → CEC/PNP checker
9. Province/pathway matcher
10. Result/action plan page
11. Closed-program filter
12. Legal disclaimer

### Phase 2 — Paid Reports

Add:

- PDF report
- Document checklist
- Improve-your-score plan
- Province suggestions
- Draw competitiveness tracker

### Phase 3 — Consultant Portal

Add:

- Add client profile
- Save case history
- Case notes
- Risk flags
- Document upload portal
- Deadline reminders
- PDF export
- Team access

---

## 25. Recommended MVP Pages

1. Profile intake
2. Location/status selector
3. IELTS/CLB converter
4. Express Entry CRS calculator
5. FSW 67-point checker
6. Student → PGWP → PR checker
7. Work permit → PR checker
8. Province/pathway matcher
9. Document checklist
10. Action plan result page

---

## 26. Main Data Model

```txt
User
→ Location: inside/outside Canada
→ Current status
→ Goal
→ Language
→ Education
→ Work/NOC/TEER
→ Canadian status
→ Province/community
→ Job offer/employer
→ Family sponsor
→ Funds
→ Risk flags
→ Matching pathways
→ Missing requirements
→ Score/risk/action plan
```

---

## Bottom Line

Build Navly as:

```txt
Profile Intake
→ CLB + CRS + FSW Checks
→ Status-Based Pathway Matching
→ Risk + Missing Requirement Detection
→ Best Next Action Plan
```

Start with **Express Entry + IELTS/CLB + student/work permit pathways + inside/outside Canada flow**.

Do **not** build refugee, H&C, Quebec business, entrepreneur, or complex sponsorship first. They matter, but they are not the fastest MVP.

The highest-value MVP is:

```txt
Outside Canada applicant
+ Inside Canada student/worker/visitor
+ CRS/CLB
+ FSW/CEC/FST
+ Category checker
+ Student/PGWP checker
+ Work permit checker
+ Province matcher
+ Document checklist
+ Best next action
```

That is the cleanest and most profitable first version.
