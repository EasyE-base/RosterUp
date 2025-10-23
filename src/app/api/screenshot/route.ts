import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    console.log('Capturing screenshot for:', url);

    // For now, return null to let it work without screenshots
    // In production, this would use Playwright MCP or a screenshot service
    return NextResponse.json({
      success: true,
      screenshot: null, // Will be enhanced later with actual screenshot capture
    });

  } catch (error) {
    console.error('Screenshot error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to capture screenshot' },
      { status: 500 }
    );
  }
}
