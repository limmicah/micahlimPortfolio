/* ============================================================
   Shop — PayPal Buy Now buttons, one per product.

   Entirely client-side: no server, no secret keys, no hosting change
   needed. PayPal collects payment (and, for physical goods, a shipping
   address) in its own overlay — card and address details never touch
   this site or its code.

   Before going live:
   1. Swap PAYPAL_CLIENT_ID below for your own from
      https://developer.paypal.com/dashboard/applications (Live tab).
      The "sb" placeholder only works with PayPal sandbox test buyers.
   2. Fill in real product names, prices, sizes, and photos in PRODUCTS
      and in shop.html (see the TODOs there).
   3. Tapstitch has no PayPal integration, so nothing fulfills itself:
      check the PayPal dashboard for each new order and place the
      matching order in Tapstitch yourself, using the shipping address
      PayPal collected at checkout.
   ============================================================ */
(function () {
    var PAYPAL_CLIENT_ID = 'sb'; // TODO: replace with your live client ID
    var CURRENCY = 'USD';

    // TODO: replace with real Tapstitch products, prices, and photos.
    var PRODUCTS = [
        {
            id: 'tee-01',
            name: 'Placeholder Tee 01',
            sizes: { S: '28.00', M: '28.00', L: '28.00', XL: '30.00' }
        },
        {
            id: 'tee-02',
            name: 'Placeholder Tee 02',
            sizes: { S: '28.00', M: '28.00', L: '28.00', XL: '30.00' }
        },
        {
            id: 'tee-03',
            name: 'Placeholder Tee 03',
            sizes: { S: '28.00', M: '28.00', L: '28.00', XL: '30.00' }
        }
    ];

    function sizeSelectFor(product) {
        return document.querySelector('.size-select[data-product="' + product.id + '"]');
    }

    function currentPrice(product) {
        var select = sizeSelectFor(product);
        return product.sizes[select.value];
    }

    function updatePriceDisplay(product) {
        var out = document.querySelector('.product-price[data-product="' + product.id + '"]');
        if (out) out.textContent = '$' + currentPrice(product);
    }

    function setStatus(product, text) {
        var out = document.querySelector('.product-status[data-product="' + product.id + '"]');
        if (out) out.textContent = text;
    }

    function wireSizeSelects() {
        PRODUCTS.forEach(function (product) {
            var select = sizeSelectFor(product);
            if (!select) return;
            select.addEventListener('change', function () { updatePriceDisplay(product); });
            updatePriceDisplay(product);
        });
    }

    function renderButtons() {
        if (!window.paypal) return;
        PRODUCTS.forEach(function (product) {
            var container = document.getElementById('paypal-' + product.id);
            if (!container) return;

            window.paypal.Buttons({
                style: { shape: 'rect', color: 'black', label: 'pay', height: 40 },

                createOrder: function (data, actions) {
                    var select = sizeSelectFor(product);
                    var size = select ? select.value : '';
                    return actions.order.create({
                        purchase_units: [{
                            description: product.name + (size ? ' — Size ' + size : ''),
                            amount: { value: currentPrice(product), currency_code: CURRENCY }
                        }]
                    });
                },

                onApprove: function (data, actions) {
                    return actions.order.capture().then(function (details) {
                        var name = details.payer && details.payer.name
                            ? details.payer.name.given_name
                            : 'there';
                        setStatus(product, 'Thanks, ' + name + ' — your order is in. A receipt is on its way to your email.');
                    });
                },

                onCancel: function () {
                    setStatus(product, 'Checkout canceled — nothing was charged.');
                },

                onError: function () {
                    setStatus(product, 'Something went wrong. Email micahblim@gmail.com to order directly.');
                }
            }).render(container);
        });
    }

    function loadPaypalSdk() {
        var script = document.createElement('script');
        script.src = 'https://www.paypal.com/sdk/js?client-id=' + encodeURIComponent(PAYPAL_CLIENT_ID) + '&currency=' + CURRENCY + '&disable-funding=paylater';
        script.addEventListener('load', renderButtons);
        script.addEventListener('error', function () {
            PRODUCTS.forEach(function (product) {
                setStatus(product, 'Checkout is temporarily unavailable — email micahblim@gmail.com to order directly.');
            });
        });
        document.body.appendChild(script);
    }

    if (document.querySelector('.shop-grid')) {
        wireSizeSelects();
        loadPaypalSdk();
    }
})();
