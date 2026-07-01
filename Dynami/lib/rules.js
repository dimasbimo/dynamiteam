// Aturan inti sistem nyawa. Satu-satunya tempat aturan ini didefinisikan -
// diimpor baik oleh API routes (server) maupun komponen client.

const MAX_NYAWA = 4;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// < 1500  -> -1 nyawa
// 1500-3000 -> tetap
// > 3000  -> +1 nyawa
function getDelta(activityPoint) {
  if (activityPoint < 1500) return -1;
  if (activityPoint <= 3000) return 0;
  return 1;
}

// Mapping nyawa -> status. Lihat rancangan-sistem-nyawa-squad.md bagian 1
// kalau mau mengubah ambang batas ini.
function getStatus(nyawa) {
  if (nyawa >= 3) return 'AMAN';
  if (nyawa === 2) return 'WASPADA';
  if (nyawa === 1) return 'TERANCAM_KICK';
  return 'KICK';
}

const STATUS_LABEL = {
  AMAN: 'Aman',
  WASPADA: 'Waspada',
  TERANCAM_KICK: 'Terancam Kick',
  KICK: 'Kick',
};

module.exports = { MAX_NYAWA, clamp, getDelta, getStatus, STATUS_LABEL };
