import { useEffect, useMemo, useRef, useState } from 'react';
import bluebird from 'bluebird';
import dayjs from 'dayjs';
import { Chart } from 'chart.js/auto';

import TandemClient, { IStreamDataResponse } from './util/TandemClient';
import TandemViewer from './util/TandemViewer';
import ConnectionConfigManager, { IConnectionConfig } from './util/ConnectionConfigManager';

import styles from './App.module.scss';
import './App.scss'

const isDebug = false;
Chart.defaults.color = '#fff';
Chart.defaults.borderColor = '#ffffff26';

export interface IStreamData {
	metadata: IConnectionConfig;
	value: IStreamDataResponse;
	schema: { [key: string]: { name: string, forgeUnit: string, forgeSymbol: string, allowedValues?: { list?: string[], map?: { [key: string]: number } } } };
}

const schemaColorSchems = [
	'rgb(75, 192, 192)',
	'rgb(147, 38, 248)',
	'rgb(243, 50, 124)',
	'rgb(240, 206, 52)',
	'rgb(94, 242, 96)',
	'rgb(71, 116, 237)',
	'rgb(137, 93, 217)',
	'rgb(230, 69, 69)',
];

const forgeUnitToAbbr: any = {
	fahrenheit: 'F',
	cubicFeetPerMinute: 'CFM',
	percentage: '%',
}

