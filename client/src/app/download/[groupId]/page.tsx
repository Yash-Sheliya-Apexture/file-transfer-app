// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Download } from "lucide-react";

// // Helper function to fetch file metadata
// async function getFileMetadata(uniqueId: string) {
//     // This fetch is server-side
//     // NOTE: This assumes your file model will be expanded to return metadata without the file itself
//     // We'll mock this for now, as creating a separa
// 
// 
// 
// 
// 
// te metadata endpoint is an extra step.
//     // In a real app, you'd fetch from `http://localhost:5000/api/files/meta/${uniqueId}`
//     return {
//         name: "example_file.zip",
//         size: 12345678, // in bytes
//         exists: true
//     };
// }

// function formatBytes(bytes: number, decimals = 2) {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const dm = decimals < 0 ? 0 : decimals;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
// }


// export default async function DownloadPage({ params }: { params: { uniqueId: string } }) {
//   const { uniqueId } = params;
//   const metadata = await getFileMetadata(uniqueId); // This needs a real endpoint in your backend
  
//   if (!metadata.exists) {
//       return <div>File not found.</div>
//   }
  
//   const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/files/download/${uniqueId}`;

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-100">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle>Download File</CardTitle>
//           <CardDescription>Ready to download your file.</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="p-4 border rounded-md">
//             <p className="font-semibold">{metadata.name}</p>
//             <p className="text-sm text-gray-500">{formatBytes(metadata.size)}</p>
//           </div>
//           <a href={downloadUrl} download>
//             <Button className="w-full">
//               <Download className="mr-2 h-4 w-4" /> Download
//             </Button>
//           </a>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { formatBytes } from "@/utils/format";
// import { Download, FileWarning } from "lucide-react";

// // Define the shape of the data we expect from our new API endpoint
// interface FileMetadata {
//   originalName: string;
//   size: number;
// }

// // This is an async Server Component. It runs on the server to fetch data.
// export default async function DownloadPage({ params }: { params: { uniqueId: string } }) {
//   const { uniqueId } = params;
  
//   // Construct the URL to our new metadata API endpoint
//   const metaApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/files/meta/${uniqueId}`;
  
//   // Construct the URL for the actual file download
//   const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/files/download/${uniqueId}`;

//   try {
//     const res = await fetch(metaApiUrl, {
//       // Use 'no-store' to ensure we always get the latest data.
//       cache: 'no-store', 
//     });

//     // If the file is not found (API returns 404), show an error page.
//     if (!res.ok) {
//       return (
//         <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
//           <Card className="w-full max-w-md text-center">
//             <CardHeader>
//               <CardTitle className="flex items-center justify-center gap-2 text-destructive">
//                 <FileWarning size={28} /> File Not Found
//               </CardTitle>
//               <CardDescription>
//                 The link may be expired or the file has been deleted.
//               </CardDescription>
//             </CardHeader>
//           </Card>
//         </div>
//       );
//     }
    
//     // If successful, parse the JSON data
//     const metadata: FileMetadata = await res.json();

//     // Render the successful download page
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
//         <Card className="w-full max-w-md">
//           <CardHeader>
//             <CardTitle>Ready to Download</CardTitle>
//             <CardDescription>Your file is ready to be downloaded.</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="flex flex-col items-center justify-center rounded-lg border bg-muted p-6 text-center">
//               <p className="font-semibold text-lg truncate w-full" title={metadata.originalName}>
//                 {metadata.originalName}
//               </p>
//               <p className="text-sm text-muted-foreground">
//                 {formatBytes(metadata.size)}
//               </p>
//             </div>
//             {/* 
//               This is the key part:
//               The <a> tag points to the REAL download endpoint.
//               The `download` attribute tells the browser to save the file.
//             */}
//             <a href={downloadUrl} download>
//               <Button className="w-full h-12 text-md">
//                 <Download className="mr-2 h-5 w-5" />
//                 Download File
//               </Button>
//             </a>
//           </CardContent>
//         </Card>
//       </div>
//     );

//   } catch (error) {
//     console.error("Failed to fetch file metadata:", error);
//     // Generic error page for network issues, etc.
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-gray-100">
//         <p>Could not load file details. Please try again later.</p>
//       </div>
//     );
//   }
// }

// // client/src/app/download/[uniqueId]/page.tsx
// "use client"; // <-- 1. Add this directive to make it a Client Component

// import { useEffect, useState } from 'react'; // <-- 2. Import hooks
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { formatBytes } from "@/utils/format";
// import { Download, FileWarning, Loader2 } from "lucide-react";

// // Define the shape of the data
// interface FileMetadata {
//   originalName: string;
//   size: number;
// }

// // Note: The component is now a default export function, not async directly in the definition
// export default function DownloadPage({ params }: { params: { uniqueId: string } }) {
//   const { uniqueId } = params;
  
//   // 3. Use state to manage metadata and loading/error states
//   const [metadata, setMetadata] = useState<FileMetadata | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // 4. Use useEffect to fetch data on the client side
//   useEffect(() => {
//     const fetchMetadata = async () => {
//       const metaApiUrl = `/api/files/meta/${uniqueId}`; // Use relative URL
//       try {
//         const res = await fetch(metaApiUrl);
//         if (!res.ok) {
//           throw new Error("File not found or link has expired.");
//         }
//         const data: FileMetadata = await res.json();
//         setMetadata(data);
//       } catch (err: any) {
//         setError(err.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchMetadata();
//   }, [uniqueId]);

//   // 5. The new onClick handler for the download button
//   const handleDownload = () => {
//     // This is the URL to our frontend proxy
//     const downloadProxyUrl = `/api/download-proxy/${uniqueId}`;
    
//     // Create a temporary, hidden anchor element
//     const link = document.createElement('a');
//     link.href = downloadProxyUrl;

//     // The 'download' attribute is optional but good practice.
//     // It suggests a filename to the browser.
//     if (metadata) {
//       link.setAttribute('download', metadata.originalName);
//     }
    
//     // Append to the document, "click" it, and then remove it.
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };
  
//   // Render loading state
//   if (isLoading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
//       </div>
//     );
//   }

//   // Render error state
//   if (error || !metadata) {
//     return (
//       <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
//         <Card className="w-full max-w-md text-center">
//           <CardHeader>
//             <CardTitle className="flex items-center justify-center gap-2 text-destructive">
//               <FileWarning size={28} /> Error
//             </CardTitle>
//             <CardDescription>{error || "An unknown error occurred."}</CardDescription>
//           </CardHeader>
//         </Card>
//       </div>
//     );
//   }

//   // Render the successful download page
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle>Ready to Download</CardTitle>
//           <CardDescription>Your file is ready to be downloaded.</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="flex flex-col items-center justify-center rounded-lg border bg-muted p-6 text-center">
//             <p className="font-semibold text-lg truncate w-full" title={metadata.originalName}>
//               {metadata.originalName}
//             </p>
//             <p className="text-sm text-muted-foreground">
//               {formatBytes(metadata.size)}
//             </p>
//           </div>
          
//           {/* 6. The Button now uses onClick instead of being a link */}
//           <Button className="w-full h-12 text-md" onClick={handleDownload}>
//             <Download className="mr-2 h-5 w-5" />
//             Download File
//           </Button>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


// // client/src/app/download/[groupId]/page.tsx

// "use client";

// // Import the 'use' hook directly from React
// import { useEffect, useState, use } from 'react';
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { formatBytes } from "@/utils/format";
// import { Download, File as FileIcon, FileWarning, Loader2, Package, Save } from "lucide-react";

// // Interface for the file metadata we fetch
// interface FileMetadata {
//   originalName: string;
//   size: number;
//   uniqueId: string;
// }

// // Interface for the shape of the params object *after* it's resolved.
// interface ResolvedParams {
//   groupId: string;
// }

// // Interface for the page's props.
// // This correctly types `params` as a Promise that resolves to our params shape.
// interface DownloadPageProps {
//   params: Promise<ResolvedParams>;
// }

// // We destructure `params` from props. The prop type is now correctly set to `DownloadPageProps`.
// export default function DownloadGroupPage({ params }: DownloadPageProps) {
//   // `use(params)` is now valid because its argument is a Promise.
//   // TypeScript can now correctly infer that the return type is `ResolvedParams`.
//   const { groupId } = use(params);

//   // State management for loading, errors, and the list of files
//   const [files, setFiles] = useState<FileMetadata[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // useEffect hook to fetch data when the component mounts or groupId changes
//   useEffect(() => {
//     // We check if groupId exists *after* it has been resolved by the `use` hook.
//     if (!groupId) {
//       setError("No Group ID provided in the URL.");
//       setIsLoading(false);
//       return;
//     }

//     const fetchGroupMetadata = async () => {
//       const apiUrl = `/api/files/group-meta/${groupId}`;
      
//       try {
//         const res = await fetch(apiUrl);

//         if (!res.ok) {
//           const errorData = await res.json().catch(() => ({ message: "File group not found or server error." }));
//           throw new Error(errorData.message);
//         }
        
//         const data: FileMetadata[] = await res.json();
        
//         if (data.length === 0) {
//             throw new Error("This link is valid, but contains no files.");
//         }

//         setFiles(data);
//       } catch (err: any) {
//         setError(err.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchGroupMetadata();
//   }, [groupId]); // The effect depends on the resolved `groupId`.

//   // Function to download a single file
//   const handleDownload = (fileUniqueId: string, fileName: string) => {
//     const downloadProxyUrl = `/api/download-proxy/${fileUniqueId}`;
//     const link = document.createElement('a');
//     link.href = downloadProxyUrl;
//     link.setAttribute('download', fileName);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   // Function to download all files as a ZIP archive
//   const handleDownloadAll = () => {
//     const downloadProxyUrl = `/api/download-proxy/zip/${groupId}`;
//     window.location.href = downloadProxyUrl;
//   };

//   // --- Conditional Rendering ---

//   if (isLoading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-gray-100">
//         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
//       </div>
//     );
//   }

//   if (error || files.length === 0) {
//     return (
//       <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
//         <Card className="w-full max-w-md text-center">
//           <CardHeader>
//             <CardTitle className="flex items-center justify-center gap-2 text-destructive">
//               <FileWarning size={28} /> Error
//             </CardTitle>
//             <CardDescription>{error || "This link is invalid or has expired."}</CardDescription>
//           </CardHeader>
//         </Card>
//       </div>
//     );
//   }
  
