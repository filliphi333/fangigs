export default function ProducerProfile({ params }) {
  const { username } = params;

  // Simulated fake data (in a real app, you'd fetch this from a DB)
  const fakeProfiles = {
    sasha: {
      name: "Sasha Star",
      bio: "Award-winning director with 10+ years in the adult industry.",
      jobs: ["Casting: Female lead", "Hiring: Camera operator"]
    },
    rawvision: {
      name: "Raw Vision",
      bio: "Known for edgy, high-end amateur productions.",
      jobs: ["MILF Role (40+)", "Sound Tech Needed"]
    }
  };

  const profile = fakeProfiles[username] || {
    name: username,
    bio: "New producer on Raunchy Indeed.",
    jobs: ["No jobs posted yet."]
  };

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
      <p className="text-gray-700 mb-6">{profile.bio}</p>
      <h2 className="text-xl font-semibold mb-2">Open Jobs:</h2>
      <ul className="list-disc list-inside space-y-1">
        {profile.jobs.map((job, index) => (
          <li key={index}>{job}</li>
        ))}
      </ul>
    </main>
  );
}
