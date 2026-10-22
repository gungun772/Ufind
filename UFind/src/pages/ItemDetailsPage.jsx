// src/pages/ItemDetailsPage.jsx
import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Calendar, Tag, User, Info,
  CheckCircle, Laptop, CreditCard, ShoppingBag, BookOpen, Key, Watch, Package
} from 'lucide-react'
import { getItemById, updateItem } from '../utils/storage.js'
import { getCategoryMeta } from '../utils/categoryIcons.js'
import ClaimDialog from '../components/ClaimDialog.jsx'
import './ItemDetailsPage.css'

const ICON_MAP = { Laptop, CreditCard, ShoppingBag, BookOpen, Key, Watch, Package }

function formatDate(d) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return d }
}

export default function ItemDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(() => getItemById(id))
  const [showClaim, setShowClaim] = useState(false)
  const [claimSubmitted, setClaimSubmitted] = useState(false)
  const [markingRecovered, setMarkingRecovered] = useState(false)

  const meta = useMemo(() => item ? getCategoryMeta(item.category) : null, [item])
  const IconComp = meta ? (ICON_MAP[meta.icon] ?? Package) : Package

  if (!item) {
    return (
      <main className="page">
        <div className="container">
          <button className="details-back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={17} /> Back to Home
          </button>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
            Item not found. It may have been removed.
          </p>
        </div>
      </main>
    )
  }

  function handleMarkRecovered() {
    setMarkingRecovered(true)
    const updated = updateItem(item.id, { status: 'recovered' })
    setItem(prev => ({ ...prev, status: 'recovered' }))
    setTimeout(() => setMarkingRecovered(false), 800)
  }

  const isOwner = item.reportedBy === 'You (demo)'
  const isRecovered = item.status === 'recovered'

  const actionLabel = item.status === 'found' ? 'I Think This Is Mine' : 'Contact the Reporter'

  return (
    <main className="page">
      <div className="container">
        <button className="details-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft size={17} /> Back
        </button>

        <div className="details-layout">
          {/* Left: Image + Info */}
          <div className="details-main">
            {/* Image */}
            <div className="details-image-wrap">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title} className="details-image" />
              ) : (
                <div className="details-placeholder" aria-hidden="true">
                  <IconComp size={56} color={meta.color} strokeWidth={1.25} />
                  <span className="details-placeholder-label">{item.category}</span>
                </div>
              )}
            </div>

            {/* Info card */}
            <div className="details-card">
              <div className="details-badge-row">
                <span className={`badge badge-${item.status}`}>
                  {item.status === 'lost' ? 'Lost' : item.status === 'found' ? 'Found' : 'Recovered'}
                </span>
                <span className="details-category-chip">
                  <Tag size={12} aria-hidden="true" /> {item.category}
                </span>
                {item.isSample && (
                  <span className="sample-chip">Sample data</span>
                )}
              </div>

              <h1 className="details-title">{item.title}</h1>
              <p className="details-description">{item.description}</p>

              <div className="divider" />

              <ul className="details-meta-list" aria-label="Item details">
                <li className="details-meta-item">
                  <span className="details-meta-icon" aria-hidden="true"><MapPin size={16} /></span>
                  <div>
                    <div className="details-meta-label">Location</div>
                    <div className="details-meta-value">{item.location}</div>
                  </div>
                </li>
                <li className="details-meta-item">
                  <span className="details-meta-icon" aria-hidden="true"><Calendar size={16} /></span>
                  <div>
                    <div className="details-meta-label">Date {item.status === 'lost' ? 'lost' : 'found'}</div>
                    <div className="details-meta-value">{formatDate(item.date)}</div>
                  </div>
                </li>
                <li className="details-meta-item">
                  <span className="details-meta-icon" aria-hidden="true"><User size={16} /></span>
                  <div>
                    <div className="details-meta-label">Reported by</div>
                    <div className="details-meta-value">{item.reportedBy ?? 'Anonymous Student'}</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="details-sidebar" aria-label="Actions">
            <div className="details-action-card">
              {isRecovered ? (
                <div className="recovered-notice">
                  <CheckCircle size={20} aria-hidden="true" />
                  This item has been recovered. 🎉
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="details-action-title">
                      {isOwner ? 'Your report' : 'Recognise this item?'}
                    </h2>
                    <p className="details-action-sub">
                      {isOwner
                        ? 'You submitted this report. Mark it as recovered once the item is returned to you.'
                        : item.contactHint ?? 'Get in touch with the reporter to claim or return this item.'}
                    </p>
                  </div>

                  {!isOwner && !claimSubmitted && (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => setShowClaim(true)}
                    >
                      {actionLabel}
                    </button>
                  )}

                  {!isOwner && claimSubmitted && (
                    <div className="recovered-notice" style={{ background: 'var(--color-primary-tint)', borderColor: '#c8dcc8', color: 'var(--color-primary-dark)' }}>
                      <CheckCircle size={18} aria-hidden="true" />
                      Demo claim submitted! Check My Activity.
                    </div>
                  )}

                  {isOwner && (
                    <button
                      className="btn btn-secondary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={handleMarkRecovered}
                      disabled={markingRecovered}
                    >
                      {markingRecovered ? 'Updating…' : 'Mark as Recovered ✓'}
                    </button>
                  )}
                </>
              )}
            </div>

            {item.isSample && (
              <div className="sample-notice">
                <Info size={14} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
                This is a sample item added to demonstrate the app. Real submissions appear here too.
              </div>
            )}

            <div className="details-action-card" style={{ gap: 10 }}>
              <h2 className="details-action-title" style={{ fontSize: '0.9375rem' }}>Something wrong?</h2>
              <p className="details-action-sub">
                If this item is yours or has already been claimed elsewhere, you can report it resolved from <strong>My Activity</strong>.
              </p>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('/activity')}
                style={{ alignSelf: 'flex-start' }}
              >
                Go to My Activity
              </button>
            </div>
          </aside>
        </div>

        {showClaim && (
          <ClaimDialog
            item={item}
            onClose={() => setShowClaim(false)}
            onSuccess={() => { setClaimSubmitted(true); setShowClaim(false) }}
          />
        )}
      </div>
    </main>
  )
}