//   const totalSize = files.reduce((acc, file) => acc + file.size, 0);

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
//       <Card className="w-full max-w-lg">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2"><Package size={28}/> File Batch</CardTitle>
//           <CardDescription>
//             This link contains {files.length} file(s) with a total size of {formatBytes(totalSize)}.
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//             <div className="space-y-2 max-h-60 overflow-y-auto rounded-md border p-2">
//                 {files.map(file => (
//                     <div key={file.uniqueId} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
//                         <div className="flex items-center gap-3 overflow-hidden">
//                             <FileIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground"/>
//                             <div className='overflow-hidden'>
//                                 <p className="font-medium text-sm truncate" title={file.originalName}>{file.originalName}</p>
//                                 <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
//                             </div>
//                         </div>
//                         <Button size="sm" variant="ghost" onClick={() => handleDownload(file.uniqueId, file.originalName)}>
//                            <Download className="h-4 w-4"/>
//                         </Button>
//                     </div>
//                 ))}
//             </div>
          
//           <Button className="w-full h-12 text-md" onClick={handleDownloadAll}>
//             <Save className="mr-2 h-5 w-5" />
//             Download All (.zip)
//           </Button>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// // client/src/app/download/[groupId]/page.tsx

// "use client";

// import { useEffect, useState, use } from 'react';
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { formatBytes } from "@/utils/format";
// import { Download, File as FileIcon, FileWarning, Loader2, Package, Save, RefreshCw } from "lucide-react";
// import { toast } from 'sonner';

// interface FileMetadata {
//   originalName: string;
//   size: number;
//   uniqueId: string;
// }
// interface ResolvedParams {
//   groupId: string;
// }
// interface DownloadPageProps {
//   params: Promise<ResolvedParams>;
// }

// export default function DownloadGroupPage({ params }: DownloadPageProps) {
//   const { groupId } = use(params);

//   const [files, setFiles] = useState<FileMetadata[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   // ADD a new state for the zipping process
//   const [isZipping, setIsZipping] = useState(false);

//   useEffect(() => {
//     // ... (useEffect logic is correct and remains the same)
//     if (!groupId) {
//       setError("No Group ID provided in the URL.");
//       setIsLoading(false);
//       return;
//     }
//     const fetchGroupMetadata = async () => {
//       const apiUrl = `/api/files/group-meta/${groupId}`;
//       try {
//         const res = await fetch(apiUrl);
//         if (!res.ok) {
//           const errorData = await res.json().catch(() => ({ message: "File group not found." }));
//           throw new Error(errorData.message);
//         }
//         const data: FileMetadata[] = await res.json();
//         if (data.length === 0) {
//             throw new Error("This link is valid, but contains no files.");
//         }
//         setFiles(data);
//       } catch (err: any) {
//         setError(err.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchGroupMetadata();
//   }, [groupId]);

//   const handleDownload = (fileUniqueId: string, fileName: string) => {
//     // ... (this function is correct)
//     const downloadProxyUrl = `/api/download-proxy/${fileUniqueId}`;
//     const link = document.createElement('a');
//     link.href = downloadProxyUrl;
//     link.setAttribute('download', fileName);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   // UPDATE this function to handle the new UI state
//   const handleDownloadAll = async () => {
//     setIsZipping(true);
//     toast.info("Preparing your ZIP file...", {
//         description: "This may take a moment for large files."
//     });

//     const downloadProxyUrl = `/api/download-proxy/zip/${groupId}`;
    
//     try {
//         // We fetch the URL instead of redirecting. This allows us to know when it's done or fails.
//         const response = await fetch(downloadProxyUrl);

//         if (!response.ok) {
//             throw new Error('Server failed to create the ZIP file.');
//         }

//         const blob = await response.blob();
//         const url = window.URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = url;
        
//         // Extract filename from headers or create a default one
//         const disposition = response.headers.get('content-disposition');
//         let filename = 'download.zip';
//         if (disposition && disposition.indexOf('attachment') !== -1) {
//             const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
//             const matches = filenameRegex.exec(disposition);
//             if (matches != null && matches[1]) {
//             filename = matches[1].replace(/['"]/g, '');
//             }
//         }
        
//         link.setAttribute('download', filename);
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//         window.URL.revokeObjectURL(url); // Clean up memory

//     } catch (err) {
//         console.error("Failed to download ZIP:", err);
//         toast.error("Download failed", {
//             description: "Could not create the ZIP file. Please try again later."
//         });
//     } finally {
//         setIsZipping(false);
//     }
//   };

//   // --- Rendering Logic ---

//   if (isLoading) {
//     // ... (this is correct)
//     return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
//   }

//   if (error || files.length === 0) {
//     // ... (this is correct)
//     return <div className="flex min-h-screen items-center justify-center p-4"><Card className="w-full max-w-md text-center"><CardHeader><CardTitle className="text-destructive">Error</CardTitle><CardDescription>{error || "This link is invalid or has expired."}</CardDescription></CardHeader></Card></div>;
//   }
  
//   const totalSize = files.reduce((acc, file) => acc + file.size, 0);

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
//       <Card className="w-full max-w-lg">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2"><Package size={28}/> File Batch</CardTitle>
//           <CardDescription>
//             This link contains {files.length} file(s) with a total size of {formatBytes(totalSize)}.
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//             <div className="space-y-2 max-h-60 overflow-y-auto rounded-md border p-2">
//                 {files.map(file => (
//                     <div key={file.uniqueId} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
//                         <div className="flex items-center gap-3 overflow-hidden">
//                             <FileIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground"/>
//                             <div className='overflow-hidden'>
//                                 <p className="font-medium text-sm truncate" title={file.originalName}>{file.originalName}</p>
//                                 <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
//                             </div>
//                         </div>
//                         <Button size="sm" variant="ghost" onClick={() => handleDownload(file.uniqueId, file.originalName)}>
//                            <Download className="h-4 w-4"/>
//                         </Button>
//                     </div>
//                 ))}
//             </div>
          
//           {/* UPDATE the button to show the zipping state */}
//           <Button className="w-full h-12 text-md" onClick={handleDownloadAll} disabled={isZipping}>
//             {isZipping ? (
//                 <><RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Preparing ZIP...</>
//             ) : (
//                 <><Save className="mr-2 h-5 w-5" /> Download All (.zip)</>
//             )}
//           </Button>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


// // client/src/app/download/[groupId]/page.tsx
// "use client";

// import { useEffect, useState, use } from 'react';
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { formatBytes } from "@/utils/format";
// // FIX: Removed unused imports: Save, RefreshCw, FileWarning
// import { Download, File as FileIcon, Loader2, Package } from "lucide-react";
// // FIX: Removed unused toast import

// interface FileMetadata {
//   originalName: string;
//   size: number;
//   uniqueId: string;
// }
// interface ResolvedParams {
//   groupId: string;
// }
// interface DownloadPageProps {
//   params: Promise<ResolvedParams>;
// }

// export default function DownloadGroupPage({ params }: DownloadPageProps) {
//   const { groupId } = use(params);

//   const [files, setFiles] = useState<FileMetadata[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   // FIX: Removed unused state variables for zipping
//   // const [isZipping, setIsZipping] = useState(false);

//   useEffect(() => {
//     if (!groupId) {
//       setError("No Group ID provided in the URL.");
//       setIsLoading(false);
//       return;
//     }
//     const fetchGroupMetadata = async () => {
//       const apiUrl = `/api/files/group-meta/${groupId}`;
//       try {
//         const res = await fetch(apiUrl);
//         if (!res.ok) {
//           const errorData = await res.json().catch(() => ({ message: "File group not found." }));
//           throw new Error(errorData.message);
//         }
//         const data: FileMetadata[] = await res.json();
//         if (data.length === 0) {
//           throw new Error("This link is valid, but contains no files.");
//         }
//         setFiles(data);
//       } catch (err) {
//         const error = err as Error;
//         setError(error.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchGroupMetadata();
//   }, [groupId]);

//   const handleDownload = (fileUniqueId: string, fileName: string) => {
//     const downloadProxyUrl = `/api/download-proxy/${fileUniqueId}`;
//     const link = document.createElement('a');
//     link.href = downloadProxyUrl;
//     link.setAttribute('download', fileName);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleDownloadAll = () => {
//     if (files.length === 0) return;
//     const delayBetweenDownloads = 300;
//     files.forEach((file, index) => {
//       setTimeout(() => {
//         handleDownload(file.uniqueId, file.originalName);
//       }, index * delayBetweenDownloads);
//     });
//   };

//   if (isLoading) {
//     return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
//   }

//   if (error || files.length === 0) {
//     // We need to add FileWarning back to the import if we use it here.
//     // For now, let's just display the text error.
//     return (
//       <div className="flex min-h-screen items-center justify-center p-4">
//         <Card className="w-full max-w-md text-center">
//           <CardHeader>
//             <CardTitle className="text-destructive">Error</CardTitle>
//             <CardDescription>{error || "This link is invalid or has expired."}</CardDescription>
//           </CardHeader>
//         </Card>
//       </div>
//     );
//   }
  
//   const totalSize = files.reduce((acc, file) => acc + file.size, 0);

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
//       <Card className="w-full max-w-lg">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2"><Package size={28}/> File Batch</CardTitle>
//           <CardDescription>
//             This link contains {files.length} file(s) with a total size of {formatBytes(totalSize)}.
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//             <div className="space-y-2 max-h-60 overflow-y-auto rounded-md border p-2">
//                 {files.map(file => (
//                     <div key={file.uniqueId} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
//                         <div className="flex items-center gap-3 overflow-hidden">
//                             <FileIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground"/>
//                             <div className='overflow-hidden'>
//                                 <p className="font-medium text-sm truncate" title={file.originalName}>{file.originalName}</p>
//                                 <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
//                             </div>
//                         </div>
//                         <Button size="sm" variant="ghost" onClick={() => handleDownload(file.uniqueId, file.originalName)}>
//                            <Download className="h-4 w-4"/>
//                         </Button>
//                     </div>
//                 ))}
//             </div>
          
//           <Button className="w-full h-12 text-md" onClick={handleDownloadAll}>
//             <Download className="mr-2 h-5 w-5" />
//             Download All
//           </Button>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// "use client";

// import { useEffect, useState, use } from 'react';
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { formatBytes } from "@/utils/format";
// import { Download, File as FileIcon, Loader2, Package, AlertTriangle } from "lucide-react";
// import { toast } from "sonner";

// // Interface for file metadata received from the API
// interface FileMetadata {
//     originalName: string;
//     size: number;
//     uniqueId: string;
// }

// // Props for the page, handling Next.js async params.
// // The `params` prop is a promise that resolves to the dynamic route parameters.
// interface DownloadPageProps {
//     params: Promise<{
//         groupId: string;
//     }>;
// }

