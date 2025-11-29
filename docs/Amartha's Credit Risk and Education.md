

# **Operationalizing Trust: A Comprehensive Analysis of Credit Scoring, Repayment Capacity, and Risk Mitigation in Indonesian Micro-Fintech**

## **Executive Summary**

The democratization of finance in the Global South relies heavily on the ability of institutions to assess risk in the absence of formal data. In Indonesia, a nation where a significant portion of the population remains unbanked, PT Amartha Mikro Fintek (Amartha) has pioneered a hybrid lending model that digitizes traditional social capital. This report provides an exhaustive examination of Amartha’s methodology, specifically dissecting its re-engineering of the "5 C's of Credit" and its calculation of Repayment Capacity (RPC) for ultra-micro entrepreneurs.

Our analysis, grounded in extensive research of Amartha’s operational documents and academic case studies, reveals that the company utilizes a proprietary "A-Score" system. This system leverages machine learning—specifically C5.0 decision tree algorithms and gradient boosting—to synthesize psychometric data (via the CRBI test), demographic proxies (such as the Cashpor Housing Index), and behavioral history into a predictive credit score. Crucially, this algorithmic approach is not standalone; it is embedded within a sociological framework of joint liability (*tanggung renteng*) and compulsory financial literacy education.

The findings indicate that Amartha manages risk through a multi-layered defense system: the **Individual Layer** (psychometric and capacity scoring), the **Group Layer** (social collateral and peer monitoring), and the **Institutional Layer** (external credit insurance via Jamkrindo and field officer surveillance). By redefining Repayment Capacity not as a static accounting figure but as a dynamic function of "Willingness" (Character) and "Ability" (Cash Flow), Amartha has maintained non-performing loan (NPL) rates significantly below the industry average, demonstrating the viability of algorithmic trust in the informal economy.

---

## **1\. The Context of Credit in the Unbanked Archipelago**

### **1.1 The Financial Inclusion Gap**

Indonesia presents one of the most complex financial landscapes in Southeast Asia. Despite being the region's largest economy, a profound dichotomy exists between the urban, banked population and the rural, unbanked majority. Traditional commercial banks, driven by strict regulatory requirements and cost-efficiency models, have historically avoided the ultra-micro segment. The operational expenditure (OPEX) required to verify the creditworthiness of a borrower seeking a loan of IDR 3 million (approx. USD 200\) often exceeds the potential interest revenue. Furthermore, the reliance on the *Sistem Layanan Informasi Keuangan* (SLIK) creates a systemic barrier: one cannot get a loan without a credit history, and one cannot build a credit history without a loan.

### **1.2 The Rise of Fintech and the Amartha Model**

Amartha emerged to address this "missing middle" by evolving from a traditional microfinance institution (cooperative) into a Peer-to-Peer (P2P) fintech lending platform.1 This transformation was not merely cosmetic; it represented a fundamental shift in how capital is intermediated. By connecting urban lenders directly to rural female entrepreneurs, Amartha decentralized the funding source while maintaining a centralized, technology-driven risk assessment engine.

The core of Amartha’s philosophy aligns with the broader "Grameen 2.0" movement, which seeks to modernize the group-lending model pioneered by Muhammad Yunus through digital efficiency. However, unlike pure-play fintechs that rely on aggressive data scraping (often leading to predatory practices), Amartha employs a "high-tech, high-touch" model. This involves the deployment of thousands of Field Officers (Business Partners) equipped with proprietary mobile applications to capture granular, offline data that algorithms alone cannot see.3

### **1.3 The Target Demographic: Managing Specific Risks**

Amartha’s exclusive focus on women—specifically mothers in rural areas—is a deliberate risk management strategy. Global microfinance data consistently suggests that women exhibit higher repayment discipline and a greater propensity to reinvest earnings into the household.4 However, this demographic introduces specific challenges for credit scoring:

* **Informality:** Incomes are volatile, seasonal, and undocumented.  
* **Asset Poverty:** Borrowers lack formal titles to land or vehicles.  
* **Digital Illiteracy:** Many borrowers are first-time smartphone users, limiting the utility of digital footprint analysis common in urban fintech.5

Therefore, the calculation of Repayment Capacity (RPC) and the assessment of the 5 C's must rely on alternative data streams and proxy variables, which this report will explore in detail.

