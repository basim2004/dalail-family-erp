const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sharp = require('sharp');

const rootDir = path.resolve(__dirname, '..');
const outputHtmlPath = path.resolve(rootDir, 'public/documents/helpdesk/publication_source.html');
const outputPdfPath = path.resolve(rootDir, 'public/documents/helpdesk/Dalail_ERP_Institutional_Profile_and_User_Guide.pdf');
const outputCoverImgPath = path.resolve(rootDir, 'public/documents/helpdesk/guide_cover_preview.png');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

// Helper to convert local image to optimized base64 data URI for ultra-crisp yet lightweight PDF rendering
async function imgDataUri(relPath, maxW = 1000) {
  const absPath = path.resolve(rootDir, relPath);
  if (!fs.existsSync(absPath)) {
    console.warn('Image not found:', absPath);
    return '';
  }
  const ext = path.extname(absPath).toLowerCase();
  const rawBuf = fs.readFileSync(absPath);
  
  if (ext === '.svg') {
    return `data:image/svg+xml;base64,${rawBuf.toString('base64')}`;
  }

  let optBuf;
  let mime;
  if (ext === '.png') {
    optBuf = await sharp(rawBuf).resize({ width: maxW, withoutEnlargement: true }).png({ quality: 85, compressionLevel: 8 }).toBuffer();
    mime = 'image/png';
  } else {
    optBuf = await sharp(rawBuf).resize({ width: maxW, withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer();
    mime = 'image/jpeg';
  }
  return `data:${mime};base64,${optBuf.toString('base64')}`;
}

(async () => {
  console.log('Optimizing & loading institutional assets into memory...');
  const logoUri = await imgDataUri('public/assets/official-logo.png', 400);
  const sealUri = await imgDataUri('public/assets/office-seal.png', 400);
  const signatureUri = await imgDataUri('public/assets/pure_signature_abdurahman.png', 500);
  const campusMainUri = await imgDataUri('public/assets/campus-main.jpg', 1000);
  const campusAerialUri = await imgDataUri('public/assets/campus-aerial.jpg', 1000);
  const campusGateUri = await imgDataUri('public/assets/campus-gate.jpg', 1000);
  const founderUri = await imgDataUri('public/assets/founder.jpg', 800);
  const student1Uri = await imgDataUri('public/assets/authentic_student_1.jpg', 800);
  const student2Uri = await imgDataUri('public/assets/authentic_student_2.jpg', 800);
  const student3Uri = await imgDataUri('public/assets/authentic_student_3.jpg', 800);
  const student4Uri = await imgDataUri('public/assets/authentic_student_4.jpg', 800);
  const igScreenshotUri = await imgDataUri('public/assets/instagram_screenshot_official.jpg', 800);
  const brochure1Uri = await imgDataUri('public/assets/brochure_eng_page_1.jpg', 900);
  const brochure2Uri = await imgDataUri('public/assets/brochure_eng_page_2.jpg', 900);

  const shotHomeUri = await imgDataUri('public/documents/helpdesk/screenshots/07_home_page.png', 1100);
  const shotLeaderboardUri = await imgDataUri('public/documents/helpdesk/screenshots/08_leaderboard_podium.png', 1100);
  const shotCampusesUri = await imgDataUri('public/documents/helpdesk/screenshots/09_campuses_page.png', 1100);
  const shotLoginUri = await imgDataUri('public/documents/helpdesk/screenshots/10_login_page.png', 1000);
  const shotStudentPortalUri = await imgDataUri('public/documents/helpdesk/screenshots/02_student_portal.png', 1100);
  const shotCampusAdminUri = await imgDataUri('public/documents/helpdesk/screenshots/03_campus_admin_portal.png', 1100);
  const shotGroupsUri = await imgDataUri('public/documents/helpdesk/screenshots/13_campus_groups.png', 1100);
  const shotMembersUri = await imgDataUri('public/documents/helpdesk/screenshots/04_campus_admin_members.png', 1100);
  const shotDispatchesUri = await imgDataUri('public/documents/helpdesk/screenshots/15_campus_dispatches.png', 1100);
  const shotReceiptVerifyUri = await imgDataUri('public/documents/helpdesk/screenshots/05_receipt_verification.png', 1000);
  const shotHelpdeskUri = await imgDataUri('public/documents/helpdesk/screenshots/16_helpdesk_live.png', 1100);

console.log('Generating 28-Page Premium Institutional Publication HTML...');

function pageHeader(chNum, chTitle, secTitle) {
  return `
    <div class="page-header">
      <div class="ph-left">
        <img src="${logoUri}" class="ph-logo" alt="Logo" />
        <div>
          <span class="ph-foundation">DALAILUL KHAIRATH ISLAMIC FOUNDATION (REGD.)</span>
          <span class="ph-title">CHAPTER ${chNum}: ${chTitle} &bull; ${secTitle}</span>
        </div>
      </div>
      <div class="ph-badge">OFFICIAL ERP MANUAL 2026</div>
    </div>
  `;
}

function pageFooter(pageNum) {
  return `
    <div class="page-footer">
      <div class="pf-text">
        <strong>DALAIL FAMILY ERP</strong> &bull; Institutional Profile & Comprehensive User Manual &bull; Confidential & Proprietary
      </div>
      <div class="pf-num">Page ${pageNum} of 28</div>
    </div>
  `;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DALAIL FAMILY ERP - Institutional Profile & User Guide</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0f172a;
      background: #f1f5f9;
      font-size: 9.5pt;
      line-height: 1.45;
    }
    .doc-page {
      width: 210mm;
      height: 297mm;
      min-height: 297mm;
      max-height: 297mm;
      position: relative;
      background: #ffffff;
      padding: 13mm 14mm 14mm 14mm;
      overflow: hidden;
      page-break-after: always;
      page-break-inside: avoid;
      display: flex;
      flex-direction: column;
    }
    
    /* Cover Page Specific */
    .cover-page {
      padding: 0;
      background: linear-gradient(145deg, #071938 0%, #0c2b64 50%, #164a9b 100%);
      color: #ffffff;
      justify-content: space-between;
    }
    .cover-pattern {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(rgba(212, 175, 55, 0.15) 1px, transparent 1px);
      background-size: 16px 16px;
      opacity: 0.6;
      pointer-events: none;
    }
    .cover-top {
      position: relative;
      z-index: 2;
      padding: 14mm 16mm 0 16mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 5mm;
    }
    .cover-logo-box {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .cover-logo-img {
      width: 48px;
      height: 48px;
      object-fit: contain;
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4));
    }
    .cover-org-name {
      font-size: 12pt;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #ffffff;
      line-height: 1.2;
    }
    .cover-org-sub {
      font-size: 7.5pt;
      color: #cbd5e1;
      font-weight: 500;
      letter-spacing: 0.3px;
    }
    .cover-reg-badge {
      font-size: 7.5pt;
      background: rgba(212, 175, 55, 0.2);
      border: 1px solid rgba(212, 175, 55, 0.6);
      color: #f7d9a0;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 999px;
      letter-spacing: 1px;
    }
    .cover-middle {
      position: relative;
      z-index: 2;
      padding: 6mm 16mm;
      text-align: center;
    }
    .cover-arabic {
      font-family: 'Amiri', serif;
      font-size: 26pt;
      color: #f7d9a0;
      margin: 0 0 4px 0;
      letter-spacing: 1px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }
    .cover-badge-pill {
      display: inline-block;
      background: linear-gradient(90deg, #d4af37, #f7d9a0, #d4af37);
      color: #071938;
      font-size: 8.5pt;
      font-weight: 900;
      text-transform: uppercase;
      padding: 5px 18px;
      border-radius: 999px;
      letter-spacing: 1.5px;
      margin-bottom: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .cover-main-title {
      font-size: 27pt;
      font-weight: 900;
      line-height: 1.15;
      margin: 0 auto 8px auto;
      letter-spacing: -0.5px;
      color: #ffffff;
      max-width: 170mm;
      text-shadow: 0 3px 12px rgba(0,0,0,0.6);
    }
    .cover-sub-title {
      font-size: 11pt;
      color: #93c5fd;
      font-weight: 600;
      max-width: 150mm;
      margin: 0 auto;
      line-height: 1.4;
    }
    
    /* Cover Image Montage */
    .cover-montage {
      position: relative;
      z-index: 2;
      padding: 0 16mm;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 10px;
      height: 70mm;
    }
    .cover-img-card {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      border: 2px solid rgba(255, 255, 255, 0.2);
      position: relative;
    }
    .cover-img-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .cover-img-label {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(0deg, rgba(7, 25, 56, 0.9) 0%, transparent 100%);
      padding: 8px 10px 4px 10px;
      font-size: 7pt;
      font-weight: 700;
      color: #ffffff;
    }
    
    .cover-bottom {
      position: relative;
      z-index: 2;
      background: rgba(4, 15, 34, 0.95);
      border-top: 1px solid rgba(212, 175, 55, 0.3);
      padding: 6mm 16mm 7mm 16mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .cb-meta {
      font-size: 7.5pt;
      color: #94a3b8;
      line-height: 1.4;
    }
    .cb-meta strong {
      color: #f1f5f9;
    }
    .cb-qr-box {
      display: flex;
      align-items: center;
      gap: 10px;
      text-align: right;
    }
    .cb-url {
      font-size: 8.5pt;
      font-weight: 800;
      color: #f7d9a0;
      letter-spacing: 0.5px;
    }

    /* Running Header & Footer */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 2.5mm;
      margin-bottom: 3.5mm;
      border-bottom: 1.5px solid #164a9b;
    }
    .ph-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ph-logo {
      width: 22px;
      height: 22px;
      object-fit: contain;
    }
    .ph-foundation {
      display: block;
      font-size: 6.5pt;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.5px;
    }
    .ph-title {
      display: block;
      font-size: 8pt;
      font-weight: 800;
      color: #0f2b5c;
    }
    .ph-badge {
      font-size: 6.5pt;
      font-weight: 800;
      color: #164a9b;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 2px 7px;
      border-radius: 999px;
      letter-spacing: 0.5px;
    }
    .page-footer {
      margin-top: auto;
      padding-top: 2mm;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7pt;
      color: #64748b;
    }
    .pf-text strong {
      color: #164a9b;
    }
    .pf-num {
      font-weight: 800;
      color: #0f172a;
      background: #f1f5f9;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
    }

    /* Content Layout Components */
    .content-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3mm;
    }
    .sec-hero {
      background: linear-gradient(90deg, #0c2b64 0%, #164a9b 100%);
      color: #ffffff;
      border-radius: 8px;
      padding: 3.5mm 5mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1mm;
    }
    .sec-hero h1 {
      margin: 0;
      font-size: 13.5pt;
      font-weight: 800;
      letter-spacing: -0.2px;
    }
    .sec-hero p {
      margin: 1px 0 0 0;
      font-size: 7.5pt;
      color: #bfdbfe;
    }
    .sec-badge {
      background: #d4af37;
      color: #071938;
      font-size: 7pt;
      font-weight: 900;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    /* Cards & Grids */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3mm;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 2.5mm;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 2mm;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 3mm;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .card-blue {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 3.5px solid #164a9b;
    }
    .card-gold {
      background: #fffdfa;
      border: 1px solid #fde68a;
      border-left: 3.5px solid #d4af37;
    }
    .card-dark {
      background: #0f172a;
      color: #ffffff;
      border: 1px solid #1e293b;
    }
    .card h3 {
      margin: 0 0 1.5mm 0;
      font-size: 9.5pt;
      font-weight: 800;
      color: #0c2b64;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .card-dark h3 {
      color: #f7d9a0;
    }
    .card p {
      margin: 0;
      font-size: 8pt;
      color: #475569;
      line-height: 1.45;
    }
    .card-dark p {
      color: #cbd5e1;
    }

    /* Image Frames */
    .img-box {
      border-radius: 7px;
      overflow: hidden;
      border: 1px solid #cbd5e1;
      background: #f1f5f9;
      position: relative;
    }
    .img-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .img-caption {
      font-size: 6.8pt;
      color: #64748b;
      font-style: italic;
      margin-top: 1mm;
      text-align: center;
    }

    /* Callout & Steps */
    .step-item {
      display: flex;
      gap: 3mm;
      align-items: flex-start;
      margin-bottom: 2.5mm;
    }
    .step-num {
      width: 20px;
      height: 20px;
      background: #164a9b;
      color: #ffffff;
      font-size: 8pt;
      font-weight: 800;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .step-content h4 {
      margin: 0 0 1px 0;
      font-size: 8.5pt;
      font-weight: 700;
      color: #0f172a;
    }
    .step-content p {
      margin: 0;
      font-size: 7.8pt;
      color: #475569;
      line-height: 1.4;
    }

    /* Tables */
    .table-custom {
      width: 100%;
      border-collapse: collapse;
      font-size: 7.8pt;
      margin-top: 1mm;
    }
    .table-custom th {
      background: #0c2b64;
      color: #ffffff;
      text-align: left;
      padding: 2mm 2.5mm;
      font-weight: 700;
      border: 1px solid #0c2b64;
    }
    .table-custom td {
      padding: 1.8mm 2.5mm;
      border: 1px solid #e2e8f0;
      color: #334155;
    }
    .table-custom tr:nth-child(even) td {
      background: #f8fafc;
    }

    /* Key-value highlight pill */
    .badge-pill {
      display: inline-block;
      font-size: 7pt;
      font-weight: 700;
      padding: 1.5px 6px;
      border-radius: 4px;
    }
    .bp-blue { background: #dbeafe; color: #1e40af; }
    .bp-green { background: #dcfce7; color: #166534; }
    .bp-amber { background: #fef3c7; color: #92400e; }
    .bp-purple { background: #f3e8ff; color: #6b21a8; }
  </style>
</head>
<body>

  <!-- ================= PAGE 1: COVER PAGE ================= -->
  <div class="doc-page cover-page">
    <div class="cover-pattern"></div>
    
    <div class="cover-top">
      <div class="cover-logo-box">
        <img src="${logoUri}" class="cover-logo-img" alt="Official Logo" />
        <div>
          <div class="cover-org-name">DALAILUL KHAIRATH ISLAMIC FOUNDATION</div>
          <div class="cover-org-sub">Kakkidippuram, P.O. Alamkode, Malappuram Dt., Kerala - 679585</div>
        </div>
      </div>
      <div class="cover-reg-badge">REGD. NO: 326/IV/2019</div>
    </div>

    <div class="cover-middle">
      <div class="cover-arabic">دَلَائِلُ الْخَيْرَاتِ الإِسْلَامِيَّة</div>
      <div class="cover-badge-pill">OFFICIAL INSTITUTIONAL PUBLICATION & SYSTEM MANUAL</div>
      <h1 class="cover-main-title">DALAIL FAMILY ERP</h1>
      <div class="cover-sub-title">Complete Institutional Profile, Public Portal Architecture & Comprehensive Operational User Manual</div>
    </div>

    <div class="cover-montage">
      <div class="cover-img-card">
        <img src="${campusMainUri}" alt="Main Campus Complex" />
        <div class="cover-img-label">Masjid Zainab & Central Institutional Sanctuary</div>
      </div>
      <div class="cover-img-card">
        <img src="${founderUri}" alt="Institutional Leadership" />
        <div class="cover-img-label">Leadership & Guidance</div>
      </div>
      <div class="cover-img-card">
        <img src="${student1Uri}" alt="Student Life" />
        <div class="cover-img-label">Scholastic Excellence</div>
      </div>
    </div>

    <div class="cover-bottom">
      <div class="cb-meta">
        <strong>Edition:</strong> 2026 Institutional Comprehensive Release (v2.4)<br>
        <strong>Authorized Distribution:</strong> Administrative Officers, Campus Rectors, Field Squads & Members<br>
        <strong>Technical Platform:</strong> DALAIL FAMILY ERP Progressive Web Application (PWA)
      </div>
      <div class="cb-qr-box">
        <div>
          <div class="cb-url">dalail-family-erp.vercel.app</div>
          <div style="font-size: 7pt; color: #cbd5e1;">Official Digital Gateway</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= PAGE 2: TABLE OF CONTENTS & FOREWORD ================= -->
  <div class="doc-page">
    ${pageHeader('I', 'PRELIMINARY', 'Foreword & Table of Contents')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Table of Contents & Executive Foreword</h1>
          <p>Structural index of institutional profile, system modules, and role-based operational procedures</p>
        </div>
        <div class="sec-badge">INDEX & OVERVIEW</div>
      </div>

      <div class="grid-2" style="margin-bottom: 1mm;">
        <div class="card card-gold">
          <h3>Foreword from the Leadership</h3>
          <p style="text-align: justify; font-size: 7.8pt; line-height: 1.45;">
            In the name of Allah, the Most Gracious, the Most Merciful. Dalailul Khairath Islamic Foundation stands as a monument of sacred classical learning, humanitarian compassion, and dignified orphan empowerment. The deployment of <strong>DALAIL FAMILY ERP</strong> marks an epochal digital milestone, uniting our sprawling multi-campus network, student collection squads, and benevolent donors through instant cryptographic transparency, real-time dispatches, and seamless cloud coordination. We present this manual to guide every stakeholder toward excellence.
          </p>
          <div style="margin-top: 2.5mm; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <strong style="font-size: 7.8pt; color: #0c2b64;">Sayyid Abdurahman Saadi Al-Bukhari</strong><br>
              <span style="font-size: 6.8pt; color: #64748b;">General Secretary & Spiritual Mentor</span>
            </div>
            <img src="${signatureUri}" style="height: 24px; object-fit: contain;" alt="Signature" />
          </div>
        </div>

        <div class="card card-blue">
          <h3>Publication Control & Architecture</h3>
          <table class="table-custom" style="margin-top: 0;">
            <tr><td><strong>Publication:</strong></td><td>Institutional Profile & User Manual</td></tr>
            <tr><td><strong>System Version:</strong></td><td>DALAIL ERP v2.4 (PWA Enabled)</td></tr>
            <tr><td><strong>Security Standard:</strong></td><td>Role-Isolated Authentication & QR Crypto</td></tr>
            <tr><td><strong>Official URL:</strong></td><td>https://dalail-family-erp.vercel.app/</td></tr>
            <tr><td><strong>Target Roles:</strong></td><td>Main Admin, Campus Admin, Students</td></tr>
          </table>
        </div>
      </div>

      <div class="card" style="flex: 1;">
        <h3 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 1.5mm; margin-bottom: 2mm;">
          Document Structure & Module Syllabus
        </h3>
        <div class="grid-2" style="font-size: 7.6pt;">
          <div style="display: flex; flex-direction: column; gap: 1.8mm;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 1mm;">
              <span><strong>Module 1:</strong> Institutional Profile & Spiritual Heritage</span>
              <span style="font-weight: 800; color: #164a9b;">Pages 3 &ndash; 4</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 1mm;">
              <span><strong>Module 2:</strong> DALAIL FAMILY ERP Architecture</span>
              <span style="font-weight: 800; color: #164a9b;">Page 5</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 1mm;">
              <span><strong>Module 3:</strong> Public Portal, YouTube & Instagram Feed</span>
              <span style="font-weight: 800; color: #164a9b;">Pages 6 &ndash; 8</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 1mm;">
              <span><strong>Module 4:</strong> Field Leaderboard & Campus Directory</span>
              <span style="font-weight: 800; color: #164a9b;">Pages 9 &ndash; 10</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 1mm;">
              <span><strong>Module 5:</strong> Public Verification Engine & Security</span>
              <span style="font-weight: 800; color: #164a9b;">Page 11</span>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1.8mm;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 1mm;">
              <span><strong>Module 6:</strong> Role-Based Access Control & Unified Login</span>
              <span style="font-weight: 800; color: #164a9b;">Page 12</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 1mm;">
              <span><strong>Module 7:</strong> Student Field Work Portal & Step-by-Step Manual</span>
              <span style="font-weight: 800; color: #164a9b;">Pages 13 &ndash; 17</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 1mm;">
              <span><strong>Module 8:</strong> Campus Admin Portal & Operations Manual</span>
              <span style="font-weight: 800; color: #164a9b;">Pages 18 &ndash; 22</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 1mm;">
              <span><strong>Module 9:</strong> Main Admin HQ & Android PWA Installation</span>
              <span style="font-weight: 800; color: #164a9b;">Pages 23 &ndash; 24</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 1mm;">
              <span><strong>Module 10:</strong> Help Desk, Troubleshooting & Literature</span>
              <span style="font-weight: 800; color: #164a9b;">Pages 25 &ndash; 28</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    ${pageFooter(2)}
  </div>

  <!-- ================= PAGE 3: INSTITUTIONAL HERITAGE & FOUNDATION ================= -->
  <div class="doc-page">
    ${pageHeader('1', 'INSTITUTIONAL PROFILE', 'Spiritual Heritage & Genesis')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Dalailul Khairath Islamic Foundation (Regd.)</h1>
          <p>Genesis, founding vision, and the sacred legacy at Kakkidippuram Main Campus</p>
        </div>
        <div class="sec-badge">HISTORICAL PROFILE</div>
      </div>

      <div class="grid-2">
        <div class="card card-blue">
          <h3>Sacred Roots & Historical Genesis</h3>
          <p style="text-align: justify; font-size: 8pt; margin-bottom: 2mm;">
            Established at the serene academic valley of Kakkidippuram (P.O. Alamkode, Malappuram Dt., Kerala), Dalailul Khairath Islamic Foundation was instituted to nurture authentic Islamic scholarship, preserve Prophetic traditions, and shelter vulnerable orphans with unconditional familial warmth.
          </p>
          <p style="text-align: justify; font-size: 8pt;">
            Founded under the spiritual inspiration of classical masters, the foundation pays solemn homage to patron saint <strong>Marhoom K. P. Moitheen Musliyar</strong>, whose vision of holistic spiritual knowledge continues to illuminate every lecture hall, library corridor, and prayer circle.
          </p>
        </div>

        <div class="img-box" style="height: 48mm;">
          <img src="${campusAerialUri}" alt="Aerial View of Kakkidippuram Complex" />
          <div class="img-caption">Aerial perspective of the sprawling academic campus complex in Kakkidippuram</div>
        </div>
      </div>

      <div class="grid-3" style="margin-top: 1mm;">
        <div class="card">
          <h3 style="font-size: 8.5pt;">Spiritual Sanctuary</h3>
          <p style="font-size: 7.5pt;">Hosting daily congregational devotions, classical Dars circles, and spiritual Dhikr Majlis at Masjid Zainab.</p>
        </div>
        <div class="card">
          <h3 style="font-size: 8.5pt;">Academic Rigor</h3>
          <p style="font-size: 7.5pt;">Affiliated with Jamia Madeenathunnoor, integrating Dawa sciences with contemporary academic disciplines.</p>
        </div>
        <div class="card">
          <h3 style="font-size: 8.5pt;">Humanitarian Care</h3>
          <p style="font-size: 7.5pt;">Providing 100% free residential boarding, nourishment, healthcare, and mentorship for orphan scholars.</p>
        </div>
      </div>

      <div class="card card-gold" style="flex: 1;">
        <h3>Foundational Pillars & Institutional Charter</h3>
        <div class="grid-2" style="font-size: 7.8pt;">
          <div>
            <strong>1. Preservation of Sacred Knowledge:</strong> Imparting classical Arabic sciences, Fiqh jurisprudence, and Hadith commentary under renowned scholars.<br><br>
            <strong>2. Total Orphan Sponsorship:</strong> Ensuring every admitted child receives dignity, parental affection, world-class healthcare, and life enablement.
          </div>
          <div>
            <strong>3. Social Harmony & Community Upliftment:</strong> Bridging community needs through educational scholarships, welfare outreach, and disaster relief.<br><br>
            <strong>4. Institutional Governance:</strong> Operating under registered Trust bylaws (Reg No: 326/IV/2019) with audited financial transparency.
          </div>
        </div>
      </div>
    </div>
    ${pageFooter(3)}
  </div>

  <!-- ================= PAGE 4: ACADEMIC WINGS & ORPHAN WELFARE ================= -->
  <div class="doc-page">
    ${pageHeader('1', 'INSTITUTIONAL PROFILE', 'Academic Wings & Orphan Care')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Academic Departments & Residential Sanctuary</h1>
          <p>Tahfeezul Qur'an, Research Academies, and the Dignified Orphan Welfare Wing</p>
        </div>
        <div class="sec-badge">CAMPUS COMPLEX</div>
      </div>

      <div class="grid-2">
        <div class="img-box" style="height: 48mm;">
          <img src="${campusGateUri}" alt="Entrance of Dalailul Khairath Complex" />
          <div class="img-caption">Grand Entrance Gate of Kakkidippuram Main Campus Complex</div>
        </div>

        <div class="card card-blue">
          <h3>Masjid Zainab & The Spiritual Core</h3>
          <p style="font-size: 8pt; text-align: justify; margin-bottom: 2mm;">
            At the epicenter of institutional life rises <strong>Masjid Zainab</strong>, a majestic architectural testament designed to accommodate hundreds of worshipers. It serves as both the spiritual reservoir for students and a community nucleus for regional believers.
          </p>
          <p style="font-size: 8pt; text-align: justify;">
            Adjoining the prayer hall is the <strong>Marhoom K. P. Moitheen Musliyar Memorial Hall</strong>, facilitating scholastic conferences, state-level seminars, and inter-collegiate debates.
          </p>
        </div>
      </div>

      <div class="grid-2" style="flex: 1;">
        <div class="card">
          <h3>Tahfeezul Qur'an Academy</h3>
          <div class="img-box" style="height: 32mm; margin-bottom: 2mm;">
            <img src="${student2Uri}" alt="Quran Students in Study Circle" />
          </div>
          <p style="font-size: 7.8pt; text-align: justify;">
            Operating as an accredited Qur'an Hub under Jamia Madeenathunnoor, the academy guides young students through precise Tajweed, memorization, and classical Qira'at under master Huffaz.
          </p>
        </div>

        <div class="card">
          <h3>Residential Orphan Welfare Home</h3>
          <div class="img-box" style="height: 32mm; margin-bottom: 2mm;">
            <img src="${student3Uri}" alt="Student Life and Care" />
          </div>
          <p style="font-size: 7.8pt; text-align: justify;">
            The residential wing provides comfortable living quarters, nutritious dietary regimens, modern hygiene amenities, sports facilities, and empathetic emotional guidance for orphaned children.
          </p>
        </div>
      </div>
    </div>
    ${pageFooter(4)}
  </div>

  <!-- ================= PAGE 5: ERP ECOSYSTEM ARCHITECTURE ================= -->
  <div class="doc-page">
    ${pageHeader('2', 'ERP SYSTEM ARCHITECTURE', 'Digital Ecosystem Overview')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>DALAIL FAMILY ERP: System Architecture</h1>
          <p>Cloud-native, role-segregated digital infrastructure uniting campuses and field squads</p>
        </div>
        <div class="sec-badge">SYSTEM INFRASTRUCTURE</div>
      </div>

      <div class="card card-dark" style="margin-bottom: 1mm;">
        <h3 style="color: #f7d9a0;">Why DALAIL FAMILY ERP Was Built</h3>
        <p style="font-size: 8pt; line-height: 1.5; text-align: justify;">
          Managing a multi-campus institution with hundreds of traveling student collection squads required moving beyond vulnerable physical receipt books and delayed postal remittances. <strong>DALAIL FAMILY ERP</strong> was engineered as a zero-latency, cloud-native platform providing instant digital WhatsApp receipts, cryptographic QR verification, dynamic leaderboard rankings, and tamper-proof financial settlements.
        </p>
      </div>

      <div class="grid-3">
        <div class="card card-blue">
          <h3>1. Public Experience</h3>
          <p style="font-size: 7.5pt;">
            Open to donors and patrons globally. Features live student/group leaderboards, verified YouTube media, campus profiles, and instant online receipt validation.
          </p>
        </div>
        <div class="card card-blue">
          <h3>2. Student Field Portal</h3>
          <p style="font-size: 7.5pt;">
            Mobile-optimized PWA for field representatives. Allows offline-ready donation receipt generation, assigned route maps, student ID cards, and collection histories.
          </p>
        </div>
        <div class="card card-blue">
          <h3>3. Campus Administration</h3>
          <p style="font-size: 7.5pt;">
            Dedicated regional command center. Campus Admins supervise squads, dispatch brochure kits, issue ID cards, verify cash/UPI handovers, and generate audit reports.
          </p>
        </div>
      </div>

      <div class="card" style="flex: 1;">
        <h3>Technical Ecosystem Blueprint</h3>
        <div class="grid-4" style="text-align: center; margin-top: 2mm;">
          <div style="background: #f1f5f9; padding: 2.5mm; border-radius: 6px; border: 1px solid #cbd5e1;">
            <div style="font-size: 11pt; font-weight: 900; color: #164a9b;">NEXT.JS 14</div>
            <div style="font-size: 6.8pt; color: #64748b; margin-top: 1mm;">React Server Components & High-Speed Edge Rendering</div>
          </div>
          <div style="background: #f1f5f9; padding: 2.5mm; border-radius: 6px; border: 1px solid #cbd5e1;">
            <div style="font-size: 11pt; font-weight: 900; color: #059669;">SECURE DB</div>
            <div style="font-size: 6.8pt; color: #64748b; margin-top: 1mm;">Cloud persistence with zero-loss local recovery caching</div>
          </div>
          <div style="background: #f1f5f9; padding: 2.5mm; border-radius: 6px; border: 1px solid #cbd5e1;">
            <div style="font-size: 11pt; font-weight: 900; color: #25d366;">WHATSAPP API</div>
            <div style="font-size: 6.8pt; color: #64748b; margin-top: 1mm;">Automated receipt delivery to donor phone numbers</div>
          </div>
          <div style="background: #f1f5f9; padding: 2.5mm; border-radius: 6px; border: 1px solid #cbd5e1;">
            <div style="font-size: 11pt; font-weight: 900; color: #d4af37;">PWA ENGINE</div>
            <div style="font-size: 6.8pt; color: #64748b; margin-top: 1mm;">Standalone Android installation without browser address bar</div>
          </div>
        </div>

        <div style="margin-top: 3mm; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 2.5mm; font-size: 7.5pt; color: #1e40af;">
          <strong>Data Security Guarantee:</strong> All personal donor records and financial collections are encrypted. Client-side role tampering is strictly blocked through authenticated server-side role verification.
        </div>
      </div>
    </div>
    ${pageFooter(5)}
  </div>

  <!-- ================= PAGE 6: PUBLIC WEBSITE OVERVIEW ================= -->
  <div class="doc-page">
    ${pageHeader('3', 'PUBLIC PORTAL', 'Website Architecture & Home Page')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Public Web Portal: dalail-family-erp.vercel.app</h1>
          <p>Global visitor gateway, institutional showcase, and interactive public information</p>
        </div>
        <div class="sec-badge">PUBLIC INTERFACE</div>
      </div>

      <div class="grid-2">
        <div class="card card-blue">
          <h3>Home Page Architecture & Purpose</h3>
          <p style="font-size: 8pt; text-align: justify; margin-bottom: 2mm;">
            The public portal represents the institutional face of Dalailul Khairath to the global diaspora. Designed with clean typography and prestigious Navy Blue and White aesthetics, it provides immediate transparency into foundation activities.
          </p>
          <ul style="margin: 0; padding-left: 15px; font-size: 7.8pt; color: #334155; line-height: 1.45;">
            <li><strong>Institutional Hero:</strong> Mission statement and direct portal entry buttons.</li>
            <li><strong>About Dalailul Khairath:</strong> Leadership profiles and historical roots.</li>
            <li><strong>YouTube Documentary:</strong> Dedicated story showcase.</li>
            <li><strong>Instagram Mockup Showcase:</strong> Verified live social feed.</li>
            <li><strong>Campus Highlights:</strong> Photographic tour of facilities.</li>
          </ul>
        </div>

        <div class="img-box" style="height: 52mm;">
          <img src="${shotHomeUri}" alt="Public Home Page Screenshot" />
          <div class="img-caption">Actual screenshot of Public Home Page (Desktop Resolution)</div>
        </div>
      </div>

      <div class="card" style="flex: 1;">
        <h3>Header Navigation & Key Public Destinations</h3>
        <table class="table-custom">
          <thead>
            <tr>
              <th style="width: 20%;">Navigation Link</th>
              <th style="width: 25%;">Destination URL</th>
              <th style="width: 55%;">Visitor Experience & Public Utility</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Home</strong></td>
              <td><code>/</code></td>
              <td>Complete institutional journey, documentary, social showcase, and overview.</td>
            </tr>
            <tr>
              <td><strong>Leaderboard</strong></td>
              <td><code>/leaderboard</code></td>
              <td>Live rankings of student collectors, groups, and campuses with Top 3 Podium.</td>
            </tr>
            <tr>
              <td><strong>Campuses</strong></td>
              <td><code>/campuses</code></td>
              <td>Directory of all regional affiliated campuses with leadership and contact info.</td>
            </tr>
            <tr>
              <td><strong>Help Desk</strong></td>
              <td><code>/helpdesk</code></td>
              <td>Raise support tickets, check status, read FAQs, and download this official guide.</td>
            </tr>
            <tr>
              <td><strong>My Portal</strong></td>
              <td><code>/login</code></td>
              <td>Secure unified authentication gateway for Students, Campus Admins, and Main Admin.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    ${pageFooter(6)}
  </div>

  <!-- ================= PAGE 7: YOUTUBE DOCUMENTARY SHOWCASE ================= -->
  <div class="doc-page">
    ${pageHeader('3', 'PUBLIC PORTAL', 'Featured YouTube Documentary')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Featured Video: "Watch Our Story"</h1>
          <p>Official institutional documentary film streaming via privacy-enhanced player</p>
        </div>
        <div class="sec-badge">MEDIA INTEGRATION</div>
      </div>

      <div class="card card-blue">
        <h3>Institutional Documentary Showcase</h3>
        <p style="font-size: 8pt; text-align: justify;">
          Prominently placed on the Public Home Page is the <strong>"Watch Our Story"</strong> documentary section, offering viewers an intimate audio-visual journey into the daily rhythm of Dalailul Khairath. It captures Quranic recitation sessions, inter-faith humanitarian food distribution, orphan dormitory life, and lectures by renowned Islamic savants.
        </p>
      </div>

      <div class="grid-2" style="flex: 1;">
        <div class="card">
          <h3>Video Configuration & Verified URL</h3>
          <div style="background: #0f172a; color: #ffffff; padding: 3mm; border-radius: 6px; font-family: monospace; font-size: 7.5pt; margin-bottom: 2mm;">
            <span style="color: #94a3b8;">// Official YouTube Video Source</span><br>
            <span style="color: #f7d9a0;">URL:</span> https://youtu.be/KjdFwGty0QY<br>
            <span style="color: #f7d9a0;">Video ID:</span> KjdFwGty0QY<br>
            <span style="color: #f7d9a0;">Player Mode:</span> youtube-nocookie.com (Privacy Safe)
          </div>
          <p style="font-size: 7.8pt; color: #475569; text-align: justify;">
            The video is embedded utilizing YouTube's privacy-enhanced mode, ensuring visitor data remains protected. It features a custom high-definition cover poster with a play button that avoids intrusive autoplay.
          </p>
        </div>

        <div class="card card-gold">
          <h3>Main Admin Video Controller</h3>
          <p style="font-size: 7.8pt; text-align: justify; margin-bottom: 2mm;">
            Authorized administrators can update the featured video dynamically from the Main Admin dashboard without editing source code:
          </p>
          <div class="step-item">
            <div class="step-num">1</div>
            <div class="step-content">
              <h4>Access Public Media Modal</h4>
              <p>Log in as Main Admin and click the [Public Media] button in the top action row.</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-num">2</div>
            <div class="step-content">
              <h4>Paste Any YouTube Link</h4>
              <p>Accepts standard links, youtu.be, Shorts, or embed URLs. Automatically extracts the 11-char ID.</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-num">3</div>
            <div class="step-content">
              <h4>Save & Live Deploy</h4>
              <p>Updates instantly reflect across all desktop and mobile visitor screens.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    ${pageFooter(7)}
  </div>

  <!-- ================= PAGE 8: INSTAGRAM SMARTPHONE SHOWCASE ================= -->
  <div class="doc-page">
    ${pageHeader('3', 'PUBLIC PORTAL', 'Official Instagram Profile Showcase')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Official Instagram Profile: @dalailul_khairath_</h1>
          <p>Live verified social media channel embedded in modern smartphone mockup</p>
        </div>
        <div class="sec-badge">SOCIAL CHANNEL</div>
      </div>

      <div class="grid-2" style="flex: 1;">
        <div class="card card-blue" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h3>Official Account Credentials</h3>
            <p style="font-size: 8pt; text-align: justify; margin-bottom: 3mm;">
              To protect our donors against fraudulent duplicate social profiles, the Public Home Page features an authentic smartphone mockup presenting the official verified Instagram account.
            </p>
            
            <table class="table-custom" style="margin-bottom: 3mm;">
              <tr><td><strong>Official Handle:</strong></td><td><code>@dalailul_khairath_</code></td></tr>
              <tr><td><strong>Profile Name:</strong></td><td>Dalailul Khairath</td></tr>
              <tr><td><strong>Verified Posts:</strong></td><td>340 Posts Published</td></tr>
              <tr><td><strong>Community:</strong></td><td>597 Followers &bull; 12 Following</td></tr>
              <tr><td><strong>Academic Hub:</strong></td><td>Qur'an Hub of @jamia_madeenathunnoor</td></tr>
              <tr><td><strong>Headquarters:</strong></td><td>Kakkidippuram, Malappuram Dt.</td></tr>
            </table>

            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 2.5mm; font-size: 7.5pt; color: #1e40af;">
              <strong>Official Direct URL:</strong><br>
              <a href="https://www.instagram.com/dalailul_khairath_/" style="color: #164a9b; font-weight: 700;">https://www.instagram.com/dalailul_khairath_/</a>
            </div>
          </div>

          <div style="margin-top: 3mm;">
            <span class="badge-pill bp-green">AUTHENTIC REFERENCE VERIFIED</span>
            <p style="font-size: 7.2pt; color: #64748b; margin-top: 1mm;">
              The adjacent smartphone frame displays the exact, uncropped, authentic mobile screen capture of the official Instagram account.
            </p>
          </div>
        </div>

        <div style="display: flex; justify-content: center; align-items: center;">
          <div style="width: 58mm; height: 130mm; background: #0f172a; border-radius: 20px; padding: 3px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 2.5px solid #334155;">
            <div style="width: 100%; height: 100%; border-radius: 16px; overflow: hidden; background: #000000;">
              <img src="${igScreenshotUri}" style="width: 100%; height: 100%; object-fit: contain;" alt="Exact Instagram Profile Screenshot" />
            </div>
          </div>
        </div>
      </div>
    </div>
    ${pageFooter(8)}
  </div>

  <!-- ================= PAGE 9: FIELD COLLECTION LEADERBOARD ================= -->
  <div class="doc-page">
    ${pageHeader('4', 'FIELD BENCHMARKING', 'Public Leaderboard & Top 3 Podium')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Public Field Leaderboard & Live Rankings</h1>
          <p>Real-time transparent ranking of student ambassadors, squads, and campus networks</p>
        </div>
        <div class="sec-badge">TRANSPARENCY HUB</div>
      </div>

      <div class="grid-2">
        <div class="card card-blue">
          <h3>The Spirit of Healthy Scholastic Race</h3>
          <p style="font-size: 8pt; text-align: justify; margin-bottom: 2mm;">
            Inspired by the Prophetic exhortation to compete in righteous works (<em>Fastabiqul Khairat</em>), the public leaderboard celebrates the tireless field dedication of our student collection squads across Kerala, Karnataka, and Tamil Nadu.
          </p>
          <ul style="margin: 0; padding-left: 15px; font-size: 7.8pt; color: #334155; line-height: 1.45;">
            <li><strong>Automated Aggregation:</strong> Computes directly from verified digital receipts.</li>
            <li><strong>Temporal Filters:</strong> Today, Weekly, Monthly, and Academic Year.</li>
            <li><strong>Triple View Modes:</strong> Individual Students, 5-Member Squads, and Campuses.</li>
          </ul>
        </div>

        <div class="img-box" style="height: 48mm;">
          <img src="${shotLeaderboardUri}" alt="Leaderboard Top 3 Podium Screenshot" />
          <div class="img-caption">Live Leaderboard displaying the Royal Blue Top 3 Podium</div>
        </div>
      </div>

      <div class="card" style="flex: 1;">
        <h3>Top 3 Podium Architecture & Ranking Badges</h3>
        <div class="grid-3" style="text-align: center; margin-top: 1mm;">
          <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 3mm;">
            <div style="font-size: 16pt; font-weight: 900; color: #64748b;">#2 SILVER</div>
            <div style="font-weight: 700; color: #0f172a; margin-top: 1mm;">Rank 2 Performer</div>
            <div style="font-size: 7.5pt; color: #059669; font-weight: 800;">₹62,199.58 Verified</div>
            <div style="font-size: 6.8pt; color: #64748b;">21 Successful Field Runs</div>
          </div>

          <div style="background: #fffdf5; border: 2px solid #d4af37; border-radius: 8px; padding: 3mm; box-shadow: 0 4px 10px rgba(212,175,55,0.15);">
            <div style="font-size: 18pt; font-weight: 900; color: #d4af37;">#1 GOLD</div>
            <div style="font-weight: 800; color: #0c2b64; margin-top: 1mm;">Grand Champion</div>
            <div style="font-size: 8.5pt; color: #059669; font-weight: 900;">₹84,550.00 Verified</div>
            <div style="font-size: 6.8pt; color: #64748b;">28 High-Volume Field Runs</div>
          </div>

          <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 3mm;">
            <div style="font-size: 16pt; font-weight: 900; color: #b45309;">#3 BRONZE</div>
            <div style="font-weight: 700; color: #0f172a; margin-top: 1mm;">Rank 3 Performer</div>
            <div style="font-size: 7.5pt; color: #059669; font-weight: 800;">₹54,750.58 Verified</div>
            <div style="font-size: 6.8pt; color: #64748b;">19 Successful Field Runs</div>
          </div>
        </div>

        <p style="font-size: 7.5pt; color: #64748b; margin-top: 2.5mm; text-align: justify;">
          Rankings update instantly upon receipt submission. Cash donations require Campus Admin verification before reflecting on the leaderboard, ensuring 100% financial veracity.
        </p>
      </div>
    </div>
    ${pageFooter(9)}
  </div>

  <!-- ================= PAGE 10: CAMPUS DIRECTORY & REGIONAL NETWORK ================= -->
  <div class="doc-page">
    ${pageHeader('4', 'CAMPUS DIRECTORY', 'Multi-Campus Institutional Network')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Regional Campus Network & Affiliates</h1>
          <p>Decentralized centers of learning supervised under the central Kakkidippuram Trust</p>
        </div>
        <div class="sec-badge">REGIONAL DESKS</div>
      </div>

      <div class="grid-2">
        <div class="img-box" style="height: 48mm;">
          <img src="${shotCampusesUri}" alt="Campuses Directory Screenshot" />
          <div class="img-caption">Public Campuses Directory (/campuses) with detail cards</div>
        </div>

        <div class="card card-blue">
          <h3>Decentralized Campus Governance</h3>
          <p style="font-size: 8pt; text-align: justify; margin-bottom: 2mm;">
            The foundation operates across specialized regional centers, each catering to specific community demographics while adhering strictly to unified curriculum guidelines, spiritual codes, and financial accountability.
          </p>
          <p style="font-size: 8pt; text-align: justify;">
            Visitors can click any campus card on the public website to inspect its infrastructure, assigned rector, student strength, and dedicated contact channels.
          </p>
        </div>
      </div>

      <div class="card" style="flex: 1;">
        <h3>Official Campus Registry & Directory</h3>
        <table class="table-custom">
          <thead>
            <tr>
              <th>Campus Code</th>
              <th>Campus Name</th>
              <th>Geographic Location</th>
              <th>Key Focus</th>
              <th>Active Students</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="badge-pill bp-blue">KAK01</span></td>
              <td><strong>Kakkidippuram Main Campus</strong></td>
              <td>P.O. Alamkode, Malappuram Dt.</td>
              <td>Central Dars, Tahfeez, Orphan Care</td>
              <td>100 Scholars</td>
            </tr>
            <tr>
              <td><span class="badge-pill bp-green">NIL02</span></td>
              <td><strong>Nilambur Valley Center</strong></td>
              <td>Nilambur, Malappuram Dt.</td>
              <td>Secondary Hifz & Community Dawa</td>
              <td>45 Scholars</td>
            </tr>
            <tr>
              <td><span class="badge-pill bp-amber">WAY03</span></td>
              <td><strong>Wayanad Highlands Campus</strong></td>
              <td>Mananthavady, Wayanad Dt.</td>
              <td>Tribal Outreach & Residential Hifz</td>
              <td>35 Scholars</td>
            </tr>
            <tr>
              <td><span class="badge-pill bp-purple">KOZ04</span></td>
              <td><strong>Kozhikode City Wing</strong></td>
              <td>Medical College Rd, Kozhikode</td>
              <td>Higher Islamic Research & Public Relations</td>
              <td>20 Scholars</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    ${pageFooter(10)}
  </div>

  <!-- ================= PAGE 11: PUBLIC VERIFICATION ENGINE ================= -->
  <div class="doc-page">
    ${pageHeader('5', 'PUBLIC VERIFICATION', 'Cryptographic QR & Identity Validation')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Public Verification Engine: Zero Fraud Safeguard</h1>
          <p>Instant QR validation for donor receipts and official student representative ID cards</p>
        </div>
        <div class="sec-badge">SECURITY PROTOCOL</div>
      </div>

      <div class="grid-2">
        <div class="card card-blue">
          <h3>Receipt Verification Engine</h3>
          <p style="font-size: 8pt; text-align: justify; margin-bottom: 2mm;">
            Every single donation receipt generated by DALAIL FAMILY ERP contains an encrypted QR code and unique alphanumeric ID (e.g., <code>REC-2026-0042</code>). Scanning the QR code takes the donor directly to:
          </p>
          <div style="background: #f1f5f9; padding: 2mm; border-radius: 4px; font-family: monospace; font-size: 7.5pt; color: #164a9b; margin-bottom: 2mm;">
            https://dalail-family-erp.vercel.app/verify/receipt/[id]
          </div>
          <p style="font-size: 7.8pt; color: #475569; text-align: justify;">
            The page displays verified donor name, amount, date/time stamp, receiving student identity, official digital seal, and signature. Tampered receipts fail instantly.
          </p>
        </div>

        <div class="img-box" style="height: 52mm;">
          <img src="${shotReceiptVerifyUri}" alt="Receipt Verification Screenshot" />
          <div class="img-caption">Public Receipt Verification page confirming genuine transaction</div>
        </div>
      </div>

      <div class="card card-gold" style="flex: 1;">
        <h3>Student Identity Card Verification (/verify/id/[id])</h3>
        <div class="grid-2" style="font-size: 7.8pt;">
          <div>
            <p style="text-align: justify; margin-bottom: 2mm;">
              Donors approached by field workers can scan the QR code printed on the student's chest badge. The public portal instantly verifies:
            </p>
            <ul style="margin: 0; padding-left: 15px; line-height: 1.45;">
              <li>Full official student name and photograph.</li>
              <li>Active registration status and campus affiliation.</li>
              <li>Official authorization letter and campus helpline number.</li>
            </ul>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 2.5mm;">
            <strong style="color: #0c2b64;">Anti-Impersonation Warning:</strong><br>
            <span style="font-size: 7.2pt; color: #64748b;">
              Never hand over cash or donations to any representative whose ID card fails digital QR verification on <code>dalail-family-erp.vercel.app</code>. Report suspicious activity immediately to our official Help Desk helpline.
            </span>
          </div>
        </div>
      </div>
    </div>
    ${pageFooter(11)}
  </div>

  <!-- ================= PAGE 12: UNIFIED AUTHENTICATION & LOGIN ================= -->
  <div class="doc-page">
    ${pageHeader('6', 'ACCESS CONTROL', 'Unified Authentication & Auto Role Redirection')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Unified Authentication Gateway (/login)</h1>
          <p>Seamless sign-in with server-side role resolution and WhatsApp password recovery</p>
        </div>
        <div class="sec-badge">SECURITY ARCHITECTURE</div>
      </div>

      <div class="grid-2">
        <div class="img-box" style="height: 50mm;">
          <img src="${shotLoginUri}" alt="Unified Login Portal Screenshot" />
          <div class="img-caption">Streamlined Login Interface with automated credential routing</div>
        </div>

        <div class="card card-blue">
          <h3>Single Login Interface (Zero Manual Role Pickers)</h3>
          <p style="font-size: 8pt; text-align: justify; margin-bottom: 2mm;">
            In strict compliance with modern cybersecurity protocols, manual role buttons (Main Admin / Campus Admin / Student) have been eliminated. Users enter only:
          </p>
          <ul style="margin: 0; padding-left: 15px; font-size: 7.8pt; color: #334155; line-height: 1.45;">
            <li><strong>Identifier:</strong> Username, Student ID, or Registered Mobile Number.</li>
            <li><strong>Password:</strong> Secure encrypted credential.</li>
          </ul>
          <p style="font-size: 7.8pt; color: #475569; margin-top: 2mm; text-align: justify;">
            Upon authentication, the server securely determines the user's role and immediately redirects them to their authorized dashboard.
          </p>
        </div>
      </div>

      <div class="card" style="flex: 1;">
        <h3>Automatic Role Redirection Matrix</h3>
        <table class="table-custom">
          <thead>
            <tr>
              <th>Authenticated Role</th>
              <th>Target Destination</th>
              <th>Access Permissions & Restrictions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="badge-pill bp-amber">MAIN ADMIN</span></td>
              <td><code>/admin</code></td>
              <td>Statewide campus governance, financial audits, dispatches, public media controls.</td>
            </tr>
            <tr>
              <td><span class="badge-pill bp-blue">CAMPUS ADMIN</span></td>
              <td><code>/campus-admin</code></td>
              <td>Strictly isolated to assigned campus. Student directory, squads, local dispatches.</td>
            </tr>
            <tr>
              <td><span class="badge-pill bp-green">STUDENT</span></td>
              <td><code>/student</code></td>
              <td>Field route, receipt generation, student ID card, personal collection history.</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 2.5mm; background: #fffdf5; border: 1px solid #fde68a; border-radius: 6px; padding: 2.5mm;">
          <strong style="color: #92400e; font-size: 7.8pt;">WhatsApp Password Recovery Protocol:</strong>
          <p style="font-size: 7.2pt; color: #78350f; margin: 1px 0 0 0;">
            Users who forget their credentials click <em>"Forgot Password"</em>. The system verifies their registered phone number and automatically dispatches a secure reset link from our verified official WhatsApp sender: <strong>+91 8547931509</strong>.
          </p>
        </div>
      </div>
    </div>
    ${pageFooter(12)}
  </div>

  <!-- ================= PAGE 13: STUDENT PORTAL PROFILE & IDENTITY ================= -->
  <div class="doc-page">
    ${pageHeader('7', 'STUDENT MANUAL', 'Field Work Portal & Identity')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Student Field Work Portal (/student)</h1>
          <p>Mobile command center, field profile card, and official student credentials</p>
        </div>
        <div class="sec-badge">STUDENT WORKSPACE</div>
      </div>

      <div class="grid-2">
        <div class="card card-blue">
          <h3>Student Profile Overview</h3>
          <p style="font-size: 8pt; text-align: justify; margin-bottom: 2mm;">
            The Student Portal serves as the primary field workstation for traveling ambassadors. Upon logging in, the student is greeted by their personalized profile banner presenting:
          </p>
          <ul style="margin: 0; padding-left: 15px; font-size: 7.8pt; color: #334155; line-height: 1.45;">
            <li>Full official student name and portrait photograph.</li>
            <li>Student ID code (e.g., <code>STU2026-014</code>) and campus association.</li>
            <li>Assigned 5-member collection squad name and leader.</li>
            <li>Active field route target mahall / municipality.</li>
          </ul>
        </div>

        <div class="img-box" style="height: 50mm;">
          <img src="${shotStudentPortalUri}" alt="Student Portal Dashboard Screenshot" />
          <div class="img-caption">Student Field Portal showing redesigned Profile Card and metrics</div>
        </div>
      </div>

      <div class="card" style="flex: 1;">
        <h3>Header Action Bar & Digital Student ID Card</h3>
        <div class="grid-3" style="margin-top: 1mm;">
          <div class="card card-blue">
            <h4 style="margin: 0 0 1mm 0; font-size: 8pt; color: #0c2b64;">[ID Card] Button</h4>
            <p style="font-size: 7.2pt;">Instantly displays the official double-sided digital student badge with QR code, seal, and validity stamp.</p>
          </div>
          <div class="card card-blue">
            <h4 style="margin: 0 0 1mm 0; font-size: 8pt; color: #0c2b64;">[Folder] Button</h4>
            <p style="font-size: 7.2pt;">Accesses assigned digital brochures in English, Kannada, and Urdu for immediate presentation to donors.</p>
          </div>
          <div class="card card-blue">
            <h4 style="margin: 0 0 1mm 0; font-size: 8pt; color: #0c2b64;">[Refresh] Button</h4>
            <p style="font-size: 7.2pt;">Synchronizes offline cached collections with the cloud database upon reconnecting to cellular networks.</p>
          </div>
        </div>

        <div style="margin-top: 3mm; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 2.5mm; font-size: 7.5pt; color: #1e40af;">
          <strong>Field Etiquette Rule:</strong> Every student must present their official digital ID card or physical badge to the household elder or donor prior to requesting donations.
        </div>
      </div>
    </div>
    ${pageFooter(13)}
  </div>

  <!-- ================= PAGE 14: TODAY'S FIELD ROUTE ================= -->
  <div class="doc-page">
    ${pageHeader('7', 'STUDENT MANUAL', 'Assigned Route & Area Operations')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Today's Field Route & Territory Allotment</h1>
          <p>Coordinated travel assignments, residential units, and squad coordination</p>
        </div>
        <div class="sec-badge">FIELD LOGISTICS</div>
      </div>

      <div class="card card-blue">
        <h3>Territory Allotment & Squad Dispatch</h3>
        <p style="font-size: 8pt; text-align: justify;">
          To prevent overlapping visits and ensure exhaustive regional coverage, field territories are allotted centrally by Campus Admins. Students view their active route directly on their mobile dashboard under <strong>"Today's Field Route"</strong>.
        </p>
      </div>

      <div class="grid-2" style="flex: 1;">
        <div class="card">
          <h3>Field Route Data Structure</h3>
          <table class="table-custom" style="margin-bottom: 2mm;">
            <tr><td><strong>Target Zone:</strong></td><td>Zone B - Tirur Coastal Sector</td></tr>
            <tr><td><strong>Assigned Mahall:</strong></td><td>Thanalur Juma Masjid Mahall</td></tr>
            <tr><td><strong>Allotted Units:</strong></td><td>120 Residential Units & 35 Shops</td></tr>
            <tr><td><strong>Brochure Allocation:</strong></td><td>50 English / 150 Malayalam Kits</td></tr>
            <tr><td><strong>Supervisor Contact:</strong></td><td>Usthad Abdul Ghafoor (+91 94471 23456)</td></tr>
            <tr><td><strong>Emergency Desk:</strong></td><td>Main Campus HQ (0494 246810)</td></tr>
          </table>
          <p style="font-size: 7.2pt; color: #64748b;">
            Students must check in with the local Mahall committee secretary prior to beginning collections.
          </p>
        </div>

        <div class="card card-gold">
          <h3>Daily Route Execution Checklist</h3>
          <div class="step-item">
            <div class="step-num">1</div>
            <div class="step-content">
              <h4>Morning Squad Assembly</h4>
              <p>Gather at 8:30 AM with squad leader; verify receipt books, ID cards, and brochures.</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-num">2</div>
            <div class="step-content">
              <h4>Check Assigned Route in ERP</h4>
              <p>Open <code>/student</code> on Android mobile; verify assigned zone boundaries.</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-num">3</div>
            <div class="step-content">
              <h4>Mark Route as "In Progress"</h4>
              <p>Toggle route status in portal so Campus Admin knows squad is actively deployed.</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-num">4</div>
            <div class="step-content">
              <h4>Evening Settlement Sign-Off</h4>
              <p>Submit daily collections to squad leader and mark route "Completed".</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    ${pageFooter(14)}
  </div>

  <!-- ================= PAGE 15: STEP-BY-STEP DONATION PROCESS ================= -->
  <div class="doc-page">
    ${pageHeader('7', 'STUDENT MANUAL', 'Step-by-Step Collection Process')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Step-by-Step Donation Collection Workflow</h1>
          <p>Standard operating procedure for issuing instant digital receipts in the field</p>
        </div>
        <div class="sec-badge">OPERATIONAL WORKFLOW</div>
      </div>

      <div class="grid-2" style="margin-bottom: 1mm;">
        <div class="card card-blue">
          <h3>Step 1: Enter Donor Information</h3>
          <p style="font-size: 7.8pt; text-align: justify; margin-bottom: 2mm;">
            Open the <strong>"New Collection Entry"</strong> card on the Student Portal. Fill in donor details accurately:
          </p>
          <ul style="margin: 0; padding-left: 15px; font-size: 7.5pt; color: #334155; line-height: 1.4;">
            <li><strong>Donor Name:</strong> Full formal name for receipt generation.</li>
            <li><strong>Mobile / WhatsApp:</strong> 10-digit number for automatic receipt SMS/WhatsApp.</li>
            <li><strong>Locality / Address:</strong> City, house name, or mahall area.</li>
          </ul>
        </div>

        <div class="card card-blue">
          <h3>Step 2: Purpose & Amount Category</h3>
          <p style="font-size: 7.8pt; text-align: justify; margin-bottom: 2mm;">
            Select the designated institutional fund:
          </p>
          <div class="grid-2" style="font-size: 7.2pt;">
            <div style="background: #ffffff; padding: 1.5mm; border: 1px solid #e2e8f0; border-radius: 4px;">
              <strong>General Donation</strong><br>Campus maintenance & Dars
            </div>
            <div style="background: #ffffff; padding: 1.5mm; border: 1px solid #e2e8f0; border-radius: 4px;">
              <strong>Orphan Sponsorship</strong><br>Food, clothing & schooling
            </div>
            <div style="background: #ffffff; padding: 1.5mm; border: 1px solid #e2e8f0; border-radius: 4px;">
              <strong>Building Complex</strong><br>Masjid Zainab construction
            </div>
            <div style="background: #ffffff; padding: 1.5mm; border: 1px solid #e2e8f0; border-radius: 4px;">
              <strong>Zakat & Sadaqah</strong><br>Sharia-compliant welfare
            </div>
          </div>
        </div>
      </div>

      <div class="grid-2" style="flex: 1;">
        <div class="card card-gold">
          <h3>Step 3: Payment Method & Verification</h3>
          <p style="font-size: 7.8pt; text-align: justify; margin-bottom: 2mm;">
            Specify the exact transaction mode received:
          </p>
          <div class="step-item">
            <div class="step-num">A</div>
            <div class="step-content">
              <h4>UPI / Google Pay / PhonePe</h4>
              <p>Scan official Dalail QR. Enter transaction UTR number into the ERP field.</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-num">B</div>
            <div class="step-content">
              <h4>Direct Cash Handover</h4>
              <p>Count physical notes carefully. Store in sealed foundation security pouch.</p>
            </div>
          </div>
        </div>

        <div class="card card-dark">
          <h3 style="color: #f7d9a0;">Step 4: Submission & Receipt Delivery</h3>
          <p style="font-size: 7.8pt; text-align: justify; color: #cbd5e1; margin-bottom: 2mm;">
            Tap the large blue <strong>"Generate & Send Digital Receipt"</strong> button:
          </p>
          <ul style="margin: 0; padding-left: 15px; font-size: 7.5pt; color: #cbd5e1; line-height: 1.45;">
            <li>Cryptographic receipt ID is generated instantly.</li>
            <li>Automated WhatsApp message is dispatched to donor.</li>
            <li>Student collection total updates on personal dashboard.</li>
            <li>Entry synchronizes with Campus Admin audit queue.</li>
          </ul>
        </div>
      </div>
    </div>
    ${pageFooter(15)}
  </div>

  <!-- ================= PAGE 16: WHATSAPP RECEIPT DISPATCH ================= -->
  <div class="doc-page">
    ${pageHeader('7', 'STUDENT MANUAL', 'Instant WhatsApp Receipt Delivery')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Automated WhatsApp Receipt Delivery</h1>
          <p>Zero-paper digital delivery protocol directly to the donor's mobile phone</p>
        </div>
        <div class="sec-badge">WHATSAPP INTEGRATION</div>
      </div>

      <div class="grid-2">
        <div class="card card-blue">
          <h3>The Digital Receipt Architecture</h3>
          <p style="font-size: 8pt; text-align: justify; margin-bottom: 2mm;">
            To eliminate printing waste and prevent receipt loss, DALAIL FAMILY ERP integrates directly with the WhatsApp Business Cloud API. Seconds after the student confirms the donation, the donor receives a formal message containing:
          </p>
          <ul style="margin: 0; padding-left: 15px; font-size: 7.8pt; color: #334155; line-height: 1.45;">
            <li>Institutional header with registered Trust number.</li>
            <li>Donor name, amount received, and selected fund category.</li>
            <li>Receiving student's name and authorized campus.</li>
            <li>Direct clickable verification link to the official web portal.</li>
          </ul>
        </div>

        <div class="card card-gold">
          <h3>Official WhatsApp Sender Profile</h3>
          <table class="table-custom" style="margin-bottom: 2mm;">
            <tr><td><strong>Official Sender:</strong></td><td><strong>+91 8547931509</strong></td></tr>
            <tr><td><strong>Backup Sender:</strong></td><td>+91 70341 49149</td></tr>
            <tr><td><strong>Delivery Status:</strong></td><td>Real-time Webhook Confirmation</td></tr>
            <tr><td><strong>Language:</strong></td><td>English & Malayalam dual templates</td></tr>
          </table>
          <p style="font-size: 7.2pt; color: #78350f;">
            Donors without WhatsApp receive an instant SMS transaction confirmation with verification URL.
          </p>
        </div>
      </div>

      <div class="card" style="flex: 1;">
        <h3>Sample WhatsApp Receipt Message Template</h3>
        <div style="background: #eef8f2; border: 1.5px solid #86efac; border-radius: 8px; padding: 3.5mm; font-family: monospace; font-size: 7.6pt; color: #14532d; line-height: 1.5;">
          <strong>DALAILUL KHAIRATH ISLAMIC FOUNDATION (REGD.)</strong><br>
          <em>Kakkidippuram, Malappuram Dt., Kerala - 679585</em><br>
          --------------------------------------------------<br>
          Assalamu Alaikum wa Rahmatullah,<br>
          Respected <strong>Ahmad Kunhi</strong>, thank you for your generous contribution of <strong>₹2,500.00</strong> toward <strong>Orphan Sponsorship Fund</strong>.<br><br>
          &bull; <strong>Receipt ID:</strong> REC-2026-0482<br>
          &bull; <strong>Date:</strong> 15 Nov 2026, 02:45 PM<br>
          &bull; <strong>Collected By:</strong> Basim Aslam (STU2026-014)<br>
          &bull; <strong>Campus:</strong> Kakkidippuram Main Campus<br><br>
          Verify your official signed digital receipt online:<br>
          <a href="https://dalail-family-erp.vercel.app/verify/receipt/REC-2026-0482" style="color: #166534; font-weight: 700;">https://dalail-family-erp.vercel.app/verify/receipt/REC-2026-0482</a><br><br>
          May Allah accept your noble contribution and grant barakah.
        </div>
      </div>
    </div>
    ${pageFooter(16)}
  </div>

  <!-- ================= PAGE 17: COLLECTION HISTORY & SETTLEMENT ================= -->
  <div class="doc-page">
    ${pageHeader('7', 'STUDENT MANUAL', 'History Logs & Daily Settlement')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Collection History & Daily Handover Settlement</h1>
          <p>Personal audit ledger, transaction search, and evening squad reconciliation</p>
        </div>
        <div class="sec-badge">FINANCIAL RECONCILIATION</div>
      </div>

      <div class="grid-2">
        <div class="card card-blue">
          <h3>Personal Collection Ledger</h3>
          <p style="font-size: 8pt; text-align: justify; margin-bottom: 2mm;">
            Every student maintains an immutable personal transaction log under the <strong>"Collection History"</strong> tab. This ledger allows:
          </p>
          <ul style="margin: 0; padding-left: 15px; font-size: 7.8pt; color: #334155; line-height: 1.45;">
            <li>Instant search by donor name, phone number, or receipt ID.</li>
            <li>One-tap re-dispatch of receipts via WhatsApp if donor didn't receive.</li>
            <li>Summary breakdowns of cash collected versus UPI payments.</li>
          </ul>
        </div>

        <div class="card card-gold">
          <h3>Evening Cash Handover Procedure</h3>
          <div class="step-item">
            <div class="step-num">1</div>
            <div class="step-content">
              <h4>Generate Daily Summary in Portal</h4>
              <p>Tap "Settle Today's Collection" on the student dashboard.</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-num">2</div>
            <div class="step-content">
              <h4>Physical Cash Handover</h4>
              <p>Count cash notes together with the assigned 5-member squad leader.</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-num">3</div>
            <div class="step-content">
              <h4>Squad Leader Sign-Off</h4>
              <p>Squad leader confirms receipt in their portal, updating the campus ledger.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card" style="flex: 1;">
        <h3>Sample Student Daily Reconciliation Table</h3>
        <table class="table-custom">
          <thead>
            <tr>
              <th>Receipt ID</th>
              <th>Donor Name</th>
              <th>Category</th>
              <th>Payment Mode</th>
              <th>Amount</th>
              <th>Settlement Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>REC-2026-0480</code></td>
              <td>Muhammed Mustafa</td>
              <td>General Dars Fund</td>
              <td><span class="badge-pill bp-green">UPI / GPay</span></td>
              <td>₹1,000.00</td>
              <td><span class="badge-pill bp-green">Verified Bank Direct</span></td>
            </tr>
            <tr>
              <td><code>REC-2026-0481</code></td>
              <td>Ibrahim Haji</td>
              <td>Building Complex</td>
              <td><span class="badge-pill bp-amber">Cash Handover</span></td>
              <td>₹5,000.00</td>
              <td><span class="badge-pill bp-amber">Awaiting Squad Sign-off</span></td>
            </tr>
            <tr>
              <td><code>REC-2026-0482</code></td>
              <td>Ahmad Kunhi</td>
              <td>Orphan Care</td>
              <td><span class="badge-pill bp-green">UPI / PhonePe</span></td>
              <td>₹2,500.00</td>
              <td><span class="badge-pill bp-green">Verified Bank Direct</span></td>
            </tr>
            <tr>
              <td><code>REC-2026-0483</code></td>
              <td>K. M. Abdulla</td>
              <td>Zakat Fund</td>
              <td><span class="badge-pill bp-amber">Cash Handover</span></td>
              <td>₹3,000.00</td>
              <td><span class="badge-pill bp-amber">Awaiting Squad Sign-off</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    ${pageFooter(17)}
  </div>

  <!-- ================= PAGE 18: CAMPUS ADMIN DASHBOARD ================= -->
  <div class="doc-page">
    ${pageHeader('8', 'CAMPUS ADMIN MANUAL', 'Regional Command Dashboard')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Campus Admin Dashboard (/campus-admin)</h1>
          <p>Autonomous regional command center with strict multi-tenant data isolation</p>
        </div>
        <div class="sec-badge">CAMPUS ADMINISTRATION</div>
      </div>

      <div class="grid-2">
        <div class="card card-blue">
          <h3>Campus-Specific Isolation & Security</h3>
          <p style="font-size: 8pt; text-align: justify; margin-bottom: 2mm;">
            Campus Admins oversee regional operational logistics. To maintain privacy and focused accountability, Campus Admins access <strong>strictly their own campus data</strong>:
          </p>
          <ul style="margin: 0; padding-left: 15px; font-size: 7.8pt; color: #334155; line-height: 1.45;">
            <li>Zero cross-campus data leakage; permissions strictly enforced.</li>
            <li>No Main Admin menu distractions or role-switch toggles.</li>
            <li>Live campus collection statistics and squad rankings.</li>
          </ul>
        </div>

        <div class="img-box" style="height: 50mm;">
          <img src="${shotCampusAdminUri}" alt="Campus Admin Dashboard Screenshot" />
          <div class="img-caption">Campus Admin Executive Overview displaying metrics and active squads</div>
        </div>
      </div>

      <div class="card" style="flex: 1;">
        <h3>Executive Metric KPIs on Campus Dashboard</h3>
        <div class="grid-4" style="text-align: center; margin-top: 1mm;">
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 2.5mm;">
            <div style="font-size: 7pt; color: #64748b; font-weight: 700;">TOTAL CAMPUS RUNS</div>
            <div style="font-size: 14pt; font-weight: 900; color: #0c2b64; margin-top: 1mm;">100 Scholars</div>
            <div style="font-size: 6.5pt; color: #059669; font-weight: 700;">Active in Field</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 2.5mm;">
            <div style="font-size: 7pt; color: #64748b; font-weight: 700;">ACTIVE SQUADS</div>
            <div style="font-size: 14pt; font-weight: 900; color: #164a9b; margin-top: 1mm;">20 Teams</div>
            <div style="font-size: 6.5pt; color: #164a9b; font-weight: 700;">5 Members / Team</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 2.5mm;">
            <div style="font-size: 7pt; color: #64748b; font-weight: 700;">TOTAL VERIFIED</div>
            <div style="font-size: 14pt; font-weight: 900; color: #059669; margin-top: 1mm;">₹2,50,997</div>
            <div style="font-size: 6.5pt; color: #059669; font-weight: 700;">Audited Collections</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 2.5mm;">
            <div style="font-size: 7pt; color: #64748b; font-weight: 700;">BROCHURE KITS</div>
            <div style="font-size: 14pt; font-weight: 900; color: #d4af37; margin-top: 1mm;">2,450 Stock</div>
            <div style="font-size: 6.5pt; color: #b45309; font-weight: 700;">Dispatched to Teams</div>
          </div>
        </div>
      </div>
    </div>
    ${pageFooter(18)}
  </div>

  <!-- ================= PAGE 19: STUDENT & MEMBER MANAGEMENT ================= -->
  <div class="doc-page">
    ${pageHeader('8', 'CAMPUS ADMIN MANUAL', 'Student Roster & ID Card Issuance')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Student Directory & ID Card Issuance</h1>
          <p>Member registration, credential assignment, and batch ID card generation</p>
        </div>
        <div class="sec-badge">MEMBERSHIP DESK</div>
      </div>

      <div class="grid-2">
        <div class="card card-blue">
          <h3>Managing Campus Student Records</h3>
          <p style="font-size: 8pt; text-align: justify; margin-bottom: 2mm;">
            Under <code>/campus-admin/members</code>, Campus Admins manage their student cadre. Operations include:
          </p>
          <ul style="margin: 0; padding-left: 15px; font-size: 7.8pt; color: #334155; line-height: 1.45;">
            <li><strong>Add New Student:</strong> Enter full name, mobile, photo, and assign Student ID.</li>
            <li><strong>Assign Squad:</strong> Place student in one of the 5-member regional squads.</li>
            <li><strong>Credential Dispatch:</strong> Send initial login details via WhatsApp.</li>
            <li><strong>Status Toggle:</strong> Temporarily deactivate students who return to campus.</li>
          </ul>
        </div>

        <div class="img-box" style="height: 50mm;">
          <img src="${shotMembersUri}" alt="Student Directory Screenshot" />
          <div class="img-caption">Student Member Directory (/campus-admin/members)</div>
        </div>
      </div>

      <div class="card card-gold" style="flex: 1;">
        <h3>Batch ID Card Generation & Printing</h3>
        <p style="font-size: 7.8pt; text-align: justify; margin-bottom: 2mm;">
          Every student representative must carry an authorized identification badge before field deployment. Campus Admins generate badges with one click:
        </p>
        <div class="grid-3" style="font-size: 7.5pt;">
          <div style="background: #ffffff; padding: 2mm; border: 1px solid #e2e8f0; border-radius: 4px;">
            <strong>1. Select Students</strong><br>Check individual boxes or tap <em>"Select All Active"</em>.
          </div>
          <div style="background: #ffffff; padding: 2mm; border: 1px solid #e2e8f0; border-radius: 4px;">
            <strong>2. Render A4 Print Grid</strong><br>Generates high-resolution PDF layout (8 cards per sheet).
          </div>
          <div style="background: #ffffff; padding: 2mm; border: 1px solid #e2e8f0; border-radius: 4px;">
            <strong>3. QR Code Cryptography</strong><br>Binds student ID with instant public verification URL.
          </div>
        </div>
      </div>
    </div>
    ${pageFooter(19)}
  </div>

  <!-- ================= PAGE 20: SQUADS & GROUP MANAGEMENT ================= -->
  <div class="doc-page">
    ${pageHeader('8', 'CAMPUS ADMIN MANUAL', 'Squad Formation & Zone Allocation')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Squad Formation & Group Management</h1>
          <p>Structuring 5-member field teams, assigning squad leaders, and quota tracking</p>
        </div>
        <div class="sec-badge">SQUAD DYNAMICS</div>
      </div>

      <div class="grid-2">
        <div class="img-box" style="height: 50mm;">
          <img src="${shotGroupsUri}" alt="Group Management Screenshot" />
          <div class="img-caption">Campus Squad Management Portal (/campus-admin/groups)</div>
        </div>

        <div class="card card-blue">
          <h3>The 5-Member Squad Philosophy</h3>
          <p style="font-size: 8pt; text-align: justify; margin-bottom: 2mm;">
            Field operations are organized strictly into 5-member teams known as <strong>Collection Squads</strong>. This structure guarantees:
          </p>
          <ul style="margin: 0; padding-left: 15px; font-size: 7.8pt; color: #334155; line-height: 1.45;">
            <li><strong>Peer Mentorship:</strong> Junior students paired with senior scholars.</li>
            <li><strong>Safety & Accountability:</strong> Students never travel alone in assigned sectors.</li>
            <li><strong>Unified Target:</strong> Squad leaders coordinate daily route checkpoints.</li>
          </ul>
        </div>
      </div>

      <div class="card" style="flex: 1;">
        <h3>Sample Active Squad Hierarchy & Leadership</h3>
        <table class="table-custom">
          <thead>
            <tr>
              <th>Squad Name</th>
              <th>Assigned Leader</th>
              <th>Member Cadre</th>
              <th>Target Sector</th>
              <th>Group Target</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Wayanad Focus Team 2K26</strong></td>
              <td>Abdul Gafoor</td>
              <td>5 Active Students</td>
              <td>Mananthavady & Panamaram</td>
              <td>₹2,50,000</td>
            </tr>
            <tr>
              <td><strong>Tirur Coastal Vanguard</strong></td>
              <td>Muhammed Salih</td>
              <td>5 Active Students</td>
              <td>Tirur, Tanur & Parappanangadi</td>
              <td>₹3,00,000</td>
            </tr>
            <tr>
              <td><strong>Nilambur Valley Squad</strong></td>
              <td>Arshad Ayyoob</td>
              <td>5 Active Students</td>
              <td>Nilambur, Edakkara & Wandoor</td>
              <td>₹2,00,000</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    ${pageFooter(20)}
  </div>

  <!-- ================= PAGE 21: DISPATCHES & MATERIAL INVENTORY ================= -->
  <div class="doc-page">
    ${pageHeader('8', 'CAMPUS ADMIN MANUAL', 'Dispatches & Material Inventory')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Dispatches & Physical Material Logistics</h1>
          <p>Receipt books, multilingual brochure stock, collection pouches, and consignment tracking</p>
        </div>
        <div class="sec-badge">LOGISTICS & STOCK</div>
      </div>

      <div class="grid-2">
        <div class="card card-blue">
          <h3>Consignment Receipt & Verification</h3>
          <p style="font-size: 8pt; text-align: justify; margin-bottom: 2mm;">
            Main Admin HQ dispatches physical materials to regional campuses prior to campaign launches. Campus Admins manage stock under <code>/campus-admin/dispatches</code>:
          </p>
          <ul style="margin: 0; padding-left: 15px; font-size: 7.8pt; color: #334155; line-height: 1.45;">
            <li><strong>Receipt Book Allotment:</strong> Track serial numbers (e.g., Series D-1000 to D-2500).</li>
            <li><strong>Multilingual Brochures:</strong> English, Kannada, and Urdu information booklets.</li>
            <li><strong>Consignment Sign-Off:</strong> Confirm delivery condition in the cloud portal.</li>
          </ul>
        </div>

        <div class="img-box" style="height: 50mm;">
          <img src="${shotDispatchesUri}" alt="Dispatches Interface Screenshot" />
          <div class="img-caption">Dispatches Management Portal showing consignments and status</div>
        </div>
      </div>

      <div class="card card-gold" style="flex: 1;">
        <h3>Material Kit Standard Allocation per Squad</h3>
        <div class="grid-4" style="text-align: center; margin-top: 1mm; font-size: 7.5pt;">
          <div style="background: #ffffff; padding: 2mm; border: 1px solid #cbd5e1; border-radius: 4px;">
            <strong>5 Official ID Badges</strong><br>Laminated with QR code
          </div>
          <div style="background: #ffffff; padding: 2mm; border: 1px solid #cbd5e1; border-radius: 4px;">
            <strong>2 Physical Receipt Books</strong><br>Backup for non-digital areas
          </div>
          <div style="background: #ffffff; padding: 2mm; border: 1px solid #cbd5e1; border-radius: 4px;">
            <strong>250 Institutional Brochures</strong><br>English & vernacular editions
          </div>
          <div style="background: #ffffff; padding: 2mm; border: 1px solid #cbd5e1; border-radius: 4px;">
            <strong>2 Tamper-Proof Cash Pouches</strong><br>Numbered security seals
          </div>
        </div>
      </div>
    </div>
    ${pageFooter(21)}
  </div>

  <!-- ================= PAGE 22: SETTLEMENT & CAMPUS REPORTS ================= -->
  <div class="doc-page">
    ${pageHeader('8', 'CAMPUS ADMIN MANUAL', 'Settlement & Campus Financial Reports')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Campus Settlement & Financial Reporting</h1>
          <p>Cash handover reconciliation, audit trail generation, and Excel/PDF data export</p>
        </div>
        <div class="sec-badge">FINANCIAL AUDIT</div>
      </div>

      <div class="grid-2">
        <div class="card card-blue">
          <h3>Daily Cash Reconciliation Workflow</h3>
          <p style="font-size: 8pt; text-align: justify; margin-bottom: 2mm;">
            At the close of each day, Campus Admins receive aggregated collections from squad leaders. The settlement interface ensures:
          </p>
          <ul style="margin: 0; padding-left: 15px; font-size: 7.8pt; color: #334155; line-height: 1.45;">
            <li>Physical cash count matches the sum of ERP cash receipts exactly.</li>
            <li>UPI transactions are cross-checked against bank statement credits.</li>
            <li>Discrepancies are flagged immediately before squad dismissal.</li>
          </ul>
        </div>

        <div class="card card-dark">
          <h3 style="color: #f7d9a0;">Campus Financial Export Suite</h3>
          <p style="font-size: 7.8pt; color: #cbd5e1; text-align: justify; margin-bottom: 2mm;">
            Under <code>/campus-admin/reports</code>, administrators can export audited spreadsheets:
          </p>
          <div class="step-item">
            <div class="step-num">1</div>
            <div class="step-content">
              <h4>Daily Summary Sheet (XLSX)</h4>
              <p>Squad-by-squad collection totals, donor counts, and payment modes.</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-num">2</div>
            <div class="step-content">
              <h4>Comprehensive Donor Audit Ledger (PDF)</h4>
              <p>Complete receipt-level log for submission to Central Trust accountants.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card" style="flex: 1;">
        <h3>End-of-Campaign Final Settlement Protocol</h3>
        <p style="font-size: 7.8pt; color: #475569; text-align: justify;">
          Upon conclusion of regional collection rounds, all collected cash is deposited into the designated Foundation Bank Account. The bank counterfoil receipt is uploaded to the ERP portal to close out the campus campaign settlement.
        </p>
      </div>
    </div>
    ${pageFooter(22)}
  </div>

  <!-- ================= PAGE 23: MAIN ADMIN CENTRAL GOVERNANCE ================= -->
  <div class="doc-page">
    ${pageHeader('9', 'MAIN ADMIN HQ', 'Central Governance & State Oversight')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Main Administration: Central Governance (/admin)</h1>
          <p>Statewide oversight, cross-campus auditing, public media controls, and security</p>
        </div>
        <div class="sec-badge">CENTRAL HQ</div>
      </div>

      <div class="card card-blue">
        <h3>Central Command Headquarters</h3>
        <p style="font-size: 8pt; text-align: justify;">
          The Main Admin dashboard at <code>/admin</code> is reserved exclusively for the General Secretary, Central Trustees, and Chief Financial Auditors. It aggregates real-time data across all campuses into unified institutional analytics.
        </p>
      </div>

      <div class="grid-3" style="flex: 1;">
        <div class="card">
          <h3>Statewide Analytics</h3>
          <p style="font-size: 7.5pt; text-align: justify;">
            Real-time visual graphs plotting daily collections across Malappuram, Wayanad, Kozhikode, and Bangalore sectors.
          </p>
        </div>
        <div class="card">
          <h3>Expense Approvals</h3>
          <p style="font-size: 7.5pt; text-align: justify;">
            Reviewing and authorizing campus operational allowances, travel expenditures, and fuel reimbursements.
          </p>
        </div>
        <div class="card">
          <h3>Public Media Modal</h3>
          <p style="font-size: 7.5pt; text-align: justify;">
            Updating featured YouTube documentary links, Instagram account handles, and public transparency toggles.
          </p>
        </div>
      </div>

      <div class="card card-gold">
        <h3>System Backup & Historical Import Engine</h3>
        <p style="font-size: 7.8pt; color: #475569; text-align: justify;">
          Main Admins can trigger complete database backups (JSON / SQL) and import legacy donation archives. Automated daily snapshots ensure zero data loss during high-volume campaign drives.
        </p>
      </div>
    </div>
    ${pageFooter(23)}
  </div>

  <!-- ================= PAGE 24: PWA ANDROID INSTALLATION GUIDE ================= -->
  <div class="doc-page">
    ${pageHeader('9', 'MOBILE INSTALLATION', 'Android Progressive Web App (PWA)')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Progressive Web App: Android Installation</h1>
          <p>Installing DALAIL FAMILY ERP as a native standalone app without browser URL bars</p>
        </div>
        <div class="sec-badge">PWA INSTALLATION</div>
      </div>

      <div class="grid-2">
        <div class="card card-blue">
          <h3>True Standalone App Experience</h3>
          <p style="font-size: 8pt; text-align: justify; margin-bottom: 2mm;">
            DALAIL FAMILY ERP is configured with a high-performance Service Worker and Web App Manifest (<code>manifest.json</code>). When installed, it launches directly from the Android home-screen icon:
          </p>
          <ul style="margin: 0; padding-left: 15px; font-size: 7.8pt; color: #334155; line-height: 1.45;">
            <li>Zero Chrome address bar, browser tabs, or navigation buttons.</li>
            <li>Standard Android system status bar and navigation bar preserved.</li>
            <li>Instant offline startup utilizing local asset caching.</li>
          </ul>
        </div>

        <div class="card card-gold">
          <h3>Step-by-Step Android Installation Guide</h3>
          <div class="step-item">
            <div class="step-num">1</div>
            <div class="step-content">
              <h4>Open Chrome on Android</h4>
              <p>Navigate to <code>https://dalail-family-erp.vercel.app/</code></p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-num">2</div>
            <div class="step-content">
              <h4>Tap "Install App" Button</h4>
              <p>Tap the [App] install button in the header or Chrome menu [Add to Home screen].</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-num">3</div>
            <div class="step-content">
              <h4>Confirm Installation</h4>
              <p>Tap [Install]. Android automatically builds and places the Dalail ERP app icon.</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-num">4</div>
            <div class="step-content">
              <h4>Launch from App Drawer</h4>
              <p>Open the app icon. The ERP now runs in full standalone native view.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card" style="flex: 1;">
        <h3>Troubleshooting Stuck WebAPK Installations</h3>
        <p style="font-size: 7.8pt; color: #475569; text-align: justify;">
          If Android displays an endless <em>"Installing Dalail ERP..."</em> notification in the shade, clear Chrome's cache: <em>Settings &rarr; Apps &rarr; Chrome &rarr; Storage &rarr; Clear Cache</em>. Ensure cellular data is active during the 30-second initial WebAPK compilation.
        </p>
      </div>
    </div>
    ${pageFooter(24)}
  </div>

  <!-- ================= PAGE 25: HELP DESK & SUPPORT PORTAL ================= -->
  <div class="doc-page">
    ${pageHeader('10', 'HELP DESK & SUPPORT', 'Ticketing & Multi-Channel Assistance')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Help Desk & Support Center (/helpdesk)</h1>
          <p>Online ticket submission, real-time ticket lookup, and official helpline directory</p>
        </div>
        <div class="sec-badge">SUPPORT PORTAL</div>
      </div>

      <div class="grid-2">
        <div class="img-box" style="height: 50mm;">
          <img src="${shotHelpdeskUri}" alt="Help Desk Portal Screenshot" />
          <div class="img-caption">Help Desk Portal showing ticket submission and status tabs</div>
        </div>

        <div class="card card-blue">
          <h3>Help Desk Architecture</h3>
          <p style="font-size: 8pt; text-align: justify; margin-bottom: 2mm;">
            The Help Desk is accessible to all stakeholders without requiring authentication. It features four functional tabs:
          </p>
          <ul style="margin: 0; padding-left: 15px; font-size: 7.8pt; color: #334155; line-height: 1.45;">
            <li><strong>Raise Request:</strong> Submit an issue ticket with category & priority.</li>
            <li><strong>Check Status:</strong> Query resolution progress by ticket number.</li>
            <li><strong>User Guide & FAQs:</strong> Instant answers and PDF documentation.</li>
            <li><strong>Direct Contacts:</strong> Multi-channel telephone and email helpline.</li>
          </ul>
        </div>
      </div>

      <div class="card" style="flex: 1;">
        <h3>Verified Official Contact Directory</h3>
        <table class="table-custom">
          <thead>
            <tr>
              <th>Channel</th>
              <th>Contact Details</th>
              <th>Operational Hours</th>
              <th>Primary Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Head Office Phone:</strong></td>
              <td>+91 8547931509 / +91 70341 49149</td>
              <td>9:00 AM &ndash; 5:00 PM (Mon&ndash;Sat)</td>
              <td>Urgent field support & password resets</td>
            </tr>
            <tr>
              <td><strong>Official WhatsApp:</strong></td>
              <td>+91 8547931509</td>
              <td>24/7 Automated Notification Bot</td>
              <td>Receipt re-sends & ticket confirmations</td>
            </tr>
            <tr>
              <td><strong>Official Email:</strong></td>
              <td>dalailulkhairath@gmail.com</td>
              <td>Response within 24 business hours</td>
              <td>Trust matters, donations & official audits</td>
            </tr>
            <tr>
              <td><strong>Postal Address:</strong></td>
              <td>Dalailul Khairath, P.O. Alamkode, Malappuram Dt., Kerala - 679585</td>
              <td>Open Daily for Visitors</td>
              <td>Physical receipt counter & administrative desk</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    ${pageFooter(25)}
  </div>

  <!-- ================= PAGE 26: TROUBLESHOOTING & FAQS ================= -->
  <div class="doc-page">
    ${pageHeader('10', 'HELP DESK & SUPPORT', 'Troubleshooting & Operational FAQs')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Troubleshooting & Operational FAQs</h1>
          <p>Verified solutions for common field issues encountered by students and campus admins</p>
        </div>
        <div class="sec-badge">KNOWLEDGEBASE</div>
      </div>

      <div class="grid-2" style="flex: 1;">
        <div class="card card-blue">
          <h4 style="margin: 0 0 1mm 0; font-size: 8.5pt; color: #0c2b64;">Q1: Login fails or shows "Invalid Credentials"?</h4>
          <p style="font-size: 7.5pt; color: #475569; margin-bottom: 2mm;">
            Ensure username or 10-digit mobile number is entered without spaces or <code>+91</code> prefix. If password is forgotten, tap <em>"Forgot Password"</em> to receive an instant WhatsApp reset link.
          </p>

          <h4 style="margin: 0 0 1mm 0; font-size: 8.5pt; color: #0c2b64;">Q2: Donor did not receive WhatsApp receipt?</h4>
          <p style="font-size: 7.5pt; color: #475569; margin-bottom: 2mm;">
            Open <em>"Collection History"</em> in Student Portal, locate the receipt entry, and tap <em>"Re-send WhatsApp"</em>. Check that the donor's WhatsApp number is active and has international messaging enabled.
          </p>

          <h4 style="margin: 0 0 1mm 0; font-size: 8.5pt; color: #0c2b64;">Q3: Cellular network is lost in remote areas?</h4>
          <p style="font-size: 7.5pt; color: #475569;">
            The PWA stores receipt entries in local encrypted browser memory. Continue recording collections; when cellular connectivity resumes, tap <strong>[Refresh]</strong> to sync all records with the cloud.
          </p>
        </div>

        <div class="card card-gold">
          <h4 style="margin: 0 0 1mm 0; font-size: 8.5pt; color: #92400e;">Q4: How do I change student squad assignments?</h4>
          <p style="font-size: 7.5pt; color: #78350f; margin-bottom: 2mm;">
            Only the Campus Admin can re-assign squad members. Navigate to <code>/campus-admin/groups</code>, select the squad, remove the student, and add them to their new squad.
          </p>

          <h4 style="margin: 0 0 1mm 0; font-size: 8.5pt; color: #92400e;">Q5: Receipt appears twice in settlement?</h4>
          <p style="font-size: 7.5pt; color: #78350f; margin-bottom: 2mm;">
            Duplicate entries are prevented by unique transaction hashes. If an erroneous duplicate entry occurs, Campus Admin can mark it "Under Review" to exclude it from leaderboard calculation.
          </p>

          <h4 style="margin: 0 0 1mm 0; font-size: 8.5pt; color: #92400e;">Q6: How to install without Chrome address bar?</h4>
          <p style="font-size: 7.5pt; color: #78350f;">
            Launch the app exclusively from the Android home-screen icon installed via PWA, not by opening Chrome and typing the URL. This guarantees full standalone view.
          </p>
        </div>
      </div>
    </div>
    ${pageFooter(26)}
  </div>

  <!-- ================= PAGE 27: MULTILINGUAL LITERATURE & BROCHURES ================= -->
  <div class="doc-page">
    ${pageHeader('10', 'INSTITUTIONAL LITERATURE', 'Multilingual Brochures & Media')}
    <div class="content-body">
      <div class="sec-hero">
        <div>
          <h1>Multilingual Brochures & Official Literature</h1>
          <p>Institutional publications available in English, Kannada, and Urdu</p>
        </div>
        <div class="sec-badge">PUBLICATIONS</div>
      </div>

      <div class="grid-2">
        <div class="img-box" style="height: 52mm;">
          <img src="${brochure1Uri}" alt="English Brochure Page 1" />
          <div class="img-caption">Official English Institutional Brochure Cover & Introduction</div>
        </div>

        <div class="img-box" style="height: 52mm;">
          <img src="${brochure2Uri}" alt="English Brochure Page 2" />
          <div class="img-caption">Academic Wings & Orphan Care Department Details</div>
        </div>
      </div>

      <div class="card card-blue" style="flex: 1;">
        <h3>Brochure Distribution Guidelines for Field Squads</h3>
        <p style="font-size: 7.8pt; text-align: justify; margin-bottom: 2mm;">
          Field representatives must present brochures respectfully. For non-Malayalam speaking communities across Karnataka, Tamil Nadu, and urban Gulf expatriates, hand over the dedicated language editions:
        </p>
        <div class="grid-3" style="font-size: 7.2pt; text-align: center;">
          <div style="background: #ffffff; padding: 2mm; border: 1px solid #cbd5e1; border-radius: 4px;">
            <strong>English Edition</strong><br>Corporate & NRI Donors
          </div>
          <div style="background: #ffffff; padding: 2mm; border: 1px solid #cbd5e1; border-radius: 4px;">
            <strong>Kannada Edition</strong><br>Karnataka & Border Regions
          </div>
          <div style="background: #ffffff; padding: 2mm; border: 1px solid #cbd5e1; border-radius: 4px;">
            <strong>Urdu Edition</strong><br>Deccan & North Indian Donors
          </div>
        </div>
      </div>
    </div>
    ${pageFooter(27)}
  </div>

  <!-- ================= PAGE 28: BACK COVER ================= -->
  <div class="doc-page cover-page" style="justify-content: space-between;">
    <div class="cover-pattern"></div>
    
    <div class="cover-top" style="border-bottom: none;">
      <div class="cover-logo-box">
        <img src="${logoUri}" class="cover-logo-img" alt="Official Logo" />
        <div>
          <div class="cover-org-name">DALAILUL KHAIRATH ISLAMIC FOUNDATION</div>
          <div class="cover-org-sub">Center of Higher Islamic Learning & Orphan Welfare</div>
        </div>
      </div>
      <img src="${sealUri}" style="width: 44px; height: 44px; object-fit: contain; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));" alt="Official Seal" />
    </div>

    <div style="position: relative; z-index: 2; padding: 0 16mm; text-align: center;">
      <div style="width: 28mm; height: 28mm; background: #ffffff; border-radius: 12px; margin: 0 auto 4mm auto; padding: 2.5mm; box-shadow: 0 8px 20px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
        <img src="${logoUri}" style="width: 100%; height: 100%; object-fit: contain;" alt="QR Code / Logo" />
      </div>

      <h2 style="font-size: 16pt; font-weight: 900; color: #ffffff; margin: 0 0 2mm 0; letter-spacing: -0.3px;">
        Official Institutional Endorsement & Verification
      </h2>
      <p style="font-size: 8.5pt; color: #cbd5e1; max-width: 140mm; margin: 0 auto 5mm auto; line-height: 1.5;">
        This publication constitutes the sole authorized operational manual and institutional profile for Dalailul Khairath Islamic Foundation and DALAIL FAMILY ERP. All rights reserved.
      </p>

      <div style="background: rgba(4, 15, 34, 0.7); border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 10px; padding: 4mm; max-width: 150mm; margin: 0 auto; text-align: center;">
        <div style="font-size: 8pt; color: #f7d9a0; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1.5mm;">
          HEAD OFFICE & ADMINISTRATIVE REGISTRY
        </div>
        <div style="font-size: 7.5pt; color: #e2e8f0; line-height: 1.5;">
          Dalailul Khairath Islamic Foundation (Regd.)<br>
          Kakkidippuram, P.O. Alamkode, Malappuram District, Kerala - 679585, India<br>
          <strong>Helpline:</strong> +91 8547931509 &bull; +91 70341 49149 &bull; <strong>Email:</strong> dalailulkhairath@gmail.com<br>
          <strong>Official Web Gateway:</strong> https://dalail-family-erp.vercel.app/
        </div>
      </div>
    </div>

    <div class="cover-bottom">
      <div class="cb-meta">
        <strong>Trust Registration No:</strong> 326/IV/2019 &bull; <strong>System Edition:</strong> 2026 Institutional v2.4<br>
        &copy; 2026 Dalailul Khairath Islamic Foundation. All intellectual property & operational protocols reserved.
      </div>
      <div style="text-align: right;">
        <img src="${signatureUri}" style="height: 26px; object-fit: contain; filter: brightness(1.8);" alt="Signature" /><br>
        <span style="font-size: 6.5pt; color: #94a3b8;">General Secretary Authorization</span>
      </div>
    </div>
  </div>

</body>
</html>
`;

fs.writeFileSync(outputHtmlPath, html, 'utf-8');
console.log('✓ HTML Publication written to:', outputHtmlPath);

console.log('Compiling 28-Page Vector PDF using Headless Chrome...');
try {
  // Command to print pixel-perfect A4 PDF with exact page sizes and no browser headers/footers
  const printCmd = `"${chromePath}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${outputPdfPath}" --allow-file-access-from-files "${outputHtmlPath}"`;
  execSync(printCmd, { stdio: 'inherit' });
  const pdfStats = fs.statSync(outputPdfPath);
  console.log(`✓ Master PDF compiled successfully! Size: ${(pdfStats.size / (1024 * 1024)).toFixed(2)} MB`);

  // Generate cover thumbnail preview for Help Desk page
  console.log('Generating cover preview thumbnail for Help Desk page...');
  const coverCmd = `"${chromePath}" --headless=new --disable-gpu --window-size=800,1130 --screenshot="${outputCoverImgPath}" "${outputHtmlPath}"`;
  execSync(coverCmd, { stdio: 'inherit' });
  const coverStats = fs.statSync(outputCoverImgPath);
  console.log(`✓ Cover Preview Image generated! Size: ${(coverStats.size / 1024).toFixed(1)} KB`);
} catch (err) {
  console.error('Error during Chrome PDF compilation:', err.message);
  process.exit(1);
}

console.log('ALL PUBLICATION TASKS COMPLETED SUCCESSFULLY!');
})();
