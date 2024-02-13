import styled from 'styled-components';

export const Header = styled.div`
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    justify-content: space-between;
    position: relative;
    width: 100%;
    margin-top: 18px;
    margin-bottom: 18px;
`;
export const HeaderTitle = styled.div`
    color: #000000;
    font-family: "Inter-Medium", Helvetica;
    font-size: 16px;
    font-weight: 500;
    line-height: normal;
    position: relative;
    white-space: nowrap;
    width: fit-content;
`;
export const Merchant = styled.div`
    align-items: center;
    display: flex;
    gap: 6px;
    height: 20px;
    justify-content: center;
    padding: 9px 8px;
    position: relative;
    width: fit-content;
`;
export const MerchantIcon = styled.img`
    height: 18px;
    position: relative;
    width: 18px;
`;
export const MerchantTag = styled.div`
    color: #000000;
    font-family: "Inter-Regular", Helvetica;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 0;
    line-height: 20px;
    position: relative;
    white-space: nowrap;
    width: fit-content;
`;
export const MerchantName = styled.div`
    color: #000000;
    font-family: "Inter-SemiBold", Helvetica;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0;
    line-height: 20px;
    position: relative;
    white-space: nowrap;
    width: fit-content;
`;