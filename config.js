// ============================================================
//  STUDY CONFIG — the only file you need to edit for your study
// ============================================================
window.STUDY_CONFIG = {

  // 1) Paste your Google Apps Script Web App URL here (ends in /exec).
  //    While left as "PASTE_APPS_SCRIPT_URL_HERE", the site runs in local preview mode
  //    so you can test the entire flow in your browser before connecting Google Sheets.
  appsScriptUrl: "PASTE_APPS_SCRIPT_URL_HERE",

  // 2) Flip to true when data collection is finished to show a "Responses closed" screen.
  responsesClosed: false,
  closedMessage: {
    kicker: "Responses closed",
    title: "Thank you!",
    body: "We are no longer collecting responses for this study. Thank you to everyone who took the time to participate."
  },

  // 3) Study branding & metadata
  study: {
    brandMain: "Mind",
    brandAccent: " Study",
    pageTitle: "Psychology Research Questionnaire",
    researchers: "Department of Psychology · Research Team",
    contactEmail: "researcher@university.edu"
  },

  // 4) Welcome slide
  intro: {
    kicker: "Research Study · ~5–8 Minutes",
    title: "Welcome! Let's explore how you think and feel.",
    body: "This academic psychology study investigates everyday reflection, stress perception, and decision-making habits. " +
          "You will read short statements and choose the option that best reflects your experience. " +
          "There are no right or wrong answers — we are simply interested in your honest perspective.",
    startBtn: "Begin"
  },

  // 5) Informed Consent slide
  consent: {
    kicker: "Informed Consent",
    title: "Before we begin",
    points: [
      "Your responses are completely anonymous and will be used strictly for academic research.",
      "We do not collect your name, IP address, or identifying contact details.",
      "Participation is voluntary — you may stop at any time simply by closing this tab.",
      "Your progress is saved automatically on this device in case you accidentally refresh the page."
    ],
    checkboxLabel: "I am 18 years of age or older, I have read the information above, and I agree to participate.",
    continueBtn: "I Agree & Continue"
  },

  // 6) Reusable rating scales (reference these by key in your questions below)
  scales: {
    likert5: [
      { value: 1, label: "Strongly Disagree" },
      { value: 2, label: "Disagree" },
      { value: 3, label: "Neutral" },
      { value: 4, label: "Agree" },
      { value: 5, label: "Strongly Agree" }
    ],
    likert7: [
      { value: 1, label: "Strongly Disagree" },
      { value: 2, label: "Disagree" },
      { value: 3, label: "Slightly Disagree" },
      { value: 4, label: "Neutral" },
      { value: 5, label: "Slightly Agree" },
      { value: 6, label: "Agree" },
      { value: 7, label: "Strongly Agree" }
    ],
    frequency5: [
      { value: 1, label: "Never" },
      { value: 2, label: "Rarely" },
      { value: 3, label: "Sometimes" },
      { value: 4, label: "Often" },
      { value: 5, label: "Very Often" }
    ]
  },

  // 7) Questionnaire sections & items
  //    Supported question types:
  //      - "likert" : Uses a named scale from `scales` above (supports `reverse: true` and `subscale: "..."`)
  //      - "choice" : Single-choice radio buttons with custom `options: [{ value, label }, ...]`
  //      - "multi"  : Multi-select checkboxes with custom `options: [{ value, label }, ...]`
  sections: [
    {
      id: "sec_wellbeing",
      kicker: "Part 1 of 3 · Everyday Experience",
      title: "Over the past month, how often have you felt or thought the following?",
      instructions: "Choose the option that comes closest to how you have felt recently. Don't overthink any single statement.",
      questions: [
        {
          id: "wb_1",
          type: "likert",
          scale: "frequency5",
          subscale: "perceived_stress",
          prompt: "I felt overwhelmed by unexpected changes in my daily routine."
        },
        {
          id: "wb_2",
          type: "likert",
          scale: "frequency5",
          subscale: "perceived_stress",
          reverse: true, // Automatically reverse-scored (5->1, 4->2, etc.) in your Google Sheet!
          prompt: "I felt confident about my ability to handle personal problems."
        },
        {
          id: "wb_3",
          type: "likert",
          scale: "frequency5",
          subscale: "perceived_stress",
          reverse: true,
          prompt: "I felt that things were going smoothly and according to plan."
        },
        {
          id: "wb_4",
          type: "likert",
          scale: "frequency5",
          subscale: "perceived_stress",
          prompt: "I found it difficult to unwind even when I had free time."
        }
      ]
    },
    {
      id: "sec_cognition",
      kicker: "Part 2 of 3 · Thinking & Reflection",
      title: "How well do these statements describe you in general?",
      instructions: "Indicate how much you agree or disagree with each statement.",
      questions: [
        {
          id: "cog_1",
          type: "likert",
          scale: "likert5",
          subscale: "need_for_cognition",
          prompt: "I enjoy tackling complex problems that require figuring out new solutions."
        },
        {
          id: "cog_2",
          type: "likert",
          scale: "likert5",
          subscale: "need_for_cognition",
          reverse: true,
          prompt: "I prefer tasks that can be completed without having to think them through deeply."
        },
        {
          id: "cog_3",
          type: "likert",
          scale: "likert5",
          subscale: "mindful_awareness",
          prompt: "I notice subtle shifts in my mood before they affect how I act toward others."
        },
        {
          id: "attn_check_1",
          type: "likert",
          scale: "likert5",
          subscale: "attention_check",
          prompt: "To show that you are reading carefully, please select \"Agree\" for this statement."
        }
      ]
    },
    {
      id: "sec_scenarios",
      kicker: "Part 3 of 3 · Preferences & Context",
      title: "Everyday Situations",
      instructions: "Select the answers that best match what you would typically do.",
      questions: [
        {
          id: "scen_1",
          type: "choice",
          subscale: "decision_style",
          prompt: "When making an important personal decision, what do you rely on first?",
          options: [
            { value: "analytical", label: "Listing pros, cons, and concrete evidence step by step" },
            { value: "intuitive", label: "Going with my initial gut feeling and overall impression" },
            { value: "social", label: "Talking it through with trusted friends or family members" },
            { value: "deliberative_delay", label: "Sleeping on it for a few days before deciding how to approach it" }
          ]
        },
        {
          id: "coping_1",
          type: "multi",
          prompt: "When you have had a demanding day, which of these help you recharge? (Choose all that apply)",
          options: [
            { value: "solitude", label: "Quiet time alone (reading, resting, journaling)" },
            { value: "social", label: "Spending time or talking with friends/family" },
            { value: "movement", label: "Physical activity, walking, or exercise" },
            { value: "media", label: "Music, shows, podcasts, or games" },
            { value: "nature", label: "Going outdoors or spending time in nature" }
          ]
        }
      ]
    }
  ],

  // 8) Participant Demographics (shown right before submission)
  //    Add, edit, or remove fields freely — Google Sheets columns adapt automatically!
  demographics: {
    kicker: "Almost Done",
    title: "About You",
    note: "These brief background questions help us describe our overall sample.",
    submitBtn: "Submit Responses",
    fields: [
      {
        name: "age",
        label: "Age (in years)",
        type: "number",
        min: 18,
        max: 105,
        required: true
      },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        required: true,
        options: [
          ["woman", "Woman"],
          ["man", "Man"],
          ["non_binary", "Non-binary / gender diverse"],
          ["prefer_not_to_say", "Prefer not to say"]
        ]
      },
      {
        name: "education",
        label: "Highest level of education completed (or currently enrolled)",
        type: "select",
        required: true,
        options: [
          ["high_school", "High school / secondary school"],
          ["undergrad", "Undergraduate / Bachelor's degree"],
          ["postgrad", "Postgraduate / Master's / Doctorate"],
          ["other", "Other"]
        ]
      },
      {
        name: "occupation",
        label: "Current primary role",
        type: "select",
        required: false,
        options: [
          ["student", "Student"],
          ["employed", "Employed / Self-employed"],
          ["research_academic", "Academic / Researcher"],
          ["other", "Other / Prefer not to say"]
        ]
      }
    ]
  },

  // 9) Thank You & Debriefing slide
  thanks: {
    kicker: "Submission Complete",
    title: "Thank you for participating!",
    body: "Your responses have been recorded anonymously. Thank you for contributing to our psychology research.",
    debriefTitle: "Study Debriefing",
    debriefBody: "This study examines how everyday perceived stress relates to reflective thinking styles and coping preferences. " +
                 "If you have any questions about the research, please reach out to the research team listed below.",
    idLabel: "Your anonymous Participant ID (save this if needed for course or study credit):"
  }
};
