require('dotenv').config({
    path: '.env'
});

import bluebird from 'bluebird';
import axios from 'axios';
import dayjs from 'dayjs';

const led_b = process.env.LED_B_CONNECTION;
const led_g = process.env.LED_G_CONNECTION;
const led_r = process.env.LED_R_CONNECTION;
const led_sw = process.env.LED_SW_CONNECTION;

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
        const delta = Math.floor(Math.random() * (2 * this.stepSize + 1)) - this.stepSize;
        this.value += delta;
        this.value = Math.max(this.min, Math.min(this.max, this.value));
        return this.value;
    }
}

const led_b_series = new SmoothRandomTimeSeriesInt(0, 1, 0, 100);
const led_g_series = new SmoothRandomTimeSeriesInt(0, 1, 0, 100);
const led_r_series = new SmoothRandomTimeSeriesInt(0, 1, 0, 100);
const led_sw_series = new SmoothRandomTimeSeriesInt(0, 1, 0, 100);

const urlAndSeries = [
    { url: led_b, series: led_b_series, key: 'led_b_brightness' },
    { url: led_g, series: led_g_series, key: 'led_g_brightness' },
    { url: led_r, series: led_r_series, key: 'led_r_brightness' },
    { url: led_sw, series: led_sw_series, key: 'led_sw_pr' },
];

setInterval(async () => {
    await bluebird.each(
        urlAndSeries,
        async ({ url, series, key }) => {
            const value = series.next();
            console.log(url, key, value);
            try {
                const pw = url.split(":")[2].split("@")[0]
                const { data } = await axios.post(
                    url,
                    { [key]: value, timeStamp: dayjs().toISOString() },
                    {
                        headers: { 'Content-Type': 'application/json' },
                        auth: {
                            username: '',
                            password: pw
                        }

                    }
                );
                console.log(data);
                console.log(`${key} : ${value} sent to ${key}`);
            } catch (error) {
                console.error(error);
            }
        }
    );
}, 10000);


