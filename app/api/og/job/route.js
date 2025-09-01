
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Job Opportunity';
    const company = searchParams.get('company') || 'FanGigs';
    const location = searchParams.get('location') || '';
    const budget = searchParams.get('budget') || '';
    const category = searchParams.get('category') || 'General';
    const type = searchParams.get('type') || 'gig';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'space-between',
            backgroundColor: '#0f172a',
            backgroundImage: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #db2777 100%)',
            position: 'relative',
            padding: '60px',
          }}
        >
          {/* Background Elements */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v20h40V20H20z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  fontSize: '18px',
                  color: 'white',
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                }}
              >
                {category}
              </div>
              <div
                style={{
                  backgroundColor: type === 'job' ? '#10b981' : '#f59e0b',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '16px',
                  color: 'white',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                }}
              >
                {type}
              </div>
            </div>
            
            <div
              style={{
                fontSize: '24px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 'bold',
              }}
            >
              FANGIGS
            </div>
          </div>
          
          {/* Main Content */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <h1
              style={{
                fontSize: '56px',
                fontWeight: 'bold',
                margin: '0 0 24px 0',
                lineHeight: 1.1,
                textShadow: '2px 2px 8px rgba(0, 0, 0, 0.3)',
              }}
            >
              {title}
            </h1>
            
            <div
              style={{
                fontSize: '28px',
                opacity: 0.9,
                marginBottom: '32px',
                fontWeight: '300',
              }}
            >
              by {company}
            </div>
            
            <div
              style={{
                display: 'flex',
                gap: '32px',
                alignItems: 'center',
                fontSize: '20px',
                opacity: 0.8,
              }}
            >
              {location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📍</span>
                  <span>{location}</span>
                </div>
              )}
              {budget && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💰</span>
                  <span>{budget}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '40px',
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            <span>Apply now on FanGigs.com</span>
            <span>🚀 Your next opportunity awaits</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.log('Error generating job OG image:', e.message);
    return new Response('Failed to generate image', { status: 500 });
  }
}
