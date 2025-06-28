// // client/src/app/api/download-proxy/[uniqueId]/route.ts
// import { NextRequest } from 'next/server';

// // This is our proxy route handler.
// export async function GET(
//   request: NextRequest,
//   { params }: { params: { uniqueId: string } }
// ) {
//   const { uniqueId } = params;
  
//   // This is the URL to your REAL backend download endpoint.
//   // It's fetched from an environment variable for security and flexibility.
//   const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/files/download/${uniqueId}`;

//   try {
//     // Make a server-to-server request to the backend.
//     const backendResponse = await fetch(backendUrl);

//     // If the backend returns an error (e.g., file not found), pass it along.
//     if (!backendResponse.ok) {
//       return new Response(backendResponse.statusText, {
//         status: backendResponse.status,
//       });
//     }

//     // Get the headers from the backend response. This is crucial for getting
//     // the correct filename, size, and type for the download.
//     const headers = new Headers();
//     headers.set(
//       'Content-Disposition',
//       backendResponse.headers.get('Content-Disposition') || `attachment; filename="download"`
//     );
//     headers.set(
//       'Content-Type',
//       backendResponse.headers.get('Content-Type') || 'application/octet-stream'
//     );
//     headers.set(
//       'Content-Length',
//       backendResponse.headers.get('Content-Length') || '0'
//     );

//     // Stream the body from the backend response directly to the client's browser.
//     // This is memory-efficient and works for large files.
//     return new Response(backendResponse.body, {
//       status: 200,
//       headers: headers,
//     });
    
//   } catch (error) {
//     console.error("Download proxy error:", error);
//     return new Response("Internal Server Error", { status: 500 });
//   }
// }

// import { NextRequest, NextResponse } from 'next/server';

// // This is our proxy route handler.
// export async function GET(
//   request: NextRequest,
//   { params }: { params: { uniqueId: string } }
// ) {
//   const { uniqueId } = params;

//   // --- THIS IS THE FIX ---
//   // The URL was pointing to "/files/download/". It must now point to our new bundle download endpoint.
//   const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/bundles/download/${uniqueId}`;

//   try {
//     console.log(`Proxying download request for ${uniqueId} to: ${backendUrl}`);
    
//     // Make a server-to-server request to the backend.
//     const backendResponse = await fetch(backendUrl, {
//       // It's good practice to pass through the original request headers if needed,
//       // though not strictly necessary for this public download endpoint.
//       headers: request.headers, 
//     });

//     // If the backend returns an error (e.g., file not found or still processing), pass it along.
//     if (!backendResponse.ok) {
//       const errorBody = await backendResponse.text();
//       console.error(`Backend returned an error (${backendResponse.status}): ${errorBody}`);
//       return new Response(errorBody || backendResponse.statusText, {
//         status: backendResponse.status,
//       });
//     }

//     // Get the headers from the backend response. This is crucial for getting
//     // the correct filename, size, and type for the download.
//     const headers = new Headers();
//     headers.set(
//       'Content-Disposition',
//       backendResponse.headers.get('Content-Disposition') || `attachment; filename="download.zip"`
//     );
//     headers.set(
//       'Content-Type',
//       backendResponse.headers.get('Content-Type') || 'application/zip'
//     );
//     // Note: Content-Length might not be perfectly accurate with on-the-fly zipping,
//     // but it's good to pass it if available.
//     if (backendResponse.headers.has('Content-Length')) {
//         headers.set(
//             'Content-Length',
//             backendResponse.headers.get('Content-Length')!
//         );
//     }


//     // Stream the body from the backend response directly to the client's browser.
//     // This is memory-efficient and works for large files.
//     return new Response(backendResponse.body, {
//       status: 200,
//       headers: headers,
//     });
    
//   } catch (error) {
//     console.error("Download proxy error:", error);
//     return new Response("Internal Server Error", { status: 500 });
//   }
// }

// import { NextRequest } from 'next/server';

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { slug: string[] } }
// ) {
//   const { slug } = params;
//   const backendApiUrl = process.env.NEXT_PUBLIC_API_URL;

//   if (!backendApiUrl) {
//     return new Response("Backend API URL is not configured.", { status: 500 });
//   }

//   let backendUrl: string;

//   // Handles /api/download-proxy/zip/[groupId]
//   if (slug.length === 2 && slug[0] === 'zip') {
//     const groupId = slug[1];
//     backendUrl = `${backendApiUrl}/files/download-zip/${groupId}`;
//   }
//   // Handles /api/download-proxy/[fileUniqueId]
//   else if (slug.length === 1) {
//     const fileUniqueId = slug[0];
//     backendUrl = `${backendApiUrl}/files/download/${fileUniqueId}`;
//   }
//   else {
//     return new Response("Invalid download path.", { status: 400 });
//   }

