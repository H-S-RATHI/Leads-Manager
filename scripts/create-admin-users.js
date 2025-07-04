const bcrypt = require("bcryptjs")
const mongoose = require("mongoose")

// Load environment variables
require("dotenv").config({ path: ".env.local" })

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("MongoDB connected successfully")
  } catch (error) {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  }
}

// User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["super_admin", "admin", "sales_rep"],
    default: "sales_rep",
  },
  profilePhoto: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

const User = mongoose.models.User || mongoose.model("User", userSchema)

async function createAdminUsers() {
  try {
    await connectDB()

    // Create Super Admin
    if (process.env.SUPER_ADMIN_EMAIL && process.env.SUPER_ADMIN_PASSWORD) {
      const existingSuperAdmin = await User.findOne({ email: process.env.SUPER_ADMIN_EMAIL })
      if (!existingSuperAdmin) {
        const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 12)
        await User.create({
          name: process.env.SUPER_ADMIN_NAME || "Super Administrator",
          email: process.env.SUPER_ADMIN_EMAIL,
          password: hashedPassword,
          role: "super_admin",
        })
        console.log("✅ Super Admin created successfully")
      } else {
        console.log("ℹ️  Super Admin already exists")
      }
    } else {
      console.log("⚠️  Super Admin credentials not found in environment variables")
    }

    // Create Admin
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL })
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12)
        await User.create({
          name: process.env.ADMIN_NAME || "Administrator",
          email: process.env.ADMIN_EMAIL,
          password: hashedPassword,
          role: "admin",
        })
        console.log("✅ Admin created successfully")
      } else {
        console.log("ℹ️  Admin already exists")
      }
    } else {
      console.log("⚠️  Admin credentials not found in environment variables")
    }

    console.log("🎉 Admin users setup completed")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error creating admin users:", error)
    process.exit(1)
  }
}

createAdminUsers()
