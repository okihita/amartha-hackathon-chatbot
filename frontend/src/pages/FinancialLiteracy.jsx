import { useState, useEffect } from 'preact/hooks';

export default function FinancialLiteracy() {
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, []);

  const fetchCourse = async () => {
    try {
      const res = await fetch('/api/financial-literacy');
      const data = await res.json();
      const filtered = data
        .filter(w => w.week_number && w.quizzes && w.quizzes.length > 0)
        .sort((a, b) => a.week_number - b.week_number);
      setWeeks(filtered);
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div class="loading">Loading course content...</div>;

  const totalQuizzes = weeks.reduce((sum, w) => sum + (w.quizzes?.length || 0), 0);

  return (
    <>
      <div class="card">
        <h2>📚 Financial Literacy Course - 15 Weeks</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{weeks.length}</div>
            <div class="stat-label">Total Weeks</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{totalQuizzes}</div>
            <div class="stat-label">Total Quizzes</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="weeks-grid">
          {weeks.length === 0 ? (
            <div class="loading">No course content available</div>
          ) : (
            weeks.map(week => {
              const quizCount = week.quizzes?.length || 0;
              let title = week.module_name || `Week ${week.week_number}`;
              title = title.replace(/^Modul\s+\d+\s*-\s*/i, '');
              title = title.replace(/^Minggu\s+\d+:\s*/i, '');

              return (
                <div key={week.week_number} class="week-card">
                  <div class="week-header">
                    <div class="week-number">Week {week.week_number}</div>
                  </div>
                  <div class="week-title">{title}</div>
                  <div class="week-quiz-count">{quizCount} questions</div>
                  <div class="week-meta">M{week.module_number || '?'}</div>
                  <div class="week-progress">
                    <div class="week-progress-bar" style="width: 0%"></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
