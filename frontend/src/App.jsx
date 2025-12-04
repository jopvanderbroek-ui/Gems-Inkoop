import React, { useState, useEffect } from 'react'

export default function GemsInkoop(){
  const defaultProducts = [
    { id: 1, title: 'Cold Mint Killa', priceEUR: 5.0, weightKg: 0.016, hsCode: '6912.00', description: 'Cold Mint Killa' },
    { id: 2, title: 'Icecold Pablo', priceEUR: 5.0, weightKg: 0.016, hsCode: '6214.20', description: 'Icecold Pablo' },
    { id: 3, title: 'Blue Raspberry', priceEUR: 5.0, weightKg: 0.016, hsCode: '8518.22', description: 'Blue Raspberry' }
  ]

  const [products] = useState(defaultProducts)
  const [cart, setCart] = useState([])
  const [currency] = useState('EUR')
  const [fromCountry] = useState('NL')
  const [toCountry, setToCountry] = useState('DE')
  const [customer, setCustomer] = useState({ name:'', email:'', address:'', city:'', postal:'', country:'DE' })
  const [estimate, setEstimate] = useState(null)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(()=>{ if(toCountry!=='NL') {} },[toCountry])

  function addToCart(p){ setCart(c=>{ const copy=[...c]; const idx=copy.findIndex(x=>x.id===p.id); if(idx>-1) copy[idx].qty++; else copy.push({...p,qty:1}); return copy }) }
  function updateQty(id,qty){ setCart(c=>c.map(i=> i.id===id?{...i,qty}:i)) }
  function removeFromCart(id){ setCart(c=>c.filter(i=>i.id!==id)) }

  function subtotal(){ return cart.reduce((s,i)=>s + i.priceEUR * i.qty,0).toFixed(2) }
  function totalWeight(){ return cart.reduce((s,i)=>s + (i.weightKg||0) * i.qty,0) }

  async function getShippingEstimate(){ setLoading(true); setMessage(''); try{ const res = await fetch('/api/estimate',{ method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ from:{country:fromCountry}, to:{country:toCountry}, parcels:cart.map(i=>({weightKg:i.weightKg,hs:i.hsCode,qty:i.qty})), declaredValue:parseFloat(subtotal()) }) }); const data = await res.json(); setEstimate(data); setMessage('Schatting ontvangen') }catch(e){ setMessage('Kon schatting niet ophalen: '+e.message) } setLoading(false) }

  async function placeOrder(){ if(cart.length===0) return setMessage('Winkelwagen is leeg'); setLoading(true); setMessage('Bestelling plaatsen...'); try{ const res = await fetch('/api/create-order',{ method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ customer, cart, estimate }) }); const data = await res.json(); setOrder(data); setCart([]); setEstimate(null); setMessage('Bestelling geplaatst met nummer: '+data.orderId) }catch(e){ setMessage('Plaatsen mislukt: '+e.message) } setLoading(false) }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gems Inkoop</h1>
          <div className="text-sm text-gray-600">Verkopen & bezorgen naar andere landen</div>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          <section className="md:col-span-2 bg-white p-4 rounded-2xl shadow-sm">
            <h2 className="font-semibold mb-3">Producten</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {products.map(p=> (
                <div key={p.id} className="p-3 border rounded">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-sm text-gray-500">{p.description}</div>
                  <div className="mt-2">Prijs: €{p.priceEUR.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">HS code: {p.hsCode} • Gewicht: {p.weightKg} kg</div>
                  <button onClick={()=>addToCart(p)} className="mt-3 px-3 py-1 rounded bg-blue-600 text-white">In winkelwagen</button>
                </div>
              ))}
            </div>
          </section>

          <aside className="bg-white p-4 rounded-2xl shadow-sm">
            <h2 className="font-semibold">Winkelwagen</h2>
            {cart.length===0 ? <div className="text-xs text-gray-500 mt-2">Je winkelwagen is leeg.</div> : (
              <div className="mt-2 space-y-2">
                {cart.map(i=> (
                  <div key={i.id} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{i.title}</div>
                      <div className="text-xs text-gray-500">€{(i.priceEUR*i.qty).toFixed(2)} • {i.qty}x</div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input type="number" value={i.qty} min={1} onChange={e=>updateQty(i.id, Math.max(1,parseInt(e.target.value)||1))} className="w-16 p-1 border rounded" />
                      <button onClick={()=>removeFromCart(i.id)} className="text-xs text-red-600">Verwijder</button>
                    </div>
                  </div>
                ))}
                <div className="mt-2">Subtotaal: €{subtotal()}</div>
                <div className="text-xs text-gray-500">Totaal gewicht: {totalWeight().toFixed(3)} kg</div>

                <hr className="my-2" />
                <label className="text-xs">Bestemming land</label>
                <select value={toCountry} onChange={e=>setToCountry(e.target.value)} className="w-full p-2 border rounded mt-1">
                  <option value="DE">Duitsland</option>
                  <option value="BE">België</option>
                  <option value="US">Verenigde Staten</option>
                  <option value="GB">Verenigd Koninkrijk</option>
                </select>

                <label className="text-xs mt-2">Klantgegevens</label>
                <input className="w-full p-2 border rounded mt-1" placeholder="Naam" value={customer.name} onChange={e=>setCustomer({...customer,name:e.target.value})} />
                <input className="w-full p-2 border rounded mt-1" placeholder="E-mail" value={customer.email} onChange={e=>setCustomer({...customer,email:e.target.value})} />
                <input className="w-full p-2 border rounded mt-1" placeholder="Adres" value={customer.address} onChange={e=>setCustomer({...customer,address:e.target.value})} />
                <div className="flex gap-2 mt-1">
                  <input className="flex-1 p-2 border rounded" placeholder="Stad" value={customer.city} onChange={e=>setCustomer({...customer,city:e.target.value})} />
                  <input className="w-28 p-2 border rounded" placeholder="Postcode" value={customer.postal} onChange={e=>setCustomer({...customer,postal:e.target.value})} />
                </div>

                <div className="mt-2 flex gap-2">
                  <button onClick={getShippingEstimate} disabled={loading} className="px-3 py-1 rounded bg-slate-200">Verzending schatten</button>
                  <button onClick={placeOrder} disabled={loading} className="px-3 py-1 rounded bg-green-600 text-white">Bestelling plaatsen</button>
                </div>

                {estimate && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                    <div>Carrier: <strong>{estimate.carrier}</strong></div>
                    <div>Service: <strong>{estimate.service}</strong></div>
                    <div>Prijs: <strong>€{estimate.price.amount}</strong></div>
                    <div>Geschatte levertijd: <strong>{estimate.eta}</strong></div>
                    <div>Diensten/inklaring: <small className="text-gray-500"> {estimate.duties ? `Geschatte invoerrechten €${estimate.duties.amount}` : ''}</small></div>
                  </div>
                )}

                {order && (
                  <div className="mt-3 p-2 bg-green-50 rounded text-sm">Bestelnummer: <strong>{order.orderId}</strong><div className="text-xs text-gray-500">Status: {order.status}</div></div>
                )}

                {message && <div className="mt-2 text-sm text-blue-600">{message}</div>}

              </div>
            )}
          </aside>
        </div>

        <footer className="mt-6 text-xs text-gray-500">Dit is een demo. Vervang mock endpoints met echte services: Stripe (betalingen), Shippo/EasyPost (tarieven + labels), Zonos/Avalara (invoerrechten), adres-validators, en DB voor producten/orders.</footer>
      </div>
    </div>
  )
}
