import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { showDiscoToast } from './DiscoDecorations';

const DiscussionForum = ({ eventId, eventOrganizerId, isRegistered }) => {
  const { user } = useAuth();
  const [discussion, setDiscussion] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState('message');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const isOrganizer = user && eventOrganizerId && user._id === eventOrganizerId;
  const canPost = user && (isOrganizer || isRegistered || !discussion?.settings?.requireRegistration);

  const fetchDiscussion = useCallback(async () => {
    try {
      const res = await api.get(`/discussions/${eventId}`);
      if (res.data.success) {
        const newMessages = res.data.messages || [];
        const prevMessages = messages;
        
        setDiscussion(res.data.discussion);
        setMessages(newMessages);
        
        // Notify on new messages
        if (prevMessages.length > 0 && newMessages.length > prevMessages.length) {
          const newCount = newMessages.length - prevMessages.length;
          
          // Find the new messages
          const newMessagesList = newMessages.slice(prevMessages.length);
          
          // Show notification for each new message
          newMessagesList.forEach((msg, index) => {
            setTimeout(() => {
              const authorName = msg.author?.organizerName || 
                               `${msg.author?.firstName || ''} ${msg.author?.lastName || ''}`.trim() || 
                               'Someone';
              const messagePreview = msg.content.length > 50 
                ? msg.content.substring(0, 50) + '...' 
                : msg.content;
              
              let icon = '💬';
              if (msg.messageType === 'announcement') icon = '📢';
              if (msg.messageType === 'question') icon = '❓';
              
              showDiscoToast(`${icon} ${authorName}: ${messagePreview}`, true);
            }, index * 300); // Stagger notifications by 300ms
          });
        }
      }
    } catch (err) {
      console.error('Error fetching discussion:', err);
      setError('Failed to load discussion');
    } finally {
      setLoading(false);
    }
  }, [eventId, messages]);

  useEffect(() => {
    fetchDiscussion();
    
    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchDiscussion, 10000);
    return () => clearInterval(interval);
  }, [fetchDiscussion]);

  const handlePostMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || posting) return;

    setPosting(true);
    setError(null);

    try {
      const res = await api.post(`/discussions/${eventId}/messages`, {
        content: newMessage.trim(),
        messageType: isOrganizer ? messageType : 'message',
        parentMessageId: replyingTo?._id
      });

      if (res.data.success) {
        showDiscoToast(replyingTo ? '💬 Reply posted!' : '✅ Message posted!', true);
        setNewMessage('');
        setReplyingTo(null);
        setMessageType('message');
        fetchDiscussion();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post message');
      showDiscoToast(err.response?.data?.message || 'Failed to post message', false);
    } finally {
      setPosting(false);
    }
  };

  const handleEditMessage = async (messageId, content) => {
    try {
      const res = await api.put(`/discussions/${eventId}/messages/${messageId}`, {
        content
      });
      if (res.data.success) {
        showDiscoToast('✏️ Message updated!', true);
        setEditingMessage(null);
        fetchDiscussion();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to edit message');
      showDiscoToast(err.response?.data?.message || 'Failed to edit message', false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const res = await api.delete(`/discussions/${eventId}/messages/${messageId}`);
      if (res.data.success) {
        showDiscoToast('🗑️ Message deleted', true);
        fetchDiscussion();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete message');
      showDiscoToast(err.response?.data?.message || 'Failed to delete message', false);
    }
  };

  const handlePinMessage = async (messageId) => {
    try {
      const res = await api.post(`/discussions/${eventId}/messages/${messageId}/pin`);
      if (res.data.success) {
        showDiscoToast(res.data.message === 'Message pinned' ? '📌 Message pinned!' : '📍 Message unpinned', true);
        fetchDiscussion();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to pin message');
      showDiscoToast(err.response?.data?.message || 'Failed to pin message', false);
    }
  };

  const handleReaction = async (messageId, reaction) => {
    if (!user) return;

    try {
      const res = await api.post(`/discussions/${eventId}/messages/${messageId}/react`, {
        reaction
      });
      if (res.data.success) {
        fetchDiscussion();
      }
    } catch (err) {
      console.error('Reaction error:', err);
    }
  };

  const handleToggleDiscussion = async () => {
    try {
      const res = await api.post(`/discussions/${eventId}/toggle`);
      if (res.data.success) {
        showDiscoToast(
          res.data.discussion.isEnabled 
            ? '🔓 Discussion forum enabled!' 
            : '🔒 Discussion forum disabled',
          true
        );
        fetchDiscussion();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle discussion');
      showDiscoToast(err.response?.data?.message || 'Failed to toggle discussion', false);
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString();
  };

  const getAuthorName = (author) => {
    if (!author) return 'Unknown';
    if (author.organizerName) return author.organizerName;
    return `${author.firstName || ''} ${author.lastName || ''}`.trim() || 'Anonymous';
  };

  const getAuthorRole = (author) => {
    if (!author) return '';
    if (author._id === eventOrganizerId) return '🎯 Organizer';
    if (author.role === 'organizer') return '🏢 Club';
    return '';
  };

  const reactions = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

  const MessageComponent = ({ message, isReply = false }) => {
    const [showReactions, setShowReactions] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const isAuthor = user && message.author?._id === user._id;
    const isEditing = editingMessage === message._id;

    const reactionCounts = message.reactions?.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {}) || {};

    const userReaction = message.reactions?.find(r => r.user === user?._id)?.type;

    return (
      <div
        style={{
          marginLeft: isReply ? '2rem' : 0,
          marginBottom: '1rem',
          padding: '1rem',
          background: message.isPinned 
            ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.15) 100%)'
            : message.messageType === 'announcement'
            ? 'linear-gradient(135deg, rgba(255, 0, 110, 0.15) 0%, rgba(255, 190, 11, 0.15) 100%)'
            : 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          border: message.isPinned 
            ? '2px solid rgba(255, 215, 0, 0.5)'
            : message.messageType === 'announcement'
            ? '2px solid rgba(255, 0, 110, 0.5)'
            : '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {message.isPinned && <span style={{ color: '#ffd700' }}>📌</span>}
            {message.messageType === 'announcement' && <span style={{ color: '#ff006e' }}>📢</span>}
            {message.messageType === 'question' && <span style={{ color: '#00ffff' }}>❓</span>}
            <span style={{ fontWeight: '600', color: message.author?._id === eventOrganizerId ? '#ffff00' : '#fff' }}>
              {getAuthorName(message.author)}
            </span>
            {getAuthorRole(message.author) && (
              <span style={{ fontSize: '0.75rem', color: '#00ff88', background: 'rgba(0, 255, 136, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '10px' }}>
                {getAuthorRole(message.author)}
              </span>
            )}
            <span style={{ fontSize: '0.75rem', color: '#888' }}>
              {formatTime(message.createdAt)}
              {message.editedAt && ' (edited)'}
            </span>
          </div>
          
          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isOrganizer && (
              <button
                onClick={() => handlePinMessage(message._id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: message.isPinned ? '#ffd700' : '#888',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
                title={message.isPinned ? 'Unpin' : 'Pin'}
              >
                📌
              </button>
            )}
            {isAuthor && (
              <button
                onClick={() => setEditingMessage(isEditing ? null : message._id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
                title="Edit"
              >
                ✏️
              </button>
            )}
            {(isAuthor || isOrganizer) && (
              <button
                onClick={() => handleDeleteMessage(message._id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ff6b6b',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
                title="Delete"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {isEditing ? (
          <div style={{ marginBottom: '0.5rem' }}>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#fff',
                resize: 'vertical',
                minHeight: '60px'
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => handleEditMessage(message._id, editContent)}
                style={{
                  padding: '0.3rem 0.8rem',
                  background: '#00ff88',
                  border: 'none',
                  borderRadius: '5px',
                  color: '#000',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingMessage(null);
                  setEditContent(message.content);
                }}
                style={{
                  padding: '0.3rem 0.8rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '5px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p style={{ margin: '0 0 0.5rem 0', color: '#ddd', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
            {message.content}
          </p>
        )}

        {/* Reactions & Reply */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Existing reactions */}
          {Object.entries(reactionCounts).map(([type, count]) => (
            <button
              key={type}
              onClick={() => handleReaction(message._id, type)}
              style={{
                padding: '0.2rem 0.5rem',
                background: userReaction === type ? 'rgba(255, 255, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                border: userReaction === type ? '1px solid rgba(255, 255, 0, 0.5)' : '1px solid transparent',
                borderRadius: '15px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem'
              }}
            >
              {type} <span style={{ color: '#888', fontSize: '0.75rem' }}>{count}</span>
            </button>
          ))}
          
          {/* Add reaction button */}
          {user && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowReactions(!showReactions)}
                style={{
                  padding: '0.2rem 0.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  color: '#888'
                }}
              >
                😀+
              </button>
              {showReactions && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: 0,
                    background: 'rgba(30, 30, 30, 0.95)',
                    borderRadius: '10px',
                    padding: '0.5rem',
                    display: 'flex',
                    gap: '0.3rem',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                    zIndex: 10
                  }}
                >
                  {reactions.map(r => (
                    <button
                      key={r}
                      onClick={() => {
                        handleReaction(message._id, r);
                        setShowReactions(false);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '0.2rem',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.3)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reply button */}
          {canPost && !isReply && (
            <button
              onClick={() => {
                setReplyingTo(message);
                inputRef.current?.focus();
              }}
              style={{
                padding: '0.2rem 0.5rem',
                background: 'transparent',
                border: 'none',
                color: '#00ffff',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              💬 Reply
            </button>
          )}
        </div>

        {/* Replies */}
        {message.replies && message.replies.length > 0 && (
          <div style={{ marginTop: '1rem', borderLeft: '2px solid rgba(255, 255, 255, 0.1)', paddingLeft: '0.5rem' }}>
            {message.replies.map(reply => (
              <MessageComponent key={reply._id} message={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
        Loading discussion...
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.02)',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(255, 0, 255, 0.1) 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: 0, color: '#fff', fontFamily: "'Anton', sans-serif" }}>
            💬 Discussion Forum
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', color: '#888', fontSize: '0.9rem' }}>
            {discussion?.messageCount || 0} messages
          </p>
        </div>
        
        {isOrganizer && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              ⚙️ Settings
            </button>
            <button
              onClick={handleToggleDiscussion}
              style={{
                padding: '0.5rem 1rem',
                background: discussion?.isEnabled ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 0, 0.2)',
                border: `1px solid ${discussion?.isEnabled ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 255, 0, 0.5)'}`,
                borderRadius: '20px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {discussion?.isEnabled ? '🔒 Disable' : '🔓 Enable'}
            </button>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && isOrganizer && (
        <div style={{
          padding: '1rem 1.5rem',
          background: 'rgba(0, 0, 0, 0.2)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ddd', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={discussion?.settings?.requireRegistration}
                onChange={async (e) => {
                  await api.put(`/discussions/${eventId}/settings`, {
                    requireRegistration: e.target.checked
                  });
                  fetchDiscussion();
                }}
              />
              Require registration to post
            </label>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div style={{
          padding: '1rem 1.5rem',
          background: 'rgba(255, 0, 0, 0.1)',
          borderBottom: '1px solid rgba(255, 0, 0, 0.3)',
          color: '#ff6b6b'
        }}>
          {error}
          <button
            onClick={() => setError(null)}
            style={{ marginLeft: '1rem', background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Messages */}
      <div style={{
        padding: '1.5rem',
        maxHeight: '500px',
        overflowY: 'auto'
      }}>
        {!discussion?.isEnabled ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            <p>🔒 Discussion forum is currently disabled</p>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            <p>No messages yet. Be the first to start the discussion!</p>
          </div>
        ) : (
          messages.map(message => (
            <MessageComponent key={message._id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {discussion?.isEnabled && (
        <div style={{
          padding: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          {!user ? (
            <p style={{ textAlign: 'center', color: '#888', margin: 0 }}>
              Please login to participate in the discussion
            </p>
          ) : !canPost ? (
            <p style={{ textAlign: 'center', color: '#888', margin: 0 }}>
              You must be registered for this event to post messages
            </p>
          ) : (
            <form onSubmit={handlePostMessage}>
              {replyingTo && (
                <div style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(0, 255, 255, 0.1)',
                  borderRadius: '10px',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#00ffff', fontSize: '0.85rem' }}>
                    Replying to {getAuthorName(replyingTo.author)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                {isOrganizer && !replyingTo && (
                  <select
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value)}
                    style={{
                      padding: '0.75rem',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="message">💬 Message</option>
                    <option value="announcement">📢 Announcement</option>
                    <option value="question">❓ Question</option>
                  </select>
                )}
                
                <textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={replyingTo ? "Write a reply..." : "Write a message..."}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    color: '#fff',
                    resize: 'none',
                    minHeight: '50px',
                    maxHeight: '150px'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handlePostMessage(e);
                    }
                  }}
                />
                
                <button
                  type="submit"
                  disabled={!newMessage.trim() || posting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: posting ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #ff006e 0%, #ffbe0b 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    color: posting ? '#888' : '#000',
                    fontWeight: '600',
                    cursor: posting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {posting ? '...' : '➤'}
                </button>
              </div>
              
              <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.75rem' }}>
                Press Enter to send, Shift+Enter for new line
              </p>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default DiscussionForum;
