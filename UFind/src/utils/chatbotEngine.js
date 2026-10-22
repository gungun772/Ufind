// src/utils/chatbotEngine.js
// Intelligent Lost & Found assistant engine for UFind
import { getItems } from './storage.js'
import { CATEGORIES, LOCATIONS } from '../data/sampleItems.js'

// Quick starter prompt suggestions
export const DEFAULT_SUGGESTIONS = [
  '🔍 Did anyone find a wallet?',
  '🪪 Search for ID cards',
  '🔑 Check lost keys',
  '📝 How do I report a lost item?',
  '🤝 How does claiming work?',
  '📍 Campus pickup locations',
]

/**
 * Searches the local database for items matching keywords
 */
export function searchDatabase(keyword, filterType = 'all') {
  const items = getItems()
  const q = (keyword || '').toLowerCase().trim()
  if (!q) return []

  return items.filter(item => {
    const matchesType = filterType === 'all' || item.status === filterType || item.type === filterType
    if (!matchesType) return false

    const titleMatch = (item.title || '').toLowerCase().includes(q)
    const descMatch = (item.description || '').toLowerCase().includes(q)
    const locMatch = (item.location || '').toLowerCase().includes(q)
    const catMatch = (item.category || '').toLowerCase().includes(q)

    return titleMatch || descMatch || locMatch || catMatch
  })
}

/**
 * Main query processor that analyzes user text and generates rich bot responses
 */
