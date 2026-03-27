
import { ServiceCategory } from '../types';

export const calculatePayment = (category: ServiceCategory, distanceKm: number): number => {
  let baseFare = 0;
  let perKmRate = 0;

  switch (category) {
    case 'Basic':
      if (distanceKm <= 4) return 0;
      perKmRate = 10;
      return (distanceKm - 4) * perKmRate;
    case 'Technical':
      baseFare = 100;
      perKmRate = 15;
      break;
    case 'Personal':
      baseFare = 200;
      perKmRate = 20;
      break;
  }

  return baseFare + (distanceKm * perKmRate);
};

export type CertTier = 'Bronze' | 'Silver' | 'Gold';

export const generateCertificatePDF = (
  helperName: string, 
  orgName: string, 
  totalTasks: number, 
  avgRating: number, 
  hours: number,
  tier: CertTier
) => {
  // @ts-ignore
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('landscape', 'mm', 'a4');

  const emerald = [5, 150, 105]; 
  const lightGray = [245, 245, 245];
  
  // Tier Colors
  const tiers = {
    Gold: { primary: [212, 175, 55], light: [255, 248, 220], text: 'GOLD PERFORMANCE' },
    Silver: { primary: [192, 192, 192], light: [248, 248, 248], text: 'SILVER PERFORMANCE' },
    Bronze: { primary: [205, 127, 50], light: [255, 245, 238], text: 'BRONZE PERFORMANCE' }
  };

  const currentTier = tiers[tier];
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // 1. BACKGROUND & BORDERS
  doc.setDrawColor(emerald[0], emerald[1], emerald[2]);
  doc.setLineWidth(4);
  doc.rect(5, 5, width - 10, height - 10);

  doc.setDrawColor(currentTier.primary[0], currentTier.primary[1], currentTier.primary[2]);
  doc.setLineWidth(1);
  doc.rect(8, 8, width - 16, height - 16);

  // Watermark
  doc.setTextColor(242, 242, 242);
  doc.setFontSize(80);
  doc.setFont('helvetica', 'bold');
  doc.text(`${tier.toUpperCase()} LEVEL`, width / 2, height / 2 + 10, { align: 'center', angle: 45 });

  // 2. HEADER
  doc.setTextColor(emerald[0], emerald[1], emerald[2]);
  doc.setFontSize(38);
  doc.setFont('times', 'bold');
  doc.text('CERTIFICATE OF RECOGNITION', width / 2, 35, { align: 'center' });
  
  doc.setTextColor(currentTier.primary[0], currentTier.primary[1], currentTier.primary[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${currentTier.text} - ${totalTasks} TASKS COMPLETED`, width / 2, 45, { align: 'center' });

  // 3. MAIN CONTENT
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(18);
  doc.setFont('times', 'italic');
  doc.text('This globally recognized certificate is awarded to', width / 2, 65, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(42);
  doc.setFont('times', 'bold');
  doc.text(helperName.toUpperCase(), width / 2, 85, { align: 'center' });

  doc.setDrawColor(currentTier.primary[0], currentTier.primary[1], currentTier.primary[2]);
  doc.setLineWidth(1.5);
  doc.line(width / 2 - 70, 90, width / 2 + 70, 90);

  doc.setTextColor(80, 80, 80);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Institutional Partner: ${orgName}`, width / 2, 100, { align: 'center' });

  doc.setFontSize(12);
  const description = `For demonstrated excellence in elder care and community support. Having achieved an exceptional quality rating of ${avgRating.toFixed(1)}/5.0 and dedicating ${hours} hours of service, the recipient is hereby granted the ${tier} Level of Distinction within the CareCircle Network.`;
  const splitDesc = doc.splitTextToSize(description, width - 120);
  doc.text(splitDesc, width / 2, 115, { align: 'center' });

  // 4. ACHIEVEMENT BADGE (CENTRAL SEAL)
  const sealX = width / 2;
  const sealY = 150;
  doc.setDrawColor(currentTier.primary[0], currentTier.primary[1], currentTier.primary[2]);
  doc.setFillColor(currentTier.primary[0], currentTier.primary[1], currentTier.primary[2]);
  doc.circle(sealX, sealY, 18, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(tier, sealX, sealY + 1, { align: 'center' });
  doc.setFontSize(6);
  doc.text('CARE CIRCLE', sealX, sealY + 5, { align: 'center' });
  doc.text('ELITE VERIFIED', sealX, sealY - 3, { align: 'center' });

  // 5. SIGNATURES
  const sigY = height - 40;
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('times', 'bold');
  doc.text(new Date().toLocaleDateString(), 60, sigY, { align: 'center' });
  doc.line(40, sigY + 2, 80, sigY + 2);
  doc.setFont('helvetica', 'normal');
  doc.text('Issue Date', 60, sigY + 8, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.text('ADMINISTRATIVE BOARD', width - 60, sigY, { align: 'center' });
  doc.line(width - 85, sigY + 2, width - 35, sigY + 2);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Seal', width - 60, sigY + 8, { align: 'center' });

  // Footer Unique ID
  const certId = `CC-CERT-${tier.substr(0,1)}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text(certId, width / 2, height - 12, { align: 'center' });

  doc.save(`CareCircle_${tier}_${helperName.replace(' ', '_')}.pdf`);
};
