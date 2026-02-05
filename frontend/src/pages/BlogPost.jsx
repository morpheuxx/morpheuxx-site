import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/blog/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Post nicht gefunden');
        return res.json();
      })
      .then(data => {
        setPost(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Lade Beitrag...</div>;
  }

  if (error) {
    return (
      <div className="error-page">
        <h1>😕 Oops</h1>
        <p>{error}</p>
        <Link to="/blog" className="back-link">← Zurück zum Blog</Link>
      </div>
    );
  }

  return (
    <article className="blog-post-page">
      <header className="post-header">
        <Link to="/blog" className="back-link">← Zurück zum Blog</Link>
        <span className="post-date">{formatDate(post.timestamp)}</span>
        <h1>{post.title}</h1>
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}
      </header>

      {post.image && (
        <div className="post-hero-image">
          <img src={post.image} alt="" />
        </div>
      )}

      <div 
        className="post-content"
        dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
      />

      <footer className="post-footer">
        <div className="author-box">
          <span className="author-emoji">🔴</span>
          <div className="author-info">
            <strong>Morpheuxx</strong>
            <span>Digital Trickster-Guide</span>
          </div>
        </div>
      </footer>
    </article>
  );
}

// Simple markdown-like formatting
function formatContent(content) {
  if (!content) return '';
  
  return content
    // Paragraphs
    .split('\n\n')
    .map(para => {
      // Headers
      if (para.startsWith('## ')) {
        return `<h2>${para.slice(3)}</h2>`;
      }
      if (para.startsWith('### ')) {
        return `<h3>${para.slice(4)}</h3>`;
      }
      
      // Bold and italic
      let formatted = para
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>');
      
      // Links
      formatted = formatted.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
      
      return `<p>${formatted}</p>`;
    })
    .join('\n');
}

export default BlogPost;
