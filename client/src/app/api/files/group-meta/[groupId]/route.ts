// // client/src/app/api/files/group-meta/[groupId]/route.ts
// import { NextResponse } from 'next/server';

// export async function GET(
//   request: Request,
//   { params }: { params: { groupId: string } }
// ) {
//   const { groupId } = params;
//   const backendApiUrl = process.env.NEXT_PUBLIC_API_URL;

//   if (!backendApiUrl) {
//     return NextResponse.json(
//       { message: "Backend API URL is not configured." },
//       { status: 500 }
//     );
//   }

//   const backendUrl = `${backendApiUrl}/files/group-meta/${groupId}`;

//   try {
//     // Fetch data from your backend server
//     const backendResponse = await fetch(backendUrl);

//     // If the backend returned an error (e.g., 404), forward it
//     if (!backendResponse.ok) {
//       const errorData = await backendResponse.json();
//       return NextResponse.json(
//         { message: errorData.message || 'File group not found on backend.' },
//         { status: backendResponse.status }
//       );
//     }

//     // Get the JSON data from the backend response
//     const data = await backendResponse.json();

//     // Return the data to the frontend client component
//     return NextResponse.json(data, { status: 200 });

//   } catch (error) {
//     console.error("Group metadata proxy error:", error);
//     return NextResponse.json(
//       { message: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

// // client/src/app/api/files/group-meta/[groupId]/route.ts
// import { NextResponse } from 'next/server';

// export async function GET(
//   request: Request,
//   { params }: { params: { groupId: string } }
// ) {
//   const { groupId } = await params; // <-- FIX: Await params

//   const backendApiUrl = process.env.NEXT_PUBLIC_API_URL;
//   // ... rest of the function is correct
//   if (!backendApiUrl) {
//     return NextResponse.json(
//       { message: "Backend API URL is not configured." },
//       { status: 500 }
//     );
//   }
//   const backendUrl = `${backendApiUrl}/files/group-meta/${groupId}`;
//   try {
//     const backendResponse = await fetch(backendUrl);
//     if (!backendResponse.ok) {
//       const errorData = await backendResponse.json();
//       return NextResponse.json(
//         { message: errorData.message || 'File group not found on backend.' },
//         { status: backendResponse.status }
//       );
//     }
//     const data = await backendResponse.json();
//     return NextResponse.json(data, { status: 200 });
//   } catch (error) {
//     console.error("Group metadata proxy error:", error);
//     return NextResponse.json(
//       { message: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }


// /client/src/app/api/files/group-meta/[groupId]/route.ts

import { NextResponse } from 'next/server';

/**
 * This is the most explicit and failsafe signature for a dynamic API Route.
 * We accept a `context` object as the second argument and provide its type inline.
 * We then destructure the `groupId` from inside the function body.
 * This pattern avoids all complex signature parsing for the Vercel build system.
 */
export async function GET(
  request: Request,
  context: { params: { groupId: string } }
) {
  const { groupId } = context.params;
  
  const backendApiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!backendApiUrl) {
    return NextResponse.json(
      { message: "Backend API URL is not configured." },
      { status: 500 }
    );
  }

  const backendUrl = `${backendApiUrl}/files/group-meta/${groupId}`;

  try {
    const backendResponse = await fetch(backendUrl);

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        { message: errorData.message || 'File group not found on backend.' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("Group metadata proxy error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}