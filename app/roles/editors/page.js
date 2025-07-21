// fangigs/app/roles/editors/page.jsx

import Image from "next/image";

export const metadata = {
  title: "For Editors – FanGigs",
  description: "Video editors play a vital role in adult content creation. Learn how FanGigs connects editors with paid editing opportunities.",
};

export default function EditorsPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10 bg-pink-100">
      <article className="prose lg:prose-xl prose-headings:text-pink-800 prose-p:text-gray-800 prose-img:float-right prose-img:ml-4 prose-img:mb-4">
        <h1>For Editors: Transform Raw Footage into Stunning Content</h1>

        <Image
          src="/images/editor-banner.jpg"
          alt="Video editor working on adult content"
          width={480}
          height={300}
        />

        <p>
          In a world flooded with content, good editing is what separates a forgettable video from a fan-favorite. If you’re a video editor with a sharp eye and fast fingers, FanGigs offers a way to find paying clients in the adult industry — creators, studios, and agencies who need your skills to elevate their content.
        </p>

        <h2>Why Join FanGigs as a Video Editor?</h2>
        <p>
          With the adult industry increasingly moving toward high-quality, personalized, and subscription-based content, creators need editors who can bring polish, emotion, and story to their scenes. Whether you're editing for OnlyFans, clips for Twitter, or cinematic trailers — there's demand for what you do.
        </p>

        <h2>Types of Projects You Can Work On</h2>
        <ul>
          <li>Full-scene editing with music and color grading</li>
          <li>Teaser/trailer creation for social media</li>
          <li>Cutting and organizing long shoots into shorter clips</li>
          <li>Multi-camera synchronization and enhancement</li>
          <li>Intro/outro branding and watermarking</li>
          <li>Sound cleanup and background music overlays</li>
        </ul>

        <h2>How It Works</h2>
        <p>
          1. <strong>Create Your Profile:</strong> Sign up on FanGigs and list yourself as an Editor. Upload a headshot, a short bio, and most importantly — examples of your work or links to your portfolio.<br />
          2. <strong>Browse Jobs or Get Invited:</strong> Producers and content creators post jobs specifying editing needs. You can apply directly or get invited based on your profile.<br />
          3. <strong>Negotiate the Deal:</strong> Agree on timeline, scope, file formats, payment, and rights. Some creators may want editors with a non-disclosure agreement (NDA), others are casual.<br />
          4. <strong>Deliver and Get Paid:</strong> Upload polished work, get feedback, revise if needed — and then get paid through your chosen method.
        </p>

        <h2>Benefits of Editing with FanGigs</h2>
        <ul>
          <li><strong>Consistent Opportunities:</strong> Work with new clients regularly or build long-term relationships.</li>
          <li><strong>Freedom to Work Remotely:</strong> Edit from anywhere — all assets are shared digitally.</li>
          <li><strong>Grow Your Niche Portfolio:</strong> Specialize in a booming and under-served editing vertical.</li>
          <li><strong>Flexible Schedules:</strong> Choose your own workload and deadlines.</li>
        </ul>

        <h2>What Makes a Great Editor for This Industry?</h2>
        <p>
          - Sensitivity to pacing and mood<br />
          - Ability to create clean cuts without over-editing<br />
          - Discretion and professionalism<br />
          - Understanding of the creator’s brand or fantasy<br />
          - Optional: familiarity with adult platform rules (e.g., TikTok crops, Twitter formatting, etc.)
        </p>

        <p>
          Your technical skills are valuable — but in this space, so is your artistic voice. FanGigs helps editors stand out, connect with paying clients, and grow their brand while supporting creators.
        </p>

        <p className="text-pink-800 font-semibold">
          If you’re ready to turn footage into fantasy — FanGigs is where you begin.
        </p>
      </article>
    </main>
  );
}
