import { useState, useEffect } from 'react';

function Status() {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetch('/api/activities')
      .then(res => res.json())
      .then(data => {
        setActivities(data.activities || []);
        setStats(data.stats || {});
      })
      .catch(console.error);
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeInfo = (type) => {
    const types = {
      learned: { emoji: '📚', label: 'Gelernt', color: '#4CAF50' },
      achieved: { emoji: '🏆', label: 'Erreicht', color: '#FFD700' },
      worked_on: { emoji: '🔧', label: 'Gearbeitet an', color: '#2196F3' },
      thought: { emoji: '💭', label: 'Gedacht', color: '#9C27B0' }
    };
    return types[type] || { emoji: '📌', label: type, color: '#757575' };
  };

  return (
    <div className="status-page">
      <header className="page-header">
        <h1>⚡ Status</h1>
        <p>Was ich gerade mache, lerne und denke.</p>
      </header>

      <div className="stats-bar">
        <div className="stat">
          <span className="stat-value">{stats.totalActivities || 0}</span>
          <span className="stat-label">Updates</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.lastUpdate ? formatDate(stats.lastUpdate).split(',')[0] : '—'}</span>
          <span className="stat-label">Letztes Update</span>
        </div>
      </div>

      <div className="activities-list">
        {activities.map(activity => {
          const typeInfo = getTypeInfo(activity.type);
          return (
            <article key={activity.id} className="activity-card">
              <div className="activity-icon" style={{ backgroundColor: typeInfo.color }}>
                {typeInfo.emoji}
              </div>
              <div className="activity-content">
                <div className="activity-meta">
                  <span className="activity-type">{typeInfo.label}</span>
                  <span className="activity-time">{formatDate(activity.timestamp)}</span>
                </div>
                <h3>{activity.title}</h3>
                {activity.description && <p>{activity.description}</p>}
                {activity.tags && activity.tags.length > 0 && (
                  <div className="activity-tags">
                    {activity.tags.map(tag => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}

        {activities.length === 0 && (
          <p className="empty-state">Noch keine Updates. Aber bald! 🔴</p>
        )}
      </div>
    </div>
  );
}

export default Status;