// export default function DownloadGroupPage({ params }: DownloadPageProps) {
//     // FIX: The `use` hook unwraps the promise from the `params` prop.
//     // This is the correct way to access dynamic route params in a Client Component
//     // and resolves the "params should be awaited" error.
//     const { groupId } = use(params);

//     // State management
//     const [files, setFiles] = useState<FileMetadata[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [downloading, setDownloading] = useState<Set<string>>(new Set()); // Tracks uniqueIds of files being downloaded
//     const [isDownloadingAll, setIsDownloadingAll] = useState(false);

//     // Fetch metadata on component mount
//     useEffect(() => {
//         if (!groupId) {
//             // This check is still useful in case the groupId is empty for some reason
//             setError("No Group ID provided in the URL.");
//             setIsLoading(false);
//             return;
//         }

//         const fetchGroupMetadata = async () => {
//             const apiUrl = `/api/files/group-meta/${groupId}`;
//             try {
//                 const res = await fetch(apiUrl);
//                 if (!res.ok) {
//                     const errorData = await res.json().catch(() => ({ message: "File group not found or the link has expired." }));
//                     throw new Error(errorData.message);
//                 }
//                 const data: FileMetadata[] = await res.json();
//                 if (data.length === 0) {
//                     throw new Error("This link is valid, but contains no files.");
//                 }
//                 setFiles(data);
//             } catch (err) {
//                 const error = err as Error;
//                 setError(error.message);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchGroupMetadata();
//     }, [groupId]);

//     /**
//      * Handles the download of a single file.
//      * Uses fetch to get the file as a blob, then creates an object URL to trigger the download.
//      * This provides better feedback and error handling than a simple link click.
//      */
//     const handleDownload = async (file: FileMetadata) => {
//         // Prevent multiple downloads of the same file simultaneously
//         if (downloading.has(file.uniqueId)) return;

//         setDownloading(prev => new Set(prev).add(file.uniqueId));
//         toast.info(`Preparing to download ${file.originalName}...`);

//         try {
//             const downloadProxyUrl = `/api/download-proxy/${file.uniqueId}`;
//             const response = await fetch(downloadProxyUrl);

//             if (!response.ok) {
//                 const errorText = await response.text();
//                 throw new Error(errorText || `Server error: ${response.statusText}`);
//             }

//             const blob = await response.blob();
//             const url = window.URL.createObjectURL(blob);
//             const link = document.createElement('a');
//             link.href = url;
//             link.setAttribute('download', file.originalName);
//             document.body.appendChild(link);
//             link.click();

//             // Cleanup
//             document.body.removeChild(link);
//             window.URL.revokeObjectURL(url);
//             toast.success(`${file.originalName} has started downloading.`);

//         } catch (err) {
//             const error = err as Error;
//             console.error("Download error:", error);
//             toast.error(`Failed to download ${file.originalName}`, { description: error.message });
//         } finally {
//             setDownloading(prev => {
//                 const newSet = new Set(prev);
//                 newSet.delete(file.uniqueId);
//                 return newSet;
//             });
//         }
//     };
    
//     /**
//      * Handles downloading all files in the group sequentially with a small delay.
//      */
//     const handleDownloadAll = () => {
//         if (files.length === 0 || isDownloadingAll) return;

//         setIsDownloadingAll(true);
//         toast.info(`Starting batch download for ${files.length} files.`, {
//             description: "Please allow pop-ups if prompted by your browser.",
//         });

//         const delayBetweenDownloads = 500; // 0.5 second delay
//         let downloadCount = 0;

//         files.forEach((file, index) => {
//             setTimeout(() => {
//                 handleDownload(file).finally(() => {
//                     downloadCount++;
//                     if (downloadCount === files.length) {
//                         setIsDownloadingAll(false);
//                         toast.success("All file downloads have been initiated.");
//                     }
//                 });
//             }, index * delayBetweenDownloads);
//         });
//     };

//     // --- RENDER LOGIC ---

//     if (isLoading) {
//         return (
//             <div className="flex min-h-screen items-center justify-center">
//                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
//             </div>
//         );
//     }

//     if (error || files.length === 0) {
//         return (
//             <div className="flex min-h-screen items-center justify-center p-4">
//                 <Card className="w-full max-w-md text-center">
//                     <CardHeader>
//                         <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
//                            <AlertTriangle className="h-6 w-6 text-red-600" />
//                         </div>
//                         <CardTitle className="mt-4 text-destructive">Download Unavailable</CardTitle>
//                         <CardDescription>{error || "This link is invalid or has expired."}</CardDescription>
//                     </CardHeader>
//                 </Card>
//             </div>
//         );
//     }

//     const totalSize = files.reduce((acc, file) => acc + file.size, 0);

//     return (
//         <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
//             <Card className="w-full max-w-lg">
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2 text-2xl">
//                         <Package size={28} /> File Batch Ready
//                     </CardTitle>
//                     <CardDescription>
//                         This link contains {files.length} file(s) with a total size of {formatBytes(totalSize)}.
//                     </CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="space-y-2 max-h-72 overflow-y-auto rounded-md border p-2">
//                         {files.map(file => (
//                             <div key={file.uniqueId} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors">
//                                 <div className="flex items-center gap-3 overflow-hidden">
//                                     <FileIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
//                                     <div className='overflow-hidden'>
//                                         <p className="font-medium text-sm truncate" title={file.originalName}>{file.originalName}</p>
//                                         <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
//                                     </div>
//                                 </div>
//                                 <Button size="sm" variant="ghost" onClick={() => handleDownload(file)} disabled={downloading.has(file.uniqueId)}>
//                                     {downloading.has(file.uniqueId) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
//                                 </Button>
//                             </div>
//                         ))}
//                     </div>
//                     <Button className="w-full h-12 text-md" onClick={handleDownloadAll} disabled={isDownloadingAll}>
//                         {isDownloadingAll ? (
//                             <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                         ) : (
//                             <Download className="mr-2 h-5 w-5" />
//                         )}
//                         {isDownloadingAll ? 'Initiating Downloads...' : 'Download All'}
//                     </Button>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }


// "use client";

// import { useEffect, useState, use } from 'react';
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { formatBytes } from "@/utils/format";
// import { Download, File as FileIcon, Loader2, Package, AlertTriangle } from "lucide-react";
// import { toast } from "sonner";

// // Interface for file metadata received from the API
// interface FileMetadata {
//     originalName: string;
//     size: number;
//     uniqueId: string;
// }

// // Props for the page, handling Next.js async params.
// // The `params` prop is a promise that resolves to the dynamic route parameters.
// interface DownloadPageProps {
//     params: Promise<{
//         groupId: string;
//     }>;
// }

// export default function DownloadGroupPage({ params }: DownloadPageProps) {
//     // FIX: The `use` hook unwraps the promise from the `params` prop.
//     // This is the correct way to access dynamic route params in a Client Component
//     // and resolves the "params should be awaited" error.
//     const { groupId } = use(params);

//     // State management
//     const [files, setFiles] = useState<FileMetadata[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [downloading, setDownloading] = useState<Set<string>>(new Set()); // Tracks uniqueIds of files being downloaded
//     const [isDownloadingAll, setIsDownloadingAll] = useState(false);

//     // Fetch metadata on component mount
//     useEffect(() => {
//         if (!groupId) {
//             // This check is still useful in case the groupId is empty for some reason
//             setError("No Group ID provided in the URL.");
//             setIsLoading(false);
//             return;
//         }

//         const fetchGroupMetadata = async () => {
//             const apiUrl = `/api/files/group-meta/${groupId}`;
//             try {
//                 const res = await fetch(apiUrl);
//                 if (!res.ok) {
//                     const errorData = await res.json().catch(() => ({ message: "File group not found or the link has expired." }));
//                     throw new Error(errorData.message);
//                 }
//                 const data: FileMetadata[] = await res.json();
//                 if (data.length === 0) {
//                     throw new Error("This link is valid, but contains no files.");
//                 }
//                 setFiles(data);
//             } catch (err) {
//                 const error = err as Error;
//                 setError(error.message);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchGroupMetadata();
//     }, [groupId]);

//     /**
//      * Handles the download of a single file.
//      * Uses fetch to get the file as a blob, then creates an object URL to trigger the download.
//      * This provides better feedback and error handling than a simple link click.
//      */
//     const handleDownload = async (file: FileMetadata) => {
//         // Prevent multiple downloads of the same file simultaneously
//         if (downloading.has(file.uniqueId)) return;

//         setDownloading(prev => new Set(prev).add(file.uniqueId));
//         toast.info(`Preparing to download ${file.originalName}...`);

//         try {
//             const downloadProxyUrl = `/api/download-proxy/${file.uniqueId}`;
//             const response = await fetch(downloadProxyUrl);

//             if (!response.ok) {
//                 const errorText = await response.text();
//                 throw new Error(errorText || `Server error: ${response.statusText}`);
//             }

//             const blob = await response.blob();
//             const url = window.URL.createObjectURL(blob);
//             const link = document.createElement('a');
//             link.href = url;
//             link.setAttribute('download', file.originalName);
//             document.body.appendChild(link);
//             link.click();

//             // Cleanup
//             document.body.removeChild(link);
//             window.URL.revokeObjectURL(url);
//             toast.success(`${file.originalName} has started downloading.`);

//         } catch (err) {
//             const error = err as Error;
//             console.error("Download error:", error);
//             toast.error(`Failed to download ${file.originalName}`, { description: error.message });
//         } finally {
//             setDownloading(prev => {
//                 const newSet = new Set(prev);
//                 newSet.delete(file.uniqueId);
//                 return newSet;
//             });
//         }
//     };
    
//     /**
//      * Handles downloading all files in the group sequentially with a small delay.
//      */
//     const handleDownloadAll = () => {
//         if (files.length === 0 || isDownloadingAll) return;

//         setIsDownloadingAll(true);
//         toast.info(`Starting batch download for ${files.length} files.`, {
//             description: "Please allow pop-ups if prompted by your browser.",
//         });

//         const delayBetweenDownloads = 500; // 0.5 second delay
//         let downloadCount = 0;

//         files.forEach((file, index) => {
//             setTimeout(() => {
//                 handleDownload(file).finally(() => {
//                     downloadCount++;
//                     if (downloadCount === files.length) {
//                         setIsDownloadingAll(false);
//                         toast.success("All file downloads have been initiated.");
//                     }
//                 });
//             }, index * delayBetweenDownloads);
//         });
//     };

//     // --- RENDER LOGIC ---

