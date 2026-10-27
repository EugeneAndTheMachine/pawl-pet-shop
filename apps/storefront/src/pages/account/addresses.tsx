import { zodResolver } from '@hookform/resolvers/zod'
import type { HttpTypes } from '@medusajs/types'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { AccountHeading } from '../../components/layout/account-layout'
import { Button } from '../../components/ui/button'
import { Drawer } from '../../components/ui/drawer'
import { CheckboxField, FormError } from '../../components/ui/field'
import { MapPinIcon, PlusIcon } from '../../components/ui/icons'
import { useToast } from '../../components/ui/use-toast'
import { createAddress, deleteAddress, fromMedusaAddress, setDefaultAddress, updateAddress } from '../../features/account/api'
import { formatAddress } from '../../features/account/address-utils'
import { AddressFields } from '../../features/account/components/address-fields'
import { addressSchema, type AddressValues } from '../../features/auth/schemas'
import { useAuth } from '../../features/auth/use-auth'

type Address = HttpTypes.StoreCustomerAddress
// null: drawer closed, 'new': adding, otherwise the address being edited
type Editing = null | 'new' | Address

export default function AccountAddressesPage() {
  const { customer, refresh } = useAuth()
  const { showToast } = useToast()
  const [editing, setEditing] = useState<Editing>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const addresses = [...(customer?.addresses ?? [])].sort((a, b) => Number(b.is_default_shipping) - Number(a.is_default_shipping))

  const run = async (id: string, action: () => Promise<unknown>, success: string) => {
    setBusy(id)
    try {
      await action()
      await refresh()
      showToast(success, 'success')
    } catch {
      showToast('Something went wrong. Please try again.', 'error')
    }
    setBusy(null)
    setConfirmDelete(null)
  }

  return (
    <>
      <title>Addresses – Pawl</title>
      <AccountHeading title="Addresses">
        {addresses.length > 0 && (
          <Button size="sm" onClick={() => setEditing('new')}>
            <PlusIcon /> Add address
          </Button>
        )}
      </AccountHeading>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white px-6 py-14 text-center shadow-card">
          <span className="grid size-16 place-items-center rounded-full bg-accent-soft text-3xl text-accent">
            <MapPinIcon />
          </span>
          <p className="text-ink-soft">No saved addresses yet. Add one to check out faster.</p>
          <Button onClick={() => setEditing('new')}>
            <PlusIcon /> Add address
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => {
            const f = formatAddress(address)
            return (
              <li key={address.id} className="flex flex-col rounded-3xl bg-white p-5 shadow-card" aria-busy={busy === address.id}>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{f.name}</p>
                  {address.is_default_shipping && <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-white">Default</span>}
                </div>
                {f.lines.map((line) => (
                  <p key={line} className="text-sm text-ink-soft">
                    {line}
                  </p>
                ))}
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                  {confirmDelete === address.id ? (
                    <>
                      <span className="text-sm">Delete this address?</span>
                      <Button size="sm" variant="ghost" className="text-danger" loading={busy === address.id} onClick={() => run(address.id, () => removeAddress(address, addresses), 'Address deleted.')}>
                        Delete
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(null)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(address)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="text-danger" onClick={() => setConfirmDelete(address.id)}>
                        Delete
                      </Button>
                      {!address.is_default_shipping && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-auto text-accent"
                          loading={busy === address.id}
                          onClick={() => run(address.id, () => setDefaultAddress(address.id), 'Default address updated.')}
                        >
                          Set as default
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Drawer open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'New address' : 'Edit address'}>
        {editing !== null && (
          <AddressForm
            // Remount per address so the form starts from that address
            key={editing === 'new' ? 'new' : editing.id}
            address={editing === 'new' ? null : editing}
            isFirst={addresses.length === 0}
            onDone={async (message) => {
              await refresh()
              setEditing(null)
              showToast(message, 'success')
            }}
          />
        )}
      </Drawer>
    </>
  )
}

/** Deleting the default address hands the default to the next one, so checkout always has one to suggest */
async function removeAddress(address: Address, all: Address[]) {
  await deleteAddress(address.id)
  const next = all.find((a) => a.id !== address.id)
  if (address.is_default_shipping && next) await setDefaultAddress(next.id)
}

function AddressForm({ address, isFirst, onDone }: { address: Address | null; isFirst: boolean; onDone: (message: string) => Promise<void> }) {
  const { customer } = useAuth()
  const [isDefault, setIsDefault] = useState(address ? address.is_default_shipping : isFirst)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState } = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: address
      ? fromMedusaAddress(address)
      : { full_name: [customer?.first_name, customer?.last_name].filter(Boolean).join(' '), phone: customer?.phone ?? '' },
  })

  const submit = handleSubmit(async (values) => {
    setError(null)
    try {
      if (address) await updateAddress(address.id, values, isDefault)
      else await createAddress(values, isDefault)
      await onDone(address ? 'Address updated.' : 'Address added.')
    } catch {
      setError('We could not save this address. Please try again.')
    }
  })

  return (
    <form onSubmit={submit} className="space-y-4 p-5" noValidate>
      <FormError message={error} />
      <AddressFields register={register} errors={formState.errors} />
      <CheckboxField
        label="Use as my default delivery address"
        checked={isDefault}
        // The only address is always the default
        disabled={isFirst || Boolean(address?.is_default_shipping)}
        onChange={(e) => setIsDefault(e.target.checked)}
      />
      <Button type="submit" className="w-full" loading={formState.isSubmitting}>
        {address ? 'Save address' : 'Add address'}
      </Button>
    </form>
  )
}
