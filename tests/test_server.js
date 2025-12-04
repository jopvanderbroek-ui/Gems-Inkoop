(async function () {
  const base = 'http://localhost:3000'
  function pass(msg) { console.log('✅ PASS:', msg) }
  function fail(msg) { console.error('❌ FAIL:', msg); process.exitCode = 1 }

  try {
    let res = await fetch(base + '/api/products')
    if (res.status !== 200) return fail('/api/products did not return 200')
    const products = await res.json()
    if (!Array.isArray(products) || products.length < 1) return fail('/api/products returned invalid payload')
    pass('/api/products ok')

    res = await fetch(base + '/api/estimate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ from: { country: 'NL' }, to: { country: 'DE' }, parcels: [{ weightKg: 0.5, qty: 1 }], declaredValue: 20 }) })
    if (res.status !== 200) return fail('/api/estimate did not return 200')
    const estimate = await res.json()
    if (!estimate.price || typeof estimate.price.amount !== 'number') return fail('/api/estimate payload invalid')
    pass('/api/estimate ok')

    res = await fetch(base + '/api/create-order', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ customer: { name: 'Test' }, cart: [{ id: 1, qty: 1 }], estimate }) })
    if (res.status !== 200) return fail('/api/create-order did not return 200')
    const order = await res.json()
    if (!order.orderId) return fail('/api/create-order returned no orderId')
    pass('/api/create-order ok')

    res = await fetch(base + '/api/order/' + order.orderId)
    if (res.status !== 200) return fail('/api/order/:id did not return 200')
    const fetched = await res.json()
    if (fetched.orderId !== order.orderId) return fail('/api/order/:id returned wrong id')
    pass('/api/order fetch ok')

    res = await fetch(base + '/api/order/NO_SUCH_ORDER')
    if (res.status !== 404) return fail('/api/order/:id missing-order did not return 404')
    pass('/api/order missing-order returns 404')

    console.log('\nAll tests passed — server appears to be working correctly.')
  } catch (e) { console.error('Error during tests:', e); process.exitCode = 1 }
})()