//     if (isLoading) {
//         return (
//             <div className="flex min-h-screen items-center justify-center">
//                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
//             </div>
//         );
//     }

//     if (error || files.length === 0) {
//         return (
//             <div className="flex min-h-screen items-center justify-center p-4">
//                 <Card className="w-full max-w-md text-center">
//                     <CardHeader>
//                         <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
//                            <AlertTriangle className="h-6 w-6 text-red-600" />
//                         </div>
//                         <CardTitle className="mt-4 text-destructive">Download Unavailable</CardTitle>
//                         <CardDescription>{error || "This link is invalid or has expired."}</CardDescription>
//                     </CardHeader>
//                 </Card>
//             </div>
//         );
//     }

//     const totalSize = files.reduce((acc, file) => acc + file.size, 0);

//     return (
//         <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
//             <Card className="w-full max-w-lg">
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2 text-2xl">
//                         <Package size={28} /> File Batch Ready
//                     </CardTitle>
//                     <CardDescription>
//                         This link contains {files.length} file(s) with a total size of {formatBytes(totalSize)}.
//                     </CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="space-y-2 max-h-72 overflow-y-auto rounded-md border p-2">
//                         {files.map(file => (
//                             <div key={file.uniqueId} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors">
//                                 <div className="flex items-center gap-3 overflow-hidden">
//                                     <FileIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
//                                     <div className='overflow-hidden'>
//                                         <p className="font-medium text-sm truncate" title={file.originalName}>{file.originalName}</p>
//                                         <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
//                                     </div>
//                                 </div>
//                                 <Button size="sm" variant="ghost" onClick={() => handleDownload(file)} disabled={downloading.has(file.uniqueId)}>
//                                     {downloading.has(file.uniqueId) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
//                                 </Button>
//                             </div>
//                         ))}
//                     </div>
//                     <Button className="w-full h-12 text-md" onClick={handleDownloadAll} disabled={isDownloadingAll}>
//                         {isDownloadingAll ? (
//                             <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                         ) : (
//                             <Download className="mr-2 h-5 w-5" />
//                         )}
//                         {isDownloadingAll ? 'Initiating Downloads...' : 'Download All'}
//                     </Button>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }



// // client/src/app/download/[groupId]/page.tsx
// "use client";

// import { useEffect, useState } from 'react';
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { formatBytes } from "@/utils/format";
// import { Download, File as FileIcon, Loader2, Package, AlertTriangle } from "lucide-react";
// import { toast } from "sonner";
// import { usePathname } from 'next/navigation';

// // --- MODIFIED INTERFACE ---
// interface FileMetadata {
//     originalName: string;
//     size: number;
//     uniqueId: string;
//     thumbnail: string | null; // Can be a base64 string
// }

// export default function DownloadGroupPage() {
//     const pathname = usePathname();
//     const groupId = pathname.split('/').pop();

//     const [files, setFiles] = useState<FileMetadata[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [downloading, setDownloading] = useState<Set<string>>(new Set());
//     const [isDownloadingAll, setIsDownloadingAll] = useState(false);

//     useEffect(() => {
//         if (!groupId) {
//             setError("No Group ID provided in the URL.");
//             setIsLoading(false);
//             return;
//         }

//         const fetchGroupMetadata = async () => {
//             const apiUrl = `/api/files/group-meta/${groupId}`;
//             try {
//                 const res = await fetch(apiUrl);
//                 if (!res.ok) {
//                     const errorData = await res.json().catch(() => ({ message: "File group not found or the link has expired." }));
//                     throw new Error(errorData.message);
//                 }
//                 const data: FileMetadata[] = await res.json();
//                 if (data.length === 0) {
//                     throw new Error("This link is valid, but contains no files.");
//                 }
//                 setFiles(data);
//             } catch (err) {
//                 const error = err as Error;
//                 setError(error.message);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchGroupMetadata();
//     }, [groupId]);

//     const handleDownload = async (file: FileMetadata) => {
//         if (downloading.has(file.uniqueId)) return;
//         setDownloading(prev => new Set(prev).add(file.uniqueId));
//         toast.info(`Preparing to download ${file.originalName}...`);
//         try {
//             const downloadProxyUrl = `/api/download-proxy/${file.uniqueId}`;
//             const response = await fetch(downloadProxyUrl);
//             if (!response.ok) {
//                 const errorText = await response.text();
//                 throw new Error(errorText || `Server error: ${response.statusText}`);
//             }
//             const blob = await response.blob();
//             const url = window.URL.createObjectURL(blob);
//             const link = document.createElement('a');
//             link.href = url;
//             link.setAttribute('download', file.originalName);
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
//             window.URL.revokeObjectURL(url);
//             toast.success(`${file.originalName} has started downloading.`);
//         } catch (err) {
//             const error = err as Error;
//             console.error("Download error:", error);
//             toast.error(`Failed to download ${file.originalName}`, { description: error.message });
//         } finally {
//             setDownloading(prev => { const newSet = new Set(prev); newSet.delete(file.uniqueId); return newSet; });
//         }
//     };
    
//     const handleDownloadAll = () => {
//         if (files.length === 0 || isDownloadingAll) return;
//         setIsDownloadingAll(true);
//         toast.info(`Starting batch download for ${files.length} files.`, { description: "Please allow pop-ups if prompted by your browser." });
//         const delayBetweenDownloads = 500;
//         let downloadCount = 0;
//         files.forEach((file, index) => {
//             setTimeout(() => {
//                 handleDownload(file).finally(() => {
//                     downloadCount++;
//                     if (downloadCount === files.length) {
//                         setIsDownloadingAll(false);
//                         toast.success("All file downloads have been initiated.");
//                     }
//                 });
//             }, index * delayBetweenDownloads);
//         });
//     };

//     if (isLoading) { return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>; }

//     if (error || files.length === 0) { return <div className="flex min-h-screen items-center justify-center p-4"><Card className="w-full max-w-md text-center"><CardHeader><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100"><AlertTriangle className="h-6 w-6 text-red-600" /></div><CardTitle className="mt-4 text-destructive">Download Unavailable</CardTitle><CardDescription>{error || "This link is invalid or has expired."}</CardDescription></CardHeader></Card></div>; }

//     const totalSize = files.reduce((acc, file) => acc + file.size, 0);

//     return (
//         <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
//             <Card className="w-full max-w-lg">
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2 text-2xl"><Package size={28} /> File Batch Ready</CardTitle>
//                     <CardDescription>This link contains {files.length} file(s) with a total size of {formatBytes(totalSize)}.</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="space-y-2 max-h-72 overflow-y-auto rounded-md border p-2">
//                         {files.map(file => (
//                             <div key={file.uniqueId} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors">
//                                 <div className="flex items-center gap-3 overflow-hidden">
//                                     {/* --- NEW: Display thumbnail if it exists, otherwise show a file icon --- */}
//                                     {file.thumbnail ? (
//                                         <img
//                                             src={`data:image/jpeg;base64,${file.thumbnail}`}
//                                             alt="preview"
//                                             className="h-10 w-10 flex-shrink-0 rounded-sm object-cover bg-gray-200"
//                                         />
//                                     ) : (
//                                         <div className="h-10 w-10 flex-shrink-0 rounded-sm bg-gray-100 flex items-center justify-center">
//                                             <FileIcon className="h-5 w-5 text-gray-500" />
//                                         </div>
//                                     )}
//                                     <div className='overflow-hidden'>
//                                         <p className="font-medium text-sm truncate" title={file.originalName}>{file.originalName}</p>
//                                         <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
//                                     </div>
//                                 </div>
//                                 <Button size="sm" variant="ghost" onClick={() => handleDownload(file)} disabled={downloading.has(file.uniqueId)}>
//                                     {downloading.has(file.uniqueId) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
//                                 </Button>
//                             </div>
//                         ))}
//                     </div>
//                     <Button className="w-full h-12 text-md" onClick={handleDownloadAll} disabled={isDownloadingAll}>
//                         {isDownloadingAll ? (<Loader2 className="mr-2 h-5 w-5 animate-spin" />) : (<Download className="mr-2 h-5 w-5" />)}
//                         {isDownloadingAll ? 'Initiating Downloads...' : 'Download All'}
//                     </Button>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }

// "use client";

// import { useEffect, useState } from 'react';
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { formatBytes } from "@/utils/format";
// import { Download, File as FileIcon, Loader2, Package, AlertTriangle } from "lucide-react";
// import { toast } from "sonner";
// import { usePathname } from 'next/navigation';

// interface FileMetadata {
//     originalName: string;
//     size: number;
//     uniqueId: string;
//     thumbnail: string | null;
// }

// export default function DownloadGroupPage() {
//     const pathname = usePathname();
//     const groupId = pathname.split('/').pop();

//     const [files, setFiles] = useState<FileMetadata[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [downloading, setDownloading] = useState<Set<string>>(new Set());
//     const [isDownloadingAll, setIsDownloadingAll] = useState(false);

//     useEffect(() => {
//         if (!groupId) {
//             setError("No Group ID provided in the URL.");
//             setIsLoading(false);
//             return;
//         }

//         const fetchGroupMetadata = async () => {
//             setIsLoading(true);
//             const apiUrl = `/api/files/group-meta/${groupId}`;
//             try {
//                 const res = await fetch(apiUrl);
//                 if (!res.ok) {
//                     const errorData = await res.json().catch(() => ({ message: "File group not found or the link has expired." }));
//                     throw new Error(errorData.message);
//                 }
//                 const data: FileMetadata[] = await res.json();
//                 if (data.length === 0) {
//                     throw new Error("This link is valid, but contains no files.");
//                 }
//                 setFiles(data);
//             } catch (err) {
//                 const error = err as Error;
//                 setError(error.message);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchGroupMetadata();
//     }, [groupId]);

//     const handleDownload = async (file: FileMetadata) => {
//         if (downloading.has(file.uniqueId)) return;
//         setDownloading(prev => new Set(prev).add(file.uniqueId));
//         toast.info(`Preparing to download ${file.originalName}...`);
//         try {
//             const downloadProxyUrl = `/api/download-proxy/${file.uniqueId}`;
//             const response = await fetch(downloadProxyUrl);
//             if (!response.ok) {
//                 const errorText = await response.text();
//                 throw new Error(errorText || `Server error: ${response.statusText}`);
//             }
//             const blob = await response.blob();
//             const url = window.URL.createObjectURL(blob);
//             const link = document.createElement('a');
//             link.href = url;
//             link.setAttribute('download', file.originalName);
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
//             window.URL.revokeObjectURL(url);
//             toast.success(`${file.originalName} has started downloading.`);
//         } catch (err) {
//             const error = err as Error;
//             console.error("Download error:", error);
//             toast.error(`Failed to download ${file.originalName}`, { description: error.message });
//         } finally {
//             setDownloading(prev => { const newSet = new Set(prev); newSet.delete(file.uniqueId); return newSet; });
//         }
//     };
    
