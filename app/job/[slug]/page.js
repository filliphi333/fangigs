import { supabase } from "../../../lib/supabase";
import { absoluteUrl } from "../../../lib/seo";
import JobPageClient from './JobPageClient';

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const { data: job, error } = await supabase
      .from("job_postings")
      .select("title, description, location, pay, creator_id, tags")
      .eq("slug", slug)
      .single();

    if (error || !job) {
      return {
        title: "Job Not Found - FanGigs",
        description: "The job you're looking for doesn't exist or has been removed.",
      };
    }

    // Get creator info for company name
    let creatorName = "FanGigs";
    if (job.creator_id) {
      const { data: creator } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", job.creator_id)
        .single();

      if (creator?.full_name) {
        creatorName = creator.full_name;
      }
    }

    const ogImageUrl = absoluteUrl(`/api/og/job?title=${encodeURIComponent(job.title)}&company=${encodeURIComponent(creatorName)}&location=${encodeURIComponent(job.location || '')}&budget=${encodeURIComponent(job.pay ? `$${job.pay}` : '')}&category=${encodeURIComponent(job.tags?.[0] || 'General')}`);

    return {
      title: `${job.title} - ${creatorName} | FanGigs`,
      description: job.description?.substring(0, 160) || `Join ${job.title} opportunity with ${creatorName}. Apply now on FanGigs.`,
      keywords: job.tags?.join(', ') || 'adult content, creator jobs, gigs',
      openGraph: {
        title: job.title,
        description: job.description?.substring(0, 160) || `Join ${job.title} opportunity with ${creatorName}`,
        type: 'website',
        url: absoluteUrl(`/job/${slug}`),
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${job.title} - Job Opportunity`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: job.title,
        description: job.description?.substring(0, 160) || `Join ${job.title} opportunity with ${creatorName}`,
        images: [ogImageUrl],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: "Job Opportunity - FanGigs",
      description: "Discover exciting opportunities on FanGigs.",
    };
  }
}

export default async function JobPage({ params }) {
  const { slug } = await params;
  return <JobPageClient slug={slug} />;
}