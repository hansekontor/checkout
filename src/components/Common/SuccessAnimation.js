import React from 'react';
import styled, { keyframes } from 'styled-components';


// styled css components
const outline = keyframes`
    0% { stroke-dasharray: 0, 345.576px; }
    100% { stroke-dasharray: 345.576px, 345.576px; }
`;
const circle = keyframes`
    0% { transform: scale(1); }
    100% { transform: scale(0); }
`;
const check = keyframes`
    0% { stroke-dasharray: 0, 75px; }
    100% { stroke-dasharray: 75px, 75px; }
`;
const check_ctn = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.09); }
    100% { transform: scale(1); }
`;    
const CheckCtn = styled.g`
    animation: 0.32s ease-in-out 1.03s ${check_ctn};
    transform-origin: center;
`;
const Check = styled.polyline`
    animation: 0.34s cubic-bezier(0.65, 0, 1, 1) 0.8s forwards ${check};
    stroke-dasharray: 0, 75px;
    stroke-linecap: round;
    stroke-linejoin: round;
`;
const CircleOutline = styled.circle`
    animation: 0.38s ease-in ${outline};
    transform: rotate(0deg);
    transform-origin: center;
`;
const WhiteCircle = styled.circle`
    animation: 0.35s ease-in 0.35s forwards ${circle};
    transform: none;
    transform-origin: center;
`;


const SuccessAnimation = () => {
   
    return (
        <>
            <svg
                width="115px"
                height="115px"
                viewBox="0 0 133 133"
            >
                <CheckCtn
                    stroke="none"
                    stroke-width="1"
                    fill="none"
                    fill-rule="evenodd"
                >
                    <circle
                        id="filled-circle"
                        fill="#32C770"
                        cx="66.5"
                        cy="66.5"
                        r="54.5"
                    />
                    <WhiteCircle
                        fill="#FFFFFF"
                        cx="66.5"
                        cy="66.5"
                        r="55.5"
                    />
                    <CircleOutline
                        stroke="#32C770"
                        stroke-width="4"
                        cx="66.5"
                        cy="66.5"
                        r="54.5"
                    />
                    <Check
                        stroke="#FFFFFF"
                        stroke-width="20"
                        points="41 70 56 85 92 49"
                    />
                </CheckCtn>
            </svg>        
        </>
    )
}

export default SuccessAnimation;