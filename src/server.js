// src/server.js

import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import { env } from './utils/env.js';
import { getAllContacts, getContactsById } from './services/contacts.js';

const PORT = Number(env('PORT', 3000));

export const startServer = () => {
  const app = express();
  app.use(express.json());
  app.use(cors());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.get('/contacts', async (req, res) => {
    try {
      const contacts = await getAllContacts();
      res.status(200).json({
        status: 200,
        data: contacts,
        message: 'Successfully found contacts!',
      });
    } catch (e) {
      res.status(404).json({
        message: `Contacts not found, ${e}`,
        data: [],
      });
    }
  });
  app.get('/contacts/:contactId', async (req, res) => {
    try {
      const contactId = req.params.contactId;
      const contact = await getContactsById(contactId);
      if (!contact) {
        return res
          .status(404)
          .json({ status: 404, message: 'Contact not found', data: null });
      }

      res
        .status(200)
        .json({
          status: 200,
          message: `Successfully found contact with id ${contactId}!`,
          data: contact,
        });
    } catch (error) {
      res.status(400).json({ message: error.message, data: null });
    }
  });

  app.use('*', (req, res, next) => {
    res.status(404).json({
      message: 'Not found',
    });
  });

  app.use((err, req, res, next) => {
    res.status(500).json({
      message: 'Something went wrong',
      error: err.message,
    });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
