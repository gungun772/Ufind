// src/pages/HomePage.jsx
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react'
import ItemCard from '../components/ItemCard.jsx'
import SearchAndFilters from '../components/SearchAndFilters.jsx'
import EmptyState from '../components/EmptyState.jsx'
import LostItemIllustration from '../components/illustrations/LostItemIllustration.jsx'
import FoundItemIllustration from '../components/illustrations/FoundItemIllustration.jsx'
import { getItems } from '../utils/storage.js'
import './HomePage.css'

export default function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [activeStatus, setActiveStatus] = useState('all')
  const [refreshKey, setRefreshKey] = useState(0)

  // Re-read items when we come back to this page
  const allItems = useMemo(() => getItems(), [refreshKey])

  const filtered = useMemo(() => {
    return allItems.filter(item => {
      const matchStatus = activeStatus === 'all' || item.status === activeStatus
      const matchCat = !activeCategory || item.category === activeCategory
      const q = query.toLowerCase()
      const matchQuery = !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      return matchStatus && matchCat && matchQuery
    })
  }, [allItems, query, activeCategory, activeStatus])

  const counts = useMemo(() => ({
    all: allItems.length,
    lost: allItems.filter(i => i.status === 'lost').length,
    found: allItems.filter(i => i.status === 'found').length,
    recovered: allItems.filter(i => i.status === 'recovered').length,
  }), [allItems])

  const categoryCounts = useMemo(() => {
    const map = { '': allItems.length }
    allItems.forEach(item => {
      map[item.category] = (map[item.category] || 0) + 1
    })
    return map
  }, [allItems])

  function clearFilters() {
    setQuery('')
    setActiveCategory('')
    setActiveStatus('all')
  }

  return (
    <main className="page">
      <div className="container">
        {/* Hero */}
        <section className="hero" aria-labelledby="hero-headline">
          <div className="hero-eyebrow" aria-hidden="true">
            <Sparkles size={12} /> Campus Lost & Found
          </div>
          <h1 className="hero-headline" id="hero-headline">
            Lost something?<br />
            <em>Let's help you find it.</em>
          </h1>
          <p className="hero-sub">
            Report it in a few simple steps. Your campus community can help.
          </p>

          {/* Lost and Found Action Cards */}
          <div className="lost-found-section" role="region" aria-label="Lost and Found actions">
            {/* Card 1: Lost an Item */}
            <article
              className="lf-card lf-card-lost"
              onClick={() => navigate('/report/lost')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate('/report/lost')
                }
              }}
              aria-label="Lost an Item? You can Post a lost item here for easy recovery"
            >
              <div className="lf-card-illustration" aria-hidden="true">
                <LostItemIllustration className="lf-illustration-svg" />
              </div>
              <div className="lf-card-body">
                <div className="lf-card-text">
                  <h2 className="lf-card-title">Lost an Item?</h2>
                  <p className="lf-card-desc">
                    You can Post a lost item here for easy recovery
                  </p>
                </div>
                <div className="lf-card-action">
                  <button
                    type="button"
                    className="lf-action-btn lf-btn-lost"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate('/report/lost')
                    }}
                    aria-label="Post a lost item"
                  >
                    Post It
                  </button>
                </div>
              </div>
            </article>

            {/* Card 2: Found an Item */}
            <article
              className="lf-card lf-card-found"
              onClick={() => navigate('/report/found')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate('/report/found')
                }
              }}
              aria-label="Found an Item? Post a found item for easy reach by the owner"
            >
              <div className="lf-card-illustration" aria-hidden="true">
                <FoundItemIllustration className="lf-illustration-svg" />
              </div>
              <div className="lf-card-body">
                <div className="lf-card-text">
                  <h2 className="lf-card-title">Found an Item?</h2>
                  <p className="lf-card-desc">
                    Post a found item for easy reach by the owner
                  </p>
                </div>
                <div className="lf-card-action">
                  <button
                    type="button"
                    className="lf-action-btn lf-btn-found"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate('/report/found')
                    }}
                    aria-label="Post a found item"
                  >
                    Post It
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="search-section" aria-label="Search and filter">
          <SearchAndFilters
            query={query}
            onQueryChange={setQuery}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            activeStatus={activeStatus}
            onStatusChange={setActiveStatus}
            counts={counts}
            categoryCounts={categoryCounts}
          />
        </section>

        {/* Items */}
        <section className="items-section" aria-labelledby="items-section-title">
          <div className="section-header">
            <h2 className="section-title" id="items-section-title">Recently Reported Items</h2>
            <span className="section-count" aria-live="polite">
              {filtered.length} item{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filtered.length > 0 ? (
            <div className="items-grid" role="list" aria-label="Item listings">
              {filtered.map(item => (
                <div key={item.id} role="listitem" className="items-grid-item">
                  <ItemCard item={item} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No items match your search"
              message="Try different keywords or clear the filters to see all items."
              actions={
                <button className="btn btn-secondary" onClick={clearFilters}>
                  Clear filters
                </button>
              }
            />
          )}
        </section>
      </div>
    </main>
  )
}
