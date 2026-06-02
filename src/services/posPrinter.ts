import type { Sale } from '../types'
import { PAYMENT_METHODS } from '../utils/constants'

export function printInvoice(sale: Sale) {
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(`
    <html dir="rtl"><head><meta charset="utf-8"><title>فاتورة ${sale.invoice_number}</title>
    <style>body{font-family:sans-serif;padding:2rem;text-align:center}
    table{width:100%;border-collapse:collapse;margin:1rem 0}
    th,td{padding:0.5rem;border-bottom:1px solid #ddd;text-align:center}
    h2{color:#1a73e8}.total{font-size:1.25rem;font-weight:700;color:#1a73e8}
    .footer{margin-top:2rem;color:#666;font-size:0.875rem}
    .no-print{display:block;margin-top:1.5rem}
    @media print{.no-print{display:none}}
</style></head><body>
<h2>فارمانا</h2>
<h3>فاتورة رقم: ${sale.invoice_number}</h3>
<p>التاريخ: ${new Date(sale.created_at).toLocaleDateString('ar-SA')}</p>
<p>طريقة الدفع: ${PAYMENT_METHODS[sale.payment_method]}</p>
<table><thead><tr><th>البيان</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead><tbody>
${(sale.items || []).map((item) => `<tr><td>${item.medicine?.name || 'دواء'}</td><td>${item.quantity}</td><td>${item.unit_price?.toFixed(2)}</td><td>${item.total_price?.toFixed(2)}</td></tr>`).join('')}
</tbody></table>
<p>المجموع: ${sale.total_amount?.toFixed(2)} ر.س</p>
${sale.discount > 0 ? `<p>الخصم: ${sale.discount?.toFixed(2)} ر.س</p>` : ''}
<p class="total">الإجمالي: ${sale.net_amount?.toFixed(2)} ر.س</p>
<p class="footer">شكراً لتسوقكم مع فارمانا</p>
<button class="no-print" onclick="window.print()" style="padding:0.75rem 2rem;font-size:1rem;cursor:pointer">🖨️ طباعة</button>
</body></html>`)
  w.document.close()
}
