## Build Navly like this: PR Pathway Engine

Your app should not say: **“You need X score for Canada.”**
That is weak and legally risky.

Your app should say:

> “Based on your profile, these are your possible PR pathways, your missing requirements, and your strongest next move.”

That is the product.

---

# 1. Main Canada PR pathways your app should cover

IRCC lists Canada PR programs under work-based, regional, family, refugee, and special programs. The major buckets include Express Entry, caregivers, medical doctors, PNP, rural/francophone pilots, Atlantic Immigration Program, Quebec, family sponsorship, refugees, and special programs. ([Canada][1])

## Core PR pathways

| Category        | Pathway                         |                 Score system? | Main user type                       |
| --------------- | ------------------------------- | ----------------------------: | ------------------------------------ |
| Federal skilled | Express Entry — FSW             | Yes: CRS + 67/100 eligibility | Skilled worker outside/inside Canada |
| Canadian work   | Express Entry — CEC             |                      Yes: CRS | Worker with Canadian experience      |
| Trades          | Express Entry — FST             |                      Yes: CRS | Skilled trades worker                |
| Provincial      | PNP Express Entry               |                Province + CRS | People province wants                |
| Provincial      | PNP Non-Express Entry           |          Province score/rules | Job offer / local connection         |
| Atlantic        | AIP                             |                        No CRS | Atlantic job offer                   |
| Rural           | RCIP                            |      Community recommendation | Rural job offer                      |
| Francophone     | FCIP                            |      Community recommendation | French-speaking applicant            |
| Quebec          | Quebec skilled/business         |                 Quebec system | People settling in Quebec            |
| Family          | Spouse/child/parent sponsorship |                        No CRS | Sponsored by family                  |
| Caregiver       | Home Care Worker pilots         |          Program requirements | Child care / home support            |
| Business        | Start-up Visa                   |          Program requirements | Founder/business owner               |
| Humanitarian    | Refugee/H&C                     |                    Case-based | Protection/hardship cases            |

---

# 2. IELTS General → CLB table

For immigration PR, your app should use **IELTS General Training**, not IELTS Academic for Express Entry.

## IELTS General to CLB

|    CLB | Reading | Writing | Listening | Speaking |
| -----: | ------: | ------: | --------: | -------: |
| CLB 10 |     8.0 |     7.5 |       8.5 |      7.5 |
|  CLB 9 |     7.0 |     7.0 |       8.0 |      7.0 |
|  CLB 8 |     6.5 |     6.5 |       7.5 |      6.5 |
|  CLB 7 |     6.0 |     6.0 |       6.0 |      6.0 |
|  CLB 6 |     5.0 |     5.5 |       5.5 |      5.5 |
|  CLB 5 |     4.0 |     5.0 |       5.0 |      5.0 |
|  CLB 4 |     3.5 |     4.0 |       4.5 |      4.0 |

IRCC uses CLB for English and NCLC for French, and publishes this IELTS-to-CLB conversion table. ([Canada][2])

---

# 3. How IELTS gives CRS points

This is where your app needs to be smart.

IELTS itself does **not** give points.
IELTS converts to **CLB**, then CLB gives CRS points.

## Express Entry CRS — first language points

For a single applicant:

|   CLB level | CRS points per ability |
| ----------: | ---------------------: |
| Below CLB 4 |                      0 |
|  CLB 4 or 5 |                      6 |
|       CLB 6 |                      9 |
|       CLB 7 |                     17 |
|       CLB 8 |                     23 |
|       CLB 9 |                     31 |
|     CLB 10+ |                     34 |

So if someone is single and gets **CLB 9 in all 4 skills**, language gives:

> 31 × 4 = **124 CRS points**

If they get **CLB 10 in all 4 skills**:

> 34 × 4 = **136 CRS points**

For an applicant with spouse, the first-language max is lower: **128 points**, not 136. IRCC’s Ministerial Instructions list the CRS language points by CLB and also confirm the first-language maximum is 136 without spouse and 128 with spouse. ([Canada][3])

---

# 4. Minimum IELTS/CLB by main PR program

## Express Entry

| Program                                 |                                 Minimum language |
| --------------------------------------- | -----------------------------------------------: |
| Federal Skilled Worker                  |                            CLB 7 in all 4 skills |
| Canadian Experience Class — TEER 0 or 1 |                                            CLB 7 |
| Canadian Experience Class — TEER 2 or 3 |                                            CLB 5 |
| Federal Skilled Trades                  | CLB 5 speaking/listening + CLB 4 reading/writing |

Federal Skilled Worker requires skilled work in TEER 0, 1, 2, or 3 and uses a 67/100 eligibility grid before CRS ranking. ([Canada][4]) CEC has no education requirement, but the applicant must meet language minimums and plan to live outside Quebec. ([Canada][5]) Federal Skilled Trades requires 2 years of qualifying skilled trade experience in the last 5 years and has its own trade/job-offer/certificate rules. ([Canada][6])

---

## Federal Skilled Worker 67/100 points

Before CRS, FSW users must pass **67 out of 100**.

| Factor          | Max points |
| --------------- | ---------: |
| Language        |         28 |
| Education       |         25 |
| Work experience |         15 |
| Age             |         12 |
| Job offer       |         10 |
| Adaptability    |         10 |
| Total           |        100 |
| Pass mark       |     **67** |

For FSW language points:

|         CLB | Points per ability |
| ----------: | -----------------: |
|      CLB 9+ |                  6 |
|       CLB 8 |                  5 |
|       CLB 7 |                  4 |
| Below CLB 7 |       Not eligible |

IRCC says FSW applicants need 67+ points to qualify and that these points are different from CRS ranking points. ([Canada][4])

---

# 5. Student pathway

Student is **not PR directly**. The real chain is:

```text
Study Permit
→ Canadian study
→ PGWP
→ Canadian work experience
→ CEC / PNP / AIP / Rural / Francophone
→ PR
```

## PGWP language requirement

For PGWP applications after November 1, 2024:

| Program type                       | Minimum language |
| ---------------------------------- | ---------------: |
| University degree-level programs   |            CLB 7 |
| College / some non-degree programs |            CLB 5 |

