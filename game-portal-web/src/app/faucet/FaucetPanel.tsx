"use client";
import { useState, useEffect, useRef } from 'react';
import Script from 'next/script'
import axios from 'axios';

import { zero, one, two, three, four, five, six, seven, eight, nine, dot } from './Number';

import styles from './page.module.scss';


export default function FaucetPanel() {
    const rcpRef = useRef(null);

    const [ userPoint, setUserPoint ] = useState(0);
    const token = window.sessionStorage.getItem('token');
    const n = [
        zero, one, two, three, four, five, six, seven, eight, nine
    ];

    const renderRecaptcha = () => {
        if (document.querySelector('#g-recaptcha')!.childElementCount === 0) {
            rcpRef.current = (window as any).grecaptcha.render(
                'g-recaptcha',
                {
                    sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
                    theme: 'dark',
                }
            );
        }
    };

    const fetchUserBalance = async () => {
        const { data } = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE}/user/point`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        );
        setUserPoint(data.point);
    }
    useEffect(() => {
        const init = async () => {
            await fetchUserBalance();
            if (userPoint >= 1000) { return; }
            if (!(window as any).grecaptcha) {
                (window as any).onLoadRecaptcha = () => {
                    renderRecaptcha();
                };
            } else {
                renderRecaptcha();
            }
        }
        init();
        

        return () => {
            if (typeof rcpRef.current === typeof 0) {
                (window as any).grecaptcha.reset(rcpRef.current);
            }
        };
    }, [ userPoint ]);

    
    

    const requestFaucet = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!(window as any).grecaptcha) {
            return;
        }
        
        if (typeof rcpRef.current !== typeof 0) {
            return;
        }

        const resp = (window as any).grecaptcha.getResponse(rcpRef.current);
        if (!resp) {
            return;
        }

        try {
            const { data } = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE}/user/faucet`,
                {
                    recaptchaToken: resp,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            (window as any).grecaptcha.reset(rcpRef.current);

            setUserPoint(
                userPoint + data.deltaPoint
            );
        } catch (e) {
            alert('fail');
        }
    };

    if (!token) {
        return (
            <div className={styles.error}>
                <h1 className={styles.errorTitleBlock}>ERROR!</h1>
                <p className={styles.errorDesc}>User token is missing</p>
            </div>
        );
    } else {
        return (
            
            <div className={ styles.faucetPanel }>
                <pre className={ styles.figure }>
                    {
`        @@         @@@@@         @@              
      @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@             
       @@@@@@    @@@@@@@@@    @@@@@@              
                    @@@                           
                    @@@                           
                 @@@@@@@@@                        
               @@@@@@@@@@@@@                      
                @@@@@@@@@@                        
@@@@#          @@@@@@@@@@@@@                      
@@@@@        @@@@@@@@@@@@@@@@@@@                  
@@@@@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@       
@@@@@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@    
@@@@@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   
@@@@@        @@@@@@@@@@@@@@@@@@@    @@@@@@@@@@@@  
@@@@@           @@@@@@@@@@@@@         &@@@@@@@@@  
                                        @@@@@@@@@ 
                                        @@@@@@@@@ 
                                       @@@@@@@@@@@

                                            @     
                                            @,    
                                          @@@@@   
                                         @@@@@@@  
                                        @@@@@@@@@ 
                                          @@@@@   

`}
                </pre>
                <div className={ styles.request }>
                    Your current points are
                    <div className={[styles.bigNumber, userPoint.toString().length > 6 ? styles.scroll : ''].join(' ')}>
                    {
                        Array.from({length: userPoint.toString().length}).map((_, idx) => {
                            if (userPoint.toString().charAt(idx) === '.') {
                                return dot(idx);
                            } else {
                                return n[parseInt(userPoint.toString().charAt(idx))](idx);
                            }
                        })
                    }
                    </div>
                    <div className={styles.desc}>
                        When your points fall below 1000,<br/>you can use the faucet to replenish them for free.
                    </div>


                    {
                        userPoint >= 1000 ?
                        null
                        :
                        <form onSubmit={requestFaucet} className={styles.requestForm}>
                            <Script src={`https://www.google.com/recaptcha/api.js?onload=onLoadRecaptcha&render=explicit`} async defer></Script>
                            <div id={"g-recaptcha"}></div>
                            <button type={'submit'} className={styles.requestBtn}>Request</button>
                        </form>
                    }
                </div>
            </div>
        );
    }
}
