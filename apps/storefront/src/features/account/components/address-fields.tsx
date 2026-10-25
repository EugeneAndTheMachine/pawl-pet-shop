import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { InputField, SelectField } from '../../../components/ui/field'
import { VN_PROVINCES } from '../../../lib/vn-provinces'
import type { AddressValues } from '../../auth/schemas'

/** The address inputs shared by checkout and the address book */
export function AddressFields({ register, errors }: { register: UseFormRegister<AddressValues>; errors: FieldErrors<AddressValues> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <InputField label="Full name" autoComplete="name" error={errors.full_name?.message} {...register('full_name')} />
      <InputField label="Phone" type="tel" autoComplete="tel" inputMode="tel" error={errors.phone?.message} {...register('phone')} />
      <SelectField label="Province / city" placeholder="Choose…" options={VN_PROVINCES} error={errors.province?.message} {...register('province')} />
      <InputField label="Ward / commune" autoComplete="address-level3" error={errors.city?.message} {...register('city')} />
      <div className="sm:col-span-2">
        <InputField label="Street address" placeholder="House number, street name" autoComplete="street-address" error={errors.address_1?.message} {...register('address_1')} />
      </div>
    </div>
  )
}

