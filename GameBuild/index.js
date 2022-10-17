const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, `./.env.${process.env.NODE_ENV}`),
});

const { program } = require('commander');
program.option('-g, --game <char>');
program.parse();
const options = program.opts();


const axios = require('axios');

const projMeta = {
  rsp: {
    id: process.env.RSP_PROJ_ID,
    scene: process.env.RSP_PROJ_SCENE,
    name: 'Mossland Metaverse Game - Rock Paper Scissors',
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

    const downloadUrl = jobData.download_url;
  } catch (e) {
    console.error(e);
  }
})();