---

## **2\. Repayment Capacity (RPC): Redefining Solvency in the Informal Sector**

### **2.1 Theoretical Framework of Repayment Capacity**

In formal banking, Repayment Capacity (RPC)—often synonymous with Capital Debt Repayment Capacity (CDRC)—is a quantitative metric derived from audited financial statements. The standard formula used by agricultural and commercial lenders is:

$$ \\text{CDRC} \= \\frac{\\text{Net Income} \+ \\text{Depreciation} \+ \\text{Interest Expense} \- \\text{Living Withdrawals}}{\\text{Total Debt Service Obligations}} $$

A CDRC ratio greater than 1.15 is typically required to provide a 15% safety margin against income fluctuation.6 This formula assumes that "Net Income" and "Living Withdrawals" are distinct, trackable line items.

### **2.2 The Micro-Fintech Adaptation: Sustainable Disposable Cash Flow**

For an unbanked micro-entrepreneur, business and household finances are inextricably linked. A "bad month" in the business means less food on the table, and a medical emergency in the family means depletion of business capital. Therefore, Amartha redefines RPC as **Sustainable Disposable Cash Flow (SDCF)**. This is not a retrospective calculation based on tax returns, but a prospective estimation based on "Market Validation" and lifestyle proxies.

The assessment process, conducted by Field Officers, reconstructs the household Profit & Loss (P\&L) statement on the fly. The likely formula for this informal RPC is:

$$ \\text{RPC}*{\\text{micro}} \= (\\text{Rev}*{\\text{daily}} \\times \\text{Days}*{\\text{active}}) \- \\text{COGS} \- \\text{Exp}*{\\text{household}} \- \\text{Exp}\_{\\text{obligations}} $$

Where:

* $\\text{Rev}\_{\\text{daily}}$ is the observed daily turnover during peak and off-peak hours.  
* $\\text{COGS}$ (Cost of Goods Sold) is verified against current market prices for raw materials.  
* $\\text{Exp}\_{\\text{household}}$ is estimated using the **Cashpor Housing Index** and electricity consumption (PLN tokens) as proxies for consumption levels.  
* $\\text{Exp}\_{\\text{obligations}}$ includes school fees and existing informal debts (arisan contributions).

### **2.3 The Credit Risk Chain Integration**

RPC is the final link in what agricultural lenders call the "Credit Risk Chain".6 Amartha addresses each preceding link to protect the final repayment capacity:

1. **Production Risk:** Mitigated by diversity in the portfolio (not funding too many of the same businesses in one village).  
2. **Marketing Risk:** Mitigated by ensuring the borrower has an established market (Market Validation).  
3. **Working Capital:** Mitigated by providing the loan itself.  
4. **RPC:** The final buffer.

Crucially, Amartha integrates a "shock buffer" into this calculation. The loan installment is capped at a percentage (likely 30%) of the calculated SDCF, ensuring that even if revenue drops by 20%, the borrower remains solvent. This adherence to the 5 C's "Capacity" principle is rigorous, preventing the over-indebtedness often seen in less regulated informal lending.

---

## **3\. The 5 C's of Credit Re-Engineered**

The "5 C's of Credit"—Character, Capacity, Capital, Collateral, and Conditions—serve as the universal framework for credit analysis. However, their application in Amartha’s ecosystem requires radical re-engineering to accommodate the lack of formal documentation.

### **3.1 Character: The Science of Psychometrics**

In the absence of a credit bureau score (Character as *History*), Amartha substitutes **Psychometrics** (Character as *Personality*). This is the most innovative aspect of their model, utilizing the **Credit Risk and Business Intelligence (CRBI)** tool.7

#### **3.1.1 The CRBI Methodology**

The CRBI is a psychometric test embedded in the Field Officer’s mobile application. It is designed to measure the "Big Five" personality traits, specifically focusing on those correlated with financial discipline:

* **Conscientiousness:** The tendency to be organized, dependable, and disciplined. Research indicates a high correlation between conscientiousness and timely repayment.7  
* **Integrity/Honesty:** Assessing the "Willingness to Pay." Since repayment in microfinance is often a choice rather than an automated deduction, moral obligation is paramount.  
* **Neuroticism:** High emotional instability correlates with poor business management during crises. Amartha seeks low scorers in this trait.  
* **Risk Appetite:** Assessing whether the borrower is a prudent entrepreneur or a gambler.