IRCC says most PGWP applicants now need proof of language results, and PGWP requirements changed as of November 1, 2024. ([Canada][7]) IRCC also says the 2026 field-of-study list is frozen, meaning eligible fields are not being added or removed in 2026. ([Canada][8])

## What your app should ask students

Collect:

* Current status: outside Canada / study permit / graduated
* School name
* DLI number
* Program length
* Program level
* Field of study / CIP code
* Graduation date
* PGWP applied? yes/no
* IELTS/CELPIP/PTE score
* Canadian work experience after graduation
* Province of study
* Province where they want to live

Your app should output:

> “You are not PR-ready yet. Your strongest route is PGWP → 1 year skilled Canadian work → CEC or PNP.”

---

# 6. Work permit pathway

Work permit is also **not PR directly**.

The chain is:

```text
Work Permit
→ Canadian skilled work
→ CEC / PNP / AIP / Rural / Francophone / Caregiver
→ PR
```

## Work permit data your app needs

Ask:

* Current work permit type:

  * PGWP
  * LMIA-based closed work permit
  * LMIA-exempt closed work permit
  * Open work permit
  * Spousal open work permit
  * Employer-specific permit
* Province of job
* Job title
* NOC code
* TEER level
* Wage
* Hours per week
* Start date
* Employer name
* Is employer designated?
  Important for AIP, RCIP, FCIP.
* Is job permanent/full-time/non-seasonal?
* Does applicant intend to live in that province/community?

Your app should calculate:

* CEC eligibility
* PNP eligibility
* AIP eligibility
* Rural/community eligibility
* CRS estimate
* Missing months of Canadian work

---

# 7. Province / area logic

Canada has **13 major areas**:

| Area                      | Immigration role       |
| ------------------------- | ---------------------- |
| British Columbia          | BC PNP                 |
| Alberta                   | AAIP                   |
| Saskatchewan              | SINP                   |
| Manitoba                  | MPNP                   |
| Ontario                   | OINP                   |
| Quebec                    | Separate Quebec system |
| New Brunswick             | NBPNP + AIP            |
| Nova Scotia               | NSNP + AIP             |
| Prince Edward Island      | PEI PNP + AIP          |
| Newfoundland and Labrador | NLPNP + AIP            |
| Yukon                     | Yukon Nominee Program  |
| Northwest Territories     | NTNP                   |
| Nunavut                   | No regular PNP         |

PNP lets provinces and territories nominate people who have the skills, education, and work experience to support their economy and who want to live in that province or territory. Each province/territory sets its own requirements and nomination numbers. ([Canada][9])

## Your app should not hard-code “one score per province”

Bad product logic:

```text
BC = 130
Ontario = 60
Alberta = 300
```

That will break fast.

Better product logic:

```text
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

# 8. Atlantic Immigration Program

AIP applies to:

* Nova Scotia
* New Brunswick
* Prince Edward Island
* Newfoundland and Labrador

It is employer-driven. Applicant needs a job offer from a **designated employer** in Atlantic Canada. IRCC says the program is for skilled workers or recent graduates from recognized Atlantic institutions, and applicants need a job offer from a designated employer. ([Canada][10])

## AIP language

| Job TEER        | Minimum language |
| --------------- | ---------------: |
| TEER 0, 1, 2, 3 |    Usually CLB 5 |
| TEER 4          |            CLB 4 |

IRCC’s AIP guide states CLB/NCLC 4 for TEER 4 job offers and language training toward CLB 5 may be required. ([Canada][11])

---

# 9. Rural and Francophone pilots

There are two important community programs:

| Program                                 | Main user                                     |
| --------------------------------------- | --------------------------------------------- |
| Rural Community Immigration Pilot       | Skilled worker with rural community job offer |
| Francophone Community Immigration Pilot | French-speaking worker for selected community |

IRCC says the rural and francophone pilots offer PR to skilled candidates who want to work and live in one of **18 selected communities**. ([Canada][12])

For RCIP, IRCC says applicants need a job offer, work experience, language assessment, education assessment, settlement funds, and then community recommendation before applying for PR. ([Canada][13])

Your app should ask:

* Which community?
* Is employer designated/approved?
* Job offer NOC/TEER
* Priority sector?
* Language score
* Work experience
* Education
* Settlement funds
* Community recommendation received?

---

# 10. Family sponsorship

This does not use IELTS/CRS.

Main types:

* Spouse
* Common-law partner
* Conjugal partner
* Dependent child
* Parent/grandparent
* Some orphaned relatives

For spouse/partner/child sponsorship, sponsor must be at least 18 and be a Canadian citizen, PR, or person registered under the Canadian Indian Act. Permanent residents must live in Canada to sponsor. ([Canada][14])

Your app should treat this as a separate route:

```text
Has Canadian citizen/PR spouse/partner/parent?
→ Sponsor eligible?
→ Relationship type?
→ Inland or outland?
→ Applicant inadmissibility issues?
```

Do **not** mix this with CRS.

---

# 11. Caregiver pathway

This is for:

* Home child care providers
* Home support workers

IRCC says the Home Care Worker Immigration pilots help skilled workers with job offers in the field immigrate permanently. ([Canada][15])

Eligibility includes:

* Plan to live/work outside Quebec
* Language requirement
* Education requirement
* Relevant work experience or training
* Job offer as home child care provider or home support worker
* Admissibility ([Canada][16])

Your app should ask:

* Job offer type
* NOC
* Employer
* Work experience
* Training/education
* Language score
* Province outside Quebec

---

# 12. Business / founder pathway

Include these modules later, not MVP:

| Pathway                                           | User type                                    |
| ------------------------------------------------- | -------------------------------------------- |
| Start-up Visa                                     | Founder with designated organization support |
| Self-employed / cultural or athletic legacy cases | Very narrow                                  |
| Provincial Entrepreneur streams                   | Business buyer / investor                    |
| Quebec business immigration                       | Quebec-specific                              |

For Navly MVP, don’t start here. These are complex, low-volume, and legally sensitive.

---

# 13. What Navly should collect from every user

This should be your main onboarding form.

## Personal profile

| Field                  | Example                |
| ---------------------- | ---------------------- |
| Age                    | 31                     |
| Marital status         | Single / married       |
| Spouse coming?         | yes/no                 |
| Country of citizenship | Iran                   |
| Current country        | Canada                 |
| Current province       | BC                     |
| Intended province      | BC / Ontario / Alberta |
| Quebec intention       | yes/no                 |

## Status in Canada

| Field             | Options                                     |
| ----------------- | ------------------------------------------- |
| Current status    | Visitor / student / worker / outside Canada |
| Permit type       | PGWP / study / LMIA / open work permit      |
| Permit expiry     | date                                        |
| Previous refusals | yes/no                                      |

## Language

| Field        | Required                                      |
| ------------ | --------------------------------------------- |
| Test type    | IELTS General / CELPIP / PTE Core / TEF / TCF |
| Test date    | must be less than 2 years old                 |
| Reading      | score                                         |
| Writing      | score                                         |
| Listening    | score                                         |
| Speaking     | score                                         |
| French test? | yes/no                                        |

## Education

| Field               | Required                                        |
| ------------------- | ----------------------------------------------- |
| Highest education   | high school / diploma / bachelor / master / PhD |
| Canadian education? | yes/no                                          |
| Province of study   | BC, Ontario, etc.                               |
| ECA completed?      | yes/no                                          |
| Field/CIP code      | for PGWP/students                               |

## Work

| Field               | Required             |
| ------------------- | -------------------- |
| Job title           | full-stack developer |
| NOC code            | NOC 21234 etc.       |
| TEER                | 0–5                  |
| Years foreign work  | number               |
| Years Canadian work | number               |
| Province of work    | BC                   |
| Wage                | hourly/yearly        |
| Hours/week          | number               |
| Job offer           | yes/no               |
| Employer designated | yes/no               |

## Family

| Field                    | Required |
| ------------------------ | -------- |
| Canadian spouse/partner? | yes/no   |
| Canadian sibling?        | yes/no   |
| Parent/child sponsor?    | yes/no   |

## Settlement

| Field                     | Required   |
| ------------------------- | ---------- |
| Funds available           | CAD amount |
| Province/community plan   | text       |
| Rural community job offer | yes/no     |

---

# 14. Your MVP scoring engine

Build it in this order.

## Phase 1 — Express Entry calculator

Must calculate:

* IELTS → CLB
* FSW 67/100 eligibility
* CEC eligibility
* FST eligibility
* CRS score estimate
* Missing requirements

This is the most valuable first module.

## Phase 2 — Student/PGWP route

Calculate:

* PGWP eligibility warning
* Language minimum
* Field-of-study risk
* Best PR route after graduation
* Months until CEC eligibility

## Phase 3 — Province matcher

Do **not** calculate every PNP score at first.

Start with:

* BC
* Ontario
* Alberta
* Atlantic provinces
* Rural/community pilots

Why? These are the highest-value for your target users.

## Phase 4 — Recommendation engine

Example output:

| Pathway            | Status         | Reason                                   |
| ------------------ | -------------- | ---------------------------------------- |
| CEC                | Not yet        | Need 5 more months Canadian skilled work |
| FSW                | Eligible       | 72/100, CRS 462                          |
| BC PNP             | Possible       | Job offer in BC, TEER 1                  |
| AIP                | Not likely     | No Atlantic job offer                    |
| Family sponsorship | Not applicable | No sponsor                               |

Then give:

> “Best next move: improve IELTS to CLB 9 and complete 1 year Canadian skilled work.”

That is where the app becomes useful.

---

# 15. Product strategy: keep it simple

Do **not** build “all immigration law” first. That will kill the project.

Build this MVP:

## MVP pages

1. **Profile intake**
2. **IELTS/CLB converter**
3. **Express Entry CRS calculator**
4. **FSW 67-point checker**
5. **Student → PGWP → PR path checker**
6. **Work permit → PR path checker**
7. **Province/pathway matcher**
8. **Action plan result page**

## Result page should say

```text
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

# Bottom line

For Navly, the core data model is:

```text
User Profile
→ Language CLB
→ Education
→ Work/NOC/TEER
→ Canadian status
→ Province/community
→ Job offer/employer
→ Family sponsor
→ Funds
→ Pathway eligibility
→ Score/risk/action plan
```

Start with **Express Entry + IELTS/CLB + student/work permit pathways**.
That is the cleanest, most profitable MVP. Province-specific PNP scoring comes after.

[1]: https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada.html "Live in Canada permanently - Canada.ca"
[2]: https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation/eligibility/language-results.html "Post-graduation work permit: How to find your language level based on your test results - Canada.ca"
[3]: https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-application-management-system/current.html?utm_source=chatgpt.com "Ministerial Instructions respecting the Express Entry system"
[4]: https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-workers.html "Express Entry: Federal Skilled Worker Program - Canada.ca"
[5]: https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/canadian-experience-class.html "Express Entry: Canadian Experience Class - Canada.ca"
[6]: https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-trades.html "Express Entry: Federal Skilled Trades Program - Canada.ca"
[7]: https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation/about.html?utm_source=chatgpt.com "About the post-graduation work permit (PGWP)"
[8]: https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation/eligibility/field-of-study.html?utm_source=chatgpt.com "Post-graduation work permit: Field of study requirement"
[9]: https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees.html?utm_source=chatgpt.com "Immigrate as a provincial nominee"
[10]: https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/atlantic-immigration/how-to-immigrate.html?utm_source=chatgpt.com "Immigrate through the Atlantic Immigration Program"
[11]: https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/guide-0154-atlantic-immigration-program.html?utm_source=chatgpt.com "Guide 0154 - Atlantic Immigration Program"
[12]: https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/rural-franco-pilots.html?utm_source=chatgpt.com "Rural and Francophone Community Immigration pilots"
[13]: https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/rural-franco-pilots/rural-immigration/eligibility.html?utm_source=chatgpt.com "Rural Community Immigration Pilots: Who can apply"
[14]: https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/spouse-partner-children/eligibility.html?utm_source=chatgpt.com "Sponsor your spouse, partner or child: Check if you're eligible"
[15]: https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/caregivers/home-care-worker-immigration-pilots.html?utm_source=chatgpt.com "Home Care Worker Immigration pilots"
[16]: https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/caregivers/home-care-worker-immigration-pilots/child-care-home-support/eligibility.html?utm_source=chatgpt.com "Immigrate through the Home Care Worker Immigration pilots"


