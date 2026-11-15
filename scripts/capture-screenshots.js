const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDir = path.resolve(__dirname, '../public/documents/helpdesk/screenshots');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const pages = [
  { url: 'http://localhost:3000', filename: '07_home_page.png', width: 1280, height: 800 },
  { url: 'http://localhost:3000/leaderboard', filename: '08_leaderboard_podium.png', width: 1280, height: 850 },
  { url: 'http://localhost:3000/campuses', filename: '09_campuses_page.png', width: 1280, height: 800 },
  { url: 'http://localhost:3000/login', filename: '10_login_page.png', width: 1280, height: 800 },
  { url: 'http://localhost:3000/student', filename: '11_student_portal.png', width: 1280, height: 900 },
  { url: 'http://localhost:3000/campus-admin', filename: '12_campus_admin.png', width: 1280, height: 900 },
  { url: 'http://localhost:3000/campus-admin/groups', filename: '13_campus_groups.png', width: 1280, height: 900 },
  { url: 'http://localhost:3000/campus-admin/members', filename: '14_campus_members.png', width: 1280, height: 900 },
  { url: 'http://localhost:3000/campus-admin/dispatches', filename: '15_campus_dispatches.png', width: 1280, height: 900 },
  { url: 'http://localhost:3000/helpdesk', filename: '16_helpdesk_live.png', width: 1280, height: 850 },
];

console.log('Capturing fresh screenshots from live portal...');
for (const p of pages) {
  const target = path.join(outputDir, p.filename);
  try {
    const cmd = `"${chromePath}" --headless=new --disable-gpu --window-size=${p.width},${p.height} --screenshot="${target}" "${p.url}"`;
    execSync(cmd, { stdio: 'ignore' });
    const stats = fs.statSync(target);
    console.log(`✓ Captured ${p.filename} (${(stats.size / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error(`Failed capturing ${p.url}:`, err.message);
  }
}
console.log('All screenshots ready!');
