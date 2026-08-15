import Stripe from "stripe"
declare const inv: Stripe.Invoice
declare const sub: Stripe.Subscription
const a = inv.subscription
const b = sub.current_period_end
const c = sub.items.data[0].current_period_end
export {a,b,c}
