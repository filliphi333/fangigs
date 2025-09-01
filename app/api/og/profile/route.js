
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const name = searchParams.get('name') || username;
    const type = searchParams.get('type') || 'talent';
    const location = searchParams.get('location') || '';
    const avatar = searchParams.get('avatar');

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a1a2e',
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '40px',
              padding: '60px',
            }}
          >
            {/* Avatar */}
            {avatar && (
              <div
                style={{
                  width: '160px',
                  height: '160px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '4px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                }}
              >
                <img
                  src={avatar}
                  alt={name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}
            
            {/* Text Content */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                color: 'white',
                textAlign: avatar ? 'left' : 'center',
              }}
            >
              <h1
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  margin: '0 0 16px 0',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                }}
              >
                {name}
              </h1>
              
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '24px',
                  opacity: 0.9,
                  marginBottom: '16px',
                }}
              >
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    textTransform: 'capitalize',
                  }}
                >
                  {type}
                </span>
                {location && (
                  <span style={{ opacity: 0.8 }}>📍 {location}</span>
                )}
              </div>
              
              <p
                style={{
                  fontSize: '20px',
                  margin: 0,
                  opacity: 0.8,
                  fontWeight: '300',
                }}
              >
                View profile on FanGigs
              </p>
            </div>
          </div>
          
          {/* FanGigs Branding */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '40px',
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 'bold',
            }}
          >
            FANGIGS
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.log('Error generating profile OG image:', e.message);
    return new Response('Failed to generate image', { status: 500 });
  }
}
