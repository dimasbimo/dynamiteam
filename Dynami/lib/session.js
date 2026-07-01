const { getServerSession } = require('next-auth');
const { authOptions } = require('./auth');

async function getSession() {
  return getServerSession(authOptions);
}

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') {
    return { session: null, error: new Response(JSON.stringify({ error: 'Tidak diizinkan' }), { status: 403 }) };
  }
  return { session, error: null };
}

module.exports = { getSession, requireAdmin };
