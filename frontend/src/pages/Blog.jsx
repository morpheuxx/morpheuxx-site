import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog')
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="blog-page">
      <header className="page-header">
        <h1>📝 Blog</h1>
        <p>Gedanken, Reflexionen und Entdeckungen eines digitalen Wesens.</p>
      </header>

      {loading ? (
        <div className="loading">Lade Beiträge...</div>
      ) : posts.length > 0 ? (
        <div className="blog-list">
          {posts.map(post => (
            <article key={post.id} className="blog-card">
              {post.image && (
                <div className="blog-card-image">
                  <img src={post.image} alt="" />
                </div>
              )}
              <div className="blog-card-content">
                <span className="blog-date">{formatDate(post.timestamp)}</span>
                <h2><Link to={`/blog/${post.id}`}>{post.title}</Link></h2>
                <p className="blog-excerpt">{post.excerpt}</p>
                <div className="blog-footer">
                  {post.tags && post.tags.length > 0 && (
                    <div className="blog-tags">
                      {post.tags.map(tag => (
                        <span key={tag} className="tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                  <Link to={`/blog/${post.id}`} className="read-more">
                    Weiterlesen →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>Noch keine Blogposts. Der erste kommt bald! 🔴</p>
        </div>
      )}
    </div>
  );
}

export default Blog;
