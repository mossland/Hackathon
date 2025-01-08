const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, `./.env.${process.env.NODE_ENV}`),
});

const { program } = require('commander');
program.option('-g, --game <char>');
program.option('-e, --env <char>');
program.parse();
const options = program.opts();

const fs = require('fs');
const https = require('https');

const axios = require('axios');
const unzipper = require('unzipper');

const projMeta = {
  rsp: {
    id: process.env.RSP_PROJ_ID,
    scene: process.env.RSP_PROJ_SCENE,
    name: 'RpsGame',
    extractFolder: 'rps',
  },
  headsOrTails: {
    id: process.env.HT_PROJ_ID,
    scene: process.env.HT_PROJ_SCENE,
    name: 'HeadsAndTails',
    extractFolder: 'headsOrTails',
  }
};

(async () => {
  try {
    console.log('[START] DOWNLOAD JOB');
    const { data } = await axios.post(
      `${process.env.PC_API_BASE}/apps/download`,
      {
        project_id: parseInt(projMeta[options.game].id),
        name: projMeta[options.game].name,
        scenes: [ parseInt(projMeta[options.game].scene) ],
        scripts_concatenate: true,
        scripts_minify: true,
        scripts_sourcemaps: false,
        optimize_scene_format: true,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.PC_TOKEN}`,
        }
      }
    );
    const jobId = data.id;

    let status = 'running';
    let count = 0;
    let jobData;

    while (status === 'running') {
      console.log(`[POLLING JOB] ${++count}`);
      const { data: jobStatusData } = await axios.get(
        `${process.env.PC_API_BASE}/jobs/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PC_TOKEN}`,
          },
        },
      );
      jobData = jobStatusData;
      status = jobData.status;
      await new Promise((resolve, reject) => {
        setTimeout(resolve, 1000);
      });
    }
    
    const downloadUrl = jobData.data.download_url;

    if (!fs.existsSync(path.join(__dirname, './dist'))) {
      fs.mkdirSync(path.join(__dirname, './dist'));
    }

    const file = fs.createWriteStream(`./dist/${projMeta[options.game].name}.zip`);
    await new Promise((downloadResolve, downloadReject) => {
      https.get(
        downloadUrl,
        function(response) {
          response.pipe(file);
          file.on("finish", () => {
              file.close();
              console.log("Download Completed");
              downloadResolve();
          });
        }
      );
    });

    if (!fs.existsSync(path.join(__dirname, `./dist/${projMeta[options.game].extractFolder}`))) {
      fs.mkdirSync(path.join(__dirname, `./dist/${projMeta[options.game].extractFolder}`));
    }

    fs.createReadStream(path.join(__dirname, `./dist/${projMeta[options.game].name}.zip`))
    .pipe(unzipper.Extract({ path: path.join(__dirname, `./dist/${projMeta[options.game].extractFolder}`) }));

    if (options.env === 'production') {
      const gameScriptsPath = path.join(__dirname, `./dist/${projMeta[options.game].extractFolder}/__game-scripts.js`);
      const content = fs.readFileSync(gameScriptsPath, 'utf8');
      const updatedContent = content.replace(/\"development\"/g, '"production"');
      fs.writeFileSync(gameScriptsPath, updatedContent);
    }
  } catch (e) {
    console.error(e);
  }
})();