## What is missing from your PR document — updated to **May 2026**

Your document is a good MVP base, but it is **not complete enough yet** for an immigration app. It misses several important pathways, rule changes, and product safeguards.

The biggest issue: your app cannot only be a **CRS calculator**. It must be a **pathway matcher + eligibility checker + risk warning system**.

---

# 1. Missing: 2026 Express Entry category-based selection

Your document mentions category-based draws, but it needs the **full May 2026 category list**.

## Add these 2026 Express Entry categories

| 2026 category                                 | App should collect              |
| --------------------------------------------- | ------------------------------- |
| French-language proficiency                   | French test type + NCLC score   |
| Healthcare and social services                | NOC + 12 months experience      |
| STEM                                          | NOC + 12 months experience      |
| Trades                                        | NOC + 12 months experience      |
| Education occupations                         | NOC + 12 months experience      |
| Transport occupations                         | NOC + 12 months experience      |
| Physicians with Canadian work experience      | NOC + Canadian work history     |
| Senior managers with Canadian work experience | NOC + Canadian work history     |
| Researchers with Canadian work experience     | NOC + Canadian work history     |
| Skilled military recruits                     | Canadian Armed Forces job offer |

IRCC lists these as the current Express Entry categories for 2026. Category-based candidates still need to qualify for one Express Entry program first, then they are ranked by CRS inside that category. ([Canada][1])

**Important update:** for renewed occupation categories, IRCC says the minimum work experience increased from **6 months to 1 year** in an eligible occupation within the previous 3 years. ([Canada][2])

### Add this app logic

```txt
Is user eligible for Express Entry?
→ If yes, check category eligibility
→ If category eligible, compare CRS against category draw history
→ If not, show missing factor
```

Do **not** show category eligibility before Express Entry eligibility. That would be misleading.

---

# 2. Missing: 2026 immigration levels and quota pressure

Your app should include a **program demand / quota pressure warning**.

Canada’s 2026 PR target is **380,000 permanent residents**. Economic immigration has the biggest share. In 2026, targets include **109,000 Federal High Skilled**, **91,500 PNP**, **4,000 Atlantic Immigration Program**, and **8,175 federal economic pilots**. ([Canada][3])

## Add to app result page

Example:

```txt
Program pressure: High
Reason: PNP and Express Entry spots are limited and draw scores change often.
Your eligibility does not guarantee invitation.
```

This protects your app legally and makes it feel more professional.

---

# 3. Missing: temporary worker transition measure for 2026–2027

This is important for people already in Canada.

Canada announced a one-time measure to transition up to **33,000 work permit holders** to PR in 2026 and 2027. It targets workers with strong roots in communities, who pay taxes and contribute to the economy. ([Canada][4])

## Add a “possible future/public policy” section

Do not hard-code this as a normal PR stream yet.

Use this wording:

```txt
Possible public-policy pathway:
You may benefit from future temporary-worker transition measures if IRCC opens a stream matching your status, work history, and community ties.
```

## App fields to collect

| Field                    | Why                                 |
| ------------------------ | ----------------------------------- |
| Current work permit type | To identify temporary worker status |
| Years in Canada          | Strong roots                        |
| Tax filing history       | Canada ties                         |
| Province/community       | Community roots                     |
| Current employer         | Work stability                      |
| Occupation/sector        | In-demand sector match              |

---

# 4. Missing: Protected Persons pathway

Your document mentions refugees generally, but not enough.

Canada has a major 2026–2027 initiative to streamline PR for approximately **115,000 Protected Persons in Canada** who are already on a PR pathway. ([Canada][4])

## Add pathway

| Pathway                         | User type                                        |
| ------------------------------- | ------------------------------------------------ |
| Protected Person in Canada → PR | Person already recognized as protected in Canada |

## App fields

* Protected person status: yes/no
* Date status granted
* Dependants in Canada
* Dependants outside Canada
* PR application submitted: yes/no
* Biometrics done: yes/no
* Medical done: yes/no

This is not a normal economic pathway. Keep it separate.

---

# 5. Missing: Humanitarian & Compassionate pathway

You mentioned H&C only lightly. Your app needs a separate H&C module.

## Add H&C as “special case pathway”

H&C is not points-based. It is case-based.

App should collect:

| Field                           | Why                     |
| ------------------------------- | ----------------------- |
| Years in Canada                 | Establishment           |
| Family in Canada                | Ties                    |
| Children affected               | Best interests of child |
| Work history                    | Establishment           |
| Community support               | Integration             |
| Hardship if removed             | Core factor             |
| Previous refusals/removal order | Risk level              |

## Product warning

```txt
This is a complex humanitarian pathway. The app can screen basic factors, but should recommend legal review.
```

Do not try to “score” H&C like CRS. That would be weak and risky.

---

# 6. Missing: Quebec details

Your document says Quebec is separate, but your app needs a proper Quebec branch.

Quebec-selected skilled workers must first apply to Quebec. After Quebec selection, they apply federally for PR with a CSQ. ([Canada][5])

Also, in 2026, Quebec skilled workers invited under the **Programme de sélection des travailleurs qualifiés — PSTQ** may be eligible for an employer-specific work permit if they submitted their permanent selection application. The deadline to apply for that work permit is **December 31, 2026**. ([Canada][6])

## Add Quebec branch

```txt
Does user intend to live in Quebec?
→ Yes: hide Express Entry/PNP recommendations as primary route
→ Show Quebec Skilled Worker / PSTQ / CSQ route
→ Then federal PR after Quebec selection
```

