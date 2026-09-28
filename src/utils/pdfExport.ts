import jsPDF from 'jspdf';
import { BirthChartData } from '../types/astro';

export const exportKundliPDF = (chartData: BirthChartData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const subject = chartData.subject;
  const meta = chartData.meta;
  const asc = chartData.ascendant;
  const moon = chartData.moon;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(245, 158, 11); // amber-500
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('JYOTISHVEDA KUNDLI REPORT', 14, 15);

  doc.setTextColor(203, 213, 225); // slate-300
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('High-Precision Vedic Horoscope Computed via Swiss Ephemeris', 14, 23);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString()} | Ephemeris: v${meta.ephemeris_version} | Ayanamsa: ${meta.ayanamsa_used} (${meta.ayanamsa_degrees}°)`, 14, 28);

  let y = 42;

  // Subject Information Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 34, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('BIRTH DETAILS & HOROSCOPE FOUNDATION', 20, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  doc.text(`Name: ${subject.name}`, 20, y + 16);
  doc.text(`Date of Birth: ${subject.dob}`, 20, y + 22);
  doc.text(`Time of Birth: ${subject.tob || '12:00 (Approx)'}`, 20, y + 28);

  doc.text(`Place: ${subject.place}`, 90, y + 16);
  doc.text(`Coordinates: ${subject.latitude.toFixed(2)}°N, ${subject.longitude.toFixed(2)}°E`, 90, y + 22);
  doc.text(`Timezone: ${subject.timezone}`, 90, y + 28);

  doc.text(`Lagna (Ascendant): ${asc ? asc.sign_en + ' ' + asc.degree.toFixed(2) + '°' : 'N/A'}`, 150, y + 16);
  doc.text(`Moon Sign: ${moon.sign_en}`, 150, y + 22);
  doc.text(`Nakshatra: ${moon.nakshatra_name} (P${moon.pada})`, 150, y + 28);

  y += 44;

  // Planetary Positions Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('GRAHA SPASHTA (PLANETARY POSITIONS)', 14, y);

  y += 5;

  // Table Header
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(14, y, 182, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('Planet', 18, y + 5);
  doc.text('Sign', 45, y + 5);
  doc.text('Degree in Sign', 75, y + 5);
  doc.text('Nakshatra', 105, y + 5);
  doc.text('House', 135, y + 5);
  doc.text('Dignity (Avastha)', 155, y + 5);

  y += 7;

  // Table Rows
  const planets = Object.values(chartData.planets);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  planets.forEach((p, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, 182, 6, 'F');
    }
    doc.text(`${p.name} (${p.name_sa}) ${p.is_retrograde ? '[R]' : ''}`, 18, y + 4.5);
    doc.text(`${p.sign_en}`, 45, y + 4.5);
    doc.text(`${p.degree_in_sign.toFixed(2)}°`, 75, y + 4.5);
    doc.text(`${p.nakshatra_name} (P${p.pada})`, 105, y + 4.5);
    doc.text(p.house ? `H${p.house}` : '—', 135, y + 4.5);
    doc.text(p.dignity || 'Neutral', 155, y + 4.5);
    y += 6;
  });

  y += 8;

  // Vimshottari & Dosha Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('KEY ASTROLOGICAL ASSESSMENTS & DOSHAS', 14, y);

  y += 5;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 38, 3, 3, 'FD');

  const yd = chartData.yogas_and_doshas;
  const vd = chartData.vimshottari_dasha;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  doc.text(`• Manglik (Kuja) Dosha: ${yd.manglik.is_manglik ? 'Present (' + yd.manglik.severity + ')' : yd.manglik.is_cancelled ? 'Cancelled (Bhanga)' : 'Non-Manglik'}`, 20, y + 8);
  doc.text(`• Kaal Sarp Yoga: ${yd.kaal_sarp.status}`, 20, y + 15);
  doc.text(`• Saturn Sade Sati: ${yd.sade_sati.is_sade_sati ? 'Active (' + yd.sade_sati.phase + ')' : yd.sade_sati.is_dhaiya ? 'Dhaiya Active' : 'Not Active'}`, 20, y + 22);
  doc.text(`• Vimshottari Balance at Birth: ${vd.balance_at_birth.description}`, 20, y + 29);
  doc.text(`• Active Dasha (2026): ${vd.active_dasha.mahadasha} Mahadasha / ${vd.active_dasha.antardasha} Antardasha (ends ${vd.active_dasha.ad_end})`, 20, y + 35);

  y += 46;

  // Disclaimer at Footer
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const splitDisclaimer = doc.splitTextToSize(
    `Disclaimer: ${chartData.interpretations.disclaimer}`,
    182
  );
  doc.text(splitDisclaimer, 14, y);

  doc.save(`Kundli_${subject.name.replace(/\s+/g, '_')}.pdf`);
};
