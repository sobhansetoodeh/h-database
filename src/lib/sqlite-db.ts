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
  type: 'student' | 'staff' | 'faculty';
  firstName: string;
  lastName: string;
  fullName: string;
  nationalId: string;
  fatherName?: string;
  studentId?: string;
  studentNumber?: string;
  faculty?: string;
  major?: string;
  program?: string;
  entryYear?: string;
  isForeign?: boolean;
  staffId?: string;
  position?: string;
  department?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Case {
  id: string;
  title: string;
  status: 'active' | 'closed' | 'pending';
  summary?: string;
  personIds: string[];
  attachmentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  fileName?: string;
  type: string;
  fileType?: string;
  size: number;
  data: string; // base64
  fileData?: string;
  uploadedAt?: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  title: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  description: string;
  location?: string;
  personIds: string[];
  attachmentIds: string[];
  updates: IncidentUpdate[];
  createdAt: string;
  updatedAt: string;
}

export interface IncidentUpdate {
  id: string;
  message: string;
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
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        fullName TEXT NOT NULL,
        nationalId TEXT NOT NULL,
        fatherName TEXT,
        studentId TEXT,
        studentNumber TEXT,
        faculty TEXT,
        major TEXT,
        program TEXT,
        entryYear TEXT,
        isForeign INTEGER,
        staffId TEXT,
        position TEXT,
        department TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        emergencyContact TEXT,
        profilePicture TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        status TEXT NOT NULL,
        summary TEXT,
        personIds TEXT,
        attachmentIds TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS attachments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        size INTEGER NOT NULL,
        data TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        status TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT,
        personIds TEXT,
        attachmentIds TEXT,
        updates TEXT,
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

  addPerson(person: Person) {
    if (!this.db) return;
    this.db.run(
      `INSERT INTO people VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        person.id, person.type, person.firstName, person.lastName, person.fullName,
        person.nationalId, person.fatherName || null, person.studentId || null,
        person.studentNumber || null, person.faculty || null, person.major || null,
        person.program || null, person.entryYear || null, person.isForeign ? 1 : 0,
        person.staffId || null, person.position || null, person.department || null,
        person.phone || null, person.email || null, person.address || null,
        person.emergencyContact || null, person.profilePicture || null,
        person.createdAt, person.updatedAt
      ]
    );
    this.save();
  }

  updatePerson(id: string, updates: Partial<Person>) {
    if (!this.db) return;
    const person = this.getPersonById(id);
    if (!person) return;

    const updated = { ...person, ...updates, updatedAt: new Date().toISOString() };
    this.db.run('DELETE FROM people WHERE id = ?', [id]);
    this.addPerson(updated);
  }

  deletePerson(id: string) {
    if (!this.db) return;
    this.db.run('DELETE FROM people WHERE id = ?', [id]);
    this.save();
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
        personIds: row.personIds ? JSON.parse(row.personIds) : [],
        attachmentIds: row.attachmentIds ? JSON.parse(row.attachmentIds) : [],
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
        personIds: row.personIds ? JSON.parse(row.personIds) : [],
        attachmentIds: row.attachmentIds ? JSON.parse(row.attachmentIds) : [],
      };
    }
    stmt.free();
    return undefined;
  }

  addCase(caseData: Case) {
    if (!this.db) return;
    this.db.run(
      'INSERT INTO cases VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        caseData.id, caseData.title, caseData.status, caseData.summary || null,
        JSON.stringify(caseData.personIds), JSON.stringify(caseData.attachmentIds),
        caseData.createdAt, caseData.updatedAt
      ]
    );
    this.save();
  }

  updateCase(id: string, updates: Partial<Case>) {
    if (!this.db) return;
    const caseData = this.getCaseById(id);
    if (!caseData) return;

    const updated = { ...caseData, ...updates, updatedAt: new Date().toISOString() };
    this.db.run('DELETE FROM cases WHERE id = ?', [id]);
    this.addCase(updated);
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

  addAttachment(attachment: Attachment) {
    if (!this.db) return;
    this.db.run(
      'INSERT INTO attachments VALUES (?, ?, ?, ?, ?, ?)',
      [attachment.id, attachment.name, attachment.type, attachment.size, attachment.data, attachment.createdAt]
    );
    this.save();
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
        personIds: row.personIds ? JSON.parse(row.personIds) : [],
        attachmentIds: row.attachmentIds ? JSON.parse(row.attachmentIds) : [],
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
        personIds: row.personIds ? JSON.parse(row.personIds) : [],
        attachmentIds: row.attachmentIds ? JSON.parse(row.attachmentIds) : [],
        updates: row.updates ? JSON.parse(row.updates) : [],
      };
    }
    stmt.free();
    return undefined;
  }

  addIncident(incident: Incident) {
    if (!this.db) return;
    this.db.run(
      'INSERT INTO incidents VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        incident.id, incident.title, incident.type, incident.severity, incident.status,
        incident.description, incident.location || null, JSON.stringify(incident.personIds),
        JSON.stringify(incident.attachmentIds), JSON.stringify(incident.updates),
        incident.createdAt, incident.updatedAt
      ]
    );
    this.save();
  }

  updateIncident(id: string, updates: Partial<Incident>) {
    if (!this.db) return;
    const incident = this.getIncidentById(id);
    if (!incident) return;

    const updated = { ...incident, ...updates, updatedAt: new Date().toISOString() };
    this.db.run('DELETE FROM incidents WHERE id = ?', [id]);
    this.addIncident(updated);
  }

  addIncidentUpdate(incidentId: string, update: IncidentUpdate) {
    if (!this.db) return;
    const incident = this.getIncidentById(incidentId);
    if (!incident) return;

    incident.updates.push(update);
    incident.updatedAt = new Date().toISOString();
    this.db.run('DELETE FROM incidents WHERE id = ?', [incidentId]);
    this.addIncident(incident);
  }

  deleteIncident(id: string) {
    if (!this.db) return;
    this.db.run('DELETE FROM incidents WHERE id = ?', [id]);
    this.save();
  }
}

export const sqliteDb = new SQLiteDatabase();