function App() {
	const [tandemViewer, setTandemViewer] = useState<TandemViewer | null>(null);

	const [showUi, setShowUi] = useState<boolean>(true);
	const [streamData, setStreamData] = useState<IStreamData | null>(null);
	const chartStreamData = useMemo(() => {
		if (!streamData) {
			return {};
		} else {
			return Object.keys(streamData.value).reduce((acc: any, k, idx) => {
				const chartKey = streamData.schema[k];
				if (chartKey) {
					const timeSerieseObj = streamData.value[k];
					const sortedKeys = Object.keys(timeSerieseObj).sort();
					const labels = sortedKeys.map((sk, idx) => {
						if (idx === 0) {
							return dayjs(
								new Date(Number(sk))
							).format('YYYY-MM-DD HH:mm:ss');
						} else {
							const prevSk = dayjs(Number(sortedKeys[0]));
							const curtime = dayjs(new Date(Number(sk)));
							return `+${curtime.diff(prevSk, 'minutes')} min.`;
						}

					});
					const datasets = [{
						label: `${streamData.schema[k].name} (${forgeUnitToAbbr[streamData.schema[k].forgeUnit ? streamData.schema[k].forgeUnit : 'percentage' ]})`,
						data: sortedKeys.map((sk) => {
							return (timeSerieseObj as any)[sk];
						}),
						fill: false,
						borderColor: schemaColorSchems[idx % schemaColorSchems.length],
						tension: 0.1,
					}];

					acc[chartKey.name] = {
						labels,
						datasets,
					};

					if (streamData.schema[k].allowedValues) {
						(acc[chartKey.name]).options = {
							plugins: {
								legend: {
									display: false,
								}
							},
							scales: {
								y: {
									ticks: {
										callback: function (v: any) {
											const normValue = v;
											const reversedObj = Object.keys(streamData.schema[k].allowedValues!.map!).reduce((acc: { [key: string]: string }, v: any) => {
												acc[streamData.schema[k].allowedValues!.map![v]] = v;
												return acc;
											}, {});
											return reversedObj[normValue];
										}
									}
								}
							}
						}
					}
				}
				return acc;
			}, {});
		}
	}, [streamData]);

	const chartRef = useRef<Chart[]>([]);

	useEffect(() => {
		if (!chartStreamData || Object.keys(chartStreamData).length === 0) {
			return;
		}
		if (Object.keys(chartStreamData).length > 0) {
			if (chartRef.current.length > 0) {
				chartRef.current.forEach((chart) => {
					chart.destroy();
				});
			}
			Object.keys(chartStreamData).forEach((key) => {
				const config = {
					type: 'line',
					data: chartStreamData[key],
				};
				if (chartStreamData[key].options) {
					(config as any).options = chartStreamData[key].options;
				}

				const chartObj = new Chart(
					document.getElementById(`chart-${key}`) as HTMLCanvasElement,
					config,
				);
				chartRef.current.push(chartObj);
			});
		}
	}, [chartStreamData])

	const viewerRef = useRef<HTMLDivElement>(null);
	function corruptedStringToUint8Array(str: string) {
		const uint8Array = new Uint8Array(str.length * 2);
		for (let i = 0; i < str.length; i++) {
			const code = str.charCodeAt(i);
			uint8Array[i * 2] = code & 0xFF;
			uint8Array[i * 2 + 1] = (code >> 8) & 0xFF;
		}
		return uint8Array;
	}
	function uint8ToBase64Url(uint8Array: Uint8Array) {
		let binary = '';
		uint8Array.forEach((byte: number) => binary += String.fromCharCode(byte));
		const base64 = btoa(binary);
		return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
	}
	function getClassNameByDbId(dbId: number, dbId2Class: any) {
		const { sid2idx, buf, idx } = dbId2Class;
		const classIdx = sid2idx[dbId] - 1; // dbId로 클래스 인덱스 얻기
		if (classIdx < 0) {
			return '';
		}
		const start = idx[classIdx];    // 시작 위치
		const end = idx[classIdx + 1];  // 끝 위치
		return buf.substring(start, end); // 클래스 이름 추출
	}

	useEffect(() => {
		const initTandemViewer = async () => {
			await ConnectionConfigManager.instance.loadData();
			if (!tandemViewer) {
				return;
			}
			await tandemViewer.initialize(viewerRef.current as HTMLElement);
			const facilityList = await tandemViewer.fetchFacilities();
			await tandemViewer.openFacility(facilityList[0]);
			// console.log(Object.keys(tandemViewer.viewer.listeners));
			tandemViewer.viewer.listeners['aggregateSelection'].push({
				once: false,
				priority: 0,
				callbackFn: async (e: any) => {
					if (e.selections.length > 0) {
						const model = e.selections[0].model;
						const dbId = e.selections[0].dbIdArray[0];
						console.log(`modelId: ${model.modelFacets.id}`);
						console.log(`modelUrn: ${model.modelFacets.modelUrn}`);
						console.log(`dbId: ${dbId}`);

						let extId = '';
						(model.myData.autoDbIds.extIdToIndex as Map<string, number>).forEach((value, key) => {
							if (value === dbId) {
								extId = uint8ToBase64Url(corruptedStringToUint8Array(key));
							}
						});
						console.log(`extId: ${extId}`);

						const className = getClassNameByDbId(dbId, model.myData.dbId2Class);
						console.log(`className: ${className}`);

						const data = await TandemClient.instance.scanModel(model.modelFacets.modelUrn);
						const scanData = data.filter((d) => {
							if (typeof d === 'string') {
								return false;
							} else {
								if (d.k && d.k === extId) {
									return true;
								}
							}
						});
						console.log(scanData);
						const conn = scanData.map((sd) => {
							const connectionConfig: IConnectionConfig[] = [];
							Object.values(sd).filter((sdv: any[]) => {
								if (typeof sdv[0] === typeof 'string') {
									const config = ConnectionConfigManager.instance.fetchDataFromName(sdv[0]);
									if (config.length > 0) {
										config.forEach((c) => {
											connectionConfig.push(c);
										});
									};
									return config.length > 0;
								} else {
									return false;
								}
							});
							return connectionConfig;
						});
						const connList = conn.reduce((acc: IConnectionConfig[], c) => {
							acc.push(...c);
							return acc;
						}, []);

						if (connList.length > 0) {
							console.log(connList[0]);
							const streamData: IStreamDataResponse | null = await TandemClient.instance.getStreamData(connList[0], model.modelFacets.modelUrn);
							if (!streamData) {
								return;
							}
							const rawSchema = await bluebird.map(Object.keys(streamData), async (sdKey) => {
								return TandemClient.instance.getModelSchema(model.modelFacets.modelUrn, sdKey);
							});
							if (streamData) {
								const schemaIdName = rawSchema.reduce((acc: { [key: string]: { name: string, forgeUnit: string, forgeSymbol: string, allowedValues?: { list?: string[], map?: { [key: string]: number } } } }, s: any) => {
									if (s.attributes) {
										s.attributes.forEach((attr: any) => {
											if (attr && attr.id && attr.name) {
												acc[attr.id] = {
													name: attr.name,
													forgeUnit: attr.forgeUnit || '',
													forgeSymbol: attr.forgeSymbol || '',
												};
												if (attr.allowedValues) {
													acc[attr.id].allowedValues = attr.allowedValues;
												}
											}
										});
									}
									return acc;
								}, {} as { [key: string]: { name: string, forgeUnit: string, forgeSymbol: string, allowedValues?: { list?: string[], map?: { [key: string]: number } } } });
								setStreamData({
									metadata: connList[0],
									value: streamData,
									schema: schemaIdName,
								});
								setShowUi(true);
							}
						}
					}
				},
			});
		};
		if (!tandemViewer) {
			const v = TandemViewer.instance;
			setTandemViewer(_ => v);
			(window as any).tandemViewer = v;
		} else if (!tandemViewer.isInitialized) {
			initTandemViewer();
		}

		return () => {
			if (tandemViewer) {
				tandemViewer.viewer.listeners['aggregateSelection'].forEach((listener: any) => {
					listener.callbackFn = () => { };
				});
			}
		}
	}, [tandemViewer]);

	return (
		<>
			<div className={styles.viewerContainer}>
				<div id={styles.viewer} ref={viewerRef}></div>
			</div>
			{
				showUi && (
					<div className={styles.uiContainer}>
						{
							streamData ?
								<div className={styles.uiCard}>
									<div className={styles.cardHead}>
										<h1>{streamData?.metadata.Name}</h1>
										<div className={styles.subtitle}>
											{streamData?.metadata["Assembly Code"]} / {streamData?.metadata["Classification"]} / {streamData?.metadata.fullId}
										</div>
									</div>
									<div className={styles.cardBody}>
										<div className={styles.cardBodyItem}>

											{
												Object.keys(chartStreamData).map((key) => {
													return (<div className={styles.chartWrapper} key={key}>
														<h2>{key}</h2>
														<canvas id={`chart-${key}`}></canvas>
													</div>);
												})
											}

											{isDebug && (
												<p>
													{JSON.stringify(chartStreamData)}
													{/* {JSON.stringify(streamData?.value)} */}
												</p>
											)}
										</div>
									</div>
								</div>
								:
								null
						}

					</div>
				)
			}

		</>
	)
}

export default App
