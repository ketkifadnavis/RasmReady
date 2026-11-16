import { jsPDF } from 'jspdf';
import { WeddingConfig, BudgetItem, TaskItem, VendorItem, GuestItem } from '../types/wedding';

interface PdfExportOptions {
  wedding: WeddingConfig;
  budgetItems: BudgetItem[];
  tasks: TaskItem[];
  vendors: VendorItem[];
  guests: GuestItem[];
}

export function generateWeddingSummaryPdf({
  wedding,
  budgetItems,
  tasks,
  vendors,
  guests,
}: PdfExportOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const plum = [78, 38, 52];       // #4E2634
  const gold = [184, 134, 11];     // Gold
  const darkStone = [44, 40, 42];  // Dark text
  const mutedStone = [115, 108, 110]; // Muted text
  const lightBg = [250, 247, 242]; // Cream background

  // Header Background Box
  doc.setFillColor(plum[0], plum[1], plum[2]);
  doc.rect(margin, margin, contentWidth, 34, 'F');

  // Gold Trim Line
  doc.setDrawColor(gold[0], gold[1], gold[2]);
  doc.setLineWidth(0.8);
  doc.line(margin, margin + 34, margin + contentWidth, margin + 34);

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(240, 220, 180);
  doc.text('|| RASMREADY  *  EXECUTIVE WEDDING PLANNER SUMMARY ||', pageWidth / 2, margin + 7, { align: 'center' });

  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(`${wedding.brideName} & ${wedding.groomName}`, pageWidth / 2, margin + 17, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(230, 220, 225);
  doc.text(`${wedding.location}  *  Vivaah Muhurat: 28 Feb 2027 (Godhuli)`, pageWidth / 2, margin + 25, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setTextColor(210, 200, 205);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}  *  Platform: RasmReady`, pageWidth / 2, margin + 30, { align: 'center' });

  let y = margin + 40;

  // Metrics Bar (4 Cards)
  const totalBudget = budgetItems.reduce((acc, b) => acc + b.estimatedAmount, 0);
  const totalPaid = budgetItems.reduce((acc, b) => acc + b.paidAmount, 0);
  const totalPending = Math.max(0, totalBudget - totalPaid);

  const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'done').length;
  const taskPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const attendingGuests = guests.filter(g => g.rsvpStatus === 'attending');
  const totalAttendingGuests = attendingGuests.reduce((acc, g) => acc + g.adultsCount + g.kidsCount, 0);
  const jainGuests = attendingGuests.filter(g => g.dietaryPreference === 'jain').length;
  const hotelRooms = attendingGuests.filter(g => g.hotelStayRequired).length;

  const cardWidth = (contentWidth - 9) / 4;
  const cardHeight = 18;

  const cards = [
    { label: 'Total Budget Est.', val: `Rs. ${(totalBudget / 100000).toFixed(1)} Lakhs`, sub: `Paid: Rs. ${(totalPaid / 100000).toFixed(1)}L` },
    { label: 'Remaining Due', val: `Rs. ${(totalPending / 100000).toFixed(1)} Lakhs`, sub: `${vendors.length} vendors contracted` },
    { label: 'Task Progress', val: `${taskPercent}% Done`, sub: `${completedTasks} of ${tasks.length} tasks completed` },
    { label: 'Confirmed Guests', val: `${totalAttendingGuests} Attending`, sub: `${jainGuests} Jain Meals * ${hotelRooms} Rooms` },
  ];

  cards.forEach((card, idx) => {
    const cardX = margin + idx * (cardWidth + 3);
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.setDrawColor(225, 218, 208);
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX, y, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(plum[0], plum[1], plum[2]);
    doc.text(card.label.toUpperCase(), cardX + 3, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(darkStone[0], darkStone[1], darkStone[2]);
    doc.text(card.val, cardX + 3, y + 10.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(mutedStone[0], mutedStone[1], mutedStone[2]);
    doc.text(card.sub, cardX + 3, y + 15);
  });

  y += cardHeight + 6;

  // Helper Section Header
  const renderSectionHeader = (title: string, subtitle?: string) => {
    doc.setFillColor(242, 237, 230);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.setLineWidth(0.4);
    doc.line(margin, y, margin, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(plum[0], plum[1], plum[2]);
    doc.text(title.toUpperCase(), margin + 3, y + 4.3);

    if (subtitle) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(mutedStone[0], mutedStone[1], mutedStone[2]);
      doc.text(subtitle, margin + contentWidth - 3, y + 4.3, { align: 'right' });
    }
    y += 8;
  };

  // 1. CEREMONY SCHEDULE & MUHURATS
  renderSectionHeader('1. Auspicious Ceremonies & Muhurats', '6 Major Celebrations');

  const celebrations = [
    { name: 'Engagement & Sagan', date: 'Dec 15, 2026', time: '6:30 PM', muhurat: 'Sagan Muhurat (6:30 PM)', theme: 'Peach & Champagne' },
    { name: "Hardik's Mehendi", date: 'Dec 16, 2026', time: '11:00 AM', muhurat: 'Shubh Labh (11:00 AM)', theme: 'Mint Green & Marigold' },
    { name: 'Haldi Phoolon ki Holi', date: 'Dec 17, 2026', time: '10:00 AM', muhurat: 'Shubh Pratah (10:00 AM)', theme: 'Yellow & Gotapatti' },
    { name: "Ketki's Mehendi Soiree", date: 'Dec 17, 2026', time: '4:00 PM', muhurat: 'Auspicious Afternoon', theme: 'Boho Henna Grove' },
    { name: 'Bollywood Sangeet Night', date: 'Dec 17, 2026', time: '7:30 PM', muhurat: 'Bespoke Evening Gala', theme: 'Indigo & Royal Shimmer' },
    { name: 'Vivaah & Vedic Pheras', date: 'Feb 28, 2027', time: '6:00 PM', muhurat: 'Godhuli Muhurat (6:30 PM)', theme: 'Sindoor & Rajwada' },
  ];

  celebrations.forEach((cel, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(252, 250, 247);
      doc.rect(margin, y - 0.5, contentWidth, 5.5, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(darkStone[0], darkStone[1], darkStone[2]);
    doc.text(cel.name, margin + 2, y + 3.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(mutedStone[0], mutedStone[1], mutedStone[2]);
    doc.text(`${cel.date}  *  ${cel.time}`, margin + 55, y + 3.2);

    doc.setFont('helvetica', 'italic');
    doc.setTextColor(plum[0], plum[1], plum[2]);
    doc.text(cel.muhurat, margin + 110, y + 3.2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedStone[0], mutedStone[1], mutedStone[2]);
    doc.text(`Theme: ${cel.theme}`, margin + contentWidth - 2, y + 3.2, { align: 'right' });

    y += 5.5;
  });

  y += 3;

  // 2. FINANCIAL ALLOCATION & SIDE SPLIT
  renderSectionHeader('2. Financial Overview & Split Tracking', `Total Budget: Rs. ${(totalBudget / 100000).toFixed(2)} Lakhs`);

  const ladkiBudget = budgetItems.filter(b => b.side === 'ladkiwale').reduce((a, b) => a + b.estimatedAmount, 0);
  const ladkeBudget = budgetItems.filter(b => b.side === 'ladkewale').reduce((a, b) => a + b.estimatedAmount, 0);
  const sharedBudget = budgetItems.filter(b => b.side === 'shared').reduce((a, b) => a + b.estimatedAmount, 0);

  const budgetCols = (contentWidth - 6) / 3;
  const budgetBlocks = [
    { side: 'Ladkiwale (Bride)', est: ladkiBudget, paid: budgetItems.filter(b => b.side === 'ladkiwale').reduce((a, b) => a + b.paidAmount, 0) },
    { side: 'Ladkewale (Groom)', est: ladkeBudget, paid: budgetItems.filter(b => b.side === 'ladkewale').reduce((a, b) => a + b.paidAmount, 0) },
    { side: 'Shared Ceremonies', est: sharedBudget, paid: budgetItems.filter(b => b.side === 'shared').reduce((a, b) => a + b.paidAmount, 0) },
  ];

  budgetBlocks.forEach((block, idx) => {
    const bx = margin + idx * (budgetCols + 3);
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.setDrawColor(225, 218, 208);
    doc.setLineWidth(0.3);
    doc.roundedRect(bx, y, budgetCols, 13, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(plum[0], plum[1], plum[2]);
    doc.text(block.side, bx + 3, y + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(darkStone[0], darkStone[1], darkStone[2]);
    doc.text(`Est: Rs. ${(block.est / 100000).toFixed(2)} L`, bx + 3, y + 8.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(mutedStone[0], mutedStone[1], mutedStone[2]);
    doc.text(`Paid: Rs. ${(block.paid / 100000).toFixed(2)} L | Bal: Rs. ${((block.est - block.paid) / 100000).toFixed(2)} L`, bx + 3, y + 11.5);
  });

  y += 16;

  // 3. TASK PROGRESS & ACTION ITEMS
  renderSectionHeader('3. Priority Tasks & Responsibilities', `${tasks.length - completedTasks} Pending Tasks`);

  const pendingTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'done').slice(0, 5);

  pendingTasks.forEach((task, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(252, 250, 247);
      doc.rect(margin, y - 0.5, contentWidth, 5, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(darkStone[0], darkStone[1], darkStone[2]);
    doc.text(`* ${task.title}`, margin + 2, y + 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(mutedStone[0], mutedStone[1], mutedStone[2]);
    doc.text(`Assigned to: ${task.assignedToName || 'Unassigned'} (${task.assignedSide})`, margin + 80, y + 3);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(task.priority === 'urgent' ? 180 : 80, 40, 50);
    doc.text(`Due: ${task.dueDate} [${task.priority.toUpperCase()}]`, margin + contentWidth - 2, y + 3, { align: 'right' });

    y += 5;
  });

  y += 3;

  // 4. FAMILY COORDINATORS & HOSPITALITY CONTACTS
  renderSectionHeader('4. Family Hospitality & Coordinator Directory', 'Travel & Stay Assistance');

  const coordinators = [
    { name: 'Vikram Mama', role: 'Outstation Logistics, Airport Pickups & Signature Resort Room Allocation', phone: '+91 98200 11223' },
    { name: 'Pooja Bhabhi', role: 'Rituals, Pooja Samagri, Haldi Phool & Ladies Henna Scheduling', phone: '+91 98444 55667' },
    { name: 'Rajesh Chacha', role: 'Baraat Assembly, Band Baja, Vintage Car & Safa Bandhai Team', phone: '+91 98333 44556' },
  ];

  coordinators.forEach((coord, i) => {
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(margin, y - 0.5, contentWidth, 5.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(plum[0], plum[1], plum[2]);
    doc.text(coord.name, margin + 2, y + 3.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(darkStone[0], darkStone[1], darkStone[2]);
    doc.text(coord.role, margin + 35, y + 3.2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 120, 80);
    doc.text(coord.phone, margin + contentWidth - 2, y + 3.2, { align: 'right' });

    y += 6;
  });

  // Footer Signature
  const footerY = pageHeight - margin + 2;
  doc.setDrawColor(215, 205, 195);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 4, margin + contentWidth, footerY - 4);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(mutedStone[0], mutedStone[1], mutedStone[2]);
  doc.text('RasmReady * Har taiyaari, apno ke saath. Shared family wedding preparation portal.', margin, footerY);
  doc.text(`Page 1 of 1  *  Nagpur 2027`, margin + contentWidth, footerY, { align: 'right' });

  // Save the PDF
  doc.save(`RasmReady_${wedding.brideName}_${wedding.groomName}_Summary.pdf`);
}
