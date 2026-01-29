import { CustomerForm } from '@/components/customers/customer-form';

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Resident</h1>
        <p className="text-gray-600">Create a new resident profile with billing information</p>
      </div>
      <CustomerForm mode="create" />
    </div>
  );
}
