class Majelis {
  static create(data) {
    return {
      name: data.name,
      description: data.description || '',
      schedule_day: data.schedule_day,
      schedule_time: data.schedule_time || '10:00',
      location: data.location || '',
      members: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  static createMock(majelisData) {
    return {
      ...majelisData,
      members: [],
      is_mock: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  static createAttendance(data) {
    const now = new Date().toISOString();
    return {
      date: data.date || now,
      attendees: data.attendees || [],
      notes: data.notes || '',
      created_at: now,
      updated_at: now
    };
  }
}

module.exports = Majelis;
