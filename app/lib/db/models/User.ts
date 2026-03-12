import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'institution' | 'student';
  institution?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  department?: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  lastPasswordChange: Date;
  lastLogin: Date;
  loginHistory: Array<{
    date: Date;
    ip: string;
    device: string;
    location: string;
  }>;
  activeSessions: Array<{
    device: string;
    browser: string;
    location: string;
    lastActive: Date;
  }>;
  apiKey?: string;
  apiSecret?: string;
  whitelistedIPs: string[];
  rateLimit: number;
  apiUsage: number;
  apiEndpoints: Array<{
    path: string;
    method: string;
    calls: number;
    lastCalled: Date;
  }>;
  notificationSettings: {
    emailAlerts: boolean;
    matchUpdates: boolean;
    jobAlerts: boolean;
    placementUpdates: boolean;
    marketingEmails: boolean;
    browserNotifications: boolean;
    mobileNotifications: boolean;
    digestFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    primaryColor: string;
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
    animations: boolean;
    sidebarCollapsed: boolean;
  };
  integrations: Array<{
    id: string;
    name: string;
    connected: boolean;
    lastSync?: Date;
    config?: Record<string, any>;
  }>;
  notifications: any[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false }, // select: false is important
  role: { type: String, enum: ['admin', 'institution', 'student'], default: 'institution' },
  institution: { type: String },
  avatar: { type: String },
  bio: { type: String },
  phone: { type: String },
  department: { type: String },
  
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, select: false },
  lastPasswordChange: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  loginHistory: [{
    date: { type: Date, default: Date.now },
    ip: String,
    device: String,
    location: String
  }],
  activeSessions: [{
    device: String,
    browser: String,
    location: String,
    lastActive: { type: Date, default: Date.now }
  }],
  
  apiKey: { type: String, unique: true, sparse: true },
  apiSecret: { type: String, select: false },
  whitelistedIPs: [{ type: String }],
  rateLimit: { type: Number, default: 1000 },
  apiUsage: { type: Number, default: 0 },
  apiEndpoints: [{
    path: String,
    method: String,
    calls: { type: Number, default: 0 },
    lastCalled: Date
  }],
  
  notificationSettings: {
    emailAlerts: { type: Boolean, default: true },
    matchUpdates: { type: Boolean, default: true },
    jobAlerts: { type: Boolean, default: true },
    placementUpdates: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },
    browserNotifications: { type: Boolean, default: true },
    mobileNotifications: { type: Boolean, default: false },
    digestFrequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'never'], default: 'weekly' }
  },
  
  appearance: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'dark' },
    primaryColor: { type: String, default: '#3B82F6' },
    fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    compactMode: { type: Boolean, default: false },
    animations: { type: Boolean, default: true },
    sidebarCollapsed: { type: Boolean, default: false }
  },
  
  integrations: [{
    id: String,
    name: String,
    connected: { type: Boolean, default: false },
    lastSync: Date,
    config: mongoose.Schema.Types.Mixed
  }],
  
  notifications: [{
    id: { type: String, required: true },
    type: { type: String, enum: ['match', 'job', 'placement', 'system'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    data: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now }
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Don't recompile the model if it already exists
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);