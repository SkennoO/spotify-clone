// route.ts
'use client'

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Endpoint-ul există doar ca să nu dea eroare, fără Stripe
  try {
    const body = await request.text(); // poți citi request-ul dacă vrei
    console.log('Webhook POST received, body:', body);

    return NextResponse.json(
      { message: "No Stripe used. Endpoint active." },
      { status: 200 }
    );
  } catch (error) {
    console.log('Error in webhook POST:', error);
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}
