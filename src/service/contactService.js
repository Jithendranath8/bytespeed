const db = require("../config/db");

const identifyContact = async (req, res) => {
  const { email, phoneNumber } = req.body;
  if (!email && !phoneNumber) {
    return res.status(400).json({ error: "Either email or phoneNumber is required" });
  }
  try {
    //Finding all contacts that match either the given email or phone number form the post req
    const [contacts] = await db.execute(
      `SELECT * FROM Contact 
       WHERE (email = ? OR phoneNumber = ?) AND deletedAt IS NULL`,
      [email, phoneNumber]
    );
    if (contacts.length === 0) {
      //If no matching contacts are found, we will create a new primary contact
      const [insertResult] = await db.execute(
        `INSERT INTO Contact (phoneNumber, email, linkPrecedence, createdAt, updatedAt) 
         VALUES (?, ?, 'primary', NOW(), NOW())`,
        [phoneNumber, email]
      );
      // generating response with the respective post req
      const newContactId = insertResult.insertId;
      return res.status(200).json({
        contact: {
          primaryContactId: newContactId,
          emails: email ? [email] : [],
          phoneNumbers: phoneNumber ? [phoneNumber] : [],
          secondaryContactIds: [],
        },
      });
    }

    // Determine the primary contact
    const primaryContact =
      contacts.find((contact) => contact.linkPrecedence === "primary") ||
      contacts.reduce((oldest, current) =>
        new Date(oldest.createdAt) < new Date(current.createdAt)
          ? oldest
          : current
      );

    //Here i'm Find all linked contacts
    const [linkedContactsResult] = await db.execute(
      `SELECT * FROM Contact 
       WHERE (linkedId = ? OR id = ?) AND deletedAt IS NULL`,
      [primaryContact.id, primaryContact.id]
    );

    const linkedContacts = [...new Set([...contacts, ...linkedContactsResult])];

    //Update any primary contacts to become secondary if needed
    const updatePromises = contacts
      .filter(
        (contact) =>
          contact.id !== primaryContact.id &&
          contact.linkPrecedence === "primary"
      )
      .map((contact) =>
        db.execute(
          `UPDATE Contact 
           SET linkedId = ?, linkPrecedence = 'secondary', updatedAt = NOW() 
           WHERE id = ?`,
          [primaryContact.id, contact.id]
        )
      );

    await Promise.all(updatePromises);

    //Consolidate all contact details into the response format
    const consolidatedContact = {
      primaryContactId: primaryContact.id,
      emails: [
        ...new Set(
          linkedContacts.map((contact) => contact.email).filter(Boolean)
        ),
      ],
      phoneNumbers: [
        ...new Set(
          linkedContacts.map((contact) => contact.phoneNumber).filter(Boolean)
        ),
      ],
      secondaryContactIds: linkedContacts
        .filter((contact) => contact.id !== primaryContact.id)
        .map((contact) => contact.id),
    };

    // sending Response with consolidated contact details
    return res.status(200).json({ contact: consolidatedContact });
  } catch (error) {
    console.error("Error identifying contact:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { identifyContact };
