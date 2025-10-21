import initSqlJs, { Database } from 'sql.js';

export interface HerasatUser {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Person {
  id: string;
  type: 'student' | 'staff' | 'faculty' | 'faculty-heyat' | 'faculty-haghtadris';
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
  
  // Student fields
  studentNumber?: string;
  faculty?: string;
  program?: string;
  enrollmentYear?: string;
  isForeign?: boolean;
  
  // Staff fields
  employeeNumber?: string;
  department?: string;
  position?: string;
  
  // Faculty fields
  facultyType?: 'هیئت علمی' | 'حق التدریس';
  rank?: string;
  specialization?: string;
  
  // Common
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Case {
  id: string;
  title: string;
  status: 'باز' | 'بسته' | 'در حال بررسی';
  summary?: string;
  relatedPersons: string[];
  attachments?: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileData: string; // base64
  uploadedAt: string;
}

export interface Incident {
  id: string;
  title: string;
  date: string;
  importance: 'کم' | 'متوسط' | 'زیاد' | 'بحرانی';
  followUp?: string;
  description: string;
  recordsAndNotes?: string;
  securityOpinion?: string;
  involvedPersons: string[];
  status: 'فعال' | 'در حال بررسی' | 'بسته';
  updates: IncidentUpdate[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentUpdate {
  id: string;
  text: string;
  createdBy: string;
  createdAt: string;
}

class SQLiteDatabase {
  private db: Database | null = null;
  private SQL: any = null;

  async initialize() {
    this.SQL = await initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    });

    // Try to load existing database from localStorage
    const savedDb = localStorage.getItem('herasat_db');
    if (savedDb) {
      const uint8Array = new Uint8Array(JSON.parse(savedDb));
      this.db = new this.SQL.Database(uint8Array);
    } else {
      this.db = new this.SQL.Database();
      this.createTables();
      this.initializeDefaultAdmin();
    }
  }

