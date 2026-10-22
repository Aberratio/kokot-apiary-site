import { Suspense } from 'react'
import { updateOrderStatusAction } from '@/cms/actions'
import { adminContext } from '@/cms/admin-context'
import styles from '@/components/admin/admin.module.css'
import { AdminLoading, DbMissing, Saved } from '@/components/admin/states'
import { formatPrice } from '@/lib/money'
import { listOrders, ORDER_STATUSES } from '@/orders/repo'

export default function OrdersPage({ params, searchParams }: PageProps<'/admin/[lang]/orders'>) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Orders params={params} searchParams={searchParams} />
    </Suspense>
  )
}

async function Orders({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { lang, dict, db } = await adminContext(params)
  const { saved } = await searchParams
  const t = dict.orders
  const rows = db ? await listOrders(db) : []
  const dateFormat = new Intl.DateTimeFormat(lang === 'pl' ? 'pl-PL' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Warsaw',
  })

  return (
    <>
      <h1>{t.title}</h1>
      {!db && <DbMissing dict={dict} />}
      {saved && <Saved dict={dict} />}
      {rows.length === 0 ? (
        <p>{dict.common.empty}</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">{t.number}</th>
              <th scope="col">{t.date}</th>
              <th scope="col">{t.customer}</th>
              <th scope="col">{t.total}</th>
              <th scope="col">{t.status}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((order) => (
              <tr key={order.id}>
                <td>{order.number}</td>
                <td>{dateFormat.format(order.createdAt)}</td>
                <td>
                  {order.customerName}
                  <details>
                    <summary>{t.details}</summary>
                    <dl className={styles.orderDetails}>
                      <dt>{t.items}</dt>
                      <dd>
                        <ul>
                          {order.items.map((item) => (
                            <li key={item.productId}>
                              {item.name}
                              {item.size && ` (${item.size})`} × {item.quantity}:{' '}
                              {formatPrice(item.unitPriceGrosze * item.quantity, lang)}
                            </li>
                          ))}
                        </ul>
                      </dd>
                      <dt>{t.delivery}</dt>
                      <dd>
                        {order.deliveryName}: {formatPrice(order.deliveryPriceGrosze, lang)}
                      </dd>
                      <dt>{t.contact}</dt>
                      <dd>
                        <a href={`mailto:${order.email}`}>{order.email}</a>
                        <br />
                        <a href={`tel:${order.phone.replace(/\s/g, '')}`}>{order.phone}</a>
                      </dd>
                      <dt>{t.address}</dt>
                      <dd className={styles.preLine}>{order.address || t.pickup}</dd>
                      {order.note && (
                        <>
                          <dt>{t.note}</dt>
                          <dd className={styles.preLine}>{order.note}</dd>
                        </>
                      )}
                      <dt>{t.language}</dt>
                      <dd>{order.locale.toUpperCase()}</dd>
                    </dl>
                  </details>
                </td>
                <td>{formatPrice(order.totalGrosze, lang)}</td>
                <td>
                  <form
                    action={updateOrderStatusAction.bind(null, lang, order.id)}
                    className={styles.statusForm}
                  >
                    <label>
                      <span className="visually-hidden">
                        {t.changeStatus}: {order.number}
                      </span>
                      <select name="status" defaultValue={order.status}>
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {t.statuses[status]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button type="submit" className={styles.secondary}>
                      {dict.common.save}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
