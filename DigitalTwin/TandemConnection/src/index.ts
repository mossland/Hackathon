require('dotenv').config({
    path: '.env'
});

import fs from 'fs';
import bluebird from 'bluebird';
import axios from 'axios';
import dayjs from 'dayjs';
import csvParser from 'csv-parser';
import Big from 'big.js';

// const led_b = process.env.LED_B_CONNECTION;
// const led_g = process.env.LED_G_CONNECTION;
// const led_r = process.env.LED_R_CONNECTION;
// const led_sw = process.env.LED_SW_CONNECTION;

class SmoothRandomTimeSeriesInt {
    private value: number;
    private readonly stepSize: number;
    private readonly min: number;
    private readonly max: number;

    constructor(initialValue = 5, stepSize = 1, min = 0, max = 10) {
        this.value = initialValue;
        this.stepSize = stepSize;
        this.min = min;
        this.max = max;
    }

    next(): number {
        const ran = Math.random();
        const delta = ran < 0.33 ? -this.stepSize : ran < 0.66 ? 0 : this.stepSize;
        this.value += delta;
        this.value = Math.max(this.min, Math.min(this.max, this.value));
        return Big(this.value).round(2, 0).toNumber();
    }
}

// const led_b_series = new SmoothRandomTimeSeriesInt(0, 1, 0, 100);
// const led_g_series = new SmoothRandomTimeSeriesInt(0, 1, 0, 100);
// const led_r_series = new SmoothRandomTimeSeriesInt(0, 1, 0, 100);
// const led_sw_series = new SmoothRandomTimeSeriesInt(0, 1, 0, 100);

// const urlAndSeries = [
//     { url: led_b, series: led_b_series, key: 'led_b_brightness' },
//     { url: led_g, series: led_g_series, key: 'led_g_brightness' },
//     { url: led_r, series: led_r_series, key: 'led_r_brightness' },
//     { url: led_sw, series: led_sw_series, key: 'led_sw_pr' },
// ];

const interval = 20000;

(async () => {
    const rawConnections: any[] = await new Promise((resolve, reject) => {
        const connections: any[] = [];
        fs.createReadStream('connections_export.csv')
            .pipe(csvParser())
            .on('data', (row) => {
                connections.push(row);
            })
            .on('end', () => {
                resolve(connections);
            });
    });

    const urlAndSeriese = rawConnections.map((connection) => {
        return {
            url: connection.ingestionUrl,
            airFlowSeries: new SmoothRandomTimeSeriesInt(20, 0.5, 15, 28),
            humiditySeries: new SmoothRandomTimeSeriesInt(78, 0.5, 56, 100),
            occupancySeries: new SmoothRandomTimeSeriesInt(0, 1, 0, 2),
            temperatureSeries: new SmoothRandomTimeSeriesInt(57, 0.1, 40, 72),
        }
    });


    setInterval(async () => {
        console.log(`Start ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);
        await bluebird.map(
            urlAndSeriese,
            async ({ url, airFlowSeries, humiditySeries, occupancySeries, temperatureSeries }, index) => {
                console.log(`${index + 1} of ${urlAndSeriese.length}`);
                const occNext = occupancySeries.next();
                const body = {
                    air_flow: airFlowSeries.next(),
                    humidity: humiditySeries.next(),
                    occupancy: occNext === 0 ? 'Free' : occNext === 1 ? 'Occupied' : 'Unavailable',
                    temperature: temperatureSeries.next(),
                    ts: dayjs().toISOString()
                };
                try {
                    const pw = url.split(":")[2].split("@")[0]
                    const { data } = await axios.post(
                        url,
                        body,
                        {
                            headers: { 'Content-Type': 'application/json' },
                            auth: {
                                username: '',
                                password: pw
                            }

                        }
                    );
                    console.log(`${body.air_flow} (CFM - airflow) : ${body.humidity} (%RH - humidity) : ${body.occupancy} (occupancy) : ${body.temperature} (F - temperature) sent to ${url}`);
                } catch (error) {
                    console.error(error);
                }
            },
            { concurrency: 45 }
        );
        console.log(`End ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);
        console.log(`Next run in ${interval / 1000} seconds`);
    }, interval);
})();






