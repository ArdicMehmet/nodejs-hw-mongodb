import { model, Schema } from 'mongoose';

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String, // Email verisi string olarak tutulur
      required: true, // Zorunlu alan
      unique: true, // Tekil olması için
      lowercase: true, // Küçük harfe çevirme
      trim: true, // Boşlukları temizleme
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Lütfen geçerli bir e-posta adresi giriniz',
      ],
    },
    isFavourite: {
      type: Boolean,
      required: false,
      default: false,
    },
    contactType: {
      type: String,
      required: false,
      enum: ['work', 'home', 'personal'],
      default: 'personal',
    },
    userId: { type: Schema.Types.ObjectId, ref: 'users' },
    photo: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const ContactsCollection = model('contacts', contactSchema);
