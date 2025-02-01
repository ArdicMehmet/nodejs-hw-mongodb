import { ContactsCollection } from '../db/models/contact.js';

export const getAllContacts = async () => {
  const contacts = await ContactsCollection.find();
  return contacts;
};

export const getContactsById = async (contactId) => {
  const contact = await ContactsCollection.findById(contactId);
  return contact;
};

export const createContact = async (payload) => {
  const contact = await ContactsCollection.create(payload);
  return contact;
};

export const deleteContact = async (contactId) => {
  const contact = await ContactsCollection.findOneAndDelete({
    _id: contactId,
  });

  return contact;
};

export const updateContact = async (contactId, payload, options = {}) => {
  const isPatch = options?.upsert === true;

  if (!isPatch) {
    // PUT işlemi: Eğer 'upsert' yoksa, 'findOneAndUpdate' kullanılır
    const rawResult = await ContactsCollection.findOneAndUpdate(
      { _id: contactId },
      payload,
      {
        new: true, // Güncellenen değeri döndür
        includeResultMetadata: true, // Metadata ekle
        ...options, // Diğer seçenekler
      },
    );

    if (!rawResult || !rawResult?.value) return null;

    return {
      contact: rawResult?.value || null,
      isNew: Boolean(rawResult?.lastErrorObject?.upserted), // 'lastErrorObject' sadece 'findOneAndUpdate' ile gelir
    };
  }

  // PATCH işlemi: Eğer 'upsert' varsa, 'replaceOne' kullanılır
  const result = await ContactsCollection.replaceOne(
    { _id: contactId },
    payload,
    {
      upsert: false, // 'false' çünkü yeni veri eklenmemeli
    },
  );

  if (!result || result.modifiedCount === 0) return null;

  return {
    contact: payload, // PATCH işlemi olduğu için payload'ı döndürmelisin
    isNew: Boolean(result.upsertedCount), // Upsert ile yeni eklenip eklenmediğini kontrol et
  };
};
