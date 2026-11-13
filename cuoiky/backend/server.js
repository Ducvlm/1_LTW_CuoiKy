const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Kết nối MongoDB Atlas thành công!'))
  .catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err));

app.get('/', (req, res) => {
  res.send('API QuizMaster đang chạy...');
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
});