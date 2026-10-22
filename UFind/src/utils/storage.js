// src/utils/storage.js
// Safe localStorage helpers for UFind demo persistence.

import { SAMPLE_ITEMS } from '../data/sampleItems.js'

const ITEMS_KEY = 'ufind_items'
const CLAIMS_KEY = 'ufind_claims'

// ---- Items ----

export function getItems() {
  try {
    const raw = localStorage.getItem(ITEMS_KEY)
    if (!raw) return [...SAMPLE_ITEMS]
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return [...SAMPLE_ITEMS]
    return parsed
  } catch {
    return [...SAMPLE_ITEMS]
  }
}

export function saveItems(items) {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
  } catch {
    // Storage quota exceeded — silently ignore in demo
  }
}

export function addItem(item) {
  const items = getItems()
  const updated = [{ ...item, isMyItem: true, reportedBy: 'You (demo)' }, ...items]
  saveItems(updated)
  return updated
}

export function updateItem(id, changes) {
  const items = getItems()
  const updated = items.map(i => (i.id === id ? { ...i, ...changes } : i))
  saveItems(updated)
  return updated
}

export function deleteItem(id) {
  const items = getItems()
  const updated = items.filter(i => i.id !== id)
  saveItems(updated)
  return updated
}

export function getItemById(id) {
  return getItems().find(i => i.id === id) ?? null
}

export function isUserItem(item) {
  if (!item) return false
  return (
    item.reportedBy === 'You (demo)' ||
    item.isMyItem === true ||
    (typeof item.id === 'string' && item.id.startsWith('user-'))
  )
}

export function getMyItems() {
  return getItems().filter(isUserItem)
}

// ---- Claims ----

export function getClaims() {
  try {
    const raw = localStorage.getItem(CLAIMS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function saveClaims(claims) {
  try {
    localStorage.setItem(CLAIMS_KEY, JSON.stringify(claims))
  } catch {}
}

export function addClaim(claim) {
  const claims = getClaims()
  const updated = [{ ...claim, id: generateId(), timestamp: new Date().toISOString() }, ...claims]
  saveClaims(updated)
  return updated
}

// ---- Reset ----

export function resetDemo() {
  localStorage.removeItem(ITEMS_KEY)
  localStorage.removeItem(CLAIMS_KEY)
}

// ---- ID generator ----

export function generateId() {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