## Quebec fields

* Intention to live in Quebec
* Arrima profile: yes/no
* Quebec invitation received: yes/no
* CSQ received: yes/no
* PSTQ application submitted: yes/no
* Quebec employer/job offer
* French level
* Work permit expiry

---

# 7. Missing: closed programs handling

Your app must know which programs are **closed** so users don’t waste time.

## Add closed/inactive pathway logic

| Program                                  | Status as of May 2026              | App action                         |
| ---------------------------------------- | ---------------------------------- | ---------------------------------- |
| Agri-Food Pilot                          | Closed May 14, 2025                | Show only if user already applied  |
| Economic Mobility Pathways Pilot         | Closed                             | Show only historical/review status |
| Old Rural and Northern Immigration Pilot | Replaced by newer community pilots | Do not use as active pathway       |

IRCC says the Agri-Food Pilot ended on **May 14, 2025** and no longer accepts new applications. ([Canada][7]) IRCC also lists the Economic Mobility Pathways Pilot as closed. ([Canada][8])

## App logic

```txt
If program status = closed:
→ Do not recommend as new pathway
→ Only ask: “Did you apply before closure?”
```

This is critical. Recommending closed programs makes the app look amateur.

---

# 8. Missing: inadmissibility screening

Your document focuses on eligibility. But PR applications can fail because of inadmissibility.

Add a basic risk screen:

| Risk              | App question                            |
| ----------------- | --------------------------------------- |
| Criminality       | Any charges/convictions?                |
| Medical           | Any medical inadmissibility concern?    |
| Misrepresentation | Any wrong info submitted before?        |
| Previous refusal  | Any visa/study/work/PR refusal?         |
| Removal order     | Ever asked to leave Canada?             |
| Overstay          | Any period without valid status?        |
| Security          | Any military/government/security issue? |

Your app should not judge these deeply. It should flag:

```txt
Legal review recommended before applying.
```

---

# 9. Missing: document readiness checklist

A serious app should not only say “eligible.” It should say **what documents are missing**.

## Add document checklist engine

| Area        | Documents                                          |
| ----------- | -------------------------------------------------- |
| Identity    | Passport, birth certificate, marriage/divorce docs |
| Language    | IELTS General / CELPIP / PTE Core / TEF / TCF      |
| Education   | ECA, transcripts, diplomas                         |
| Work        | Reference letters, pay stubs, tax slips, contracts |
| Canada work | T4, NOA, ROE, pay slips, work permit               |
| Job offer   | Offer letter, employer forms, LMIA if applicable   |
| Funds       | Bank statements                                    |
| Medical     | Immigration medical exam                           |
| Police      | Police certificates                                |
| Family      | Spouse/dependent documents                         |

This is a strong monetization feature.

You can sell:

* Free: eligibility estimate
* Paid: document checklist
* Premium: personalized action plan

---

# 10. Missing: NOC/TEER validation

You mentioned NOC, but not enough.

Your app needs a NOC engine:

```txt
Job title
→ Duties
→ NOC code
→ TEER level
→ Eligible programs
→ Category-based draw match
→ PNP match
```

Do not match only by job title. That is weak.

Example: “manager” can mean many NOCs. Duties matter.

## Required fields

* Job title
* Main duties
* Industry
* Seniority
* Number of employees managed
* Wage
* Province
* Full-time/part-time
* Paid/unpaid
* Self-employed yes/no

---

# 11. Missing: settlement funds calculator

Your app needs to calculate settlement funds.

Not everyone needs funds.

## Add logic

| User type                         | Funds usually needed?           |
| --------------------------------- | ------------------------------- |
| FSW outside Canada                | Yes                             |
| FST outside Canada                | Usually yes                     |
| CEC                               | Usually no                      |
| Valid job offer + authorized work | May reduce/remove need          |
| PNP                               | Depends on stream               |
| AIP / rural pilots                | Usually settlement proof needed |
| Family sponsorship                | Different financial rules       |

Add a funds calculator by family size.

---

# 12. Missing: spouse strategy

This is a big one.

For married applicants, your app should check:

```txt
Who should be principal applicant?
```

Sometimes the spouse has better:

* Age
* Education
* IELTS
* Canadian experience
* NOC/category
* French
* Provincial connection

## Add app output

```txt
Recommended principal applicant: Spouse A
Reason: Higher language score + Canadian work experience + younger age.
```

This feature gives real value.

---

# 13. Missing: study permit → PR risk scoring

Your student section is decent, but missing risk rules.

## Add study-risk fields

| Field                      | Why                   |
| -------------------------- | --------------------- |
| Public/private institution | PGWP risk             |
| DLI status                 | Must be valid         |
| Program level              | PGWP/language rules   |
| Program length             | PGWP length           |
| Field of study             | PGWP eligibility risk |
| Province                   | PNP options           |
| Co-op component            | Work rules            |
| Graduation date            | PGWP deadline         |
| Full-time status           | PGWP eligibility      |
| Unauthorized work          | Refusal risk          |

Your result should say:

```txt
Study route is not a PR guarantee.
Your PR strength depends on PGWP length, skilled work, language, and province.
```

---

# 14. Missing: visitor-to-PR reality check

Many users will ask: “Can I come as visitor and get PR?”

Add a clear branch.

## Visitor pathway logic

```txt
Visitor status
→ No direct PR from visitor status
→ Check family sponsor / job offer / study / refugee / H&C / Express Entry from outside Canada
```

This saves people from bad decisions.

---

# 15. Missing: family sponsorship details

Your family sponsorship section needs more detail.

Add these routes:

| Route                                    | Add to app?    |
| ---------------------------------------- | -------------- |
| Spouse/common-law sponsorship            | Yes            |
| Dependent child                          | Yes            |
| Parent/grandparent sponsorship           | Yes            |
| Orphaned sibling/niece/nephew/grandchild | Later          |
| Lonely Canadian “other relative” rule    | Later, complex |

## Add sponsor checks