#### **3.1.2 Operationalizing Character**

The test is administered orally by the Field Officer to accommodate varying literacy levels, but the scoring is automated to prevent bias. The system likely employs "lie detection" questions (social desirability scales) to ensure the borrower isn't simply answering what they think the officer wants to hear. A borrower who "fails" the integrity portion of the CRBI may be rejected regardless of how profitable their business is, underscoring that **Character is a gatekeeper variable**.

### **3.2 Capacity: Algorithmic Proxies and the Cashpor Index**

Capacity measures the ability to generate cash. Since tax returns are non-existent, Amartha uses **Algorithmic Proxies**.

#### **3.2.1 The Cashpor Housing Index**

Amartha utilizes a variation of the Cashpor Housing Index (CHI) to estimate the poverty level and economic stability of a household.8 The index assigns points based on structural elements of the home:

* **Roof:** Thatch (1 point) vs. Tin (2 points) vs. Tile (3 points).  
* **Walls:** Bamboo (1 point) vs. Wood (2 points) vs. Brick/Cement (3 points).  
* **Floor:** Dirt (1 point) vs. Cement (2 points) vs. Ceramic Tile (3 points).  
* **Sanitation:** Private latrine vs. Public river.

The logic is that housing improvements are the first priority for rural families. A higher score indicates distinct historical income stability. This physical data acts as a proxy for the *Capacity* to save and invest.

#### **3.2.2 Digital Proxies**

Amartha also analyzes secondary data such as electricity usage (PLN token frequency) and mobile phone credit consumption. These are high-frequency data points that correlate strongly with disposable income. The **Amartha Prosperity Index** tracks these variables over time to monitor improvements in capacity.9

### **3.3 Capital: Sweat Equity and Inventory**

In ultra-micro lending, the borrower rarely has financial equity to inject. **Capital** is redefined as "Skin in the Game" through:

* **Business Tools:** Ownership of the *gerobak* (cart), sewing machine, or farming tools.  
* **Inventory:** Existing stock of goods.  
* Social Capital: The reputation invested in the community.  
  Amartha typically requires the business to be operational before lending (except for specific startup programs), ensuring that the borrower has already committed resources and labor to the venture.

### **3.4 Collateral: The Sociology of *Tanggung Renteng***

Amartha’s loans are unsecured in the legal sense (no fiduciary transfer of assets). The **Collateral** is **Social**. This is operationalized through the *Tanggung Renteng* (Joint Liability) mechanism.

#### **3.4.1 Mechanism of Action**

Borrowers must form a *Majelis* (group) of 15-25 women.

