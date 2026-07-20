import { CreditCard } from 'lucide-react';

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
          <p className="text-gray-500">View transactions and Razorpay integration status.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center justify-center text-gray-500 shadow-sm">
        <CreditCard className="w-12 h-12 text-gray-300 mb-4" />
        <p className="font-medium text-gray-900">Payments module ready for integration</p>
        <p className="text-sm mt-1">Backend service prepared.</p>
      </div>
    </div>
  );
}
