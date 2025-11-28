// Quiz Session Repository - In-memory storage for active quiz sessions
class QuizSessionRepository {
  constructor() {
    this.sessions = new Map();
    this.SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  }

  create(phone, weekNumber, questions) {
    const session = {
      phone,
      week_number: weekNumber,
      questions_pool: questions,
      questions_asked: [],
      correct_count: 0,
      total_asked: 0,
      current_question: null,
      started_at: new Date(),
      last_activity: new Date()
    };
    this.sessions.set(phone, session);
    return session;
  }

  get(phone) {
    const session = this.sessions.get(phone);
    if (!session) return null;

    // Check timeout
    const now = new Date();
    if (now - session.last_activity > this.SESSION_TIMEOUT) {
      this.delete(phone);
      return null;
    }

    return session;
  }

  update(phone, updates) {
    const session = this.get(phone);
    if (!session) return null;

    Object.assign(session, updates, { last_activity: new Date() });
    this.sessions.set(phone, session);
    return session;
  }

  delete(phone) {
    return this.sessions.delete(phone);
  }

  exists(phone) {
    return this.sessions.has(phone);
  }

  cleanup() {
    const now = new Date();
    for (const [phone, session] of this.sessions.entries()) {
      if (now - session.last_activity > this.SESSION_TIMEOUT) {
        this.sessions.delete(phone);
      }
    }
  }
}

module.exports = new QuizSessionRepository();
