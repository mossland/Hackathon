const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, `./.env.${process.env.NODE_ENV}`),
});

const { program } = require("commander");
program.option("-g, --game <char>");
program.parse();
const options = program.opts();

const fs = require("fs");
const https = require("https");
const axios = require("axios");
const unzipper = require("unzipper");

const MAX_RETRIES = 5;

const projMeta = {
  rsp: {
    id: process.env.RSP_PROJ_ID,
    scene: process.env.RSP_PROJ_SCENE,
    name: "RpsGame",
    extractFolder: "rps",
  },
  headsOrTails: {
    id: process.env.HT_PROJ_ID,
    scene: process.env.HT_PROJ_SCENE,
    name: "HeadsAndTails",
    extractFolder: "headsOrTails",
  },
  pizzaRevolution: {
    id: process.env.PR_PROJ_ID,
    scene: process.env.PR_PROJ_SCENE,
    name: "PizzaRevolution",
    extractFolder: "pizzaRevolution",
  },
  gemQuest: {
    id: process.env.GQ_PROJ_ID,
    scene: process.env.GQ_PROJ_SCENE,
    name: "GemQuest",
    extractFolder: "gemQuest",
  },
  doubleDice: {
    id: process.env.DD_PROJ_ID,
    scene: process.env.DD_PROJ_SCENE,
    name: "DoubleDice",
    extractFolder: "doubleDice",
  },
  diamondAndBomb: {
    id: process.env.DAB_PROJ_ID,
    scene: process.env.DAB_PROJ_SCENE,
    name: "DiamondAndBomb",
    extractFolder: "diamondAndBomb",
  },
  horseRace: {
    id: process.env.HR_PROJ_ID,
    scene: process.env.HR_PROJ_SCENE,
    name: "HorseRace",
    extractFolder: "horseRace",
  },
  oneTwoThree: {
    id: process.env.OTT_PROJ_ID,
    scene: process.env.OTT_PROJ_SCENE,
    name: "OneTwoThree",
    extractFolder: "oneTwoThree",
  },
  keno: {
    id: process.env.KENO_PROJ_ID,
    scene: process.env.KENO_PROJ_SCENE,
    name: "Keno",
    extractFolder: "keno",
  },
  luckyMatch: {
    id: process.env.LUCKY_MATCH_PROJ_ID,
    scene: process.env.LUCKY_MATCH_PROJ_SCENE,
    name: "LuckyMatch",
    extractFolder: "luckyMatch",
  },
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function downloadJob(options, projMeta, attempt = 1) {
  try {
    console.log(
      `game : ${options.game}, id :${projMeta[options.game].id}, scene : ${projMeta[options.game].scene}, name : scene : ${
        projMeta[options.game].name
      }`
    );
    console.log(`[START] DOWNLOAD JOB (attempt ${attempt})`);

    const { data } = await axios.post(
      `${process.env.PC_API_BASE}/apps/download`,
      {
        project_id: parseInt(projMeta[options.game].id),
        name: projMeta[options.game].name,
        scenes: [parseInt(projMeta[options.game].scene)],
        scripts_concatenate: true,
        scripts_minify: true,
        scripts_sourcemaps: false,
        optimize_scene_format: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PC_TOKEN}`,
        },
      }
    );

    const jobId = data.id;
    let status = "running";
    let count = 0;
    let jobData;

    while (status === "running") {
      console.log(`[POLLING JOB] ${++count}`);
      const { data: jobStatusData } = await axios.get(`${process.env.PC_API_BASE}/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${process.env.PC_TOKEN}`,
        },
      });
      jobData = jobStatusData;
      status = jobData.status;
      await delay(1000);
    }

    const downloadUrl = jobData.data.download_url;
    const distPath = path.join(__dirname, "./dist");
    const zipPath = path.join(distPath, `${projMeta[options.game].name}.zip`);
    const extractPath = path.join(distPath, projMeta[options.game].extractFolder);

    if (!fs.existsSync(distPath)) fs.mkdirSync(distPath);
    const file = fs.createWriteStream(zipPath);

    await new Promise((resolve, reject) => {
      https.get(downloadUrl, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          console.log("Download Completed");
          resolve();
        });
        file.on("error", reject);
      });
    });

    if (!fs.existsSync(extractPath)) fs.mkdirSync(extractPath);

    fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractPath }))
      .on("close", () => {
        console.log("Extraction Completed");
      });
  } catch (error) {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers["retry-after"];
      const waitTime = (retryAfter ? parseInt(retryAfter, 10) * 1000 : 5000) + 1000;
      console.warn(`[WARN] 429 Too Many Requests. Waiting ${waitTime / 1000}s before retry...`);
      await delay(waitTime);
    }

    if (attempt < MAX_RETRIES) {
      console.log(`Retrying download job... (attempt ${attempt + 1})`);
      return downloadJob(options, projMeta, attempt + 1);
    } else {
      console.error("Maximum retry attempts reached. Download failed.");
      process.exit(1);
    }
  }
}

(async () => {
  await downloadJob(options, projMeta);
})();
