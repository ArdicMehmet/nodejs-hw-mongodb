import { model, Schema } from 'mongoose';
// import { ROLES } from '../../constants/index.js';

const usersSchema = new Schema(
  {
    name: {
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
    password: {
      type: String,
      required: true,
    },
    // role: {
    //   type: String,
    //   enum: [ROLES.TEACHER, ROLES.PARENT],
    //   default: ROLES.PARENT,
    // },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

usersSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const UsersCollection = model('users', usersSchema);
