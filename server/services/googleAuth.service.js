const axios = require('axios');

/**
 * Verify a Google access_token (from the implicit / token flow) and return the profile.
 * We call Google's tokeninfo / userinfo endpoints — no need for google-auth-library in this path.
 * @param {string} accessToken  — the access_token string from @react-oauth/google implicit flow
 * @returns {{ googleId, email, name, picture }} verified profile data
 */
async function verifyGoogleToken(accessToken) {
  // Fetch user info from Google using the access token
  const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const info = response.data;

  if (!info.sub)            throw new Error('Invalid Google token — no user ID');
  if (!info.email_verified) throw new Error('Google account email is not verified');

  return {
    googleId: info.sub,
    email:    info.email,
    name:     info.name,
    picture:  info.picture,
  };
}

module.exports = { verifyGoogleToken };
