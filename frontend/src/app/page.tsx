export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to FinCommerce</h1>
        <p className="text-lg text-gray-600 mb-8">Your next generation e-commerce platform.</p>
        <div className="space-x-4">
          <a href="/login" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Sign In</a>
          <a href="/register" className="px-6 py-3 bg-white text-indigo-600 border border-indigo-600 rounded-lg font-medium hover:bg-indigo-50">Sign Up</a>
        </div>
      </div>
    </div>
  );
}
