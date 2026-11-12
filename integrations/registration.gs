// This is a set up code for registration to connect
// the code to google sheet using Google AppScript
function doPost(e) {
  const lock = LockService.getScriptLock();
  let stage = "validation";
  try {
    if (!e || !e.postData || e.postData.contents.length > 12000)
      throw new Error("Invalid request");
    const input = JSON.parse(e.postData.contents);
    const field = (key, max) => {
      if (typeof input[key] !== "string")
        throw new Error("Missing field: " + key);
      const value = input[key].trim();
      if (!value || value.length > max)
        throw new Error("Invalid field: " + key);
      return value;
    };
    const id = field("requestId", 36);
    if (!/^[a-f0-9-]{36}$/i.test(id)) throw new Error("Invalid request ID");
    const firstName = field("firstName", 100);
    const lastName = field("lastName", 100);
    const email = field("email", 254).toLowerCase();
    const phone = field("phone", 16);
    const location = field("location", 200);
    if (
      !/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(email) ||
      !/^\+[1-9][0-9]{7,14}$/.test(phone)
    )
      throw new Error("Invalid contact");
    const prayer = input.prayer || "";
    if (typeof prayer !== "string" || prayer.length > 4000)
      throw new Error("Invalid prayer");
    const config = PropertiesService.getScriptProperties().getProperties();
    stage = "configuration";
    if (!config.SHEET_ID || !config.SHEET_ID.trim())
      throw new Error("Missing SHEET_ID script property");
    stage = "lock";
    lock.waitLock(30000);
    stage = "spreadsheet";
    const sheet = SpreadsheetApp.openById(
      config.SHEET_ID.trim(),
    ).getSheetByName("Registrations");
    stage = "sheet_tab";
    if (!sheet) throw new Error("Run setup first");
    stage = "read";
    const rows = sheet.getDataRange().getValues();
    // A retry, or a repeated registration for the same email, returns the saved result.
    const existing = rows
      .slice(1)
      .find((row) => row[0] === id || row[4] === email);
    if (existing) return registrationJson_({ ok: true, email: existing[11] });
    const today = new Date().toISOString().slice(0, 10);
    const count = rows.slice(1).filter((row) => {
      const timestamp = new Date(row[1]);
      return (
        !Number.isNaN(timestamp.getTime()) &&
        timestamp.toISOString().slice(0, 10) === today
      );
    }).length;
    // Bounds cost on this public endpoint. Adjust deliberately for your event volume.
    stage = "capacity";
    if (count >= Number(config.DAILY_REGISTRATION_LIMIT || 80))
      throw new Error("Daily limit reached");
    const safeCell = (value) =>
      /^[=+\-@\t\r\n]/.test(value) ? "'" + value : value;
    stage = "save";
    sheet.appendRow([
      id,
      new Date(),
      safeCell(firstName),
      safeCell(lastName),
      email,
      safeCell(phone),
      safeCell(location),
      safeCell(prayer),
      input.confidential === true,
      input.followup === true,
      false,
      "pending",
      "skipped",
      "",
    ]);
    SpreadsheetApp.flush();
    const rowNumber = sheet.getLastRow();
    let emailStatus = "pending";
    let emailError = "";
    try {
      if (MailApp.getRemainingDailyQuota() < 1)
        throw new Error("Daily email quota exhausted");
      MailApp.sendEmail({
        to: email,
        subject: "IPC 2026 registration confirmation",
        name: "Let’s Pray",
        body:
          "Hello " +
          firstName +
          ",\n\nYour registration for IPC 2026 is confirmed.\n\nReference: " +
          id +
          "\n\nThank you for joining us.\nLet’s Pray",
      });
      emailStatus = "sent";
    } catch (error) {
      emailError = String(error.message || error).slice(0, 500);
      console.error(
        "Email confirmation failed for registration " + id + ": " + emailError,
      );
    }
    stage = "notification_status";
    sheet.getRange(rowNumber, 12).setValue(emailStatus);
    sheet.getRange(rowNumber, 14).setValue(emailError);
    SpreadsheetApp.flush();
    return registrationJson_({ ok: true, email: emailStatus });
  } catch (error) {
    console.error(
      "Registration failed at " + stage + ": " + String(error.message || error),
    );
    const messages = {
      validation:
        "Please check your form details, including the phone country code and field lengths.",
      configuration:
        "Registration is not configured. Please contact the team. (configuration)",
      lock: "Registration is busy. Please try again shortly. (lock)",
      spreadsheet:
        "The registration spreadsheet could not be opened. Please contact the team. (spreadsheet)",
      sheet_tab:
        "The registration sheet is not ready. Please contact the team. (sheet_tab)",
      read: "The registration records could not be read. Please contact the team. (read)",
      capacity:
        "Today's registration limit has been reached. Please try again later.",
      save: "Your registration could not be saved. Please try again. (save)",
      notification_status:
        "Your registration may have saved, but confirmation could not be checked. Please retry. (notification_status)",
    };
    return registrationJson_({
      ok: false,
      code: stage,
      message: messages[stage] || "Registration could not be completed.",
    });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function registrationJson_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

// Run in the editor. Checks configuration without submitting or sending mail.
function diagnoseRegistration() {
  const configuredId =
    PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  if (!configuredId || !configuredId.trim()) {
    throw new Error(
      "SHEET_ID is missing from Project Settings > Script Properties. Add the spreadsheet ID, not its URL.",
    );
  }
  const book = SpreadsheetApp.openById(configuredId.trim());
  console.log("Configured spreadsheet: " + book.getUrl());
  const sheet = book.getSheetByName("Registrations");
  if (!sheet)
    throw new Error(
      "The Registrations tab is missing. Run setupRegistration first.",
    );
  console.log(
    "Registrations tab found. Rows including header: " + sheet.getLastRow(),
  );
  console.log(
    "Remaining email recipients today: " + MailApp.getRemainingDailyQuota(),
  );
  console.log(
    "Configuration check passed. This checks editor access; the web app must also execute as Me.",
  );
}

function setupRegistration() {
  const id = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  const book = SpreadsheetApp.openById(id);
  const sheet =
    book.getSheetByName("Registrations") || book.insertSheet("Registrations");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Reference",
      "Submitted at",
      "First name",
      "Last name",
      "Email",
      "WhatsApp number",
      "Location",
      "Prayer request",
      "Confidential",
      "Follow-up consent",
      "Reserved",
      "Email status",
      "Reserved",
      "Email error",
    ]);
    sheet.setFrozenRows(1);
  }
  sheet.getRange(1, 14).setValue("Email error");
  // Requests permission to send mail during setup, before visitors submit.
  MailApp.getRemainingDailyQuota();
}

// Run manually in the editor to check authorization and sending independently of the website.
// Sends only to the Google account executing this function.
function testRegistrationEmail() {
  const recipient = Session.getEffectiveUser().getEmail();
  if (!recipient) throw new Error("Could not identify your Google account");
  console.log("Remaining email quota: " + MailApp.getRemainingDailyQuota());
  MailApp.sendEmail({
    to: recipient,
    subject: "Let’s Pray registration email test",
    body: "Email sending is working for your registration script. Check the registration Sheet for the status of your website submissions.",
    name: "Let’s Pray",
  });
  console.log(
    "Google accepted the test email. Check your inbox and spam folder.",
  );
}
