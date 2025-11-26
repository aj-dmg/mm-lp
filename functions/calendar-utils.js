// functions/calendar-utils.js
const { google } = require('googleapis');
const path = require('path');
const functions = require('firebase-functions');

const CREDENTIALS_PATH = path.join(__dirname, 'service-account.json');
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/cloud-platform' // Scope for checking service status
];

// Get the email of the Workspace admin to impersonate from Firebase config.
// You MUST set this by running the following command in your terminal:
// firebase functions:config:set google.impersonation_account="your-admin-user@your-domain.com"
const ADMIN_TO_IMPERSONATE = functions.config().google?.impersonation_account;

/**
 * Creates and returns a single, fully authenticated Google API client.
 * This client is authorized with all necessary scopes for all functions.
 * @returns {Promise<import('google-auth-library').OAuth2Client>} An authenticated client instance.
 */
const getAuthenticatedClient = async () => {
  if (!ADMIN_TO_IMPERSONATE) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'The Google impersonation account is not configured. Please ask your developer to set the `google.impersonation_account` in the Firebase environment configuration.'
    );
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: SCOPES,
    // This is the crucial part for Domain-Wide Delegation to work.
    // The service account will act on behalf of this user.
    clientOptions: {
      subject: ADMIN_TO_IMPERSONATE,
    }
  });
  return auth.getClient();
};

/**
 * Returns an authenticated Google Calendar API client.
 */
const getCalendarClient = async () => {
  const client = await getAuthenticatedClient();
  return google.calendar({ version: 'v3', auth: client });
};

/**
 * Returns an authenticated Service Usage API client.
 */
const getServiceUsageClient = async () => {
    const client = await getAuthenticatedClient();
    return google.serviceusage({ version: 'v1', auth: client });
}

module.exports = { getCalendarClient, getServiceUsageClient };