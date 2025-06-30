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
 * This is the final and failsafe signature for a dynamic API Route.
 * We ONLY use the `request` object. We manually parse the URL to get the `groupId`.
 * This completely avoids the problematic second `context`/`params` argument that is
 * causing conflicting errors between the local dev server and the Vercel build environment.
 */
export async function GET(request: Request) {
  // Manually parse the groupId from the URL pathname
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  // The path is /api/files/group-meta/[groupId], so the groupId is the last part
  const groupId = pathParts[pathParts.length - 1];

  // Add a simple validation check
  if (!groupId) {
    return NextResponse.json({ message: "Group ID is missing in the URL." }, { status: 400 });
  }
  
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