// fangigs/app/roles/camera/page.jsx

import Image from "next/image";

export const metadata = {
  title: "For Camera Operators – FanGigs",
  description: "Discover opportunities to work as a cameraman or camera operator in the adult content industry using FanGigs.",
};

export default function CameraPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10 bg-pink-100">
      <article className="prose lg:prose-xl prose-headings:text-pink-900 prose-p:text-gray-800 prose-img:float-right prose-img:ml-4 prose-img:mb-4">
        <h1>Opportunities for Camera Operators on FanGigs</h1>
        <Image
          src="/images/camera-banner.jpg"
          alt="Camera operator on set"
          width={480}
          height={300}
        />
        <p>
          The adult content industry isn’t only about being in front of the camera — there’s an entire world behind it that makes every scene possible. If you’re a camera operator or someone with videography experience, FanGigs is your gateway into a creative, high-demand segment of adult production.
        </p>

        <h2>Why Join as a Camera Operator?</h2>
        <p>
          With the rise of independent content creators and platforms like OnlyFans, there's been an explosion of demand for skilled camerapeople who can help create cinematic, professional-quality content. FanGigs bridges the gap between these creators and freelance camera talent like you.
        </p>

        <h2>What Kind of Work Can You Expect?</h2>
        <p>
          - One-on-one content shoots<br/>
          - Behind-the-scenes filming<br/>
          - Event coverage<br/>
          - Outdoor/Studio production<br/>
          - Interviews and documentary-style features<br/>
          - Multi-angle filming and lighting setups
        </p>

        <h2>How to Get Started</h2>
        <p>
          1. <strong>Create Your Profile:</strong> Sign up on FanGigs and choose your role as a "Camera Operator" or similar. Upload a headshot, provide links to your work, and describe your equipment and skills.<br/>
          2. <strong>Browse Job Listings:</strong> Use the “Find Work” section to discover shoots looking for camerapeople. Many are willing to hire on a freelance basis and even cover travel costs.<br/>
          3. <strong>Apply or Connect:</strong> Apply to posted jobs or save creators you’d like to collaborate with. Messaging and visibility options give you the flexibility to control your reach.<br/>
          4. <strong>Get Hired & Shoot:</strong> Once approved, agree on logistics, bring your gear, and roll camera!
        </p>

        <h2>Benefits of Using FanGigs</h2>
        <ul>
          <li><strong>Verified Listings:</strong> Work with real content creators and avoid scams.</li>
          <li><strong>Direct Communication:</strong> Chat with producers and creators through the platform.</li>
          <li><strong>Portfolio Building:</strong> Gain access to varied shoots and grow your demo reel.</li>
          <li><strong>Flexible Jobs:</strong> Work when and where you want, with roles across the country.</li>
        </ul>

        <h2>Whether You're a Pro or a Passionate Beginner</h2>
        <p>
          Even if you’re just starting out with a DSLR and a passion for visuals, FanGigs is the right place to begin your journey. Many creators are looking for energetic collaborators who can grow with them.
        </p>

        <p>
          The adult content world values creativity, reliability, and professionalism — if you bring those, the rest will follow. Start browsing jobs, connect with creators, and bring your cinematography skills to the set.
        </p>

        <p className="text-pink-800 font-semibold">
          Lights. Camera. Action. Welcome to FanGigs.
        </p>
      </article>
    </main>
  );
}