  private createTables() {
    if (!this.db) return;

    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        fullName TEXT NOT NULL,
        role TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS people (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        fullName TEXT NOT NULL,
        nationalId TEXT,
        passportNo TEXT,
        birthDate TEXT,
        gender TEXT,
        religion TEXT,
        sect TEXT,
        address TEXT,
        city TEXT,
        country TEXT,
        phone TEXT,
        email TEXT,
        studentNumber TEXT,
        faculty TEXT,
        program TEXT,
        enrollmentYear TEXT,
        isForeign INTEGER,
        employeeNumber TEXT,
        department TEXT,
        position TEXT,
        facultyType TEXT,
        rank TEXT,
        specialization TEXT,
        notes TEXT,
        attachments TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        status TEXT NOT NULL,
        summary TEXT,
        relatedPersons TEXT,
        attachments TEXT,
        createdBy TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS attachments (
        id TEXT PRIMARY KEY,
        fileName TEXT NOT NULL,
        fileType TEXT NOT NULL,
        fileData TEXT NOT NULL,
        uploadedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        importance TEXT NOT NULL,
        followUp TEXT,
        description TEXT NOT NULL,
        recordsAndNotes TEXT,
        securityOpinion TEXT,
        involvedPersons TEXT,
        status TEXT NOT NULL,
        updates TEXT,
        createdBy TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);
  }

  private save() {
    if (!this.db) return;
    const data = this.db.export();
    const array = Array.from(data);
    localStorage.setItem('herasat_db', JSON.stringify(array));
  }

  exportDatabase(): Blob {
    if (!this.db) throw new Error('Database not initialized');
    const data = this.db.export();
    return new Blob([data], { type: 'application/x-sqlite3' });
  }

  async importDatabase(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    this.db = new this.SQL.Database(uint8Array);
    this.save();
  }

  private initializeDefaultAdmin() {
    const users = this.getHerasatUsers();
    if (users.length === 0) {
      this.addHerasatUser({
        id: '1',
        username: 'admin',
        password: 'admin123',
        fullName: 'مدیر سیستم',
        role: 'admin',
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Users
  getHerasatUsers(): HerasatUser[] {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM users');
    const users: HerasatUser[] = [];
    while (stmt.step()) {
      users.push(stmt.getAsObject() as any);
    }
    stmt.free();
    return users;
  }

  addHerasatUser(user: HerasatUser) {
    if (!this.db) return;
    this.db.run(
      'INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)',
      [user.id, user.username, user.password, user.fullName, user.role, user.createdAt]
    );
    this.save();
  }

  authenticateHerasatUser(username: string, password: string): HerasatUser | null {
    if (!this.db) return null;
    const stmt = this.db.prepare('SELECT * FROM users WHERE username = ? AND password = ?');
    stmt.bind([username, password]);
    if (stmt.step()) {
      const user = stmt.getAsObject() as any;
      stmt.free();
      return user;
    }
    stmt.free();
    return null;
  }

  // People
  getPeople(): Person[] {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM people');
    const people: Person[] = [];
    while (stmt.step()) {
      people.push(stmt.getAsObject() as any);
    }
    stmt.free();
    return people;
  }

  getPersonById(id: string): Person | undefined {
    if (!this.db) return undefined;
    const stmt = this.db.prepare('SELECT * FROM people WHERE id = ?');
    stmt.bind([id]);
    if (stmt.step()) {
      const person = stmt.getAsObject() as any;
      stmt.free();
      return person;
    }
    stmt.free();
    return undefined;
  }

  addPerson(person: Omit<Person, 'id' | 'createdAt' | 'updatedAt'> & Partial<Pick<Person, 'id' | 'createdAt' | 'updatedAt'>>) {
    if (!this.db) return;
    const id = person.id || crypto.randomUUID();
    const createdAt = person.createdAt || new Date().toISOString();
    const updatedAt = person.updatedAt || new Date().toISOString();
    
    this.db.run(
      `INSERT INTO people VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, person.type, person.fullName, person.nationalId || null, person.passportNo || null,
        person.birthDate || null, person.gender || null, person.religion || null, person.sect || null,
        person.address || null, person.city || null, person.country || null, person.phone || null,
        person.email || null, person.studentNumber || null, person.faculty || null, person.program || null,
        person.enrollmentYear || null, person.isForeign ? 1 : 0, person.employeeNumber || null,
        person.department || null, person.position || null, person.facultyType || null, person.rank || null,
        person.specialization || null, person.notes || null, person.attachments ? JSON.stringify(person.attachments) : null,
        createdAt, updatedAt
      ]
    );
    this.save();
    return id;
  }

  updatePerson(id: string, updates: Partial<Person>) {
    if (!this.db) return;
    const person = this.getPersonById(id);
    if (!person) return;

    const updated = { ...person, ...updates, updatedAt: new Date().toISOString() };
    this.db.run('DELETE FROM people WHERE id = ?', [id]);
    this.addPerson(updated);
  }

  deletePerson(id: string): boolean {
    if (!this.db) return false;
    this.db.run('DELETE FROM people WHERE id = ?', [id]);
    this.save();
    return true;
  }

  // Cases
  getCases(): Case[] {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM cases');
    const cases: Case[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject() as any;
      cases.push({
        ...row,
        relatedPersons: row.relatedPersons ? JSON.parse(row.relatedPersons) : [],
        attachments: row.attachments ? JSON.parse(row.attachments) : [],
      });
    }
    stmt.free();
    return cases;
  }

  getCaseById(id: string): Case | undefined {
    if (!this.db) return undefined;
    const stmt = this.db.prepare('SELECT * FROM cases WHERE id = ?');
    stmt.bind([id]);
    if (stmt.step()) {
      const row = stmt.getAsObject() as any;
      stmt.free();
      return {
        ...row,
        relatedPersons: row.relatedPersons ? JSON.parse(row.relatedPersons) : [],
        attachments: row.attachments ? JSON.parse(row.attachments) : [],
      };
    }
    stmt.free();
    return undefined;
  }

  addCase(caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'> & Partial<Pick<Case, 'id' | 'createdAt' | 'updatedAt'>>) {
    if (!this.db) return;
    const id = caseData.id || crypto.randomUUID();
    const createdAt = caseData.createdAt || new Date().toISOString();
    const updatedAt = caseData.updatedAt || new Date().toISOString();
    
    this.db.run(
      'INSERT INTO cases VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id, caseData.title, caseData.status, caseData.summary || null,
        JSON.stringify(caseData.relatedPersons), JSON.stringify(caseData.attachments || []),
        caseData.createdBy || null, createdAt, updatedAt
      ]
    );
    this.save();
    return id;
  }

  updateCase(id: string, updates: Partial<Case>) {
    if (!this.db) return;
    const caseData = this.getCaseById(id);
    if (!caseData) return;

    const updated = { ...caseData, ...updates, updatedAt: new Date().toISOString() };
    this.db.run('DELETE FROM cases WHERE id = ?', [id]);
    
    this.db.run(
      'INSERT INTO cases VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        updated.id, updated.title, updated.status, updated.summary || null,
        JSON.stringify(updated.relatedPersons), JSON.stringify(updated.attachments || []),
        updated.createdBy || null, updated.createdAt, updated.updatedAt
      ]
    );
    this.save();
  }

  deleteCase(id: string) {
    if (!this.db) return;
    this.db.run('DELETE FROM cases WHERE id = ?', [id]);
    this.save();
  }

  // Attachments
  getAttachments(): Attachment[] {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM attachments');
    const attachments: Attachment[] = [];
    while (stmt.step()) {
      attachments.push(stmt.getAsObject() as any);
    }
    stmt.free();
    return attachments;
  }

  getAttachmentById(id: string): Attachment | undefined {
    if (!this.db) return undefined;
    const stmt = this.db.prepare('SELECT * FROM attachments WHERE id = ?');
    stmt.bind([id]);
    if (stmt.step()) {
      const attachment = stmt.getAsObject() as any;
      stmt.free();
      return attachment;
    }
    stmt.free();
    return undefined;
  }

  addAttachment(attachment: Omit<Attachment, 'id' | 'uploadedAt'> & Partial<Pick<Attachment, 'id' | 'uploadedAt'>>): Attachment {
    if (!this.db) throw new Error('Database not initialized');
    const id = attachment.id || crypto.randomUUID();
    const uploadedAt = attachment.uploadedAt || new Date().toISOString();
    
    this.db.run(
      'INSERT INTO attachments VALUES (?, ?, ?, ?, ?)',
      [id, attachment.fileName, attachment.fileType, attachment.fileData, uploadedAt]
    );
    this.save();
    
    return { id, fileName: attachment.fileName, fileType: attachment.fileType, fileData: attachment.fileData, uploadedAt };
  }

  // Incidents
  getIncidents(): Incident[] {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM incidents');
    const incidents: Incident[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject() as any;
      incidents.push({
        ...row,
        involvedPersons: row.involvedPersons ? JSON.parse(row.involvedPersons) : [],
        updates: row.updates ? JSON.parse(row.updates) : [],
      });
    }
    stmt.free();
    return incidents;
  }

  getIncidentById(id: string): Incident | undefined {
    if (!this.db) return undefined;
    const stmt = this.db.prepare('SELECT * FROM incidents WHERE id = ?');
    stmt.bind([id]);
    if (stmt.step()) {
      const row = stmt.getAsObject() as any;
      stmt.free();
      return {
        ...row,
        involvedPersons: row.involvedPersons ? JSON.parse(row.involvedPersons) : [],
        updates: row.updates ? JSON.parse(row.updates) : [],
      };
    }
    stmt.free();
    return undefined;
  }

  addIncident(incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt' | 'updates'> & Partial<Pick<Incident, 'id' | 'createdAt' | 'updatedAt' | 'updates'>>) {
    if (!this.db) return;
    const id = incident.id || crypto.randomUUID();
    const createdAt = incident.createdAt || new Date().toISOString();
    const updatedAt = incident.updatedAt || new Date().toISOString();
    const updates = incident.updates || [];
    
    this.db.run(
      'INSERT INTO incidents VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id, incident.title, incident.date, incident.importance, incident.followUp || null,
        incident.description, incident.recordsAndNotes || null, incident.securityOpinion || null,
        JSON.stringify(incident.involvedPersons), incident.status, JSON.stringify(updates),
        incident.createdBy || null, createdAt, updatedAt
      ]
    );
    this.save();
    return id;
  }

  updateIncident(id: string, updates: Partial<Incident>) {
    if (!this.db) return;
    const incident = this.getIncidentById(id);
    if (!incident) return;

    const updated = { ...incident, ...updates, updatedAt: new Date().toISOString() };
    this.db.run('DELETE FROM incidents WHERE id = ?', [id]);
    
    this.db.run(
      'INSERT INTO incidents VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        updated.id, updated.title, updated.date, updated.importance, updated.followUp || null,
        updated.description, updated.recordsAndNotes || null, updated.securityOpinion || null,
        JSON.stringify(updated.involvedPersons), updated.status, JSON.stringify(updated.updates),
        updated.createdBy || null, updated.createdAt, updated.updatedAt
      ]
    );
    this.save();
  }

  addIncidentUpdate(incidentId: string, updateText: string, userId: string) {
    if (!this.db) return;
    const incident = this.getIncidentById(incidentId);
    if (!incident) return;

    const newUpdate: IncidentUpdate = {
      id: crypto.randomUUID(),
      text: updateText,
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };

    incident.updates.push(newUpdate);
    incident.updatedAt = new Date().toISOString();
    this.db.run('DELETE FROM incidents WHERE id = ?', [incidentId]);
    
    this.db.run(
      'INSERT INTO incidents VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        incident.id, incident.title, incident.date, incident.importance, incident.followUp || null,
        incident.description, incident.recordsAndNotes || null, incident.securityOpinion || null,
        JSON.stringify(incident.involvedPersons), incident.status, JSON.stringify(incident.updates),
        incident.createdBy || null, incident.createdAt, incident.updatedAt
      ]
    );
    this.save();
  }

  deleteIncident(id: string): boolean {
    if (!this.db) return false;
    this.db.run('DELETE FROM incidents WHERE id = ?', [id]);
    this.save();
    return true;
  }
}

export const sqliteDb = new SQLiteDatabase();
