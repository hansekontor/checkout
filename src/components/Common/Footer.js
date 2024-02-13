import styled from 'styled-components';
import React from 'react';
import LockSvg from '@assets/lock_icon.svg';
import CardSvg from '@assets/card_icon.svg';
import MastercardSvg from '@assets/mastercard_icon.svg';
import VisaSvg from '@assets/visa_icon.svg';

const Footer = () => {
    const FooterCtn = styled.div`
        background-color: #f6f6f6;
        align-items: center;
        justify-content: center;
        position: absolute;
        width: 85%;
        left: 7%;
        bottom: 25px;
        height: 50px;
        justify-content: flex-start;

        a {
            color: black;

            :hover {
                color: grey;
            }
        }
    `;
    const Divider = styled.div`
        height: 0.5px;
        left: 0;
        margin-top: 17px;
        margin-bottom: 17px;
        background-color: #D7D7D7;
    `;
    const FooterLine = styled.div`
        display: flex;
        justify-content: space-between;
        position: relative;
        width: 100%;
    `;
    const FooterTextWrapper = styled.div`
        align-items: center;
        display: flex;
        gap: 12px;
    `;
    const FooterTextItem = styled.div`
        color: #858585;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0;
        margin-top; -1px;
        position: relative;
        white-space: nowrap;
        width: fit-content;
    `;
    const FooterIconWrapper = styled.div`
        align-items: flex-start;
        float: right;
        gap: 12px;
        display: inline-flex;
    `;
    const LockIcon = styled.img`
        height: 18px;
        width: 14px;
    `;
    const CardIcon = styled.img`
        height: 20px;
        width: 28px;
    `;
    const VisaIconCtn = styled.div`
        background: linear-gradient(180deg, rgb(34,35,87) 0%, rgb(37,74,165) 100%);
        background-color: rgba(255, 255, 255, 1);
        border-radius: 3px;
        height: 20px;
        overflow: hidden;
        position: relative;
        width: 28px;
    `;
    const VisaIcon = styled.img`
        height: 6px;
        left: 4px;
        position: absolute;
        top: 7px;
        width: 19px;
    `;

    return (
        <FooterCtn>
            <Divider />
            <FooterLine>
                <FooterTextWrapper>
                    <FooterTextItem>Privacy</FooterTextItem>
                    <FooterTextItem>About</FooterTextItem>
                </FooterTextWrapper>
                <FooterIconWrapper>
                    <LockIcon src={LockSvg} alt="secure"/>
                    <CardIcon src={CardSvg} alt="CC"/>
                    <img src={MastercardSvg} alt="MC"/>
                    <VisaIconCtn>
                        <VisaIcon src={VisaSvg} alt="VISA" />
                    </VisaIconCtn>
                </FooterIconWrapper>
            </FooterLine>
        </FooterCtn>      
    );
}

export default Footer;