* Sponsor age 18+
* Citizen/PR/status
* Sponsor lives in Canada if PR
* Previous sponsorship undertaking
* Social assistance issue
* Bankruptcy issue
* Criminal/family violence issue
* Income requirement where relevant

---

# 16. Missing: business and entrepreneur routes

You said “add later,” which is fine. But for a complete PR app, list them as advanced modules.

## Add advanced economic routes

| Route                                        | User type                                    |
| -------------------------------------------- | -------------------------------------------- |
| Start-up Visa                                | Founder with designated organization support |
| Provincial entrepreneur streams              | Business buyer/investor                      |
| Self-employed cultural/athletic legacy route | Very narrow                                  |
| Quebec business routes                       | Quebec-specific                              |

Do not build these first. But include them in the roadmap.

---

# 17. Missing: live draw history and cutoff tracker

Your app needs current draw data.

For each draw:

* Program
* Date
* CRS cutoff
* Number invited
* Tie-breaking rule
* Category
* Province if PNP
* NOC if targeted
* Minimum score if provincial

## App feature

```txt
Your CRS: 462
Recent similar draw range: 430–510
Competitiveness: Medium/Low/High
```

Without draw history, your app is just a static calculator.

---

# 18. Missing: “best next action” engine

This is the money feature.

Do not only show pathways. Show the **highest leverage move**.

## Examples

| User profile               | Best action                                    |
| -------------------------- | ---------------------------------------------- |
| CRS 470, IELTS CLB 8       | Improve IELTS to CLB 9                         |
| Student graduating soon    | Protect PGWP eligibility                       |
| Worker in BC with low wage | Improve wage/job offer before BC PNP           |
| French speaker NCLC 7      | Target French category                         |
| Married applicant          | Compare principal applicant                    |
| Visitor                    | Get valid job/study/family route; no direct PR |

---

# 19. Missing: legal disclaimer and RCIC boundary

Very important.

Your app should not say:

```txt
You qualify for PR.
```

Say:

```txt
Based on the information provided, you may be eligible for these pathways. Final eligibility depends on official program rules and document review.
```

Add:

```txt
This tool does not provide legal advice.
```

This protects you.

---

# 20. Final missing checklist

Here is the clean list to add to your document:

| Missing item                                     |    Priority |
| ------------------------------------------------ | ----------: |
| 2026 Express Entry categories                    |        High |
| 1-year category work experience rule             |        High |
| Closed program handling                          |        High |
| Quebec/PSTQ/CSQ branch                           |        High |
| Protected Persons pathway                        |      Medium |
| H&C pathway                                      |      Medium |
| Temporary worker 2026–2027 public policy tracker |        High |
| Inadmissibility risk screen                      |        High |
| Document checklist engine                        |        High |
| NOC duties-based matcher                         |        High |
| Settlement funds calculator                      |        High |
| Spouse principal-applicant optimizer             |        High |
| Student/PGWP risk checker                        |        High |
| Visitor-to-PR reality branch                     |      Medium |
| Family sponsorship deeper screening              |      Medium |
| Business/entrepreneur advanced routes            | Low for MVP |
| Live draw history tracker                        |        High |
| Legal disclaimer                                 |        High |

---

## My practical recommendation

For Navly MVP, add only these next:

1. **IELTS/CLB converter**
2. **CRS calculator**
3. **Express Entry category checker**
4. **Student/PGWP checker**
5. **Work permit → CEC/PNP checker**
6. **Province matcher**
7. **Closed-program filter**
8. **Document checklist**
9. **Best next action engine**
10. **Legal disclaimer**

Do not build refugee, H&C, Quebec business, entrepreneur, or complex sponsorship first. They are important, but they will slow you down and create legal-risk complexity. Build the high-volume economic pathways first.

[1]: https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations/category-based-selection.html "Express Entry: Category-based selection - Canada.ca"
[2]: https://www.canada.ca/en/immigration-refugees-citizenship/news/2026/02/attracting-the-worlds-best-talent-to-fill-canadas-labour-gaps-and-build-our-economy.html "Attracting the world’s best talent to fill Canada’s labour gaps and build our economy - Canada.ca"
[3]: https://www.canada.ca/en/immigration-refugees-citizenship/corporate/transparency/committees/soci-nov-17-2025/levels.html "SOCI – 2026‒2028 Immigration Levels Plan – November 17, 2025 - Canada.ca"
[4]: https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/corporate-initiatives/levels/supplementary-immigration-levels-2026-2028.html "Supplementary Information for the 2026-2028 Immigration Levels Plan - Canada.ca"
[5]: https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/quebec-skilled-workers.html?utm_source=chatgpt.com "Quebec-selected skilled workers: About the process"
[6]: https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/special-instructions/work-permit-skilled-workers-quebec-pstq.html?utm_source=chatgpt.com "Work permits for Quebec skilled workers who applied ..."
[7]: https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/agri-food-pilot.html?utm_source=chatgpt.com "Closed: Agri-Food Pilot"
[8]: https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees/economic-mobility-pathways-pilot/immigrate.html?utm_source=chatgpt.com "Immigrate through the Economic Mobility Pathways Pilot"


## Yes — split users by **location + current status**

This is the right structure for Navly.

Do **not** show the same dashboard to everyone.
A person **outside Canada** needs a “best entry strategy.”
A person **inside Canada** needs a “how to convert my current status to PR” strategy.

---

# 1. First screen: ask the user’s situation

Your first question should be:

## “Where are you right now?”

Options:

| Option                                    | Meaning                             |
| ----------------------------------------- | ----------------------------------- |
| Outside Canada                            | Planning to enter Canada            |
| Inside Canada as visitor                  | In Canada, no study/work status     |
| Inside Canada as student                  | Study permit / student pathway      |
| Inside Canada as worker                   | Work permit / Canadian work pathway |
| Inside Canada as refugee/protected person | Special pathway                     |
| Inside Canada with family sponsor         | Sponsorship pathway                 |
| Not sure                                  | App guides them                     |

This one question controls the whole app.

---

# 2. What an **outside Canada** user should see

Their dashboard should be called something like:

## **“Your Canada Entry-to-PR Plan”**

Because they are not inside Canada yet.

