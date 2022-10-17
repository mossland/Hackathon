const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, `./.env.${process.env.NODE_ENV}`),
});

const { Command } = require('commander');
const axios = require('axios');

(async () => {
  await axios.post(
    `${process.env.PC_API_BASE}/apps/download`,
    {
      
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PC_TOKEN}`,
      }
    }
  );
})();