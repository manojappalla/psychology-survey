/**
 * Psychology Research Questionnaire — Google Apps Script Receiver
 *
 * ONE-TIME SETUP (~5 minutes):
 *   1. Open https://script.google.com -> click "New project".
 *   2. Delete any starter code, paste this entire file, and press Cmd+S / Ctrl+S.
 *   3. In the toolbar dropdown at the top, select "setup" and click "Run".
 *      Approve Google permissions ("Advanced" -> "Go to project (unsafe)" -> "Allow").
 *      Check the Execution Log at the bottom — it prints the direct link to your new Google Sheet!
 *   4. Click "Deploy" -> "New deployment" -> gear icon -> "Web app":
 *        - Execute as: "Me"
 *        - Who has access: "Anyone"
 *      Click "Deploy" and copy the Web App URL (ends in /exec).
 *   5. Paste that URL into `config.js` at `appsScriptUrl`.
 */

const SHEET_NAME = "Psychology Study Responses";

function setup() {
  const props = PropertiesService.getScriptProperties();
  let sheetId = props.getProperty("SHEET_ID");

  if (!sheetId) {
    const ss = SpreadsheetApp.create(SHEET_NAME);
    sheetId = ss.getId();
    props.setProperty("SHEET_ID", sheetId);

    // Tab 1: Wide format (1 row per participant — ready for SPSS, R, JASP, jamovi, Excel)
    const wide = ss.getSheets()[0];
    wide.setName("Respondents");
    wide.appendRow([
      "Participant ID",
      "External ID",
      "Started",
      "Finished",
      "Duration (s)",
      "Device"
    ]);
    wide.setFrozenRows(1);

    // Tab 2: Long format (1 row per question answer — ideal for mixed-effects / item analysis)
    const items = ss.insertSheet("Item_Responses");
    items.appendRow([
      "Timestamp",
      "Participant ID",
      "Section ID",
      "Question #",
      "Question ID",
      "Prompt",
      "Raw Value",
      "Scored Value",
      "Selected Label",
      "Subscale"
    ]);
    items.setFrozenRows(1);

    // Tab 3: Subscale summaries (automatic sum & mean per participant and psychological subscale)
    const subs = ss.insertSheet("Subscale_Scores");
    subs.appendRow([
      "Timestamp",
      "Participant ID",
      "Subscale",
      "Sum",
      "Mean",
      "Items Count"
    ]);
    subs.setFrozenRows(1);
  }

  Logger.log("Responses Google Sheet URL: " + SpreadsheetApp.openById(sheetId).getUrl());
}

function doGet() {
  return ContentService.createTextOutput("Psychology Study receiver is running.");
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const d = JSON.parse(e.postData.contents);
    const props = PropertiesService.getScriptProperties();
    const sheetId = props.getProperty("SHEET_ID");
    if (!sheetId) {
      throw new Error("Run setup() in Google Apps Script first.");
    }

    const ss = SpreadsheetApp.openById(sheetId);
    const rid = String(d.rid || "unknown").replace(/[^A-Za-z0-9-]/g, "");
    const extPid = String(d.externalPid || "").slice(0, 120);

    if (d.kind === "start") {
      const sh = ss.getSheetByName("Respondents");
      const row = findOrCreateRespondentRow_(sh, rid);
      if (extPid) sh.getRange(row, 2).setValue(extPid);
      if (!sh.getRange(row, 3).getValue()) sh.getRange(row, 3).setValue(new Date());
      sh.getRange(row, 6).setValue(String(d.ua || "").slice(0, 300));
    } else if (d.kind === "submit") {
      const now = new Date();
      const sh = ss.getSheetByName("Respondents");
      const row = findOrCreateRespondentRow_(sh, rid);

      if (extPid) sh.getRange(row, 2).setValue(extPid);
      if (!sh.getRange(row, 3).getValue()) sh.getRange(row, 3).setValue(now);
      sh.getRange(row, 4).setValue(now);
      sh.getRange(row, 5).setValue(Number(d.durationSec || 0));

      // Dynamically ensure columns exist on the wide "Respondents" tab for demographics, subscales, & items
      const demoObj = d.demographics || {};
      const demoKeys = Array.isArray(d.demographicColumns)
        ? d.demographicColumns
        : Object.keys(demoObj);

      demoKeys.forEach(function (key) {
        const col = ensureColumn_(sh, "demo_" + key);
        sh.getRange(row, col).setValue(demoObj[key] !== undefined ? demoObj[key] : "");
      });

      const subscales = d.subscales || {};
      const subsSheet = ss.getSheetByName("Subscale_Scores");
      Object.keys(subscales).forEach(function (subName) {
        const s = subscales[subName];
        const sumCol = ensureColumn_(sh, "score_" + subName + "_sum");
        const meanCol = ensureColumn_(sh, "score_" + subName + "_mean");
        sh.getRange(row, sumCol).setValue(s.sum);
        sh.getRange(row, meanCol).setValue(s.mean);

        subsSheet.appendRow([now, rid, subName, s.sum, s.mean, s.count]);
      });

      const flat = d.flatAnswers || {};
      const qOrder = Array.isArray(d.questionOrder) ? d.questionOrder : Object.keys(flat);
      qOrder.forEach(function (qid) {
        const col = ensureColumn_(sh, qid);
        sh.getRange(row, col).setValue(flat[qid] !== undefined ? flat[qid] : "");
      });

      // Append detailed rows to "Item_Responses"
      const itemsSheet = ss.getSheetByName("Item_Responses");
      const items = Array.isArray(d.items) ? d.items : [];
      if (items.length > 0) {
        const rowsToAppend = items.map(function (it) {
          return [
            now,
            rid,
            it.sectionId || "",
            it.qindex || "",
            it.qid || "",
            it.prompt || "",
            it.rawValue !== undefined ? it.rawValue : "",
            it.scoredValue !== undefined ? it.scoredValue : "",
            it.label || "",
            it.subscale || ""
          ];
        });
        itemsSheet
          .getRange(itemsSheet.getLastRow() + 1, 1, rowsToAppend.length, rowsToAppend[0].length)
          .setValues(rowsToAppend);
      }
    } else {
      throw new Error("Unknown payload kind: " + d.kind);
    }

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function findOrCreateRespondentRow_(sh, rid) {
  const last = sh.getLastRow();
  if (last > 1) {
    const ids = sh.getRange(2, 1, last - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (ids[i][0] === rid) return i + 2;
    }
  }
  sh.appendRow([rid]);
  return sh.getLastRow();
}

function ensureColumn_(sh, headerName) {
  const lastCol = Math.max(1, sh.getLastColumn());
  const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  const idx = headers.indexOf(headerName);
  if (idx !== -1) return idx + 1;
  const newCol = lastCol + 1;
  sh.getRange(1, newCol).setValue(headerName);
  return newCol;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
