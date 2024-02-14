import * as zoid from 'zoid/dist/zoid.frameworks.min.js';

let Checkout = zoid.create({
    tag: 'zoid-checkout',
    url: 'http://localhost:3000/#/',
    dimensions: {
        width: "420px", 
        height: "610px",
    },
    defaultContext: "popup"
});

export default Checkout;