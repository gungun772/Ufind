import bcrypt from 'bcryptjs'
import { User } from './models/User.js'
import { Item } from './models/Item.js'

export async function seedInitialData() {
  try {
    // 1. Seed Admin user securely
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@ufind.edu').trim().toLowerCase()
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin#UFind2026!'
    const adminName = process.env.ADMIN_NAME || 'Campus Administrator'

    const existingAdmin = await User.findOne({ email: adminEmail })
    const salt = await bcrypt.genSalt(10)
    const newHash = await bcrypt.hash(adminPassword, salt)

    if (!existingAdmin) {
      await User.create({
        name: adminName,
        email: adminEmail,
        passwordHash: newHash,
        college: 'UFind Central Campus',
        role: 'admin',
      })
      console.log(`[Seed] Provisioned default administrator account: ${adminEmail}`)
    } else {
      existingAdmin.name = adminName
      existingAdmin.role = 'admin'
      existingAdmin.passwordHash = newHash
      await existingAdmin.save()
      console.log(`[Seed] Synchronized administrator account credentials for: ${adminEmail}`)
    }

    // 2. Seed sample items (with isSample: true) if none exist
    const sampleCount = await Item.countDocuments({ isSample: true })
    if (sampleCount === 0) {
      const sampleItems = [
        {
          title: 'Black Wallet',
          type: 'found',
          status: 'found',
          category: 'Accessories',
          description: 'A black leather bi-fold wallet found near the library entrance. Contains some cards but no cash visible.',
          location: 'Library',
          date: '2026-10-19',
          reportedBy: 'Campus Staff',
          contactHint: 'Describe the contents to verify ownership.',
          isSample: true,
          imageUrl: '/images/blackWallet.png',
        },
        {
          title: 'Student ID Card',
          type: 'lost',
          status: 'lost',
          category: 'ID Cards',
          description: 'Lost my college ID card somewhere in or around the cafeteria during lunch. Has photo and roll number.',
          location: 'Cafeteria',
          date: '2026-10-20',
          reportedBy: 'Demo Student',
          contactHint: 'Contact if found. Will describe card details.',
          isSample: true,
          imageUrl: '/images/idCard.jpg',
        },
        {
          title: 'Blue Water Bottle',
          type: 'found',
          status: 'found',
          category: 'Accessories',
          description: 'A blue metal water bottle with a white screw cap, found on a desk in Room 204.',
          location: 'Classroom Block A',
          date: '2026-10-18',
          reportedBy: 'Class Rep',
          contactHint: 'Identify bottle capacity to claim.',
          isSample: true,
          imageUrl: '/images/blueBottle.jpg',
        },
      ]

      await Item.insertMany(sampleItems)
      console.log('[Seed] Populated sample reference items (isSample: true).')
    }
  } catch (error) {
    console.error('[Seed] Initialization error:', error.message)
  }
}
