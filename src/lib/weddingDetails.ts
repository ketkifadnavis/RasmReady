import type { TaskItem, WeddingConfig } from '../types/wedding';

export function weddingSchedule(wedding: WeddingConfig) {
  const date = new Date(wedding.weddingDate);
  return [{
    id: 'shaadi', name: 'Vivaah & Vedic Pheras',
    date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    time: date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
    muhurat: wedding.muhuratTime || 'Wedding ceremony',
    theme: 'Wedding celebration',
  }];
}

export function weddingContacts(tasks: TaskItem[]) {
  const contacts = new Map<string, { name: string; phone: string; role: string }>();
  for (const task of tasks) {
    const phone = task.assignedToPhone?.trim();
    if (phone) contacts.set(phone, { name: task.assignedToName, phone, role: task.assignedFamilyRole || 'Family coordinator' });
  }
  return [...contacts.values()];
}