### Main pathways to show

| Pathway                                | Show to outside-Canada user? | Why                                        |
| -------------------------------------- | ---------------------------: | ------------------------------------------ |
| Express Entry — FSW                    |                          Yes | Direct PR from outside Canada              |
| Express Entry — FST                    |                          Yes | Direct PR if trade profile fits            |
| PNP job-offer streams                  |                          Yes | Some can apply from outside with job offer |
| Atlantic Immigration Program           |                          Yes | Needs Atlantic job offer                   |
| Rural/Francophone pilots               |                          Yes | Needs designated employer/community        |
| Study permit → PGWP → PR               |                          Yes | Common long-term strategy                  |
| Work permit → Canadian experience → PR |                          Yes | If they can get LMIA/job offer             |
| Family sponsorship                     |                          Yes | If they have eligible sponsor              |
| Quebec                                 |                          Yes | If they want Quebec                        |
| Start-up / entrepreneur                |                        Later | Advanced module                            |

---

## Outside Canada dashboard should show this:

### 1. **Direct PR options**

Example:

```txt
You may be able to apply for PR directly through:
- Federal Skilled Worker
- Express Entry category-based draw
- PNP if you secure a provincial nomination
```

### 2. **Entry strategy options**

Example:

```txt
If your direct PR score is not strong enough, your best entry routes are:
1. Study permit → PGWP → Canadian work → PR
2. Employer job offer → work permit → Canadian work → PR
3. Atlantic/rural job offer → employer-supported PR
```

### 3. **Best action plan**

Example:

```txt
Your best next move:
Improve IELTS to CLB 9 before spending money on college.
```

or:

```txt
Your best next move:
Apply for jobs in Atlantic Canada because your CRS is too low for direct Express Entry.
```

---

# 3. Outside Canada user flow

Use this structure:

```txt
Outside Canada
→ Calculate CRS
→ Check FSW 67/100
→ Check Express Entry categories
→ Check French advantage
→ Check PNP/job-offer options
→ Check study route
→ Check work permit route
→ Show best entry-to-PR plan
```

---

# 4. What an outside Canada user needs to answer

## Basic profile

* Age
* Country of citizenship
* Current country
* Marital status
* Spouse coming or not
* Family in Canada
* Intended province
* Quebec intention

## Language

* IELTS / CELPIP / PTE Core
* TEF / TCF French
* Test date
* Scores in all 4 skills

## Education

* Highest education
* ECA completed or not
* Field of study
* Canadian education? usually no

## Work

* Job title
* Job duties
* NOC / TEER
* Years of skilled work
* Industry
* Self-employed or employee
* Proof of work documents

## Money

* Settlement funds
* Study budget
* Ability to pay tuition
* Family size

## Goal

Ask this:

```txt
What is your strongest preference?
- Fastest PR
- Cheapest route
- Study first
- Work first
- Any province
- Specific province
```

This is very valuable.

---

# 5. What an **inside Canada** user should see

Their dashboard should be called:

## **“Your Status-to-PR Plan”**

Because they already have a status.

The app should focus on:

* Current permit
* Expiry date
* Canadian work/study history
* Risk of losing status
* PR pathway before permit expires

---

## Inside Canada dashboard should show this:

### 1. Current status health

Example:

```txt
Your PGWP expires in 9 months.
You need 3 more months of skilled Canadian work for CEC.
Risk level: Medium.
```

### 2. PR pathway match

Example:

```txt
Your strongest PR options:
1. Canadian Experience Class
2. BC PNP Skilled Worker
3. Express Entry STEM category
```

### 3. Urgent risks

Example:

```txt
Warning:
Your work permit may expire before you complete enough Canadian experience.
You should check extension/bridging options.
```

### 4. Best next action

Example:

```txt
Your next move:
Stay in TEER 1 full-time work until you complete 12 months, then enter Express Entry.
```

---

# 6. Inside Canada user flow by status

## A) Student in Canada

Show:

```txt
Study Permit
→ PGWP eligibility
→ PGWP length risk
→ Field-of-study risk
→ Canadian work plan
→ CEC / PNP / AIP / rural path
```

### Student should see:

* Can they get PGWP?
* How long PGWP might be
* Whether their program is risky
* Whether their province has student PNP options
* What job/NOC they should target after graduation
* How many months until PR-ready

---

## B) Worker in Canada

Show:

```txt
Work Permit
→ Canadian skilled work months
→ CEC eligibility
→ PNP eligibility
→ Employer-supported PR
→ Permit expiry risk
```

### Worker should see:

* How many months of Canadian skilled work they have
* Whether their NOC/TEER qualifies
* Whether their wage/job offer helps PNP
* Whether their employer can support nomination
* Whether permit expires before PR path is ready

---

## C) Visitor in Canada

Show reality. No fake hope.

```txt
Visitor status does not create a direct PR pathway.
Your realistic options are:
- Express Entry from your profile
- Study permit
- Work permit/job offer
- Family sponsorship
- Humanitarian/special case if applicable
```

### Visitor should see:

* Direct PR eligibility
* Study route
* Work route
* Family sponsorship route
* Status expiry warning
* No-work warning

This is important because many people think “I am in Canada, so PR is easier.” Not always.

---

## D) Sponsored family applicant

Show:

```txt
Family sponsorship
→ Sponsor eligibility
→ Relationship proof
→ Inland/outland option
→ Work permit possibility if applicable
→ Document checklist
```

Do not mix this with CRS.

---

# 7. Difference between outside vs inside Canada screens

| Feature                        | Outside Canada                        | Inside Canada                      |
| ------------------------------ | ------------------------------------- | ---------------------------------- |
| Main goal                      | Enter Canada with best long-term plan | Convert current status to PR       |
| Urgency                        | Medium                                | High if permit expiring            |
| Main risk                      | Choosing wrong route                  | Losing status / permit expiry      |
| Main pathways                  | FSW, study, work, job offer, PNP      | CEC, PNP, PGWP, employer-supported |
| Needs permit expiry tracker    | No                                    | Yes                                |
| Needs PGWP checker             | Only if planning to study             | Yes for students                   |
| Needs Canadian work calculator | Future plan                           | Critical                           |
| Needs job strategy             | Yes                                   | Yes, but more urgent               |
| Needs settlement funds         | Yes                                   | Depends on route                   |
| Needs document checklist       | Yes                                   | Yes                                |

