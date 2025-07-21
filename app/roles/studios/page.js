// fangigs/app/roles/studios/page.jsx

import Image from "next/image";

export const metadata = {
  title: "For Studios – FanGigs",
  description: "Adult film studios can use FanGigs to discover new talent and post professional casting calls.",
};

export default function StudiosPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10 bg-pink-100">
      <article className="prose lg:prose-xl prose-headings:text-pink-800 prose-p:text-gray-800 prose-img:float-right prose-img:ml-4 prose-img:mb-4">
        <h1>For Studios: Discover New Talent with a Professional Touch</h1>

        <Image
          src="/images/studio.jpg"
          alt="Film crew on a professional adult set"
          width={480}
          height={300}
        />

        <p>
          FanGigs isn’t just for independent creators — it's also a bridge between professional studios and the next generation of performers. If you run a studio and are constantly looking for fresh talent, this platform offers a new, respectful way to recruit people who might never set foot on a traditional porn site.
        </p>

        <h2>Why FanGigs Appeals to New Faces</h2>
        <p>
          Many aspiring models, actors, and creators are open to exploring the adult space — but are intimidated or turned off by the stigma around porn websites. FanGigs changes that. By presenting adult gigs in a clean, professional, mainstream layout — without nudity or explicit content — the platform creates an approachable entry point for people who wouldn’t normally apply through your studio’s "Apply" page.
        </p>

        <h2>Studios Can Post Gigs, Auditions & Open Calls</h2>
        <ul>
          <li><strong>Standard casting calls:</strong> Post opportunities for scenes, roles, or long-term contracts.</li>
          <li><strong>Local or remote work:</strong> Whether you're scouting locally or traveling, list exact dates and locations.</li>
          <li><strong>Public or private:</strong> You can allow public applications, or request applicants to have verified profiles first.</li>
          <li><strong>Visibility:</strong> Gigs posted by studios get priority visibility on our platform.</li>
        </ul>

        <h2>What Makes FanGigs Different?</h2>
        <ul>
          <li><strong>No nudity or explicit photos:</strong> Talent applies with clean, professional profiles. All photos are safe-for-work.</li>
          <li><strong>Focused on talent, not followers:</strong> This isn’t about clout — it’s about commitment, diversity, and potential.</li>
          <li><strong>Profile filtering:</strong> Search by experience level, location, gender, orientation, and more.</li>
          <li><strong>Legitimacy:</strong> FanGigs helps studios appear modern, professional, and talent-friendly.</li>
        </ul>

        <h2>Reach a New Pool of Talent</h2>
        <p>
          FanGigs attracts people who never imagined themselves working in adult — until they saw how organized, respectful, and legitimate this industry could be. That’s your opportunity. The same individuals who would scroll past your casting call on a tube site are now exploring FanGigs and thinking, “Maybe I could do this professionally.”
        </p>

        <h2>How to Get Started</h2>
        <p>
          1. <strong>Create a verified Studio profile</strong> and add a company bio, logo, and social links.<br />
          2. <strong>Post your current casting calls</strong>, even if they’re recurring or for general interest.<br />
          3. <strong>Review applicants</strong> with headshots, social links, and tags like camera experience or availability.<br />
          4. <strong>Hire, schedule, and connect</strong> — all on a platform that respects the industry while protecting your brand.
        </p>

        <h2>We Help You Stay Ahead</h2>
        <p>
          Studios using FanGigs are showing future stars that adult entertainment can be a career — not just a stunt. You build trust. You widen your reach. And you position your company as part of the modern, digital future of this industry.
        </p>

        <p className="text-pink-800 font-semibold">
          Start casting where the next generation of talent is looking — and discover faces that were never going to land in your inbox.
        </p>
      </article>
    </main>
  );
}
