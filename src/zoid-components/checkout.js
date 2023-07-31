import * as zoid from 'zoid/dist/zoid.frameworks';

let CheckoutZoidComponent = zoid.create({
    tag: 'zoid-checkout',
    url: 'http://localhost:3000/#/checkout',
    dimensions: {
        width: "500px",
        height: "750px",
    },
    defaultContext: "popup"
});

export default CheckoutZoidComponent;