//   try {
//     const backendResponse = await fetch(backendUrl);

//     if (!backendResponse.ok) {
//       return new Response(backendResponse.body, {
//         status: backendResponse.status,
//         statusText: backendResponse.statusText,
//       });
//     }

//     const headers = new Headers();
//     const contentDisposition = backendResponse.headers.get('Content-Disposition');
//     const contentType = backendResponse.headers.get('Content-Type');
//     const contentLength = backendResponse.headers.get('Content-Length');

//     if (contentDisposition) {
//       headers.set('Content-Disposition', contentDisposition);
//     }
//     if (contentType) {
//       headers.set('Content-Type', contentType);
//     }
//     if (contentLength) {
//       headers.set('Content-Length', contentLength);
//     }

//     // Stream the body from the backend directly to the client
//     return new Response(backendResponse.body, {
//       status: 200,
//       headers: headers,
//     });

//   } catch (error) {
//     console.error("Download proxy error:", error);
//     return new Response("Internal Server Error", { status: 500 });
//   }
// }


// // client/src/app/api/download-proxy/[...slug]/route.ts
// import { NextRequest } from 'next/server';

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { slug: string[] } }
// ) {
//   const { slug } = await params; // <-- FIX: Await params
  
//   const backendApiUrl = process.env.NEXT_PUBLIC_API_URL;
//   // ... rest of the function is correct
//   if (!backendApiUrl) {
//     return new Response("Backend API URL is not configured.", { status: 500 });
//   }

//   let backendUrl: string;

//   if (slug.length === 2 && slug[0] === 'zip') {
//     const groupId = slug[1];
//     backendUrl = `${backendApiUrl}/files/download-zip/${groupId}`;
//   }
//   else if (slug.length === 1) {
//     const fileUniqueId = slug[0];
//     backendUrl = `${backendApiUrl}/files/download/${fileUniqueId}`;
//   }
//   else {
//     return new Response("Invalid download path.", { status: 400 });
//   }

//   try {
//     const backendResponse = await fetch(backendUrl);

//     if (!backendResponse.ok) {
//       return new Response(backendResponse.body, {
//         status: backendResponse.status,
//         statusText: backendResponse.statusText,
//       });
//     }

//     const headers = new Headers();
//     const contentDisposition = backendResponse.headers.get('Content-Disposition');
//     const contentType = backendResponse.headers.get('Content-Type');
//     const contentLength = backendResponse.headers.get('Content-Length');

//     if (contentDisposition) {
//       headers.set('Content-Disposition', contentDisposition);
//     }
//     if (contentType) {
//       headers.set('Content-Type', contentType);
//     }
//     if (contentLength) {
//       headers.set('Content-Length', contentLength);
//     }
    
//     return new Response(backendResponse.body, {
//       status: 200,
//       headers: headers,
//     });

//   } catch (error) {
//     console.error("Download proxy error:", error);
//     return new Response("Internal Server Error", { status: 500 });
//   }
// }



import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
): Promise<Response> {
  const { slug } = params;

  const backendApiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!backendApiUrl) {
    return new Response("Backend API URL is not configured.", { status: 500 });
  }

  let backendUrl: string;

  // Handles /api/download-proxy/zip/[groupId]
  if (slug.length === 2 && slug[0] === 'zip') {
    const groupId = slug[1];
    backendUrl = `${backendApiUrl}/files/download-zip/${groupId}`;
  }
  // Handles /api/download-proxy/[fileUniqueId]
  else if (slug.length === 1) {
    const fileUniqueId = slug[0];
    backendUrl = `${backendApiUrl}/files/download/${fileUniqueId}`;
  } else {
    return new Response("Invalid download path.", { status: 400 });
  }

  try {
    const backendResponse = await fetch(backendUrl);

    if (!backendResponse.ok) {
      const errorBody = await backendResponse.text();
      return new Response(errorBody, {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
      });
    }

    const headers = new Headers();
    const contentDisposition = backendResponse.headers.get('Content-Disposition');
    const contentType = backendResponse.headers.get('Content-Type');
    const contentLength = backendResponse.headers.get('Content-Length');

    if (contentDisposition) {
      headers.set('Content-Disposition', contentDisposition);
    }
    if (contentType) {
      headers.set('Content-Type', contentType);
    }
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    return new Response(backendResponse.body, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error("Download proxy error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
