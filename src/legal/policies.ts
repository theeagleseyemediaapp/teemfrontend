export type LegalPolicy = {
  title: string;
  summary: string;
  meta: Array<{ label: string; value: string }>;
  sections: Array<{
    title: string;
    body?: string[];
    items?: string[];
    table?: {
      headers: string[];
      rows: string[][];
    };
  }>;
  contacts: Array<{ label: string; value: string }>;
};

const defaultMeta = (operator = "The Eagle's Eye Media, Cameroon") => [
  { label: "Effective Date", value: "January 15, 2025" },
  { label: "Platform Scope", value: "theeagleseyemedia.com (Web & Mobile)" },
  { label: "Operator Entity", value: operator },
  { label: "Jurisdiction", value: "Yaoundé, Republic of Cameroon" },
];

export const policies = {
  termsOfService: {
    title: "Terms of Service",
    summary: "The legally binding agreement governing your access, browsing, and use of The Eagle's Eye Media platform, including subscription billing, user conduct guidelines, copyright licenses, and AI Assist auxiliary functionalities.",
    meta: defaultMeta(),
    contacts: [
      { label: "General Support", value: "support@theeagleseyemedia.com" },
      { label: "Legal & Compliance", value: "legal@theeagleseyemedia.com" },
      { label: "Complaints & Arbitration", value: "disputes@theeagleseyemedia.com" },
    ],
    sections: [
      {
        title: "1. Agreement and Acceptance of Terms",
        body: [
          "Welcome to The Eagle's Eye Media. By accessing, downloading, installing, browsing, or using our website, mobile application, or syndication feeds, you enter into a legally binding contract with The Eagle's Eye Media. You acknowledge that you have read, understood, and agreed to be bound by these Terms of Service in their entirety, alongside our Privacy Policy and Editorial Guidelines.",
          "If you do not agree with any provision of these terms, you must immediately cease all access, delete the mobile application from your devices, and discontinue using any of our premium services or downloadable content.",
          "The Eagle's Eye Media operates as an independent, non-partisan parliamentary press organization based in Yaoundé, Cameroon. We reserve the right to amend, update, or restructure these terms at any time. Significant updates will be notified via email or platform announcements, and your continued use of the platform constitutes explicit acceptance of the updated terms.",
        ],
      },
      {
        title: "2. Eligibility and User Account Security",
        body: [
          "To access standard public feeds on the platform, you must meet the minimum age requirement. For interactive features, premium billing, and AI Assist tools, account registration is strictly required.",
        ],
        items: [
          "Age Requirement: Users must be at least 13 years of age. If you are between 13 and 17, you must review these terms with a parent or legal guardian who accepts legal responsibility for your platform activities.",
          "Account Registration: You agree to provide current, complete, and accurate information (such as email address, display name, and payment coordinates) during registration. Registering under false aliases or fake email addresses is a violation of these terms.",
          "Credential Safety: You are solely responsible for maintaining the confidentiality of your Supabase login credentials (email and password). Any activity occurring under your account is deemed your legal responsibility.",
          "Unauthorized Access: You must notify our security operations desk immediately at legal@theeagleseyemedia.com if you suspect or detect any unauthorized access, breach of security, or password compromise.",
        ],
      },
      {
        title: "3. Premium Subscriptions, Billing, and Renewals",
        body: [
          "The Eagle's Eye Media provides premium tiers of service that grant subscribers access to downloadable PDF magazines, deep policy briefs, historical archives, and enhanced AI Assist queries. These premium features are governed by the following financial provisions:",
        ],
        items: [
          "Billing Channels: Subscriptions are processed in CFA Francs (FCFA) using secure Cameroonian mobile money channels (MTN Mobile Money, Orange Money) managed via MeSomb and Fapshi payment integration gateways.",
          "Manual Approval: To prevent unauthorized charges, subscription plans do not support automated mobile money direct-debit. You must manually confirm the payment prompt on your handset at the beginning of each billing period to renew access.",
          "Refund Policy: Due to the immediate delivery and downloadable nature of digital magazines and PDF files, all subscription fees, purchases, and renewals are final, non-refundable, and non-pro-ratable under any circumstances.",
          "Commercial and Multi-User Prohibitions: Personal subscriptions are restricted to a single individual. Sharing login details to bypass subscription walls or distributing downloaded PDFs to non-subscribers is strictly prohibited. For institutional licensing, please contact syndication@theeagleseyemedia.com.",
        ],
      },
      {
        title: "4. Permitted User Conduct & Community Guidelines",
        body: [
          "Our platform aims to foster constructive dialogue and transparency in Cameroonian public affairs. We expect all comments, user-submitted tip sheets, and discussions to remain civil and legal. You agree not to engage in the following prohibited behaviors:",
        ],
        items: [
          "Defamation and Abuse: Do not post, upload, or transmit any comments, letters to the editor, or profile summaries that are defamatory, slanderous, abusive, harassing, threatening, hateful, or racially offensive.",
          "Misinformation: Do not use our interactive sections to spread false news, unverified corruption allegations, or propaganda regarding members of parliament, senators, public figures, or government ministries.",
          "Impersonation: Do not falsely claim to represent the National Assembly, the Senate, any state agency, or The Eagle's Eye Media staff.",
          "Technical Misuse: Do not implement bots, scrapers, crawlers, indexers, or automated tools to extract articles, disrupt servers, bypass paywalls, or simulate artificial traffic.",
        ],
      },
      {
        title: "5. Intellectual Property Rights and Content License",
        body: [
          "All materials published on The Eagle's Eye Media—including investigative articles, layout designs, high-definition photography, infographics, podcast audio, video clips, and database models—are the exclusive intellectual property of The Eagle's Eye Media and are protected under Cameroonian copyright law (Law No. 2000/011 on Copyright and Neighboring Rights) and international treaties.",
          "Subject to your compliance with these terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access, view, and read our content for personal, non-commercial research and educational use.",
          "Any redistribution, commercial reproduction, compilation, translation, or broadcasting of full-text articles or premium PDFs without explicit prior written authorization is strictly prohibited.",
        ],
      },
      {
        title: "6. AI Assist Auxiliary Feature Limits",
        body: [
          "The platform provides an AI-powered conversational search tool (AI Assist) designed to help readers search archives, summarize public bills, and locate committee structures.",
          "You acknowledge that the responses generated by AI Assist are powered by large language models and are intended solely for educational reference. AI Assist does not provide official legal, constitutional, governmental, or policy interpretations.",
          "You agree to verify any critical dates, legal clauses, or voting records against the official journals of the National Assembly or the Senate of Cameroon before making civic or legal decisions. The Eagle's Eye Media is not liable for errors, hallucinations, or omissions in AI responses.",
        ],
      },
      {
        title: "7. Governing Law, Sanctions, and Dispute Resolution",
        body: [
          "These Terms of Service, and all relationships arising out of your use of the platform, shall be governed by, interpreted, and enforced in accordance with the laws of the Republic of Cameroon.",
          "You agree that any legal actions, claims, or arbitrations concerning these terms or the platform services shall be submitted exclusively to the competent courts of Yaoundé, Cameroon. You waive any objection to personal jurisdiction or venue in such courts.",
          "Violation of platform security, automated scraping of content, or copyright infringement will be prosecuted under Law No. 2010/012 of December 21, 2010, on Cybersecurity and Cybercrime, which carries heavy financial penalties and custodial sentences.",
        ],
      },
    ],
  },
  privacyPolicy: {
    title: "Privacy Policy",
    summary: "Our commitment to data protection. This document explains transparently what personal information we collect, how it is processed and secured in Supabase, and your data ownership rights.",
    meta: defaultMeta(),
    contacts: [
      { label: "Privacy Operations Desk", value: "privacy@theeagleseyemedia.com" },
      { label: "Data Protection Officer", value: "dpo@theeagleseyemedia.com" },
    ],
    sections: [
      {
        title: "1. Information We Collect and Process",
        body: [
          "We collect personal information directly when you register an account, subscribe to our news services, or submit inquiries to our desk. We also record standard diagnostic network metadata automatically during your sessions to ensure service security and reliability.",
        ],
        table: {
          headers: ["Information Category", "Specific Data Items Collected", "Primary Business and Legal Purpose"],
          rows: [
            ["Account Metadata", "Full display name, valid email address, account password hash", "Required to authenticate logins, manage subscriber accounts, and verify user profiles via Supabase Auth services."],
            ["Billing Credentials", "Mobile Money telephone number, payment provider network", "Used to trigger MTN MoMo or Orange Money checkout prompts via secure local payment processors (MeSomb, Fapshi)."],
            ["Platform Analytics", "IP address, browser type, page navigation path, session duration", "Monitors server health, mitigates Distributed Denial of Service (DDoS) threats, and collects anonymous readership metrics."],
            ["AI Tool Inputs", "Text prompts, search queries, and historical questions submitted to AI Assist", "Stored anonymously to improve search indexing, run safety checks, and refine model responses."],
          ],
        },
      },
      {
        title: "2. Technical Security and Cloud Storage Architecture",
        body: [
          "The Eagle's Eye Media takes data security seriously. We implement robust, state-of-the-art technologies to guarantee your information remains private:",
          "Data in Transit: All data transferred between your web browser or mobile client and our servers is encrypted using Secure Sockets Layer/Transport Layer Security (SSL/TLS 1.3) protocols.",
          "Authentication Encryption: Passwords and access credentials are automatically hashed using secure industry-standard algorithms and managed via Supabase's identity protection architecture.",
          "Backup and Database Isolation: Our production databases are hosted in secure, access-restricted cloud instances. Backups are encrypted at rest and stored in localized repositories with role-based access controls.",
        ],
      },
      {
        title: "3. Cookie Consent and Browser LocalStorage",
        body: [
          "We use browser cookies, SessionStorage, and LocalStorage tokens to deliver a personalized experience. Disabling these options in your browser settings may cause authentication failures or loss of custom configuration.",
        ],
        items: [
          "Session & Authentication Tokens: Essential cookies used to maintain your logged-in state as you browse between public and premium pages.",
          "UI Preferences: LocalStorage variables used to store settings such as active categories, search history, and dark mode configuration.",
          "Readership Analytics: Anonymized tracking cookies that calculate aggregate readership numbers without identifying individual users.",
        ],
      },
      {
        title: "4. Third-Party Disclosures and Service Providers",
        body: [
          "We maintain a strict policy against selling, renting, or trading your personal data with third-party advertising brokers or external marketing lists.",
          "To keep our platform operational, we share specific data points with verified technical partners. These partners are legally bound to protect your data and are prohibited from using it for any other purpose:",
          "Payment Processing: Mobile Money numbers and checkout instructions are shared with MeSomb and Fapshi to confirm premium subscriptions.",
          "Email & Newsletter Delivery: Subscriber email lists are synced with secure SMTP and newsletter delivery platforms to send news digests.",
          "Legal Obligations: We may disclose personal data if required to do so by a formal judicial warrant or order from Cameroonian law enforcement agencies.",
        ],
      },
      {
        title: "5. Your Rights and Data Deletion Protocol",
        body: [
          "Under modern data privacy guidelines, you retain absolute ownership over your personal data. We provide simple mechanisms to exercise your rights:",
        ],
        items: [
          "Right of Access: You can request a downloadable file containing all personal data we store regarding your user profile.",
          "Right of Rectification: You can update your display name and email settings directly from your account dashboard.",
          "Right of Erasure: You have the right to request the complete deletion of your account, bookmarks, and billing records. To do so, email privacy@theeagleseyemedia.com. Your account and associated databases will be permanently purged within 30 days.",
        ],
      },
    ],
  },
  editorialPolicy: {
    title: "Editorial Policy",
    summary: "The ethical, professional, and journalistic guidelines that guarantee objective, accurate, and non-partisan reporting of Cameroonian legislative and government affairs.",
    meta: defaultMeta("The Eagle's Eye Media Editorial Board"),
    contacts: [
      { label: "Editor-in-Chief", value: "editor@theeagleseyemedia.com" },
      { label: "Corrections Desk", value: "corrections@theeagleseyemedia.com" },
      { label: "Press Credentials", value: "press@theeagleseyemedia.com" },
    ],
    sections: [
      {
        title: "1. Journalistic Mission and Civic Duty",
        body: [
          "The core mission of The Eagle's Eye Media is to provide the Cameroonian public with accurate, comprehensive, and objective coverage of the National Assembly and the Senate of the Republic of Cameroon.",
          "We operate with strict independence. We are not affiliated with, nor funded by, any political party, parliamentary caucus, or lobbying group. Our reporters seek to explain complex bills, follow public budgets, and hold lawmakers accountable to their constituencies.",
          "We believe that a transparent legislature is essential for the consolidation of democracy in Cameroon, and we are committed to making parliamentary work accessible to all citizens.",
        ],
      },
      {
        title: "2. Standards of Accuracy and Verification",
        body: [
          "We enforce rigorous verification protocols. Before any article or policy brief is published, it must undergo double-source verification or reference official documentation.",
        ],
        items: [
          "Primary Sources: Our reporting relies primarily on official journals, published drafts of government bills, committee reports, public records, and on-the-record interviews with lawmakers or ministerial representatives.",
          "Anonymous Sources: The use of anonymous sources is highly restricted. We only grant anonymity to protect a source from verified professional, legal, or personal retaliation. All anonymous sources must be vetted and approved by the Editor-in-Chief before publication.",
          "Allegations of Misconduct: Any article detailing corruption, conflicts of interest, or parliamentary misconduct must be backed by documentary evidence or verified by at least two independent, unrelated sources.",
        ],
      },
      {
        title: "3. Separation of News and Opinion",
        body: [
          "To maintain public trust, we keep a strict boundary between objective news reporting and analytical commentary:",
          "News articles are written to report facts, events, and parliamentary statements without editorial bias or personal opinion.",
          "Opinion columns, guest essays, and commentaries must be clearly labeled as 'Opinion' or 'Analysis' and must represent the personal views of the stated author, not the institutional position of The Eagle's Eye Media.",
        ],
      },
      {
        title: "4. Correction and Retraction Protocol",
        body: [
          "We strive for error-free journalism, but when factual mistakes occur, we act swiftly to correct them in a transparent manner:",
          "Factual Corrections: When a substantive error regarding dates, figures, names, or bill clauses is identified, we correct the article text and append a dated correction note at the bottom of the page detailing the update.",
          "Retractions: If an article is discovered to be fundamentally incorrect or based on falsified data, we retract it immediately. A retraction notice detailing the error will replace the original article text.",
          "Reporting Errors: Readers can report inaccuracies directly to our desk at corrections@theeagleseyemedia.com.",
        ],
      },
      {
        title: "5. Ethical Use of Artificial Intelligence",
        body: [
          "As a forward-looking newsroom, we leverage digital technologies to improve efficiency, but we enforce strict rules regarding AI usage in our editorial workflows:",
          "Human Control: Generative AI tools may be used for transcribing recordings, summarizing long government PDFs, or drafting article outlines, but they are never permitted to write final published text. Every word published undergoes human drafting, verification, and editing.",
          "Imagery & Media Integrity: We do not publish AI-generated photos, deepfakes, or altered images representing real news events. All photographic materials must be authentic editorial photos or verified public domain uploads.",
        ],
      },
    ],
  },
  copyrightNotice: {
    title: "Copyright Notice",
    summary: "Clear rules regarding the intellectual property rights, reproduction permissions, academic citation standards, and syndication limits of our content.",
    meta: defaultMeta(),
    contacts: [
      { label: "Permissions & Licensing", value: "syndication@theeagleseyemedia.com" },
    ],
    sections: [
      {
        title: "1. Intellectual Property Protection",
        body: [
          "© 2025 The Eagle's Eye Media. All rights reserved.",
          "All original content published on this platform—including investigative text, analytical columns, exclusive editorial photos, custom infographics, audio podcasts, video interviews, interface designs, and downloadable PDF magazines—is the sole property of The Eagle's Eye Media and is protected under the intellectual property laws of Cameroon and international copyright conventions.",
          "Strict Image and Asset Prohibition: Copying, downloading, hotlinking, hosting, reproducing, or distributing any photograph, logo, video, watermark, or digital design asset from this website without explicit prior written consent from The Eagle's Eye Media is strictly prohibited under any circumstances."
        ],
      },
      {
        title: "2. Permitted Uses and Social Sharing",
        body: [
          "We support public dissemination of parliamentary news. You are permitted to reuse and share our content under the following strict conditions:",
        ],
        items: [
          "Personal Reference: You may read, print, and save individual articles or public reports for personal, non-commercial use.",
          "Social Sharing: You may share article links or headlines on social media platforms, provided the share redirects the reader back to our official website or mobile app.",
          "Academic Citation: Students, researchers, and NGOs may quote brief excerpts (up to 200 words) from our articles, provided clear attribution is given to 'The Eagle's Eye Media' alongside a direct link to the original publication.",
        ],
      },
      {
        title: "3. Prohibited Redistribution and Scraper Policies",
        body: [
          "Republishing, reproducing, translating, or broadcasting our full-text articles, premium magazines, or photos on commercial websites, print newspapers, or broadcast television without explicit written syndication agreements is strictly prohibited.",
          "Scraping & Machine Learning: The use of automated scripts, web spiders, or scraper bots to copy our database, harvest subscriber emails, or extract text archives for commercial directories or AI training datasets is strictly forbidden.",
        ],
      },
    ],
  },
  disclaimer: {
    title: "Disclaimer",
    summary: "Factual limitations and liabilities. This page outlines the informational nature of our platform and provides limits of liability regarding schedules and AI Assist tools.",
    meta: defaultMeta(),
    contacts: [
      { label: "Legal Compliance desk", value: "compliance@theeagleseyemedia.com" },
    ],
    sections: [
      {
        title: "1. General Information and Platform Limits",
        body: [
          "The content, summaries, digests, and commentary published on The Eagle's Eye Media are provided solely for general informational, educational, and civic purposes.",
          "While our editorial desk works diligently to verify dates, legislative votes, and bill drafts, parliamentary schedules in Cameroon are subject to rapid change by the Bureau of the National Assembly or the Senate. We make no warranties, express or implied, regarding the accuracy, completeness, or real-time reliability of the information.",
        ],
      },
      {
        title: "2. Exclusion of Professional and Legal Advice",
        body: [
          "The simplified summaries of government bills, finance laws, and constitutional clauses published on this platform do not constitute legal, financial, or constitutional advice.",
          "Legislative guides are written to make parliamentary processes understandable to the layperson. For formal legal interpretations or compliance guidelines, you must consult qualified legal professionals or refer directly to the official publications of the Secretariat General of the Presidency, the Ministry of Justice, or the official Gazette.",
        ],
      },
      {
        title: "3. AI Assist System Warnings",
        body: [
          "The AI Assist chatbot is an experimental auxiliary feature designed to facilitate search and content summarization. It is built on generative AI technologies and is prone to hallucinating or misrepresenting policy specifics.",
          "The Eagle's Eye Media accepts no liability for actions taken, or not taken, based on responses generated by the AI Assist tool. Always verify AI responses with original PDF reports or official sources.",
        ],
      },
      {
        title: "4. Third-Party Websites and External Links",
        body: [
          "Our platform contains links to official government portals, parliamentary databases, public archives, and external reports. These links are provided solely as a reference. We have no control over, and accept no responsibility for, the content, availability, privacy protocols, or practices of third-party websites.",
        ],
      },
    ],
  },
} satisfies Record<string, LegalPolicy>;
