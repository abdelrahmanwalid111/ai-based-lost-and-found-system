import mongoose from 'mongoose';

export interface IUser {
  _id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  fraudUser: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  fraudUser: { type: String, default: 'false' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User; 