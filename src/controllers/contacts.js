import createHttpError from 'http-errors';
import {
  createContact,
  deleteContact,
  getAllContacts,
  getContactsById,
  updateContact,
} from '../services/contacts.js';
import mongoose from 'mongoose';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import dotenv from 'dotenv';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
dotenv.config();

export const getContactsController = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;
  const sortBy = req.query.sortBy || 'name'; // Varsayılan olarak 'name' ile sıralanacak
  const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1; // 'desc' ise azalan, 'asc' ise artan sıralama
  const contactType = req.query.type || null; // İletişim türü (null olursa, filtreleme yapılmaz)
  const isFavourite =
    req.query.isFavourite !== undefined
      ? JSON.parse(req.query.isFavourite)
      : null; // Favori durumu (null olursa, filtreleme yapılmaz)
  const user = req.user;
  if (page < 1 || perPage < 1) {
    throw createHttpError(400, 'page and perPage must be 1 or greater.');
  }
  const contacts = await getAllContacts(
    page,
    perPage,
    sortBy,
    sortOrder,
    contactType,
    isFavourite,
    user,
  );

  return res.json({
    status: 200,
    message:
      contacts.data.length > 0
        ? 'Successfully found contacts!'
        : 'No contacts found',
    data: {
      ...contacts,
    },
  });
};

export const getContactsByIdController = async (req, res, next) => {
  const { contactId } = req.params;

  const userId = req.user._id;
  if (!contactId) {
    throw createHttpError(404, 'ContactId not found');
  }
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw createHttpError(500, 'Invalid id format');
  }
  const contact = await getContactsById(contactId, userId);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }
  return res.json({
    data: contact,
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
  });
};

export const createContactController = async (req, res) => {
  const data = req.body;
  const photo = req.file;
  let photoUrl;

  if (photo) {
    if (process.env['ENABLE_CLOUDINARY'] === 'true') {
      console.log('Photo içinde if e girdi');
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }

  if (!data) {
    throw createHttpError(400, 'Invalid input data');
  }

  const contact = await createContact({
    ...data,
    userId: req.user._id,
    photo: photoUrl,
  });
  if (!contact) {
    throw createHttpError(500, 'Database error');
  }
  res.status(201).json({
    status: 201,
    message: `Successfully created a contact!`,
    data: contact,
  });
};

export const deleteContactController = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  if (!contactId) {
    throw createHttpError(404, 'ContactId not found');
  }
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw createHttpError(500, 'Invalid id format');
  }
  const contact = await deleteContact(contactId, userId);
  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }
  res.status(204).send();
};

export const upsertContactController = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  if (!contactId) {
    throw createHttpError(404, 'ContactId not found');
  }
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw createHttpError(500, 'Invalid id format');
  }

  const contact = await updateContact(contactId, userId, req.body, {
    upsert: true,
  });

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }
  const status = contact.isNew ? 201 : 200;

  res.status(status).json({
    status,
    message: `Successfully upserted a contact!`,
    data: contact.data,
  });
};
export const patchContactController = async (req, res) => {
  const { contactId } = req.params;
  let patchedContact = { ...req.body };
  const userId = req.user._id;
  const photo = req.file;

  if (!contactId) {
    throw createHttpError(404, 'ContactId not found');
  }
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw createHttpError(500, 'Invalid id format');
  }

  let photoUrl;

  if (photo) {
    if (process.env['ENABLE_CLOUDINARY'] === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }

  photoUrl ? (patchedContact = { ...patchedContact, photo: photoUrl }) : '';
  console.log('patched CONTACT : ', patchedContact);

  const contact = await updateContact(contactId, userId, patchedContact);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.json({
    status: 200,
    message: `Successfully patched a contact!`,
    data: contact.data,
  });
};
