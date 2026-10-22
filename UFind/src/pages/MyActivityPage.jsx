// src/pages/MyActivityPage.jsx
import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  CheckCheck,
  Search,
  Plus,
  ArrowRight,
  Trash2,
  Clock,
  MapPin,
  Calendar,
  MessageSquare,
  HelpCircle,
  ExternalLink,
} from 'lucide-react'
import { getMyItems, updateItem, deleteItem, getClaims } from '../utils/storage.js'
import { getCategoryMeta } from '../utils/categoryIcons.js'
import EmptyState from '../components/EmptyState.jsx'
import './MyActivityPage.css'

export default function MyActivityPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'lost' | 'found' | 'recovered' | 'claims'
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [toastMessage, setToastMessage] = useState(null)

  const myItems = useMemo(() => getMyItems(), [refreshKey])
  const myClaims = useMemo(() => getClaims(), [refreshKey])

  function showToast(msg) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  function handleMarkRecovered(id, e) {
    e.stopPropagation()
    updateItem(id, { status: 'recovered' })
    setRefreshKey(k => k + 1)
    showToast('Item marked as successfully recovered! 🎉')
  }

  function handleDelete(id, title, e) {
    e.stopPropagation()
    if (window.confirm(`Are you sure you want to remove the report for "${title}"?`)) {
      deleteItem(id)
      setRefreshKey(k => k + 1)
      showToast('Report removed.')
    }
  }

  // Metrics
  const stats = useMemo(() => {
    const lostCount = myItems.filter(i => i.type === 'lost' && i.status === 'lost').length
    const foundCount = myItems.filter(i => i.type === 'found' && i.status === 'found').length
    const recoveredCount = myItems.filter(i => i.status === 'recovered').length
    const claimsCount = myClaims.length
    return { lostCount, foundCount, recoveredCount, claimsCount, total: myItems.length }
  }, [myItems, myClaims])

  // Filtered Items
  const filteredItems = useMemo(() => {
    let list = myItems
    if (activeTab === 'lost') {
      list = list.filter(i => i.type === 'lost' && i.status !== 'recovered')
    } else if (activeTab === 'found') {
      list = list.filter(i => i.type === 'found' && i.status !== 'recovered')
    } else if (activeTab === 'recovered') {
      list = list.filter(i => i.status === 'recovered')
    }

    if (!searchQuery.trim()) return list
    const q = searchQuery.toLowerCase()
    return list.filter(
      i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    )
  }, [myItems, activeTab, searchQuery])

  return (
    <main className="page activity-page">
      <div className="container">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="activity-toast" role="status" aria-live="polite">
            <CheckCheck size={18} /> {toastMessage}
          </div>
        )}

        {/* Page Header */}
        <div className="activity-header">
          <div>
            <div className="activity-eyebrow">
              <Activity size={14} /> Campus Activity Dashboard
            </div>
            <h1 className="activity-title">My Activity</h1>
            <p className="activity-sub">
              Manage items you have lost, found, recovered, or claimed across campus.
            </p>
          </div>

          <div className="activity-quick-actions">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/report/lost')}
            >
              <Plus size={15} /> Report Lost
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/report/found')}
            >
              <Plus size={15} /> Report Found
            </button>
          </div>
        </div>

        {/* Metrics Overview Cards */}
        <div className="activity-metrics-grid" role="region" aria-label="Activity summary statistics">
          <div
            className={`metric-card lost-metric${activeTab === 'lost' ? ' active' : ''}`}
            onClick={() => setActiveTab('lost')}
            role="button"
            tabIndex={0}
          >
            <div className="metric-icon lost-icon" aria-hidden="true">
              <AlertCircle size={22} />
            </div>
            <div className="metric-info">
              <span className="metric-num">{stats.lostCount}</span>
              <span className="metric-label">Items Lost by Me</span>
            </div>
            <span className="metric-indicator">Click to view</span>
          </div>

          <div
            className={`metric-card found-metric${activeTab === 'found' ? ' active' : ''}`}
            onClick={() => setActiveTab('found')}
            role="button"
            tabIndex={0}
          >
            <div className="metric-icon found-icon" aria-hidden="true">
              <CheckCircle2 size={22} />
            </div>
            <div className="metric-info">
              <span className="metric-num">{stats.foundCount}</span>
              <span className="metric-label">Items Found by Me</span>
            </div>
            <span className="metric-indicator">Click to view</span>
          </div>

          <div
            className={`metric-card recovered-metric${activeTab === 'recovered' ? ' active' : ''}`}
            onClick={() => setActiveTab('recovered')}
            role="button"
            tabIndex={0}
          >
            <div className="metric-icon recovered-icon" aria-hidden="true">
              <CheckCheck size={22} />
            </div>
            <div className="metric-info">
              <span className="metric-num">{stats.recoveredCount}</span>
              <span className="metric-label">Recovered / Returned</span>
            </div>
            <span className="metric-indicator">Click to view</span>
          </div>

          <div
            className={`metric-card claims-metric${activeTab === 'claims' ? ' active' : ''}`}
            onClick={() => setActiveTab('claims')}
            role="button"
            tabIndex={0}
          >
            <div className="metric-icon claims-icon" aria-hidden="true">
              <MessageSquare size={22} />
            </div>
            <div className="metric-info">
              <span className="metric-num">{stats.claimsCount}</span>
              <span className="metric-label">Inquiries & Claims</span>
            </div>
            <span className="metric-indicator">Click to view</span>
          </div>
        </div>

        {/* Filter Navigation & Search */}
        <div className="activity-controls">
          <div className="activity-tabs" role="tablist" aria-label="Activity filter tabs">
            <button
              className={`activity-tab${activeTab === 'all' ? ' active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'all'}
              onClick={() => setActiveTab('all')}
            >
              All Reports ({stats.total})
            </button>
            <button
              className={`activity-tab${activeTab === 'lost' ? ' active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'lost'}
              onClick={() => setActiveTab('lost')}
            >
              Lost ({stats.lostCount})
            </button>
            <button
              className={`activity-tab${activeTab === 'found' ? ' active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'found'}
              onClick={() => setActiveTab('found')}
            >
              Found ({stats.foundCount})
            </button>
            <button
              className={`activity-tab${activeTab === 'recovered' ? ' active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'recovered'}
              onClick={() => setActiveTab('recovered')}
            >
              Recovered ({stats.recoveredCount})
            </button>
            <button
              className={`activity-tab${activeTab === 'claims' ? ' active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'claims'}
              onClick={() => setActiveTab('claims')}
            >
              Inquiries ({stats.claimsCount})
            </button>
          </div>

          {activeTab !== 'claims' && (
            <div className="activity-search-box">
              <Search size={16} className="activity-search-icon" />
              <input
                type="text"
                placeholder="Search within my reports…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="activity-search-input"
              />
            </div>
          )}
        </div>

        {/* Tab 1-4: Items List */}
        {activeTab !== 'claims' && (
          <div className="activity-items-list" role="list" aria-label="My reported items list">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => {
                const meta = getCategoryMeta(item.category)
                const isRecovered = item.status === 'recovered'
                return (
                  <article key={item.id} className="activity-item-card" role="listitem">
                    {/* Item Thumbnail */}
                    <div className="activity-thumb-wrap">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="activity-thumb" />
                      ) : (
                        <div
                          className="activity-thumb-placeholder"
                          style={{ backgroundColor: meta.bg, color: meta.color }}
                        >
                          {item.category?.slice(0, 2).toUpperCase() || 'UF'}
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="activity-card-content">
                      <div className="activity-card-header">
                        <div className="activity-badges">
                          <span
                            className={`badge badge-${
                              isRecovered ? 'recovered' : item.type === 'lost' ? 'lost' : 'found'
                            }`}
                          >
                            {isRecovered
                              ? 'Recovered'
                              : item.type === 'lost'
                              ? 'Lost Item'
                              : 'Found Item'}
                          </span>
                          <span className="activity-category-tag">{item.category}</span>
                        </div>
                        <span className="activity-date">
                          <Calendar size={13} /> {item.date}
                        </span>
                      </div>

                      <h3 className="activity-item-title">{item.title}</h3>
                      <p className="activity-item-desc">{item.description}</p>

                      <div className="activity-meta-row">
                        <span className="activity-meta-chip">
                          <MapPin size={13} /> {item.location}
                        </span>
                        {item.holdingLocation && (
                          <span className="activity-meta-chip holding-chip">
                            Location: {item.holdingLocation}
                          </span>
                        )}
                        {item.reward && (
                          <span className="activity-meta-chip reward-chip">
                            🎁 Reward: {item.reward}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="activity-actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/item/${item.id}`)}
                      >
                        View Post <ExternalLink size={13} />
                      </button>

                      {!isRecovered && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm btn-recover"
                          onClick={e => handleMarkRecovered(item.id, e)}
                        >
                          <CheckCheck size={14} /> Mark Recovered
                        </button>
                      )}

                      <button
                        type="button"
                        className="activity-delete-btn"
                        onClick={e => handleDelete(item.id, item.title, e)}
                        title="Delete report"
                        aria-label="Delete report"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                )
              })
            ) : (
              <EmptyState
                title="No items found in this section"
                message="You can report a new lost or found item to keep track of it here."
                actions={
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-secondary" onClick={() => navigate('/report/lost')}>
                      Report Lost Item
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate('/report/found')}>
                      Report Found Item
                    </button>
                  </div>
                }
              />
            )}
          </div>
        )}

        {/* Tab 5: Inquiries & Claims */}
        {activeTab === 'claims' && (
          <div className="activity-claims-list">
            {myClaims.length > 0 ? (
              myClaims.map((claim, idx) => (
                <div key={claim.id || idx} className="activity-claim-card">
                  <div className="claim-header">
                    <span className="claim-type-badge">Ownership Claim / Inquiry</span>
                    <span className="claim-date">
                      <Clock size={13} />{' '}
                      {claim.timestamp
                        ? new Date(claim.timestamp).toLocaleDateString('en-IN')
                        : 'Recent'}
                    </span>
                  </div>
                  <h3 className="claim-title">Inquiry on Item #{claim.itemId}</h3>
                  <p className="claim-message">
                    <strong>Verification details provided:</strong> {claim.message || claim.notes || 'Details submitted to finder.'}
                  </p>
                  <div className="claim-contact-box">
                    <span>Contact: {claim.contact || 'Anonymous Student'}</span>
                  </div>
                  <div className="claim-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/item/${claim.itemId}`)}
                    >
                      View Related Item <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No inquiries or claims submitted yet"
                message="When you submit an inquiry or claim an item found by another student, it will appear here so you can track its progress."
                actions={
                  <button className="btn btn-primary" onClick={() => navigate('/')}>
                    Browse Campus Items
                  </button>
                }
              />
            )}
          </div>
        )}
      </div>
    </main>
  )
}