---

# 8. What the result page should say

## Example: outside Canada user

```txt
Your best Canada plan

Direct PR:
Possible, but not strong yet.
Your estimated CRS: 421
Federal Skilled Worker: Eligible
Recent CRS competitiveness: Low

Best route:
Study route or employer-supported work permit.

Recommended plan:
1. Improve IELTS to CLB 9.
2. Complete ECA.
3. Apply to PGWP-eligible programs or target employers in Atlantic Canada.
4. Recalculate PR after job offer or Canadian education.
```

---

## Example: inside Canada student

```txt
Your best PR plan

Current status:
Study permit

PR readiness:
Not ready yet.

Best route:
Graduate → PGWP → skilled job → Canadian Experience Class / BC PNP

Risk:
Your program must stay PGWP-eligible.
Your job after graduation should be TEER 0, 1, 2, or 3.

Next actions:
1. Confirm PGWP eligibility.
2. Prepare IELTS/CELPIP.
3. Target skilled jobs before graduation.
```

---

## Example: inside Canada worker

```txt
Your best PR plan

Current status:
PGWP holder

Canadian work:
8 months skilled experience

PR readiness:
Almost ready.

Best route:
CEC + Express Entry

Missing:
4 more months full-time skilled work.
IELTS should improve to CLB 9 for stronger CRS.

Next actions:
1. Keep full-time TEER 1 job.
2. Take IELTS General.
3. Enter Express Entry after 12 months Canadian experience.
```

---

# 9. Should you add a consultant section?

## Yes — but not in MVP version 1.

Add it as a **B2B dashboard later**.

Your first MVP should serve applicants directly.
After that, add a consultant version because it can make more money.

---

# 10. Consultant feature: good idea or not?

## Good idea, but only if you design it carefully.

Consultants do not need a simple calculator. They need:

* Client intake
* Case notes
* Document checklist
* Risk flags
* Pathway comparison
* Follow-up reminders
* PDF report export
* Client dashboard
* Admin dashboard
* Team access

That becomes a SaaS product.

---

# 11. Two product versions

## Version A: Applicant app

For normal users.

### Features

* Eligibility checker
* CRS calculator
* IELTS/CLB converter
* PR pathway matcher
* Document checklist
* Best next action
* Paid report

### Monetization

| Offer                    |   Price idea |
| ------------------------ | -----------: |
| Free eligibility check   |         Free |
| Full personalized report |      $19–$49 |
| Document checklist       |      $29–$79 |
| Monthly tracking         | $9–$19/month |

---

## Version B: Consultant portal

For immigration consultants.

### Features

| Feature              | Why it matters                  |
| -------------------- | ------------------------------- |
| Add client profile   | Consultant manages many clients |
| Save case history    | Needed for follow-up            |
| Generate report      | Saves consultant time           |
| Document checklist   | Reduces back-and-forth          |
| Risk flags           | Helps avoid weak cases          |
| Timeline tracker     | Useful for deadlines            |
| Internal notes       | Consultant-only                 |
| Client upload portal | Strong SaaS feature             |
| PDF export           | Professional deliverable        |

### Monetization

| Plan            |      Price idea |
| --------------- | --------------: |
| Solo consultant |   $49–$99/month |
| Small office    | $149–$299/month |
| Agency          |     $399+/month |

This is stronger long-term than selling only to applicants.

---

# 12. But be careful with legal risk

If you add consultants, separate roles:

## Applicant side wording

Use:

```txt
Possible pathway
Estimated eligibility
Suggested next action
```

Do not use:

```txt
You are guaranteed eligible
You will get PR
Apply now and you will be accepted
```

## Consultant side wording

Use:

```txt
Case screening support tool
Document organization
Eligibility estimate
```

Do not market it as replacing a licensed consultant.

---

# 13. Best database structure

You need user type logic like this:

```txt
User
→ Location: inside / outside Canada
→ Current status
→ Goal
→ Profile
→ Language
→ Education
→ Work
→ Province/community
→ Family
→ Funds
→ Risk flags
→ Matching pathways
→ Action plan
```

---

# 14. Simple decision tree

Use this:

```txt
Start
│
├── Outside Canada
│   ├── Direct PR possible?
│   │   ├── Yes → Express Entry / PNP / family / Quebec
│   │   └── No → Study / work / job offer / rural / Atlantic plan
│
├── Inside Canada
│   ├── Student → PGWP → work → PR
│   ├── Worker → CEC / PNP / employer-supported PR
│   ├── Visitor → direct PR / study / work / family
│   ├── Sponsored family → sponsorship path
│   └── Protected/H&C → legal review path
│
└── Consultant
    ├── Add client
    ├── Run screening
    ├── Generate checklist
    ├── Export report
    └── Track case
```

---

# 15. My recommendation

Build in this order:

## Phase 1 — Applicant MVP

1. Outside Canada flow
2. Inside Canada flow
3. IELTS/CLB converter
4. CRS calculator
5. FSW 67-point checker
6. Student route checker
7. Worker route checker
8. Result/action plan page

## Phase 2 — Paid reports

Add:

* PDF report
* Document checklist
* “Improve your score” plan
* Province suggestions

## Phase 3 — Consultant portal

Add:

* Client management
* Saved profiles
* Notes
* Document upload
* Deadline reminders
* Report export

---

## Bottom line

Yes, split the app into **3 user types**:

| User type                | App goal                                     |
| ------------------------ | -------------------------------------------- |
| Outside Canada applicant | Find best entry-to-PR strategy               |
| Inside Canada applicant  | Convert current status to PR before deadline |
| Consultant               | Manage client cases and generate reports     |

For MVP, build **outside Canada + inside Canada applicants first**.
Do **consultants later** as a paid SaaS layer. That is the smarter business path.
