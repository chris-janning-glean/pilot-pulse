import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const endpoint = process.env.NEXT_PUBLIC_GLEAN_API_ENDPOINT || 'https://scio-prod-be.glean.com';
    const token = process.env.NEXT_PUBLIC_GLEAN_OAUTH_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: 'GLEAN_OAUTH_TOKEN not configured' },
        { status: 500 }
      );
    }

    // Log the FULL request body for debugging
    console.log('➡️ FULL REQUEST TO GLEAN:', JSON.stringify(body, null, 2));

    // Make server-side request to Glean API (bypasses CORS)
    const response = await fetch(`${endpoint}/rest/api/v1/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('📊 Glean API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GLEAN API ERROR:');
      console.error('   Status:', response.status, response.statusText);
      console.error('   Response Body:', errorText);
      return NextResponse.json(
        { 
          error: `Glean API error: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Log detailed response info
    console.log('✅ GLEAN API RESPONSE:', {
      resultCount: data.results?.length || 0,
      hasResults: !!data.results,
      firstThreeResults: data.results?.slice(0, 3).map((r: any) => ({
        title: r.title,
        url: r.url,
        datasource: r.datasource,
      })) || [],
    });
    
    // Log first 2 complete results to understand full structure
    if (data.results && data.results.length > 0) {
      console.log('📋 FIRST RESULT (FULL):', JSON.stringify(data.results[0], null, 2));
      if (data.results.length > 1) {
        console.log('📋 SECOND RESULT (FULL):', JSON.stringify(data.results[1], null, 2));
      }
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Glean API proxy error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

