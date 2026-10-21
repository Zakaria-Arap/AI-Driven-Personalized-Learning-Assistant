// Verifies a Google ID token with Google's tokeninfo endpoint and returns the verified email.
const { unauthorized } = require('../../utils/errors');

exports.verifyIdToken = async (idToken) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw unauthorized('Google sign-in is not set up on this server.', 'GOOGLE_NOT_CONFIGURED');
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!res.ok) throw unauthorized('Google sign-in failed.', 'GOOGLE_FAILED');
  const info = await res.json();
  if (info.aud !== clientId || info.email_verified !== 'true') throw unauthorized('Google sign-in failed.', 'GOOGLE_FAILED');
  return info.email.toLowerCase();
};
