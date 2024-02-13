import styled from "styled-components";

export const AuthCodeCtn = styled.div`
	background-color: #ffffff !important;
	width: 85%;
	align-items: flex-start;
	display: flex;
	flex: 0 0 auto;
	flex-direction: column;
	gap: 3px;
	padding: 12px;
	position: relative;
`;
export const AuthCode = styled.div`
	align-items: flex-start;
	display: flex;
	flex: 0 0 auto;
	justify-content: space-between;
	position: relative;
	width: 95%;
`;
export const AuthCodeTextCtn = styled.div`
	align-items: center;
	display: flex;
	gap: 4px;
	position: relative;
	width: 50%;
`;
export const AuthCodeText = styled.p`        
	font-family: "Inter-Semibold", Helvetica;
	font-size: 14px;
	font-weight: 600;
	line-height: 20px;
	color: #000000;
	width: fit-content;
	white-space: nowrap;
	letter-spacing: 0;
	position: relative;
	margin: 0;
`;
export const InfoIcon = styled.img`
	height: 16px;
	position: relative;
	width: 16px;
	color: #858585;
`;
export const AuthCodeAmount = styled.div`
	font-family: "Inter-Semibold", Helvetica;
	font-size: 14px;
	font-weight: 600;
	line-height: 20px;
	color: #000000;
	width: fit-content;
	white-space: nowrap;
	position: relative;
`;
export const AuthCodeDescription = styled.p`
	font-family: "Inter-Medium", Helvetica;
	font-size: 12px;
	font-weight: 500;
	line-height: 17px;
	color: #858585;
	width: fit-content;
	white-space: nowrap;
	position: relative;
	margin: 0;
`;
export const Offer = styled.div`
	align-items: flex-start;
	display: inline-flex;
	flex: 0 0 auto;
	flex-direction: column;
	gap: 9px;
	position: relative;
	width: 85%;
`; 
export const OfferHeader = styled.div`
	align-items: center;
	display: flex;
	justify-content: space-between;
	position: relative;
	width: 85%;
`;
export const OfferName = styled.div`
	color: #000000;
	font-family: "PP Telegraf-Medium", Helvetica;
	font-size: 16px;
	font-weight: 500;
	line-height: normal;
	position: relative;
	white-space: nowrap;
	width: fit-content;
	text-transform: uppercase;
`;
export const OfferDescription = styled.p`
	color: #000000;
	font-family: "Inter-Medium", Helvetica;
	font-size: 12px; 
	font-weight: 500;
	letter-spacing: 0;
	line-height: 17px;
	padding-top: 9px;
	position: relative;
	width: fit-content;
	white-space: nowrap;
`;
export const Fee = styled.div`
	align-items: flex-start;
	display: flex;
	flex: 0 0 auto;
	justify-content: space-between;
	padding: 0px 9px;
	position: relative;
	width: 85%;
	color: #000000;
	font-weight: 400;
`;
export const FeeLabel = styled.div`
`;
export const FeeAmount = styled.div`
`;
export const Total = styled(Fee)`
	color: #000000;
	font-size: 14px;
	font-weight: 600;
	line-height: 20px;
`;
export const TotalLabel = styled.div``;
export const TotalAmount = styled.div``;
export const TooltipLine = styled(Fee)`
	padding-bottom: 7px;
	width: 100%;
`;
export const TooltipExpand = styled.div`
	color: #000000;
	font-family: "Inter-Medium", Helvetica;
	font-size: 12px;
	font-weight: 500;
	line-height: 17px;
	position: relative;
	text-align: left;
	padding: 0px 9px;
`;
export const TooltipExpandText = styled(TooltipExpand)`
	font-weight: 400;
	line-height: 15px;
	padding: 0;
`;
export const Invoice = styled.div`
	color: #858585;
	font-family: "Inter-Medium", Helvetica;
	font-size: 10px;
	font-weight: 500;
	line-height: 14px;   
	position: relative;
	right: 0;
`;
export const Support = styled.div`
	min-height: 125px;
	width: 85%;
	gap: 6px;
`;
export const Heading = styled.h3`
	font-weight: 600;
	font-size: 1.125rem;
	margin-bottom: 0.75rem;
	line-height: 1.25;
	color: #000000;
`;
// changed max-width 470->480
export const Overlay = styled.div` 
	align-items: center;
	position: absolute;
	flex-direction: column;
	max-width: 480px;
	top: 0;
	right: 0;
	bottom: 0;
	right: 0 ;
	background: rgba(0, 0, 0, 0.5);
	transition: opacity 200ms;
	z-index: 7999;
`;
export const OverlayContent = styled.div`
	margin: 20px 20px;
	padding: 20px 20px;
	background: #fff;
	border: 1px solid #666;
	border-radius: 6px;
	box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
	position: relative;
	gap: 10px;

	p {
		color: #8a8a8a;
		text-align: justify;
  		text-justify: inter-word;
	}

	.first {
		margin-top: 1em;
	}

	.key,
	.value {
		font-size: 1rem;
		line-height: 1.25;
	}
	.black {
		color: #000;
	}
`;

export const WidgetCtn = styled.div`
	width: inherit;
	bottom: 0px;
	background: #fff;
	border: 1px solid #666;
	border-radius: 6px 6px 0 0;
	box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
	position: fixed;
	height: 100%;
	max-height: 451px;
`;