export function processChatQuery(rawInput) {
  const text = (rawInput || '').trim()
  const lower = text.toLowerCase()

  if (!text) {
    return {
      text: "I didn't quite catch that. How can I assist you with lost or found items today?",
      suggestions: DEFAULT_SUGGESTIONS.slice(0, 4),
    }
  }

  // 1. Greetings
  if (
    /^(hi|hello|hey|greetings|hola|good morning|good afternoon|good evening|sup|yo)\b/i.test(lower) ||
    lower === 'hi' ||
    lower === 'hello'
  ) {
    return {
      text: "👋 Hello! I'm **UFind Bot**, your campus Lost & Found assistant. I can help you search for lost belongings, look up recently found items, or guide you on how to file a report.\n\nWhat are you looking for today?",
      suggestions: [
        '🔍 I lost something',
        '📦 I found an item',
        '🔑 Find keys or ID card',
        '❓ How do I claim an item?',
      ],
    }
  }

  // 2. Who are you / About
  if (/(who are you|what can you do|help me|what is this|about you|commands)/i.test(lower)) {
    return {
      text: "🤖 **About Me:**\nI am UFind's automated assistant! Here is what I can do:\n\n• **Search live items:** Ask me about keys, IDs, wallets, bags, or laptops.\n• **Help you report:** Jump straight to reporting a lost or found item.\n• **Claiming guide:** Learn how to verify and reclaim your items.\n• **Campus info:** Details about campus lost & found collection points.",
      suggestions: DEFAULT_SUGGESTIONS.slice(0, 4),
    }
  }

  // 3. How to report lost item
  if (/(report lost|how (to|do i) report lost|lost an item|i lost|missing item)/i.test(lower) && !/(find|wallet|key|id|card|phone|bag|laptop)/i.test(lower)) {
    return {
      text: "Sorry to hear you lost something! 😟 You can submit a lost report with details like location, date, and photo. If someone finds it, they can reach out to you.",
      actions: [
        { label: '📢 Report Lost Item Now', path: '/report/lost', variant: 'danger' },
        { label: '🔍 Browse All Lost Items', path: '/', variant: 'secondary' },
      ],
      suggestions: ['Did anyone find a wallet?', 'Check lost ID cards', 'How do I claim?'],
    }
  }

  // 4. How to report found item
  if (/(report found|i found|found an item|how (to|do i) report found|turn in item)/i.test(lower) && !/(wallet|key|id|card|phone|bag|laptop)/i.test(lower)) {
    return {
      text: "Thank you for helping out the campus community! 🙌 Reporting a found item takes less than a minute. You can describe the item and specify where it was found or handed over.",
      actions: [
        { label: '✨ Report Found Item Now', path: '/report/found', variant: 'primary' },
        { label: '📍 See Campus Drop-off Desks', query: 'campus pickup locations', variant: 'secondary' },
      ],
      suggestions: ['Where should I drop off found items?', 'How does claiming work?'],
    }
  }

  // 5. How does claiming work
  if (/(how.*claim|claim.*process|how do i get my item|reclaim|verify.*ownership)/i.test(lower)) {
    return {
      text: "📋 **How to Claim an Item on UFind:**\n\n1. **Find your item** on the dashboard or search results.\n2. **Click 'Claim Item'** on the item details page.\n3. **Provide proof of ownership** (e.g. describe unique markings, unlock code, serial number, or ID verification).\n4. Once verified with the finder or campus security, arrange a safe campus handover!",
      actions: [
        { label: '👀 View Dashboard Items', path: '/', variant: 'primary' },
        { label: '📜 View My Activity & Claims', path: '/activity', variant: 'secondary' },
      ],
      suggestions: ['📍 Campus pickup locations', '🔍 Search for my lost item'],
    }
  }

  // 6. Campus locations / desk info
  if (/(where.*(drop|pickup|location|desk|office|admin|security|library|gate))/i.test(lower)) {
    return {
      text: "📍 **Campus Lost & Found Desks:**\n\n• **Main Library Helpdesk** — Ground Floor Entrance (Mon–Fri, 9am–7pm)\n• **Campus Security Office** — Near Main Gate (Open 24/7)\n• **Student Affairs / Admin Block** — Room 102 (Mon–Fri, 10am–5pm)\n• **Cafeteria Manager's Office** — Beside North Counter\n\nHigh-value items (smartphones, wallets with cash) should be handed directly to Campus Security.",
      suggestions: ['Report Found Item', 'Did anyone find a wallet?', 'Browse items'],
    }
  }

  // 7. Check specific item categories / keywords in database
  const keywords = [
    'wallet', 'purse', 'cash', 'money',
    'id', 'id card', 'student id', 'license', 'card',
    'key', 'keys', 'keychain',
    'bag', 'backpack', 'tote',
    'phone', 'iphone', 'samsung', 'mobile', 'airpods', 'headphones', 'earphones', 'charger',
    'laptop', 'macbook', 'notebook', 'book', 'bottle', 'umbrella', 'watch', 'glasses'
  ]

  let matchedKeyword = ''
  for (const kw of keywords) {
    const regex = new RegExp(`\\b${kw}s?\\b`, 'i')
    if (regex.test(lower)) {
      matchedKeyword = kw
      break
    }
  }

  // If a keyword was matched or if general search was prompted
  const searchTarget = matchedKeyword || lower.replace(/^(search|find|did anyone find|look for|check for|where is|is there|any)\s+/i, '').trim()

  if (searchTarget && searchTarget.length >= 2) {
    const isFoundQuery = lower.includes('found') || lower.includes('turn')
    const isLostQuery = lower.includes('lost') || lower.includes('missing')
    const filterType = isFoundQuery ? 'found' : (isLostQuery ? 'lost' : 'all')

    const matches = searchDatabase(searchTarget, filterType)

    if (matches.length > 0) {
      const typeLabel = filterType === 'found' ? 'found' : (filterType === 'lost' ? 'lost' : 'registered')
      return {
        text: `🔎 I found **${matches.length}** ${typeLabel} item${matches.length > 1 ? 's' : ''} matching **"${searchTarget}"**:`,
        items: matches.slice(0, 4),
        actions: [
          { label: '📢 Report Lost Item', path: '/report/lost', variant: 'secondary' },
          { label: '✨ Report Found Item', path: '/report/found', variant: 'secondary' },
        ],
        suggestions: ['How do I claim an item?', 'Search for another item'],
      }
    } else {
      // No matches found in DB
      return {
        text: `🔍 I searched for **"${searchTarget}"**, but no matching items are currently listed in the system.\n\nDon't worry! You can report it right away so other students or staff can notify you when it turns up.`,
        actions: [
          { label: `📢 Report Lost "${searchTarget}"`, path: '/report/lost', variant: 'danger' },
          { label: '✨ Report as Found', path: '/report/found', variant: 'primary' },
        ],
        suggestions: [
          '📍 Campus pickup locations',
          '🤝 How does claiming work?',
          '🔍 Show all recent items',
        ],
      }
    }
  }

  // 8. Show all / recent items
  if (/(show all|recent items|all items|latest items|browse items)/i.test(lower)) {
    const all = getItems()
    return {
      text: `📦 Currently there are **${all.length} items** in the campus registry (${all.filter(i => i.status === 'lost').length} lost, ${all.filter(i => i.status === 'found').length} found). Here are the most recent:`,
      items: all.slice(0, 4),
      actions: [
        { label: '🏠 Go to Dashboard', path: '/', variant: 'primary' },
      ],
      suggestions: ['🔍 Search for wallet', '🪪 Search for ID card', '🔑 Check lost keys'],
    }
  }

  // 9. Thanks / Gratitude
  if (/(thank|thanks|awesome|great|cool|appreciate|bye|goodbye)/i.test(lower)) {
    return {
      text: "You're very welcome! 😊 Feel free to chat with me anytime if you need more help finding or returning items. Have a wonderful day!",
      suggestions: ['🔍 Search for an item', '📝 Report an item'],
    }
  }

  // 10. Fallback with helpful suggestions
  const fallbackMatches = searchDatabase(lower.slice(0, 20), 'all')
  if (fallbackMatches.length > 0) {
    return {
      text: `I found some items that might be related to your request:`,
      items: fallbackMatches.slice(0, 3),
      suggestions: DEFAULT_SUGGESTIONS.slice(0, 4),
    }
  }

  return {
    text: "I'm not quite sure about that, but I'm here to help you navigate UFind! You can ask me to search for specific items (like *\"wallet\"*, *\"keys\"*, *\"ID card\"*), ask how claiming works, or report an item.",
    actions: [
      { label: '📢 Report Lost Item', path: '/report/lost', variant: 'secondary' },
      { label: '✨ Report Found Item', path: '/report/found', variant: 'secondary' },
    ],
    suggestions: DEFAULT_SUGGESTIONS.slice(0, 4),
  }
}
