// Local Storage Database Implementation
import { v4 as uuidv4 } from 'uuid';

export interface HerasatUser {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: string;
  createdAt: string;
}

export interface Person {
  id: string;
  type: 'student' | 'staff' | 'faculty-heyat' | 'faculty-haghtadris';
  fullName: string;
  nationalId?: string;
  passportNo?: string;
  birthDate?: string;
  gender?: 'مرد' | 'زن';
  religion?: string;
  sect?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  // Student specific
  studentNumber?: string;
  isForeign?: boolean;
  faculty?: string;
  program?: string;
  enrollmentYear?: string;
  // Staff specific
  employeeNumber?: string;
  department?: string;
  position?: string;
  // Faculty specific
  facultyType?: 'هیئت علمی' | 'حق التدریس';
  rank?: string;
  specialization?: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Case {
  id: string;
  title: string;
  summary?: string;
  status: 'باز' | 'بسته' | 'در حال بررسی';
  relatedPersons: string[];
  attachments?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileData: string; // base64
  uploadedBy: string;
  uploadedAt: string;
}

class Database {
  private getItem<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setItem<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Herasat Users
  getHerasatUsers(): HerasatUser[] {
    return this.getItem<HerasatUser>('herasat_users');
  }

  addHerasatUser(user: Omit<HerasatUser, 'id' | 'createdAt'>): HerasatUser {
    const users = this.getHerasatUsers();
    const newUser: HerasatUser = {
      ...user,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    this.setItem('herasat_users', users);
    return newUser;
  }

  authenticateHerasatUser(username: string, password: string): HerasatUser | null {
    const users = this.getHerasatUsers();
    return users.find(u => u.username === username && u.password === password) || null;
  }

  // People
  getPeople(): Person[] {
    return this.getItem<Person>('people');
  }

  getPersonById(id: string): Person | null {
    const people = this.getPeople();
    return people.find(p => p.id === id) || null;
  }

  addPerson(person: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>): Person {
    const people = this.getPeople();
    const newPerson: Person = {
      ...person,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    people.push(newPerson);
    this.setItem('people', people);
    return newPerson;
  }

  updatePerson(id: string, updates: Partial<Person>): Person | null {
    const people = this.getPeople();
    const index = people.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    people[index] = {
      ...people[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.setItem('people', people);
    return people[index];
  }

  deletePerson(id: string): boolean {
    const people = this.getPeople();
    const filtered = people.filter(p => p.id !== id);
    if (filtered.length === people.length) return false;
    this.setItem('people', filtered);
    return true;
  }

  // Cases
  getCases(): Case[] {
    return this.getItem<Case>('cases');
  }

  getCaseById(id: string): Case | null {
    const cases = this.getCases();
    return cases.find(c => c.id === id) || null;
  }

  addCase(caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>): Case {
    const cases = this.getCases();
    const newCase: Case = {
      ...caseData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    cases.push(newCase);
    this.setItem('cases', cases);
    return newCase;
  }

  updateCase(id: string, updates: Partial<Case>): Case | null {
    const cases = this.getCases();
    const index = cases.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    cases[index] = {
      ...cases[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.setItem('cases', cases);
    return cases[index];
  }

  deleteCase(id: string): boolean {
    const cases = this.getCases();
    const filtered = cases.filter(c => c.id !== id);
    if (filtered.length === cases.length) return false;
    this.setItem('cases', filtered);
    return true;
  }

  // Attachments
  getAttachments(): Attachment[] {
    return this.getItem<Attachment>('attachments');
  }

  addAttachment(attachment: Omit<Attachment, 'id' | 'uploadedAt'>): Attachment {
    const attachments = this.getAttachments();
    const newAttachment: Attachment = {
      ...attachment,
      id: uuidv4(),
      uploadedAt: new Date().toISOString(),
    };
    attachments.push(newAttachment);
    this.setItem('attachments', attachments);
    return newAttachment;
  }

  getAttachmentById(id: string): Attachment | null {
    const attachments = this.getAttachments();
    return attachments.find(a => a.id === id) || null;
  }

  // Initialize default admin
  initializeDefaultAdmin(): void {
    const users = this.getHerasatUsers();
    if (users.length === 0) {
      this.addHerasatUser({
        username: 'admin',
        password: 'admin123',
        fullName: 'مدیر سیستم',
        role: 'admin',
      });
    }
  }
}

export const db = new Database();