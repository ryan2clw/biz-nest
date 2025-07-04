import { NextResponse } from 'next/server';
import swaggerSpec from '../../../swagger.js';

export async function GET() {
  return NextResponse.json(swaggerSpec);
} 