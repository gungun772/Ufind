// src/components/Chatbot.jsx
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ExternalLink,
  MapPin,
  Calendar,
  Tag,
  ChevronDown,
  Laptop,
  CreditCard,
  ShoppingBag,
  BookOpen,
  Key,
  Watch,
  Package,
} from 'lucide-react'
import { processChatQuery, DEFAULT_SUGGESTIONS } from '../utils/chatbotEngine.js'
import { getCategoryMeta } from '../utils/categoryIcons.js'
import './Chatbot.css'

const ICON_MAP = {
  Laptop,
  CreditCard,
  ShoppingBag,
  BookOpen,
  Key,
  Watch,
  Package,
}

export default function Chatbot() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(true)
  const [showTeaser, setShowTeaser] = useState(true)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Initial welcome message
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: "👋 Hi! I'm **UFind Bot**, your campus Lost & Found assistant.\n\nDid you lose something, find an item on campus, or need help claiming a lost belonging? Ask me below!",
      timestamp: formatTime(new Date()),
      suggestions: [
        '🔍 Did anyone find a wallet?',
        '🪪 Search for ID cards',
        '🔑 Check lost keys',
        '📢 Report a lost item',
        '🤝 How does claiming work?',
      ],
    },
  ])

  // Scroll to bottom when messages update or typing occurs
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping, isOpen])

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false)
      setShowTeaser(false)
      setTimeout(() => inputRef.current?.focus(), 250)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen])

  function handleSend(textToSend) {
    const query = (textToSend || input).trim()
    if (!query) return

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: formatTime(new Date()),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate realistic thoughtful bot response time (350 - 650ms)
    setTimeout(() => {
      const response = processChatQuery(query)
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        items: response.items,
        actions: response.actions,
        suggestions: response.suggestions,
        timestamp: formatTime(new Date()),
      }
      setMessages(prev => [...prev, botMsg])
      setIsTyping(false)
    }, 450)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleClearChat() {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: "🧹 Chat cleared! How can I help you with campus lost and found items?",
        timestamp: formatTime(new Date()),
        suggestions: DEFAULT_SUGGESTIONS.slice(0, 4),
      },
    ])
  }

  function handleItemClick(itemId) {
    navigate(`/item/${itemId}`)
  }

  function handleActionClick(action) {
    if (action.path) {
      navigate(action.path)
    } else if (action.query) {
      handleSend(action.query)
    }
  }

  return (
    <aside className="chatbot-wrapper" aria-label="Campus Lost and Found Assistant">
      {/* 1. Animated Teaser Speech Bubble (invites user before clicking) */}
      {!isOpen && showTeaser && (
        <div className="chatbot-teaser" role="tooltip">
          <button
            className="chatbot-teaser-close"
            onClick={(e) => {
              e.stopPropagation()
              setShowTeaser(false)
            }}
            aria-label="Close teaser"
          >
            <X size={12} />
          </button>
          <div className="chatbot-teaser-content" onClick={() => setIsOpen(true)}>
            <span className="chatbot-teaser-sparkle">✨</span>
            <span className="chatbot-teaser-text">
              Lost something on campus? <strong>Ask me!</strong>
            </span>
          </div>
          <div className="chatbot-teaser-arrow" />
        </div>
      )}

      {/* 2. Floating Animated Launcher Symbol in the Corner */}
      <button
        className={`chatbot-launcher ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(v => !v)}
        aria-label={isOpen ? 'Close Lost & Found assistant' : 'Open Lost & Found assistant'}
        aria-expanded={isOpen}
      >
        {/* Animated Ripple waves */}
        <span className="launcher-ripple ripple-1" />
        <span className="launcher-ripple ripple-2" />

        {/* Animated moving bot mascot symbol */}
        <div className="launcher-symbol-box">
          {isOpen ? (
            <X size={26} className="launcher-close-icon" />
          ) : (
            <div className="animated-bot-mascot">
              {/* Cute SVG Animated Mascot */}
              <svg
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="bot-svg"
                aria-hidden="true"
              >
                {/* Floating Shadow */}
                <ellipse cx="32" cy="57" rx="14" ry="2.5" className="bot-shadow" />

                {/* Antenna with pulsing beacon */}
                <g className="bot-antenna-group">
                  <line x1="32" y1="16" x2="32" y2="7" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="32" cy="6" r="4.5" className="bot-beacon" fill="#48bb78" />
                  <circle cx="32" cy="6" r="2" fill="#ffffff" />
                </g>

                {/* Ears / Headphone nubs */}
                <rect x="9" y="22" width="4" height="13" rx="2" fill="#e2e8f0" />
                <rect x="51" y="22" width="4" height="13" rx="2" fill="#e2e8f0" />

                {/* Robot Head Body */}
                <rect x="13" y="15" width="38" height="27" rx="8" fill="#ffffff" className="bot-head" />
                
                {/* Screen / Visor */}
                <rect x="17" y="19" width="30" height="19" rx="5" fill="#141f16" className="bot-visor" />

                {/* Animated Blinking Eyes */}
                <g className="bot-eyes">
                  <ellipse cx="25.5" cy="28.5" rx="3.5" ry="4" fill="#48bb78" className="bot-eye bot-eye-left" />
                  <ellipse cx="38.5" cy="28.5" rx="3.5" ry="4" fill="#48bb78" className="bot-eye bot-eye-right" />
                  {/* Eye gleams */}
                  <circle cx="27" cy="27" r="1.3" fill="#ffffff" />
                  <circle cx="40" cy="27" r="1.3" fill="#ffffff" />
                </g>

                {/* Robot body base / collar */}
                <path d="M22 43 H42 L46 51 H18 L22 43Z" fill="#ffffff" />
                <circle cx="32" cy="47" r="2.2" fill="#48bb78" className="bot-heartbeat" />
              </svg>
            </div>
          )}
        </div>

        {/* Unread badge */}
        {!isOpen && hasUnread && (
          <span className="launcher-badge" aria-label="1 unread tip">
            1
          </span>
        )}
      </button>

      {/* 3. Expandable Chatbot Window */}
      {isOpen && (
        <section className="chatbot-window" role="dialog" aria-label="Campus Lost & Found Chatbot">
          {/* Header */}
          <header className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="bot-avatar-badge">
                <span className="bot-avatar-mini">🤖</span>
                <span className="status-dot-pulse" title="Online" />
              </div>
              <div>
                <h3 className="chatbot-title">UFind Assistant</h3>
                <span className="chatbot-status">
                  <span className="status-live-indicator" /> Live Campus Help
                </span>
              </div>
            </div>

            <div className="chatbot-header-actions">
              <button
                className="chatbot-icon-btn"
                onClick={handleClearChat}
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                <RotateCcw size={15} />
              </button>
              <button
                className="chatbot-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
                aria-label="Minimize chat"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </header>

          {/* Quick Prompts Bar */}
          <div className="chatbot-chips-bar" aria-label="Suggested questions">
            <div className="chatbot-chips-scroll">
              <button
                className="chip-btn"
                onClick={() => handleSend('Did anyone find a wallet?')}
              >
                🔍 Lost Wallet
              </button>
              <button
                className="chip-btn"
                onClick={() => handleSend('Search for ID cards')}
              >
                🪪 ID Card
              </button>
              <button
                className="chip-btn"
                onClick={() => handleSend('Check lost keys')}
              >
                🔑 Lost Keys
              </button>
              <button
                className="chip-btn"
                onClick={() => handleSend('How does claiming work?')}
              >
                ❓ Claiming Guide
              </button>
              <button
                className="chip-btn"
                onClick={() => handleSend('Where are campus pickup locations?')}
              >
                📍 Campus Desks
              </button>
            </div>
          </div>

          {/* Message History List */}
          <div className="chatbot-messages" role="log" aria-live="polite">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`chat-bubble-row ${msg.sender === 'user' ? 'row-user' : 'row-bot'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="bot-bubble-avatar" aria-hidden="true">
                    🤖
                  </div>
                )}

                <div className={`chat-bubble ${msg.sender === 'user' ? 'bubble-user' : 'bubble-bot'}`}>
                  {/* Formatted Text */}
                  <div className="bubble-text">
                    {renderFormattedText(msg.text)}
                  </div>

                  {/* Render Matched Item Cards if any */}
                  {msg.items && msg.items.length > 0 && (
                    <div className="bubble-items-list">
                      {msg.items.map(item => (
                        <article
                          key={item.id}
                          className="chat-item-card"
                          onClick={() => handleItemClick(item.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleItemClick(item.id)
                            }
                          }}
                        >
                          <div
                            className="chat-item-thumb"
                            style={!item.imageUrl ? { backgroundColor: getCategoryMeta(item.category).bg } : undefined}
                          >
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.title} />
                            ) : (() => {
                              const meta = getCategoryMeta(item.category)
                              const IconComp = ICON_MAP[meta.icon] || Package
                              return <IconComp size={18} color={meta.color} strokeWidth={1.75} />
                            })()}
                          </div>
                          <div className="chat-item-details">
                            <div className="chat-item-header">
                              <span className="chat-item-title">{item.title}</span>
                              <span className={`badge badge-${item.status || item.type} chat-item-badge`}>
                                {item.status || item.type}
                              </span>
                            </div>
                            <div className="chat-item-meta">
                              <span className="chat-item-location">
                                <MapPin size={11} /> {item.location}
                              </span>
                              {item.date && (
                                <span className="chat-item-date">
                                  <Calendar size={11} /> {item.date}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="chat-item-arrow" aria-hidden="true">
                            <ArrowRight size={14} />
                          </span>
                        </article>
                      ))}
                    </div>
                  )}

                  {/* Interactive Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="bubble-actions">
                      {msg.actions.map((act, idx) => (
                        <button
                          key={idx}
                          className={`btn btn-sm ${act.variant === 'danger' ? 'btn-danger' : act.variant === 'primary' ? 'btn-primary' : 'btn-secondary'} chat-action-btn`}
                          onClick={() => handleActionClick(act)}
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Suggested follow-up queries */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="bubble-suggestions">
                      <span className="suggestions-label">Suggestions:</span>
                      <div className="suggestions-wrap">
                        {msg.suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            className="suggestion-pill"
                            onClick={() => handleSend(sug.replace(/^[^\w\s]+/, '').trim())}
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className="bubble-time">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="chat-bubble-row row-bot">
                <div className="bot-bubble-avatar" aria-hidden="true">
                  🤖
                </div>
                <div className="chat-bubble bubble-bot bubble-typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            className="chatbot-footer"
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="chatbot-input"
              placeholder="Ask about lost items, claiming, reporting..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={200}
            />
            <button
              type="submit"
              className="chatbot-send-btn"
              disabled={!input.trim()}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </section>
      )}
    </aside>
  )
}

/**
 * Basic markdown parser for bold, bullet lists, and paragraphs
 */
function renderFormattedText(text = '') {
  const lines = text.split('\n')
  return lines.map((line, lIdx) => {
    if (!line.trim()) {
      return <div key={lIdx} className="text-spacer" />
    }

    // Replace **bold** with <strong>
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    const formatted = parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pIdx}>{part.slice(2, -2)}</strong>
      }
      return part
    })

    return (
      <p key={lIdx} className="formatted-line">
        {formatted}
      </p>
    )
  })
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
