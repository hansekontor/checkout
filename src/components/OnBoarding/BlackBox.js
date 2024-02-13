import React from 'react';
import styled from 'styled-components';
import MRCLogo from '../../assets/mrc_logo.svg';


const Box = styled.div`
    height: 385px;
    left: 0;
    position: relative;
    top: 0;
    margin: 0;
    padding: 0;
    background-color: #000000;
    color: #000000;
    width: inherit;
`;
const BrandWrapper = styled.div`
    align-items: center;
    display: inline-flex;
    gap: 8px;
    left: 10%;
    position: absolute;
    top: 50px;
    color: #000000;
`;
const BrandText = styled.div`
    color: #ffffff;
    font-family: "PP Telegraf-SemiBold", Helvetica;
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 0;
    line-height: normal;
    position: relative;
    white-space: nowrap; 
    width: fit-content;
`; 
const BrandLogo = styled.div`
    background-image: url(${MRCLogo});
    height: 42px;
    position: relative; 
    width: 32px;
    stroke: transparent;
    stroke-width: 0px;
    color: #000000;
`;
const GuideWrapper = styled.div`
    position: center;
    height: 128px;
    position: relative;
    width: 85%;
    margin-top: 170px;
    margin-left: 7%;
    text-align: left;
`;
const GuideHeader = styled.div`
    color: #ffffff;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0;
    line-height: normal;
    white-space: nowrap;
    width: fit-content;
    padding-bottom: 0px;
`;
// const DividerWrapper = styled.div`
//     color: #ffffff;
//     height: 0.5px;
//     left: 0;
//     object-fit: cover;
//     padding-bottom: 34px;
// `;

const Divider = styled.div`
    height: 1px;
    margin-top: 17px;
    margin-bottom: 17px;
    background-color: #ffffff;
    object-fit: cover;
    left: 0;
`;

const GuideText = styled.div`
    color: #ffffff;
    font-family: "Inter-Medium", Helvetica;
    font-size: 18px;
    font-weight: 500; 
    letter-spacing: 0;
    line-height: 25.2px;
    position: absolute;
    left: 0;
`;


export const BlackBox = () => {
    return (
        <Box>
            <BrandWrapper>
                <BrandLogo /><BrandText>MAR</BrandText>
            </BrandWrapper>

            <GuideWrapper>
                <GuideHeader>MRC // SECURE CHECKOUT</GuideHeader>
                <Divider />
                <GuideText>
                    This is not like any other checkout <br />
                    Your fiat payment initiates a crypto payment to the merchant.
                </GuideText>
            </GuideWrapper>
        </Box>
    )
}
