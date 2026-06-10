import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  phone?: string;

  @Prop({ default: null })
  refreshToken?: string;

  @Prop()
  country?: string;

  @Prop()
  city?: string;

  @Prop()
  address1?: string;

  @Prop()
  address2?: string;

  @Prop()
  poBox?: string;

  @Prop()
  profilePicture?: string;

  @Prop()
  nationality?: string;

  @Prop()
  idType?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
