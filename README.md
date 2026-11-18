# Psychology Research Questionnaire (Static Site + Google Sheets)

A lightweight, zero-build static psychology questionnaire modeled after [matimati-27/svaadu](https://github.com/matimati-27/svaadu). It hosts for free on **GitHub Pages** and saves anonymous participant responses straight into **your private Google Sheet** via Google Apps Script — respondents never need to sign in, and no participant data ever touches GitHub.

```
psych-survey/
├── index.html            ← The questionnaire app (no build step needed)
├── config.js             ← THE ONLY FILE YOU EDIT: scales, questions, consent, Apps Script URL
├── media/
│   └── emblem.svg        ← Calm vector illustration (swap with your lab logo if you like)
└── apps-script/
    └── Code.gs           ← Paste once into script.google.com to create & connect your Google Sheet
```

---

## Where Your Data Lands (Automatic SPSS / R / Excel Ready Format)

When you run `setup()` in Google Apps Script, it creates a spreadsheet named **Psychology Study Responses** in your Google Drive with three tabs:

1. **`Respondents` (Wide format — 1 row per participant)**:
   - Participant ID (`P-XXXXXX`), optional external ID (`?pid=...` for Prolific/SONA), start/finish timestamps, total duration in seconds, demographic fields, **reverse-scored subscale sums & means**, and one column per question ID.
2. **`Item_Responses` (Long format — 1 row per item)**:
   - Includes both `Raw Value` and `Scored Value` (automatically flipped when `reverse: true` is set on a Likert item!), selected text label, and subscale tag.
3. **`Subscale_Scores`**:
   - Clean summary rows of `Sum`, `Mean`, and `Items Count` for every subscale you tag in `config.js`.

---

## Step 1: Customize Your Questions (`config.js` — ~5 min)

Open `config.js` in any text editor:
- Edit `study`, `intro`, `consent`, `demographics`, and `thanks` (including your debriefing note).
- Add or edit reusable Likert scales under `scales` (5-point, 7-point, frequency scales, etc.).
- Add your study's sections and questions under `sections`:
  - **`type: "likert"`**: Uses any scale name from `scales`. Add `reverse: true` on negatively keyed items (e.g., on a 1–5 scale, selecting `5` automatically scores as `1`) and `subscale: "your_scale_name"` to auto-compute subscale sums and means.
  - **`type: "choice"`**: Single-select multiple-choice radio options.
  - **`type: "multi"`**: Multi-select checkboxes ("choose all that apply").
- When data collection finishes, flip `responsesClosed: true` in `config.js` to display a clean *"Responses closed"* screen.

---

## Step 2: Connect Google Sheets (`apps-script/Code.gs` — ~5 min)

1. Go to **[script.google.com](https://script.google.com)** and click **New project**.
2. Delete the placeholder code, paste the entire contents of `apps-script/Code.gs`, and save (`Cmd+S` / `Ctrl+S`).
3. In the top toolbar dropdown, choose **`setup`** and click **Run**.
   - Approve permissions when prompted (*Review permissions -> Advanced -> Go to project (unsafe) -> Allow* — Google shows this notice because it is your own private script).
   - Check **Execution log** at the bottom: copy and bookmark the URL to your new **Psychology Study Responses** Google Sheet!
4. Click **Deploy -> New deployment** -> click the gear icon -> select **Web app**:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
   - Click **Deploy** and copy the **Web app URL** (ends in `/exec`).
5. Paste that URL into `config.js` at `appsScriptUrl`.

---

## Step 3: Host Free on GitHub Pages (~5 min)

1. Create a new **public** repository on GitHub (for example, `psych-study`) and push the contents of this folder to the `main` branch.
2. In your GitHub repo, go to **Settings -> Pages**.
3. Under **Build and deployment -> Source**, choose **Deploy from a branch**, select **`main`** and **`/ (root)`**, and click **Save**.
4. After ~1 minute, your questionnaire will be live at:
   `https://<your-github-username>.github.io/psych-study/`

*(Optional)* If you recruit via Prolific, SONA, or class links, append `?pid=PARTICIPANT_CODE` to the URL — it will automatically be recorded in the `External ID` column of your Google Sheet!
