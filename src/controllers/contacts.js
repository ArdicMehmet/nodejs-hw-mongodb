import createHttpError from 'http-errors';
import {
  createContact,
  deleteContact,
  getAllContacts,
  getContactsById,
  updateContact,
} from '../services/contacts.js';
import mongoose from 'mongoose';

export const getContactsController = async (req, res, next) => {
  console.log(req.body);

  const contacts = await getAllContacts();
  if (contacts.length == 0 || contacts == null) {
    throw createHttpError(404, 'Contacts not found');
  }
  return res.json({
    data: contacts,
    status: 200,
    message: 'Successfully found contacts',
  });
};

export const getContactsByIdController = async (req, res, next) => {
  const { contactId } = req.params;
  if (!contactId) {
    throw createHttpError(404, 'ContactId not found');
  }
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw createHttpError(500, 'Invalid id format');
  }
  const contact = await getContactsById(contactId);

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
  console.log(data);
  if (!data) {
    throw createHttpError(400, 'Invalid input data');
  }
  const contact = await createContact(data);
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
  if (!contactId) {
    throw createHttpError(404, 'ContactId not found');
  }
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw createHttpError(500, 'Invalid id format');
  }
  const contact = await deleteContact(contactId);
  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }
  res.status(204).send();
};

export const upsertContactController = async (req, res) => {
  const { contactId } = req.params;
  if (!contactId) {
    throw createHttpError(404, 'ContactId not found');
  }
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw createHttpError(500, 'Invalid id format');
  }

  const contact = await updateContact(contactId, req.body, {
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
  if (!contactId) {
    throw createHttpError(404, 'ContactId not found');
  }
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw createHttpError(500, 'Invalid id format');
  }

  const contact = await updateContact(contactId, req.body);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.json({
    status: 200,
    message: `Successfully patched a contact!`,
    data: contact.data,
  });
};