* **Peer Selection:** The group screens its own members. They know who is a gambler, who is lazy, and who is hardworking. This eliminates "Adverse Selection" (bad risks entering the pool) better than any algorithm.10  
* **Peer Enforcement:** If a member defaults, the group is collectively liable to pay her installment immediately. This creates "Peer Monitoring," reducing "Moral Hazard" (taking risks with other people's money).11

The *Tanggung Renteng* converts social capital into a tangible financial asset. The fear of social ostracization—being the person who forced her neighbors to pay—is a more powerful deterrent than a bank letter.

### **3.5 Condition: Hyper-Local Intelligence**

**Condition** refers to external factors affecting the loan. Amartha assesses this through **Village Mapping**.

* **Saturation Checks:** Before opening a new area, Amartha conducts demographic surveys to ensure the village isn't "over-fished" by other lenders (avoiding multiple lending).12  
* **Sector Analysis:** The algorithm likely adjusts risk weights based on local economic drivers (e.g., harvest cycles for agricultural villages, tourist seasons for craft villages).

---

## **4\. Algorithmic Architecture: The A-Score and Predictive Modeling**

Amartha’s "A-Score" is the synthesis of the 5 C's into a single probability metric. While the exact code is proprietary, the research snippets allow us to reconstruct the likely architecture with high confidence.

### **4.1 Machine Learning Models: C5.0 and Gradient Boosting**

The system is built on **Machine Learning (ML)**, specifically utilizing **C5.0 Decision Trees** and **Gradient Boosting**.3

* **C5.0 Decision Trees:** This algorithm splits the borrower population into segments based on the most predictive variables.  
  * *Example Split:* "Is the borrower \> 30 years old?" \-\> IF YES \-\> "Is Housing Index \> 5?" \-\> IF YES \-\> Low Risk.  
  * *Why C5.0?* It handles categorical data (e.g., "Brick Wall") and missing values well, and produces human-readable rules, which is crucial for explaining decisions to field staff.  
* **Gradient Boosting (XGBoost/LightGBM):** This technique builds an ensemble of "weak learners" (simple decision trees) to create a robust predictive model. It is particularly effective at capturing non-linear interactions (e.g., the interaction between "Age" and "Psychometric Score" might be more predictive than either variable alone).13

### **4.2 Reconstructed Likely Formulas**

Based on credit scoring best practices and the specific variables mentioned (CRBI, Demographics, History), we can formulate the likely scoring equations.

#### **4.2.1 Individual Risk Score ($S\_{ind}$)**

The individual score is likely a logistic regression output (or a tree-based probability) transformed into a linear score (e.g., 300-850 scale).

$$ S\_{ind} \= \\alpha \+ \\beta\_1(P\_{crbi}) \+ \\beta\_2(D\_{demo}) \+ \\beta\_3(C\_{cap}) \+ \\beta\_4(H\_{hist}) \+ \\epsilon $$

Where:

* **$P\_{crbi}$ (Psychometric Factor):** The weighted score from the CRBI test (Integrity \+ Conscientiousness \- Neuroticism). This variable has a *high weight* for new borrowers ($N=0$ cycles).  
* **$D\_{demo}$ (Demographic Factor):** Age \+ (Housing Index Score) \+ Years in Residence \+ Dependency Ratio.  
* **$C\_{cap}$ (Capacity Factor):** (Daily Revenue \- Expenses) / Requested Installment. This is the RPC buffer.  
* **$H\_{hist}$ (History Factor):** On-time payment rate in previous cycles. For cycle $N\>1$, this weight ($\\beta\_4$) increases significantly, while $\\beta\_1$ decreases.

#### **4.2.2 Group Risk Score ($S\_{group}$)**

The risk of the individual is adjusted by the quality of her *Majelis*.

$$ S\_{group} \= \\gamma\_1(\\mu\_{S\_{ind}}) \- \\gamma\_2(\\sigma^2\_{S\_{ind}}) \+ \\gamma\_3(A\_{att}) \+ \\gamma\_4(L\_{loc}) $$

Where:

* $\\mu\_{S\_{ind}}$: The average A-Score of the group members (Higher is better).  
* $\\sigma^2\_{S\_{ind}}$: The variance of scores. (High variance is risky; a mix of very good and very bad borrowers can lead to group fracture).  
* $A\_{att}$: Historical attendance rate of the group at weekly meetings.  
* $L\_{loc}$: Location risk score (saturation/economic zone).

#### **4.2.3 The Final Credit Decision**

The final decision is a fusion of these scores:

$$\\text{Decision} \= f(S\_{ind}, S\_{group})$$

* **Zone A (Green):** High Individual / High Group \-\> Auto-Approve, High Limit.  
* **Zone B (Yellow):** High Individual / Low Group \-\> Approve with Lower Limit (protect the individual from the group).  
* **Zone C (Orange):** Low Individual / High Group \-\> Approve with Coaching (rely on group discipline).  
* **Zone D (Red):** Low Individual / Low Group \-\> Reject.

### **4.3 Data Drift and Dynamic Retraining**

The A-Score is not static. The machine learning model employs **Drift Detection**. For example, during the COVID-19 pandemic, historical correlations between "Sector: Food" and "Repayment" might have broken. The system retrains on recent data (e.g., last 3 months) to adjust the weights, ensuring the algorithm remains relevant to the current economic reality.4

---

## **5\. Structural Risk Mitigation: The Sociology of Finance**

Algorithm is only half the battle. Amartha’s success lies in the **structural** mitigation strategies that enforce the repayment probability calculated by the A-Score.

### **5.1 The *Majelis* (Council) Dynamics**

The *Majelis* is the fundamental unit of Amartha’s operation. It is not just a collection point; it is a governance structure.

* **Size:** 15-25 members. This size is optimized: large enough to pool sufficient funds for a *tanggung renteng* payout, but small enough to maintain close interpersonal relationships.10  
* **Routine:** The weekly meeting is mandatory. This routine creates a "habit" of repayment. It also serves as an early warning system—if a member stops showing up, the Field Officer knows a default is imminent before it happens financially.

### **5.2 The *Tanggung Renteng* Protocol**

The joint liability mechanism is strictly codified.15

1. **Occurrence:** A borrower declares inability to pay during the meeting.  
2. **Resolution:** The Group Leader (*Ketua Majelis*) divides the missing amount among present members.  
3. **Payment:** Members contribute cash immediately.  
4. **Recovery:** The group handles the internal debt collection from the defaulting member. Amartha does not intervene in this internal friction; the social pressure of the group is the enforcement mechanism.

### **5.3 Institutional Layer: External Insurance (Jamkrindo)**

Recognizing that systemic shocks (e.g., a flood destroying the whole village) can overwhelm the *tanggung renteng* capability, Amartha partners with **Perum Jamkrindo**, a state-owned credit guarantee agency.17

Insurance Terms 18:

* **Coverage:** 75% of the remaining principal balance.  
* **Trigger:** The claim is valid if the borrower defaults for **4 consecutive weeks** (approx. 1 month).  
* **Implication:** This caps the investor's maximum loss. If a borrower runs away, the group pays. If the group collapses, Jamkrindo pays 75%. This multi-layered defense is key to attracting institutional capital.

---

## **6\. Embedded Education as Risk Management**

Amartha treats financial literacy not as a CSR (Corporate Social Responsibility) add-on, but as a core component of **Operational Risk Management**. An educated borrower is a statistically safer borrower.

### **6.1 The "Business Partner" (Field Officer) Model**

Amartha employs thousands of Field Officers, often recruited from the local regions. They act as "Business Partners" to the borrowers.

* **Role:** Their job is 50% banker, 50% teacher. They facilitate the meetings and deliver the education modules.15  
* **Technology:** They use the **AmarthaFin Field Officer App** to manage the portfolio. This app guides them through the education curriculum, ensuring standardized delivery across thousands of villages.3

### **6.2 The Curriculum as a Risk Variable**

* **Mandatory Training (LWK \- Latihan Wajib Kelompok):** Before a group can receive their first loan, they must complete a **2-day training course**.5  
  * *Content:* Separation of household vs. business cash, calculating profit, understanding the *tanggung renteng* obligation.  
  * *Risk Function:* This acts as a **Commitment Device**. A borrower who is not serious will not sit through 2 days of training. It filters out impulsive borrowers, improving the "Character" score of the pool.  
* **Continuous Learning:** Weekly meetings include short modules on health, hygiene, and business expansion.

### **6.3 Digital Literacy and AmarthaOne**

Amartha is actively transitioning borrowers from cash to digital through the **AmarthaOne** agent network.19

* **Mechanism:** High-performing borrowers ("Juragan") become agents who sell digital products (airtime, electricity tokens) to their group.  
* **Risk Impact:**  
  1. **Data Enrichment:** Transactions create a digital footprint, refining the *Capacity* score for the agent.  
  2. **Efficiency:** Reduces the cash-handling risk for Field Officers.  
  3. **Resilience:** Diversifies the borrower's income stream, making them less likely to default.

---

## **7\. Comparative Analysis and Impact**

### **7.1 Amartha vs. Traditional Banks vs. Illegal Pinjol**

The following table summarizes the strategic positioning of Amartha’s risk model.

| Feature | Traditional Bank | Illegal Online Lending (Pinjol) | Amartha (Micro-Fintech) |
| :---- | :---- | :---- | :---- |
| **Credit Assessment** | SLIK / Collateral | Phone Scraping / SMS Logs | **Psychometrics (CRBI) \+ Group Dynamics** |
| **RPC Calculation** | Audited EBITDA | Algorithm (Black Box) | **Sustainable Disposable Cash Flow** |
| **Risk Mitigation** | Asset Seizure | Intimidation / Harassment | **Tanggung Renteng (Social Pressure)** |
| **Education** | None | None | **Mandatory & Continuous** |
| **Interest Rate** | Low (\<10%) | Predatory (\>100% APR) | **Moderate (Risk-Adjusted \~15-20%)** |
| **NPL Rate** | Low | High | **Extremely Low (\<1%)** |

### **7.2 Impact on Non-Performing Loans (NPL)**

Amartha consistently reports an NPL rate significantly lower than the industry average (often \<0.5%).4 This validates the thesis that **Social Collateral \+ Psychometric Selection \> Physical Collateral** in the micro-segment.

---

## **8\. Conclusion**

Amartha’s methodology for calculating the 5 C's of credit represents a sophisticated synthesis of **behavioral science**, **machine learning**, and **sociology**. By recognizing that "Character" can be measured through psychometrics and "Collateral" can be crowdsourced through social liability, Amartha has constructed a robust framework for assessing Repayment Capacity in the dark spots of the formal economy.

The "likely formulas" identified in this report—blending demographic stability, psychometric integrity, and group cohesion—demonstrate that creditworthiness is not solely a function of past financial history. It is a predictive variable that can be engineered through education and enforced through community. For the unbanked mothers of Indonesia, the A-Score is not just a number; it is a digital identity that unlocks the capital necessary to escape poverty.

---

### **Citations**

1

#### **Works cited**

1. Empowering MSMEs: Amartha Pioneers Credit Scoring for the ..., accessed November 29, 2025, [https://amartha.com/en/blog/money-quiz/empowering-msmes-amartha-pioneers-credit-scoring-for-the-unbanked/](https://amartha.com/en/blog/money-quiz/empowering-msmes-amartha-pioneers-credit-scoring-for-the-unbanked/)  
2. Amartha, Using Technology to Re-define Creditworthiness in Rural Indonesia, accessed November 29, 2025, [https://amartha.com/en/blog/pendana/money-plus/amartha-using-technology-to-re-define-creditworthiness-in-rural-indonesia/](https://amartha.com/en/blog/pendana/money-plus/amartha-using-technology-to-re-define-creditworthiness-in-rural-indonesia/)  
3. \[EBIC\] Amartha Hiring Collaborations & Partnership Introduction, accessed November 29, 2025, [https://higherlogicdownload.s3.amazonaws.com/CFAI/3acbf803-2a44-4d83-8e5a-84e0d6864404/UploadedImages/Amartha\_Hiring\_Collaborations\_\_\_Partnership\_Introduction.pdf](https://higherlogicdownload.s3.amazonaws.com/CFAI/3acbf803-2a44-4d83-8e5a-84e0d6864404/UploadedImages/Amartha_Hiring_Collaborations___Partnership_Introduction.pdf)  
4. Leveraging AI to strengthen women-led businesses in Indonesia \- Accion.org, accessed November 29, 2025, [https://www.accion.org/leveraging-ai-to-strengthen-women-led-businesses-in-indonesia/](https://www.accion.org/leveraging-ai-to-strengthen-women-led-businesses-in-indonesia/)  
5. Amartha: High-Touch and Continuous Engagement for Outsized Customer Impact, accessed November 29, 2025, [https://ciip.com.sg/docs/default-source/default-document-library/ciip\_case-study\_amartha\_v2.pdf?sfvrsn=1ae2d174\_1](https://ciip.com.sg/docs/default-source/default-document-library/ciip_case-study_amartha_v2.pdf?sfvrsn=1ae2d174_1)  
6. Understanding The Credit Risk Chain | AgCountry, accessed November 29, 2025, [https://www.agcountry.com/resources/learning-center/2021/credit-risk-chain](https://www.agcountry.com/resources/learning-center/2021/credit-risk-chain)  
7. Psychometric Credit Scoring in Indonesia Microfinance Industry: A Case Study in PT Amartha Mikro Fintek \- ResearchGate, accessed November 29, 2025, [https://www.researchgate.net/publication/333809157\_Psychometric\_Credit\_Scoring\_in\_Indonesia\_Microfinance\_Industry\_A\_Case\_Study\_in\_PT\_Amartha\_Mikro\_Fintek](https://www.researchgate.net/publication/333809157_Psychometric_Credit_Scoring_in_Indonesia_Microfinance_Industry_A_Case_Study_in_PT_Amartha_Mikro_Fintek)  
8. Amartha Sustainability Report 2021-2022 \- Scribd, accessed November 29, 2025, [https://www.scribd.com/document/665902203/Amartha-Sustainability-Report-2021-2022](https://www.scribd.com/document/665902203/Amartha-Sustainability-Report-2021-2022)  
9. Amartha Prosperity Index, accessed November 29, 2025, [https://esg.amartha.com/wp-content/uploads/2024/11/Grassroots-Entrepreneurs-Report-Vol-1-Amartha-Prosperity-Index.pdf](https://esg.amartha.com/wp-content/uploads/2024/11/Grassroots-Entrepreneurs-Report-Vol-1-Amartha-Prosperity-Index.pdf)  
10. IMPACT REPORT 2025 \- Lendable, accessed November 29, 2025, [https://lendable.io/wp-content/uploads/2025/07/2025-Lendable-Impact-Report.pdf](https://lendable.io/wp-content/uploads/2025/07/2025-Lendable-Impact-Report.pdf)  
11. CREDIT RISK MANAGEMENT IN MICROFINANCE: THE CONCEPTUAL FRAMEWORK \- FinDev Gateway, accessed November 29, 2025, [https://www.findevgateway.org/sites/default/files/publications/files/credit\_risk\_in\_microfinance\_the\_conceptual\_framework.pdf](https://www.findevgateway.org/sites/default/files/publications/files/credit_risk_in_microfinance_the_conceptual_framework.pdf)  
12. Amartha, Using Technology to Re-define Creditworthiness in Rural Indonesia, accessed November 29, 2025, [https://amartha.com/blog/pendana/money-plus/amartha-using-technology-to-re-define-creditworthiness-in-rural-indonesia/](https://amartha.com/blog/pendana/money-plus/amartha-using-technology-to-re-define-creditworthiness-in-rural-indonesia/)  
13. On the combination of graph data for assessing thin-file borrowers' creditworthiness \- SciSpace, accessed November 29, 2025, [https://scispace.com/pdf/on-the-combination-of-graph-data-for-assessing-thin-file-1cgzawq2.pdf](https://scispace.com/pdf/on-the-combination-of-graph-data-for-assessing-thin-file-1cgzawq2.pdf)  
14. Machine Learning Implementation for Sentiment Analysis on X/Twitter: Case Study of Class Of Champions Event in Indonesia, accessed November 29, 2025, [https://ijeeemi.org/index.php/ijeeemi/article/view/81?articlesBySimilarityPage=5](https://ijeeemi.org/index.php/ijeeemi/article/view/81?articlesBySimilarityPage=5)  
15. 6 Langkah Sederhana Menjadi Anggota Amartha, accessed November 29, 2025, [https://amartha.com/en/blog/pendana/money-plus/6-langkah-sederhana-menjadi-anggota-amartha/](https://amartha.com/en/blog/pendana/money-plus/6-langkah-sederhana-menjadi-anggota-amartha/)  
16. Tanggung Renteng, Cara Berinvestasi Yang Aman Dan ..., accessed November 29, 2025, [https://amartha.com/en/blog/pendana/money-plus/tanggung-renteng-amartha/](https://amartha.com/en/blog/pendana/money-plus/tanggung-renteng-amartha/)  
17. Peer To Peer Lender Amartha Partners With Largest State Owned Micro-credit Company In Indonesia | Crowdfund Insider, accessed November 29, 2025, [https://www.crowdfundinsider.com/2017/09/121447-peer-peer-lender-amartha-partners-largest-state-owned-micro-credit-company-indonesia/](https://www.crowdfundinsider.com/2017/09/121447-peer-peer-lender-amartha-partners-largest-state-owned-micro-credit-company-indonesia/)  
18. Mitigation of Default Risk through Insurance in Peer- to-Peer Lending Financial Technology \- EUDL, accessed November 29, 2025, [https://eudl.eu/pdf/10.4108/eai.29-6-2021.2312604](https://eudl.eu/pdf/10.4108/eai.29-6-2021.2312604)  
19. Financial Service Agents \- Amartha.com, accessed November 29, 2025, [https://cms-web-stg.amartha.com/en/personal/financial-service-agents/](https://cms-web-stg.amartha.com/en/personal/financial-service-agents/)