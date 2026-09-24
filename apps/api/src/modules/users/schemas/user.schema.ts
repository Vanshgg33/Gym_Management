import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, index: true })
  phone: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['owner', 'manager', 'frontdesk', 'trainer', 'member'] })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  photoUrl: string;

  @Prop()
  email: string;

  @Prop()
  joiningDate: Date;

  @Prop()
  staffCode: string;

  @Prop()
  specialisation: string;

  @Prop({ default: false })
  canManageSalary: boolean;

  @Prop({ default: false })
  enableSystemAccess: boolean;

  @Prop({ default: false })
  isArchived: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
