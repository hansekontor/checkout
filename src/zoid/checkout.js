import * as zoid from 'zoid/dist/zoid.frameworks';

let Checkout = zoid.create({
    tag: 'zoid-checkout',
    url: 'http://localhost:3000/#/',
    dimensions: {
        width: "400px",
        height: "600px",
    },
    defaultContext: "popup"
});

export default Checkout;