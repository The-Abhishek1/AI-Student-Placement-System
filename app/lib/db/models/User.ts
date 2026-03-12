import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'institution' | 'student';
  institution?: string;
  notifications: INotification[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface INotification {
  id: string;
  type: 'match' | 'job' | 'placement' | 'system';
  title: string;
  message: string;
  read: boolean;
  data?: any;
  createdAt: Date;
}

const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true, default: () => new mongoose.Types.ObjectId().toString() },
  type: { type: String, enum: ['match', 'job', 'placement', 'system'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  data: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'institution', 'student'], default: 'institution' },
  institution: { type: String },
  notifications: [NotificationSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);