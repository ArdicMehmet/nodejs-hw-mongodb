import { ContactsCollection } from '../db/models/contact.js';

export const getAllContacts = async (
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder = 1,
  contactType = null,
  isFavourite = null,
  user,
) => {
  let filter = {
    userId: user._id,
  };

  if (contactType) {
    filter.contactType = contactType;
  }

  if (isFavourite !== null) {
    filter.isFavourite = isFavourite;
  }

  const totalItems = await ContactsCollection.countDocuments(filter);
  const skip = (page - 1) * perPage > totalItems ? 0 : (page - 1) * perPage;
  const contacts = await ContactsCollection.find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(perPage);

  return {
    data: contacts,
    page: skip == 0 ? 1 : page,
    perPage,
    totalItems,
    totalPages: Math.ceil(totalItems / perPage),
    hasPreviousPage: page > 1,
    hasNextPage: page * perPage < totalItems,
  };
};

export const getContactsById = async (contactId, userId) => {
  const contact = await ContactsCollection.findOne({ _id: contactId, userId });
  return contact;
};

export const createContact = async (payload) => {
  const contact = await ContactsCollection.create(payload);
  return contact;
};

export const deleteContact = async (contactId, userId) => {
  const contact = await ContactsCollection.findOneAndDelete({
    _id: contactId,
    userId,
  });

  return contact;
};

export const updateContact = async (
  contactId,
  userId,
  payload,
  options = {},
) => {
  const isPatch = options?.upsert === true;

  if (!isPatch) {
    // PUT işlemi: Eğer 'upsert' yoksa, 'findOneAndUpdate' kullanılır
    const rawResult = await ContactsCollection.findOneAndUpdate(
      { _id: contactId, userId },
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
    { _id: contactId, userId },
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
