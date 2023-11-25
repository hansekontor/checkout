import * as zoid from 'zoid/dist/zoid.frameworks';

// 420px is minimum width to properly show WertModule
let Checkout = zoid.create({
    tag: 'zoid-checkout',
    url: 'http://localhost:3000/#/',
    dimensions: {
        width: "420px", 
        height: "600px",
    },
    defaultContext: "popup"
});

export default Checkout;