//     const handleDownloadAll = async () => {
//         if (files.length === 0 || isDownloadingAll || !groupId) return;
//         setIsDownloadingAll(true);
//         toast.info("Preparing your ZIP file, this may take a moment...");
//         try {
//             const downloadProxyUrl = `/api/download-proxy/zip/${groupId}`;
//             const response = await fetch(downloadProxyUrl);
//             if (!response.ok) {
//                 const errorText = await response.text();
//                 throw new Error(errorText || `Server error: ${response.statusText}`);
//             }
//             const blob = await response.blob();
//             const url = window.URL.createObjectURL(blob);
//             const link = document.createElement('a');
//             link.href = url;
//             const zipFileName = files[0].originalName.split('.')[0] || 'archive';
//             link.setAttribute('download', `${zipFileName}.zip`);
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
//             window.URL.revokeObjectURL(url);
//             toast.success("Your ZIP download has started!");
//         } catch (err) {
//             const error = err as Error;
//             console.error("Download All error:", error);
//             toast.error(`Failed to download ZIP file`, { description: error.message });
//         } finally {
//             setIsDownloadingAll(false);
//         }
//     };

//     // <-- REVISED RENDER LOGIC -->
//     return (
//         <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
//             <Card className="w-full max-w-lg">
//                 {error ? (
//                     // State: An error occurred
//                     <CardHeader>
//                         <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
//                             <AlertTriangle className="h-6 w-6 text-red-600" />
//                         </div>
//                         <CardTitle className="mt-4 text-center text-destructive">Download Unavailable</CardTitle>
//                         <CardDescription className="text-center">{error}</CardDescription>
//                     </CardHeader>
//                 ) : (
//                     // State: Loading or Success
//                     <>
//                         <CardHeader>
//                             <CardTitle className="flex items-center gap-2 text-2xl">
//                                 <Package size={28} /> File Batch Ready
//                             </CardTitle>
//                             {isLoading ? (
//                                 <CardDescription>Fetching file details...</CardDescription>
//                             ) : (
//                                 <CardDescription>
//                                     This link contains {files.length} file(s) with a total size of {formatBytes(files.reduce((acc, file) => acc + file.size, 0))}.
//                                 </CardDescription>
//                             )}
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                             {isLoading ? (
//                                 <div className="flex justify-center items-center h-48">
//                                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                                 </div>
//                             ) : (
//                                 <>
//                                     <div className="space-y-2 max-h-72 overflow-y-auto rounded-md border p-2">
//                                         {files.map(file => (
//                                             <div key={file.uniqueId} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors">
//                                                 <div className="flex items-center gap-3 overflow-hidden">
//                                                     {file.thumbnail ? (
//                                                         <img src={`data:image/jpeg;base64,${file.thumbnail}`} alt="preview" className="h-10 w-10 flex-shrink-0 rounded-sm object-cover bg-gray-200" />
//                                                     ) : (
//                                                         <div className="h-10 w-10 flex-shrink-0 rounded-sm bg-gray-100 flex items-center justify-center">
//                                                             <FileIcon className="h-5 w-5 text-gray-500" />
//                                                         </div>
//                                                     )}
//                                                     <div className='overflow-hidden'>
//                                                         <p className="font-medium text-sm truncate" title={file.originalName}>{file.originalName}</p>
//                                                         <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
//                                                     </div>
//                                                 </div>
//                                                 <Button size="sm" variant="ghost" onClick={() => handleDownload(file)} disabled={downloading.has(file.uniqueId)}>
//                                                     {downloading.has(file.uniqueId) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
//                                                 </Button>
//                                             </div>
//                                         ))}
//                                     </div>
//                                     <Button className="w-full h-12 text-md" onClick={handleDownloadAll} disabled={isDownloadingAll}>
//                                         {isDownloadingAll ? (<Loader2 className="mr-2 h-5 w-5 animate-spin" />) : (<Package className="mr-2 h-5 w-5" />)}
//                                         {isDownloadingAll ? 'Zipping files...' : 'Download All as .ZIP'}
//                                     </Button>
//                                 </>
//                             )}
//                         </CardContent>
//                     </>
//                 )}
//             </Card>
//         </div>
//     );
// }

// client/src/app/download/[groupId]/page.tsx
// "use client";

// import { useEffect, useState } from 'react';
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { formatBytes } from "@/utils/format";
// import { Download, File as FileIcon, Loader2, Package, AlertTriangle, XCircle } from "lucide-react";
// import { toast } from "sonner";
// import { usePathname } from 'next/navigation';
// import { Zip, ZipPassThrough } from 'fflate'; 
// import { saveAs } from 'file-saver';

// interface FileMetadata {
//     originalName: string;
//     size: number;
//     uniqueId: string;
//     thumbnail: string | null;
// }

// interface ZipProgressState {
//     totalFiles: number;
//     completedFiles: number;
//     currentFileName: string;
//     overallPercentage: number;
//     currentFilePercentage: number;
// }

// export default function DownloadGroupPage() {
//     const pathname = usePathname();
//     const groupId = pathname.split('/').pop();

//     const [files, setFiles] = useState<FileMetadata[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
    
//     // --- FIX: Removed unused 'downloading' and 'setDownloading' state ---
//     const [isZipping, setIsZipping] = useState(false);
//     const [zipProgress, setZipProgress] = useState<ZipProgressState>({
//         totalFiles: 0, completedFiles: 0, currentFileName: '', overallPercentage: 0, currentFilePercentage: 0
//     });
//     const [abortController, setAbortController] = useState<AbortController | null>(null);

//     const backendApiUrl = process.env.NEXT_PUBLIC_API_URL;

//     useEffect(() => {
//         if (!groupId || !backendApiUrl) {
//             setError("Configuration error or missing Group ID.");
//             setIsLoading(false);
//             return;
//         }
//         const fetchGroupMetadata = async () => {
//             setIsLoading(true);
//             const apiUrl = `${backendApiUrl}/files/group-meta/${groupId}`;
//             try {
//                 const res = await fetch(apiUrl);
//                 if (!res.ok) {
//                     const errorData = await res.json().catch(() => ({ message: "File group not found or the link has expired." }));
//                     throw new Error(errorData.message);
//                 }
//                 const data: FileMetadata[] = await res.json();
//                 if (data.length === 0) {
//                     throw new Error("This link is valid, but contains no files.");
//                 }
//                 setFiles(data);
//             } catch (err) {
//                 const error = err as Error;
//                 setError(error.message);
//             } finally {
//                 setIsLoading(false);
//             }
//         };
//         fetchGroupMetadata();
//     }, [groupId, backendApiUrl]);

//     const handleDownload = (file: FileMetadata) => {
//         if (!backendApiUrl) { toast.error("API URL not configured."); return; }
//         try {
//             toast.info(`Your download for ${file.originalName} has started.`);
//             const downloadUrl = `${backendApiUrl}/files/download/${file.uniqueId}`;
//             const link = document.createElement('a');
//             link.href = downloadUrl;
//             link.setAttribute('download', file.originalName);
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
//         } catch (err) {
//             const error = err as Error;
//             toast.error(`Failed to start download for ${file.originalName}`, { description: error.message });
//         }
//     };
    
//     const handleCancelZip = () => {
//         if (abortController) {
//             abortController.abort();
//             toast.warning("Download All operation has been cancelled.");
//         }
//         setIsZipping(false);
//     };

//     const handleDownloadAllAsZip = async () => {
//         if (files.length === 0 || isZipping || !backendApiUrl) return;

//         setIsZipping(true);
//         const controller = new AbortController();
//         setAbortController(controller);

//         const zip = new Zip();
//         const zipFileName = `${files[0].originalName.split('.')[0] || 'archive'}.zip`;
        
//         const zipChunks: Uint8Array[] = [];
//         zip.ondata = (err, data, final) => {
//             if (err) {
//                 setIsZipping(false);
//                 toast.error("Error during zipping", { description: err.message });
//                 throw err;
//             }
//             zipChunks.push(data);
//             if (final) {
//                 const zipBlob = new Blob(zipChunks, { type: 'application/zip' });
//                 saveAs(zipBlob, zipFileName);
//                 setIsZipping(false);
//                 toast.success("ZIP file created successfully!");
//             }
//         };

//         toast.info("Starting download and zip process...");

//         try {
//             for (let i = 0; i < files.length; i++) {
//                 const file = files[i];
                
//                 setZipProgress({
//                     totalFiles: files.length,
//                     completedFiles: i,
//                     currentFileName: file.originalName,
//                     overallPercentage: Math.round((i / files.length) * 100),
//                     currentFilePercentage: 0,
//                 });

//                 const downloadUrl = `${backendApiUrl}/files/download/${file.uniqueId}`;
//                 const response = await fetch(downloadUrl, { signal: controller.signal });

//                 if (!response.ok || !response.body) {
//                     throw new Error(`Failed to start download for ${file.originalName}`);
//                 }
                
//                 const fileStream = new ZipPassThrough(file.originalName);
//                 fileStream.mtime = new Date();
//                 zip.add(fileStream);

//                 const reader = response.body.getReader();
//                 let downloadedBytes = 0;
                
//                 while (true) {
//                     const { done, value } = await reader.read();
//                     if (done) break;
                    
//                     fileStream.push(value);
//                     downloadedBytes += value.length;

//                     setZipProgress(currentProgress => ({
//                         ...currentProgress,
//                         currentFilePercentage: (downloadedBytes / file.size) * 100,
//                     }));
//                 }
                
//                 fileStream.push(new Uint8Array(0), true);
//             }
            
//             setZipProgress(currentProgress => ({
//                 ...currentProgress,
//                 completedFiles: files.length,
//                 overallPercentage: 100,
//                 currentFilePercentage: 100,
//             }));
//             zip.end();

//         } catch (err) {
//             if ((err as Error).name !== 'AbortError') {
//                 toast.error("Download failed", { description: (err as Error).message });
//             }
//             setIsZipping(false);
//         }
//     };

//     return (
//         <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
//             <Card className="w-full max-w-lg">
//                 {error ? (
//                      <CardHeader>
//                         <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
//                             <AlertTriangle className="h-6 w-6 text-red-600" />
//                         </div>
//                         <CardTitle className="mt-4 text-center text-destructive">Download Unavailable</CardTitle>
//                         <CardDescription className="text-center">{error}</CardDescription>
//                     </CardHeader>
//                 ) : (
//                     <>
//                         <CardHeader>
//                             <CardTitle className="flex items-center gap-2 text-2xl">
//                                 <Package size={28} /> File Batch Ready
//                             </CardTitle>
//                             {isLoading ? (
//                                 <CardDescription>Fetching file details...</CardDescription>
//                             ) : (
//                                 <CardDescription>
//                                     This link contains {files.length} file(s) with a total size of {formatBytes(files.reduce((acc, file) => acc + file.size, 0))}.
//                                 </CardDescription>
//                             )}
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                             {isLoading ? (
//                                 <div className="flex justify-center items-center h-48">
//                                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                                 </div>
//                             ) : (
//                                 <>
//                                     <div className="space-y-2 max-h-72 overflow-y-auto rounded-md border p-2">
//                                         {files.map(file => (
//                                             <div key={file.uniqueId} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors">
//                                                 <div className="flex items-center gap-3 overflow-hidden">
//                                                      {file.thumbnail ? (
//                                                         <img src={`data:image/jpeg;base64,${file.thumbnail}`} alt="preview" className="h-10 w-10 flex-shrink-0 rounded-sm object-cover bg-gray-200" />
//                                                     ) : (
//                                                         <div className="h-10 w-10 flex-shrink-0 rounded-sm bg-gray-100 flex items-center justify-center">
//                                                             <FileIcon className="h-5 w-5 text-gray-500" />
//                                                         </div>
//                                                     )}
//                                                     <div className='overflow-hidden'>
//                                                         <p className="font-medium text-sm truncate" title={file.originalName}>{file.originalName}</p>
//                                                         <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
//                                                     </div>
//                                                 </div>
//                                                 {/* --- FIX: Disable single download button while zipping --- */}
//                                                 <Button size="sm" variant="ghost" onClick={() => handleDownload(file)} disabled={isZipping}>
//                                                     <Download className="h-4 w-4" />
//                                                 </Button>
//                                             </div>
//                                         ))}
//                                     </div>
                                    
//                                     {files.length > 1 && (
//                                         <>
//                                             {isZipping ? (
//                                                 <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
//                                                     <div className="flex justify-between items-center">
//                                                         <p className="font-semibold text-sm">Processing Files...</p>
//                                                         <Button variant="ghost" size="sm" onClick={handleCancelZip}>
//                                                             <XCircle className="h-4 w-4 mr-2" />
//                                                             Cancel
//                                                         </Button>
//                                                     </div>

//                                                     <div className='space-y-1'>
//                                                         <p className='text-xs font-medium text-muted-foreground'>
//                                                             Overall Progress ({zipProgress.completedFiles} / {zipProgress.totalFiles})
//                                                         </p>
//                                                         <Progress value={zipProgress.overallPercentage} />
//                                                     </div>

//                                                     <div className='space-y-1'>
//                                                         <p className="text-xs font-medium text-muted-foreground truncate" title={zipProgress.currentFileName}>
//                                                             Current: {zipProgress.currentFileName}
//                                                         </p>
//                                                         <Progress value={zipProgress.currentFilePercentage} className="h-1.5" />
//                                                     </div>
//                                                 </div>
//                                             ) : (
//                                                 <Button className="w-full h-12 text-md" onClick={handleDownloadAllAsZip}>
//                                                     <Package className="mr-2 h-5 w-5" />
//                                                     Download All as .ZIP
//                                                 </Button>
//                                             )}
//                                         </>
//                                     )}
//                                 </>
//                             )}
//                         </CardContent>
//                     </>
//                 )}
//             </Card>
//         </div>
//     );
// }


// // client/src/app/download/[groupId]/page.tsx
// "use client";

// import { useEffect, useState } from 'react';
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { formatBytes } from "@/utils/format";
// import { Download, File as FileIcon, Loader2, Package, AlertTriangle, XCircle } from "lucide-react";
// import { toast } from "sonner";
// import { usePathname } from 'next/navigation';
// import { Zip, ZipPassThrough } from 'fflate'; 
// import { saveAs } from 'file-saver';

// interface FileMetadata {
//     originalName: string;
//     size: number;
//     uniqueId: string;
//     thumbnail: string | null;
// }

// interface ZipProgressState {
//     totalFiles: number;
//     completedFiles: number;
//     currentFileName: string;
//     overallPercentage: number;
//     currentFilePercentage: number;
// }

// export default function DownloadGroupPage() {
//     const pathname = usePathname();
//     const groupId = pathname.split('/').pop();

//     const [files, setFiles] = useState<FileMetadata[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>();
    
//     const [isZipping, setIsZipping] = useState(false);
//     const [zipProgress, setZipProgress] = useState<ZipProgressState>({
//         totalFiles: 0, completedFiles: 0, currentFileName: '', overallPercentage: 0, currentFilePercentage: 0
//     });
//     const [abortController, setAbortController] = useState<AbortController | null>(null);

//     // --- FIX: Get the backend URL directly from environment variables ---
//     const backendApiUrl = process.env.NEXT_PUBLIC_API_URL;

//     useEffect(() => {
//         if (!groupId) {
//             setError("Group ID is missing.");
//             setIsLoading(false);
//             return;
//         }
//         // Use the local API proxy for metadata, as it's a fast request and avoids CORS issues if any.
//         const fetchGroupMetadata = async () => {
//             setIsLoading(true);
//             try {
//                 const res = await fetch(`/api/files/group-meta/${groupId}`); // This can still use the proxy
//                 if (!res.ok) {
//                     const errorData = await res.json().catch(() => ({ message: "File group not found or has expired." }));
//                     throw new Error(errorData.message);
//                 }
//                 const data: FileMetadata[] = await res.json();
//                 if (data.length === 0) {
//                     throw new Error("This link is valid, but contains no files.");
//                 }
//                 setFiles(data);
//             } catch (err) {
//                 const error = err as Error;
//                 setError(error.message);
//             } finally {
//                 setIsLoading(false);
//             }
//         };
//         fetchGroupMetadata();
//     }, [groupId]);

//     const handleDownload = (file: FileMetadata) => {
//         // --- FIX: Point the download directly to the EC2 backend ---
//         if (!backendApiUrl) { 
//             toast.error("Backend API URL is not configured. Cannot start download."); 
//             return; 
//         }
//         try {
//             toast.info(`Your download for ${file.originalName} has started.`);
            
//             // Construct the URL to point DIRECTLY to the EC2 backend API
//             const downloadUrl = `${backendApiUrl}/files/download/${file.uniqueId}`;
            
//             // We use a link to initiate the download, as this is the standard browser behavior
//             const link = document.createElement('a');
//             link.href = downloadUrl;
//             // The 'download' attribute is a hint, but the Content-Disposition header from the server is what matters
//             link.setAttribute('download', file.originalName); 
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
            
//         } catch (err) {
//             const error = err as Error;
//             toast.error(`Failed to start download for ${file.originalName}`, { description: error.message });
//         }
//     };
    
//     const handleCancelZip = () => {
//         if (abortController) {
//             abortController.abort();
//             toast.warning("Download All operation has been cancelled.");
//         }
//         setIsZipping(false);
//     };

//     const handleDownloadAllAsZip = async () => {
//         if (files.length === 0 || isZipping || !backendApiUrl) return;

//         setIsZipping(true);
//         const controller = new AbortController();
//         setAbortController(controller);

//         const zip = new Zip();
//         const zipFileName = `${files[0].originalName.split('.')[0] || 'archive'}.zip`;
        
//         const zipChunks: Uint8Array[] = [];
//         zip.ondata = (err, data, final) => {
//             if (err) {
//                 setIsZipping(false);
//                 toast.error("Error during zipping", { description: err.message });
//                 throw err;
//             }
//             zipChunks.push(data);
//             if (final) {
//                 const zipBlob = new Blob(zipChunks, { type: 'application/zip' });
//                 saveAs(zipBlob, zipFileName);
//                 setIsZipping(false);
//                 toast.success("ZIP file created successfully!");
//             }
//         };

//         toast.info("Starting download and zip process...");

//         try {
//             for (let i = 0; i < files.length; i++) {
//                 const file = files[i];
                
//                 setZipProgress({
//                     totalFiles: files.length,
//                     completedFiles: i,
//                     currentFileName: file.originalName,
//                     overallPercentage: Math.round((i / files.length) * 100),
//                     currentFilePercentage: 0,
//                 });

//                 // --- FIX: Point the download for zipping directly to the EC2 backend ---
//                 const downloadUrl = `${backendApiUrl}/files/download/${file.uniqueId}`;
//                 const response = await fetch(downloadUrl, { signal: controller.signal });

//                 if (!response.ok || !response.body) {
//                     throw new Error(`Failed to start download for ${file.originalName}`);
//                 }
                
//                 const fileStream = new ZipPassThrough(file.originalName);
//                 fileStream.mtime = new Date();
//                 zip.add(fileStream);

//                 const reader = response.body.getReader();
//                 let downloadedBytes = 0;
                
//                 while (true) {
//                     const { done, value } = await reader.read();
//                     if (done) break;
                    
//                     fileStream.push(value);
//                     downloadedBytes += value.length;

//                     setZipProgress(currentProgress => ({
//                         ...currentProgress,
//                         currentFilePercentage: (downloadedBytes / file.size) * 100,
//                     }));
//                 }
                
//                 fileStream.push(new Uint8Array(0), true);
//             }
            
//             setZipProgress(currentProgress => ({ ...currentProgress, completedFiles: files.length, overallPercentage: 100, currentFilePercentage: 100 }));
//             zip.end();

//         } catch (err) {
//             if ((err as Error).name !== 'AbortError') {
//                 toast.error("Download failed", { description: (err as Error).message });
//             }
//             setIsZipping(false);
//         }
//     };

//     // The rest of the JSX rendering remains the same, as it calls these updated handlers.
//     return (
//         <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
//             <Card className="w-full max-w-lg">
//                 {error ? (
//                      <CardHeader>
//                         <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
//                             <AlertTriangle className="h-6 w-6 text-red-600" />
//                         </div>
//                         <CardTitle className="mt-4 text-center text-destructive">Download Unavailable</CardTitle>
//                         <CardDescription className="text-center">{error}</CardDescription>
//                     </CardHeader>
//                 ) : (
//                     <>
//                         <CardHeader>
//                             <CardTitle className="flex items-center gap-2 text-2xl"><Package size={28} /> File Batch Ready</CardTitle>
//                             {isLoading ? (<CardDescription>Fetching file details...</CardDescription>) : (
//                                 <CardDescription>This link contains {files.length} file(s) with a total size of {formatBytes(files.reduce((acc, file) => acc + file.size, 0))}.</CardDescription>
//                             )}
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                             {isLoading ? (
//                                 <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
//                             ) : (
//                                 <>
//                                     <div className="space-y-2 max-h-72 overflow-y-auto rounded-md border p-2">
//                                         {files.map(file => (
//                                             <div key={file.uniqueId} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors">
//                                                 <div className="flex items-center gap-3 overflow-hidden">
//                                                      {file.thumbnail ? (<img src={`data:image/jpeg;base64,${file.thumbnail}`} alt="preview" className="h-10 w-10 flex-shrink-0 rounded-sm object-cover bg-gray-200" />) : (
//                                                         <div className="h-10 w-10 flex-shrink-0 rounded-sm bg-gray-100 flex items-center justify-center"><FileIcon className="h-5 w-5 text-gray-500" /></div>
//                                                      )}
//                                                     <div className='overflow-hidden'>
//                                                         <p className="font-medium text-sm truncate" title={file.originalName}>{file.originalName}</p>
//                                                         <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
//                                                     </div>
//                                                 </div>
//                                                 <Button size="sm" variant="ghost" onClick={() => handleDownload(file)} disabled={isZipping}><Download className="h-4 w-4" /></Button>
//                                             </div>
//                                         ))}
//                                     </div>
                                    
//                                     {files.length > 1 && (
//                                         <>
//                                             {isZipping ? (
//                                                 <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
//                                                     <div className="flex justify-between items-center">
//                                                         <p className="font-semibold text-sm">Processing Files...</p>
//                                                         <Button variant="ghost" size="sm" onClick={handleCancelZip}><XCircle className="h-4 w-4 mr-2" />Cancel</Button>
//                                                     </div>
//                                                     <div className='space-y-1'>
//                                                         <p className='text-xs font-medium text-muted-foreground'>Overall Progress ({zipProgress.completedFiles} / {zipProgress.totalFiles})</p>
//                                                         <Progress value={zipProgress.overallPercentage} />
//                                                     </div>
//                                                     <div className='space-y-1'>
//                                                         <p className="text-xs font-medium text-muted-foreground truncate" title={zipProgress.currentFileName}>Current: {zipProgress.currentFileName}</p>
//                                                         <Progress value={zipProgress.currentFilePercentage} className="h-1.5" />
//                                                     </div>
//                                                 </div>
//                                             ) : (
//                                                 <Button className="w-full h-12 text-md" onClick={handleDownloadAllAsZip}><Package className="mr-2 h-5 w-5" />Download All as .ZIP</Button>
//                                             )}
//                                         </>
//                                     )}
//                                 </>
//                             )}
//                         </CardContent>
//                     </>
//                 )}
//             </Card>
//         </div>
//     );
// }

// "use client";

// import { useEffect, useState } from 'react';
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { formatBytes } from "@/utils/format";
// import { Download, File as FileIcon, Loader2, Package, AlertTriangle } from "lucide-react";
// import { toast } from "sonner";
// import { usePathname } from 'next/navigation';

// interface FileMetadata {
//     originalName: string;
//     size: number;
//     uniqueId: string;
//     thumbnail: string | null;
// }

// export default function DownloadGroupPage() {
//     const pathname = usePathname();
//     const groupId = pathname.split('/').pop();

//     const [files, setFiles] = useState<FileMetadata[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>();

//     const backendApiUrl = process.env.NEXT_PUBLIC_API_URL;

//     useEffect(() => {
//         if (!groupId) {
//             setError("Group ID is missing.");
//             setIsLoading(false);
//             return;
//         }

//         const fetchGroupMetadata = async () => {
//             setIsLoading(true);
//             try {
//                 // Use the local API proxy to get file metadata
//                 const res = await fetch(`/api/files/group-meta/${groupId}`);
//                 if (!res.ok) {
//                     const errorData = await res.json().catch(() => ({ message: "File group not found or has expired." }));
//                     throw new Error(errorData.message);
//                 }
//                 const data: FileMetadata[] = await res.json();
//                 if (data.length === 0) {
//                     throw new Error("This link is valid, but contains no files.");
//                 }
//                 setFiles(data);
//             } catch (err) {
//                 const error = err as Error;
//                 setError(error.message);
//             } finally {
//                 setIsLoading(false);
//             }
//         };
//         fetchGroupMetadata();
//     }, [groupId]);

//     const handleDownload = (file: FileMetadata) => {
//         if (!backendApiUrl) {
//             toast.error("Backend API URL is not configured. Cannot start download.");
//             return;
//         }
//         try {
//             toast.info(`Your download for ${file.originalName} has started.`);

//             // This URL points to our server, which will REDIRECT to the Cloudflare Worker.
//             // The browser handles this redirect automatically.
//             const downloadUrl = `${backendApiUrl}/files/download/${file.uniqueId}`;

//             const link = document.createElement('a');
//             link.href = downloadUrl;
//             // The 'download' attribute is a hint, but the server's Content-Disposition header is what matters.
//             link.setAttribute('download', file.originalName);
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);

//         } catch (err) {
//             const error = err as Error;
//             toast.error(`Failed to start download for ${file.originalName}`, { description: error.message });
//         }
//     };

//     const handleDownloadAll = () => {
//         if (files.length === 0) return;
//         toast.info(`Starting download for ${files.length} files. Your browser may ask for permission for multiple downloads.`);
        
//         files.forEach((file, index) => {
//             // Stagger the downloads slightly to prevent the browser from blocking them as popups
//             setTimeout(() => {
//                 handleDownload(file);
//             }, index * 400); // 400ms delay between each download
//         });
//     };

//     return (
//         <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
//             <Card className="w-full max-w-lg">
//                 {error ? (
//                     <CardHeader>
//                         <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
//                             <AlertTriangle className="h-6 w-6 text-red-600" />
//                         </div>
//                         <CardTitle className="mt-4 text-center text-destructive">Download Unavailable</CardTitle>
//                         <CardDescription className="text-center">{error}</CardDescription>
//                     </CardHeader>
//                 ) : (
//                     <>
//                         <CardHeader>
//                             <CardTitle className="flex items-center gap-2 text-2xl"><Package size={28} /> File Batch Ready</CardTitle>
//                             {isLoading ? (<CardDescription>Fetching file details...</CardDescription>) : (
//                                 <CardDescription>This link contains {files.length} file(s) with a total size of {formatBytes(files.reduce((acc, file) => acc + file.size, 0))}.</CardDescription>
//                             )}
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                             {isLoading ? (
//                                 <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
//                             ) : (
//                                 <>
//                                     <div className="space-y-2 max-h-72 overflow-y-auto rounded-md border p-2">
//                                         {files.map(file => (
//                                             <div key={file.uniqueId} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors">
//                                                 <div className="flex items-center gap-3 overflow-hidden">
//                                                     {file.thumbnail ? (<img src={`data:image/jpeg;base64,${file.thumbnail}`} alt="preview" className="h-10 w-10 flex-shrink-0 rounded-sm object-cover bg-gray-200" />) : (
//                                                         <div className="h-10 w-10 flex-shrink-0 rounded-sm bg-gray-100 flex items-center justify-center"><FileIcon className="h-5 w-5 text-gray-500" /></div>
//                                                     )}
//                                                     <div className='overflow-hidden'>
//                                                         <p className="font-medium text-sm truncate" title={file.originalName}>{file.originalName}</p>
//                                                         <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
//                                                     </div>
//                                                 </div>
//                                                 <Button size="sm" variant="ghost" onClick={() => handleDownload(file)}><Download className="h-4 w-4" /></Button>
//                                             </div>
//                                         ))}
//                                     </div>
                                    
//                                     {files.length > 1 && (
//                                         <Button className="w-full h-12 text-md" onClick={handleDownloadAll}>
//                                             <Download className="mr-2 h-5 w-5" />
//                                             Download All Files
//                                         </Button>
//                                     )}
//                                 </>
//                             )}
//                         </CardContent>
//                     </>
//                 )}
//             </Card>
//         </div>
//     );
// }

// "use client";
// import { useEffect, useState } from 'react';
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { formatBytes } from "@/utils/format";
// import { Download, File as FileIcon, Loader2, Package, AlertTriangle, Hourglass } from "lucide-react";
// import { toast } from "sonner";
// import { usePathname } from 'next/navigation';
// import { saveAs } from 'file-saver';

// interface FileMetadata { originalName: string; size: number; uniqueId: string; thumbnail: string | null }

// export default function DownloadGroupPage() {
//     const pathname = usePathname();
//     const groupId = pathname.split('/').pop();
//     const [files, setFiles] = useState<FileMetadata[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>();
//     const [isDownloading, setIsDownloading] = useState<string | null>(null);
//     const backendApiUrl = process.env.NEXT_PUBLIC_API_URL;

//     useEffect(() => {
//         if (!groupId) { setError("Group ID is missing."); setIsLoading(false); return; }
//         const fetchGroupMetadata = async () => {
//             setIsLoading(true);
//             try {
//                 const res = await fetch(`/api/files/group-meta/${groupId}`);
//                 if (!res.ok) { const errorData = await res.json().catch(() => ({ message: "File group not found or has expired." })); throw new Error(errorData.message); }
//                 const data: FileMetadata[] = await res.json();
//                 if (data.length === 0) throw new Error("This link is valid, but contains no files.");
//                 setFiles(data);
//             } catch (err) { setError((err as Error).message); }
//             finally { setIsLoading(false); }
//         };
//         fetchGroupMetadata();
//     }, [groupId]);

//     const handleDownload = async (file: FileMetadata) => {
//         if (!backendApiUrl) { toast.error("Backend API URL is not configured."); return; }
//         setIsDownloading(file.uniqueId);
//         const downloadToast = toast.loading(`Preparing download for ${file.originalName}...`);
//         try {
//             const downloadUrl = `${backendApiUrl}/files/download/${file.uniqueId}`;
//             const response = await fetch(downloadUrl);
//             if (response.ok) {
//                 toast.success(`Download starting for ${file.originalName}`, { id: downloadToast });
//                 const blob = await response.blob();
//                 saveAs(blob, file.originalName);
//             } else {
//                 const errorData = await response.json();
//                 toast.error(errorData.message || 'Could not start download.', { id: downloadToast });
//             }
//         } catch (err) { toast.error('An unexpected error occurred.', { id: downloadToast, description: (err as Error).message }); }
//         finally { setIsDownloading(null); }
//     };

//     return (
//         <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
//             <Card className="w-full max-w-lg">
//                 {error ? (
//                     <CardHeader><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100"><AlertTriangle className="h-6 w-6 text-red-600" /></div><CardTitle className="mt-4 text-center text-destructive">Download Unavailable</CardTitle><CardDescription className="text-center">{error}</CardDescription></CardHeader>
//                 ) : (
//                     <>
//                         <CardHeader><CardTitle className="flex items-center gap-2 text-2xl"><Package size={28} /> File Batch Ready</CardTitle>{isLoading ? (<CardDescription>Fetching file details...</CardDescription>) : (<CardDescription>This link contains {files.length} file(s) with a total size of {formatBytes(files.reduce((acc, f) => acc + f.size, 0))}.</CardDescription>)}</CardHeader>
//                         <CardContent>{isLoading ? (<div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>) : (<div className="space-y-2 max-h-72 overflow-y-auto rounded-md border p-2">{files.map(file => (<div key={file.uniqueId} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md"><div className="flex items-center gap-3 overflow-hidden"><div className="h-10 w-10 flex-shrink-0 rounded-sm bg-gray-100 flex items-center justify-center"><FileIcon className="h-5 w-5 text-gray-500" /></div><div className='overflow-hidden'><p className="font-medium text-sm truncate" title={file.originalName}>{file.originalName}</p><p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p></div></div><Button size="sm" variant="ghost" onClick={() => handleDownload(file)} disabled={!!isDownloading}>{isDownloading === file.uniqueId ? <Hourglass className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}</Button></div>))}</div>)}</CardContent>
//                     </>
//                 )}
//             </Card>
//         </div>
//     );
// }


// "use client";

// import { useEffect, useState } from 'react';
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { formatBytes } from "@/utils/format";
// import { Download, File as FileIcon, Loader2, Package, AlertTriangle, Hourglass } from "lucide-react";
// import { toast } from "sonner";
// import { usePathname } from 'next/navigation';
// import { saveAs } from 'file-saver';

// interface FileMetadata {
//     originalName: string;
//     size: number;
//     uniqueId: string;
//     thumbnail: string | null;
// }

// export default function DownloadGroupPage() {
//     const pathname = usePathname();
//     const groupId = pathname.split('/').pop();

//     const [files, setFiles] = useState<FileMetadata[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>();
//     const [isDownloading, setIsDownloading] = useState<string | null>(null); // Track which file is downloading

//     const backendApiUrl = process.env.NEXT_PUBLIC_API_URL;

//     useEffect(() => {
//         if (!groupId) {
//             setError("Group ID is missing.");
//             setIsLoading(false);
//             return;
//         }
        
//         const fetchGroupMetadata = async () => {
//             setIsLoading(true);
//             try {
//                 // Use the local API proxy to get file metadata, avoiding CORS issues.
//                 const res = await fetch(`/api/files/group-meta/${groupId}`);
//                 if (!res.ok) {
//                     const errorData = await res.json().catch(() => ({ message: "File group not found or has expired." }));
//                     throw new Error(errorData.message);
//                 }
//                 const data: FileMetadata[] = await res.json();
//                 if (data.length === 0) {
//                     throw new Error("This link is valid, but contains no files.");
//                 }
//                 setFiles(data);
//             } catch (err) {
//                 setError((err as Error).message);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchGroupMetadata();
//     }, [groupId]);

//     const handleDownload = async (file: FileMetadata) => {
//         if (!backendApiUrl) {
//             toast.error("Backend API URL is not configured.");
//             return;
//         }
        
//         setIsDownloading(file.uniqueId);
//         const downloadToast = toast.loading(`Preparing download for ${file.originalName}...`);
        
//         try {
//             // This URL points to our server, which will either stream the file
//             // directly or redirect to the high-speed Cloudflare Worker.
//             const downloadUrl = `${backendApiUrl}/files/download/${file.uniqueId}`;
            
//             // We use fetch to handle the response intelligently.
//             const response = await fetch(downloadUrl);

//             // If the response is OK, it's a file stream.
//             if (response.ok) {
//                 toast.success(`Download starting for ${file.originalName}`, { id: downloadToast });
//                 const blob = await response.blob();
//                 saveAs(blob, file.originalName);
//             } else {
//                 // If not OK, the server sent an error message (e.g., "file processing").
//                 const errorData = await response.json();
//                 toast.error(errorData.message || 'Could not start download.', { id: downloadToast });
//             }
//         } catch (err) {
//             toast.error('An unexpected error occurred.', { id: downloadToast, description: (err as Error).message });
//         } finally {
//             setIsDownloading(null);
//         }
//     };

//     return (
//         <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
//             <Card className="w-full max-w-lg">
//                 {error ? (
//                     <CardHeader>
//                         <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
//                             <AlertTriangle className="h-6 w-6 text-red-600" />
//                         </div>
//                         <CardTitle className="mt-4 text-center text-destructive">Download Unavailable</CardTitle>
//                         <CardDescription className="text-center">{error}</CardDescription>
//                     </CardHeader>
//                 ) : (
//                     <>
//                         <CardHeader>
//                             <CardTitle className="flex items-center gap-2 text-2xl"><Package size={28} /> File Batch Ready</CardTitle>
//                             {isLoading ? (
//                                 <CardDescription>Fetching file details...</CardDescription>
//                             ) : (
//                                 <CardDescription>This link contains {files.length} file(s) with a total size of {formatBytes(files.reduce((acc, f) => acc + f.size, 0))}.</CardDescription>
//                             )}
//                         </CardHeader>
//                         <CardContent>
//                             {isLoading ? (
//                                 <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
//                             ) : (
//                                 <div className="space-y-2 max-h-72 overflow-y-auto rounded-md border p-2">
//                                     {files.map(file => (
//                                         <div key={file.uniqueId} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors">
//                                             <div className="flex items-center gap-3 overflow-hidden">
//                                                 <div className="h-10 w-10 flex-shrink-0 rounded-sm bg-gray-100 flex items-center justify-center"><FileIcon className="h-5 w-5 text-gray-500" /></div>
//                                                 <div className='overflow-hidden'>
//                                                     <p className="font-medium text-sm truncate" title={file.originalName}>{file.originalName}</p>
//                                                     <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
//                                                 </div>
//                                             </div>
//                                             <Button size="sm" variant="ghost" onClick={() => handleDownload(file)} disabled={!!isDownloading}>
//                                                 {isDownloading === file.uniqueId ? <Hourglass className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
//                                             </Button>
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </CardContent>
//                     </>
//                 )}
//             </Card>
//         </div>
//     );
// }


"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBytes } from "@/utils/format";
import { Download, File as FileIcon, Loader2, Package, AlertTriangle, Hourglass, FolderDown } from "lucide-react";
import { toast } from "sonner";
import { usePathname } from 'next/navigation';
import { saveAs } from 'file-saver';

interface FileMetadata {
    originalName: string;
    size: number;
    uniqueId: string;
    thumbnail: string | null;
}

export default function DownloadGroupPage() {
    const pathname = usePathname();
    const groupId = pathname.split('/').pop();

    const [files, setFiles] = useState<FileMetadata[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>();
    const [isDownloading, setIsDownloading] = useState<string | null>(null);

    const backendApiUrl = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        if (!groupId) {
            setError("Group ID is missing.");
            setIsLoading(false);
            return;
        }
        
        const fetchGroupMetadata = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/files/group-meta/${groupId}`);
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({ message: "File group not found or has expired." }));
                    throw new Error(errorData.message);
                }
                const data: FileMetadata[] = await res.json();
                if (data.length === 0) {
                    throw new Error("This link is valid, but contains no files.");
                }
                setFiles(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGroupMetadata();
    }, [groupId]);

    const handleDownload = async (file: FileMetadata) => {
        if (!backendApiUrl) {
            toast.error("Backend API URL is not configured.");
            return;
        }
        
        setIsDownloading(file.uniqueId);
        const downloadToast = toast.loading(`Preparing download for ${file.originalName}...`);
        
        try {
            const downloadUrl = `${backendApiUrl}/files/download/${file.uniqueId}`;
            const response = await fetch(downloadUrl);

            if (response.ok) {
                toast.success(`Download starting for ${file.originalName}`, { id: downloadToast });
                const blob = await response.blob();
                saveAs(blob, file.originalName);
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Could not start download.', { id: downloadToast });
            }
        } catch (err) {
            toast.error('An unexpected error occurred.', { id: downloadToast, description: (err as Error).message });
        } finally {
            setIsDownloading(null);
        }
    };

    // ✅ New function to handle downloading all files
    const handleDownloadAll = () => {
        if (files.length === 0) return;

        toast.info(`Starting download for all ${files.length} files. Your browser may ask for permission.`);

        files.forEach((file, index) => {
            // Stagger the downloads to prevent the browser from blocking them
            setTimeout(() => {
                // We don't need to await this, just trigger it
                handleDownload(file);
            }, index * 500); // 500ms delay between each download start
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-lg">
                {error ? (
                    <CardHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <CardTitle className="mt-4 text-center text-destructive">Download Unavailable</CardTitle>
                        <CardDescription className="text-center">{error}</CardDescription>
                    </CardHeader>
                ) : (
                    <>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-2xl"><Package size={28} /> File Batch Ready</CardTitle>
                            {isLoading ? (
                                <CardDescription>Fetching file details...</CardDescription>
                            ) : (
                                <CardDescription>This link contains {files.length} file(s) with a total size of {formatBytes(files.reduce((acc, f) => acc + f.size, 0))}.</CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                            ) : (
                                <>
                                    <div className="space-y-2 max-h-60 overflow-y-auto rounded-md border p-2">
                                        {files.map(file => (
                                            <div key={file.uniqueId} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="h-10 w-10 flex-shrink-0 rounded-sm bg-gray-100 flex items-center justify-center"><FileIcon className="h-5 w-5 text-gray-500" /></div>
                                                    <div className='overflow-hidden'>
                                                        <p className="font-medium text-sm truncate" title={file.originalName}>{file.originalName}</p>
                                                        <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="ghost" onClick={() => handleDownload(file)} disabled={!!isDownloading}>
                                                    {isDownloading === file.uniqueId ? <Hourglass className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* ✅ "Download All" button */}
                                    {files.length > 1 && (
                                        <Button 
                                            className="w-full h-12 text-md" 
                                            onClick={handleDownloadAll} 
                                            disabled={!!isDownloading}
                                        >
                                            <FolderDown className="mr-2 h-5 w-5" />
                                            Download All ({files.length})
                                        </Button>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
}
