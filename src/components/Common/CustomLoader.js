import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

export const LoadingAnimation = () => {
    const green = "#32C770";
    const grey = "#ADADAD";
    const props = [
        {color: green, opacity: 1},
        {color: green, opacity: 1},
        {color: grey, opacity: 0.8},
        {color: grey, opacity: 0.6},
        {color: grey, opacity: 0.4},
        {color: grey, opacity: 0.2},
        {color: grey, opacity: 0.1},
        {color: grey, opacity: 0},
    ];

    const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const [count, setCount] = useState(0);
    
    const getIndex = (i) => {
        const j = i - 8 * Math.floor( i/8 );
        return j;
    }

    useEffect(async () => {
        await sleep(120);
        setCount(count + 1);
    }, [count])

    return (
        <svg width="101" height="100" viewBox="0 0 101 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="100.5" y="45.5947" width="8.81057" height="30.837" rx="4.40529" transform="rotate(90 100.5 45.5947)" fill={props[getIndex(count+1)].color} fill-opacity={props[getIndex(count+1)].opacity} />
            <rect x="60.9355" y="66.6652" width="8.81057" height="30.837" rx="4.40529" transform="rotate(-45 60.9355 66.6652)" fill={props[getIndex(count)].color} fill-opacity={props[getIndex(count)].opacity} />            
            <rect x="46.0938" y="69.163" width="8.81057" height="30.837" rx="4.40529" fill={props[getIndex(count+7)].color} fill-opacity={props[getIndex(count+7)].opacity} />            
            <rect x="33.834" y="60.4355" width="8.81057" height="30.837" rx="4.40529" transform="rotate(45 33.834 60.4355)" fill={props[getIndex(count+6)].color} fill-opacity={props[getIndex(count+6)].opacity} />
            <rect x="31.3379" y="45.5947" width="8.81057" height="30.837" rx="4.40529" transform="rotate(90 31.3379 45.5947)" fill={props[getIndex(count+5)].color} fill-opacity={props[getIndex(count+5)].opacity} />     
            <rect x="12.0293" y="17.7597" width="8.81057" height="30.837" rx="4.40529" transform="rotate(-45 12.0293 17.7597)" fill={props[getIndex(count+4)].color} fill-opacity={props[getIndex(count+4)].opacity} />
            <rect x="46.0938" width="8.81057" height="30.837" rx="4.40528" fill={props[getIndex(count+3)].color} fill-opacity={props[getIndex(count+3)].opacity} />
            <rect x="82.7402" y="11.5294" width="8.81057" height="30.837" rx="4.40529" transform="rotate(45 82.7402 11.5294)" fill={props[getIndex(count+2)].color} fill-opacity={props[getIndex(count+2)].opacity} />
        </svg>
    )
}

export const LoaderCtn = styled.div`
    background-color: rgba(255, 255, 255,1);
    background: linear-gradient(180deg, rgb(0,0,0) 0%, rgb(14.58, 14.58, 14.58) 100%);
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: inherit;
    height: 100%;
    top: 0;
    position: fixed;
    z-index: 9999;
`;
export const Loader = styled.div`
    margin: auto;
    align-items: center;
    display: inline-flex;
    flex-direction: column;
    gap: 24px;
`;
export const LoadingText = styled.div`
    color: #8B8B8B;
    font-family: "PP Telegraf-Medium", Helvetica;
    font-size: 16px;
    font-weight: 500;
    left: 0;
    letter-spacing: 0;
    line-height: normal;
    position: relative;
    top: 0;
    white-space: nowrap;
`;