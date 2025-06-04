<form 
  className="space-y-4"
  onSubmit={async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      fullName: form.fullName.value,
      email: form.email.value,
      password: form.password.value,
      type: userType,
      phone: form.phone?.value,
      company: form.company?.value
    };

    const res = await fetch('/api/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    alert(result.message || "Joined!");
    onClose();
  }}
>
  <div>
    <label className="block text-sm font-medium text-gray-700">Full Name</label>
    <input name="fullName" type="text" required className="w-full p-2 border rounded" />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700">Email</label>
    <input name="email" type="email" required className="w-full p-2 border rounded" />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700">Password</label>
    <input name="password" type="password" required className="w-full p-2 border rounded" />
  </div>

  {userType === 'creator' && (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number (optional)</label>
        <input name="phone" type="tel" className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Company (optional)</label>
        <input name="company" type="text" className="w-full p-2 border rounded" />
      </div>
    </>
  )}

  <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded mt-4 hover:bg-blue-700">
    Join Now
  </button>
</form>
