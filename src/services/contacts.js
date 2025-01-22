import mongoose from 'mongoose';
import { ContactsCollection } from '../db/models/contact.js';

export const getAllContacts = async () => {
  const contacts = await ContactsCollection.find();
  return contacts;
};

export const getContactsById = async (contactId) => {
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    console.error('Geçersiz ID formatı:', contactId);
    throw new Error('Geçersiz ID formatı');
  }
  const contact = await ContactsCollection.findById(contactId);
  console.log('Bulunan contact :', contact);
  return contact;
};
