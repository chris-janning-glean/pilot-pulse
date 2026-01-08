import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, customerName, timeframe } = body;
    
    if (!agentId || !customerName) {
      return NextResponse.json(
        { error: 'agentId and customerName are required' },
        { status: 400 }
      );
    }

    const endpoint = process.env.NEXT_PUBLIC_GLEAN_API_ENDPOINT || 'https://scio-prod-be.glean.com';
    const token = process.env.NEXT_PUBLIC_GLEAN_OAUTH_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: 'GLEAN_OAUTH_TOKEN not configured' },
        { status: 500 }
      );
    }

    // Use the correct Glean Agent API format (per Glean documentation)
    const requestBody: any = {
      agent_id: agentId,  // Note: underscore, not camelCase
      input: {
        Customer: customerName,  // Input is an object with Customer field
      },
    };
    
    // Add Timeframe if provided
    if (timeframe) {
      requestBody.input.Timeframe = timeframe;
    }
    
    console.log('➡️ Calling Glean Agent:', JSON.stringify(requestBody, null, 2));

    // Call Glean Agent API with correct endpoint
    const url = `${endpoint}/rest/api/v1/agents/runs/wait`;
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📊 Glean Agent API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GLEAN AGENT API ERROR:');
      console.error('   Status:', response.status, response.statusText);
      console.error('   Response Body:', errorText);
      return NextResponse.json(
        { 
          error: `Glean Agent API error: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ GLEAN AGENT RESPONSE:', {
      hasOutput: !!data.output,
      hasAnswer: !!data.answer,
      keys: Object.keys(data),
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Glean Agent API proxy error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
