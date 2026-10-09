// Razorpay Checkout: their script draws the payment sheet (UPI, cards, netbanking). Loaded only when Pay is tapped.
type Order = { keyId: string; orderId: string; amount: number; month: number; plan: 'month' | 'year'; email?: string }
export type Paid = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }

function load(): Promise<any> {
  const w = window as any
  if (w.Razorpay) return Promise.resolve(w.Razorpay)
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    // A blocked or stalled script used to leave Pay grey with no words (UX review 9 Oct): after 15 s it counts as failed.
    const t = window.setTimeout(() => { s.remove(); reject(new Error('checkout')) }, 15000)
    s.onload = () => { window.clearTimeout(t); resolve(w.Razorpay) }
    s.onerror = () => { window.clearTimeout(t); s.remove(); reject(new Error('checkout')) }
    document.head.appendChild(s)
  })
}

// Resolves with Razorpay's signed reply, or null if the reader closed the sheet.
// onFailed: a try that failed inside the sheet (declined card, UPI timeout). The sheet stays open so they can retry.
export async function checkout(o: Order, onFailed?: (reason: string) => void): Promise<Paid | null> {
  const Razorpay = await load()
  return new Promise((resolve) => {
    const r = new Razorpay({
      key: o.keyId,
      order_id: o.orderId,
      amount: o.amount * 100,
      currency: 'INR',
      name: 'I Get It',
      description: o.plan === 'year' ? 'One year, one-time payment' : 'One month, one-time payment',
      prefill: o.email ? { email: o.email } : undefined,
      theme: { color: '#d98b19' },
      handler: (reply: Paid) => resolve(reply),
      modal: { ondismiss: () => resolve(null) },
    })
    r.on('payment.failed', (e: any) => onFailed?.(String(e?.error?.description ?? 'The payment did not go through.')))
    r.open()
  })
}
