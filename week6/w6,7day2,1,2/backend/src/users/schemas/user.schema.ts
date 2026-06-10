import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  passwordHash: string;

  @Prop({ type: String, enum: Role, default: Role.USER })
  role: Role;

  @Prop({ default: 0 })
  points: number;

  @Prop({ type: String, default: null })
  refreshToken: string | null;

  @Prop({ type: String, default: 'local' })
  provider: string; // The primary provider used to create the account

  @Prop({ type: String, default: null })
  providerId: string | null;

  @Prop({ type: String, default: null })
  avatar: string | null;

  @Prop({ type: [{ provider: String, providerId: String }], default: [] })
  authIdentities: { provider: string; providerId: string }[];

  @Prop({ type: Date, default: null })
  lastLoginAt: Date | null;

  @Prop({ type: [{ timestamp: Date, method: String }], default: [] })
  loginActivity: { timestamp: Date; method: string }[];
}

export const UserSchema = SchemaFactory.createForClass(User);
