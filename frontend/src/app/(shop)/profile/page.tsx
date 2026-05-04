import { ProfileForm } from '@/features/user/ui/ProfileForm';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-2">
            <a href="#profile" className="block px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium">
              Profile Info
            </a>
            <a href="#addresses" className="block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              Addresses
            </a>
            <a href="#orders" className="block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              Order History
            </a>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <ProfileForm />
            
            {/* Placeholder cho AddressList */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Delivery Addresses</h2>
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  + Add New
                </button>
              </div>
              <div className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                You haven't added any addresses yet.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
