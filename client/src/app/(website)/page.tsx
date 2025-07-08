// "use client";

// import { useState } from 'react';
// import { useDropzone } from 'react-dropzone';
// import api from '@/services/api';
// import { Progress } from "@/components/ui/progress";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import { formatBytes } from '@/utils/format';

// export default function HomePage() {
//   const [file, setFile] = useState<File | null>(null);
//   const [progress, setProgress] = useState(0);
//   const [uploadedBytes, setUploadedBytes] = useState(0);
//   const [downloadLink, setDownloadLink] = useState('');
//   const [isUploading, setIsUploading] = useState(false);

//   const onDrop = (acceptedFiles: File[]) => {
//     if (acceptedFiles.length > 0) {
//       setFile(acceptedFiles[0]);
//       setDownloadLink('');
//       setProgress(0);
//       setUploadedBytes(0);
//     }
//   };

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

//   const handleUpload = async () => {
//     if (!file) return;

//     setIsUploading(true);
//     setUploadedBytes(0);
//     setProgress(0);

//     // Send the raw file with custom headers, instead of FormData
//     const promise = api.post('/files/upload', file, {
//       headers: {
//         'Content-Type': file.type,
//         // Send a custom header with the URL-encoded file name
//         'X-File-Name': encodeURIComponent(file.name),
//       },
//       onUploadProgress: (progressEvent) => {
//         const { loaded, total } = progressEvent;
//         if (total) {
//           const percentCompleted = Math.round((loaded * 100) / total);
//           setProgress(percentCompleted);
//           setUploadedBytes(loaded);
//         }
//       },
//     });

//     toast.promise(promise, {
//       loading: 'Uploading to Google Drive...',
//       success: (response) => {
//         setDownloadLink(response.data.downloadLink);
//         return 'File uploaded successfully!';
//       },
//       error: (err) => {
//         // Provide a more specific error message if possible
//         return err.response?.data?.message || 'Upload failed. Please try again.';
//       },
//       finally: () => {
//         setIsUploading(false);
//       }
//     });
//   };

//   return (
//     <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
//       <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
//         <h1 className="text-2xl font-bold text-center">File Transfer</h1>
//         <div
//           {...getRootProps()}
//           className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
//         >
//           <input {...getInputProps()} />
//           {file ? (
//             <p className="truncate">{file.name}</p>
//           ) : (
//             <p>Drag 'n' drop a file here, or click to select a file</p>
//           )}
//         </div>
        
//         {isUploading && file && (
//           <div className="w-full space-y-2 pt-2">
//             <Progress value={progress} />
//             <div className="flex justify-between text-sm text-muted-foreground">
//               <span>{progress}%</span>
//               <span>
//                 {formatBytes(uploadedBytes)} / {formatBytes(file.size)}
//               </span>
//             </div>
//             <p className="text-center text-xs text-gray-500">
//               {formatBytes(file.size - uploadedBytes)} remaining
//             </p>
//           </div>
//         )}

//         {file && !isUploading && !downloadLink && (
//           <Button onClick={handleUpload} className="w-full" disabled={isUploading}>
//             {isUploading ? 'Uploading...' : 'Upload and Get Link'}
//           </Button>
//         )}

//         {downloadLink && (
//             <div className="space-y-2">
//                 <p className="text-sm font-medium">Your download link:</p>
//                 <div className="flex items-center space-x-2">
//                     <Input value={downloadLink} readOnly />
//                     <Button onClick={() => {
//                         navigator.clipboard.writeText(downloadLink);
//                         toast.success("Link copied to clipboard!");
//                     }}>Copy</Button>
//                 </div>
//             </div>
//         )}
//       </div>
//     </main>
//   );
// }

// "use client";

// import { useState } from 'react';
// import { useDropzone } from 'react-dropzone';
// import api from '@/services/api';
// import { Progress } from "@/components/ui/progress";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import { formatBytes } from '@/utils/format';

// export default function HomePage() {
//   const [file, setFile] = useState<File | null>(null);
//   const [progress, setProgress] = useState(0);
//   const [uploadedBytes, setUploadedBytes] = useState(0);
//   const [downloadLink, setDownloadLink] = useState('');
//   const [isUploading, setIsUploading] = useState(false);

//   const onDrop = (acceptedFiles: File[]) => {
//     if (acceptedFiles.length > 0) {
//       setFile(acceptedFiles[0]);
//       setDownloadLink('');
//       setProgress(0);
//       setUploadedBytes(0);
//     }
//   };

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

//   const handleUpload = async () => {
//     if (!file) return;

//     setIsUploading(true);
//     setUploadedBytes(0);
//     setProgress(0);

//     const promise = api.post('/files/upload', file, {
//       headers: {
//         'Content-Type': file.type,
//         'X-File-Name': encodeURIComponent(file.name),
//       },
//       onUploadProgress: (progressEvent) => {
//         const { loaded, total } = progressEvent;
//         if (total) {
//           const percentCompleted = Math.round((loaded * 100) / total);
//           setProgress(percentCompleted);
//           setUploadedBytes(loaded);
//         }
//       },
//     });

//     toast.promise(promise, {
//       loading: 'Uploading to Google Drive...',
//       // ==========================================================
//       //  THE ONLY CHANGE IS HERE
//       //  We construct the full URL on the frontend.
//       // ==========================================================
//       success: (response) => {
//         // response.data.downloadLink is now "/download/some-id"
//         // window.location.origin is "http://localhost:3000" or your production domain
//         const fullUrl = `${window.location.origin}${response.data.downloadLink}`;
//         setDownloadLink(fullUrl);
//         return 'File uploaded successfully!';
//       },
//       error: (err) => {
//         return err.response?.data?.message || 'Upload failed. Please try again.';
//       },
//       finally: () => {
//         setIsUploading(false);
//       }
//     });
//   };

//   return (
//     <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
//       <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
//         <h1 className="text-2xl font-bold text-center">File Transfer</h1>
//         <div
//           {...getRootProps()}
//           className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
//         >
//           <input {...getInputProps()} />
//           {file ? (
//             <p className="truncate">{file.name}</p>
//           ) : (
//             <p>Drag 'n' drop a file here, or click to select a file</p>
//           )}
//         </div>
        
//         {isUploading && file && (
//           <div className="w-full space-y-2 pt-2">
//             <Progress value={progress} />
//             <div className="flex justify-between text-sm text-muted-foreground">
//               <span>{progress}%</span>
//               <span>
//                 {formatBytes(uploadedBytes)} / {formatBytes(file.size)}
//               </span>
//             </div>
//             <p className="text-center text-xs text-gray-500">
//               {formatBytes(file.size - uploadedBytes)} remaining
//             </p>
//           </div>
//         )}

//         {file && !isUploading && !downloadLink && (
//           <Button onClick={handleUpload} className="w-full" disabled={isUploading}>
//             {isUploading ? 'Uploading...' : 'Upload and Get Link'}
//           </Button>
//         )}

//         {downloadLink && (
//             <div className="space-y-2">
//                 <p className="text-sm font-medium">Your download link:</p>
//                 <div className="flex items-center space-x-2">
//                     <Input value={downloadLink} readOnly />
//                     <Button onClick={() => {
//                         navigator.clipboard.writeText(downloadLink);
//                         toast.success("Link copied to clipboard!");
//                     }}>Copy</Button>
//                 </div>
//             </div>
//         )}
//       </div>
//     </main>
//   );
// }


// // client/src/app/(website)/layout.tsx
// "use client";

// import { useState } from 'react';
// import { useDropzone } from 'react-dropzone';
// import api from '@/services/api';
// import { Progress } from "@/components/ui/progress";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import { formatBytes } from '@/utils/format';
// import { UploadCloud, File as FileIcon, X, CheckCircle, AlertCircle } from 'lucide-react';
// import { Card, CardContent } from '@/components/ui/card';

// // 1. Define a new type to track each file's individual status
// type UploadableFile = {
//   file: File;
//   status: 'pending' | 'uploading' | 'success' | 'error';
//   progress: number;
//   link?: string;
//   error?: string;
// }

// export default function HomePage() {
//   // 2. State now holds an array of files, not just one
//   const [files, setFiles] = useState<UploadableFile[]>([]);
//   const [isUploading, setIsUploading] = useState(false);

//   // onDrop now accepts multiple files and maps them to our new type
//   const onDrop = (acceptedFiles: File[]) => {
//     const newUploadableFiles = acceptedFiles.map(file => ({
//       file,
//       status: 'pending' as 'pending',
//       progress: 0,
//     }));
//     setFiles(prevFiles => [...prevFiles, ...newUploadableFiles]);
//   };

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

//   // Function to remove a file from the list before uploading
//   const removeFile = (fileName: string) => {
//     setFiles(prevFiles => prevFiles.filter(f => f.file.name !== fileName));
//   }

//   // 3. The main upload handler now iterates through the files
//   const handleUpload = async () => {
//     if (files.length === 0) return;

//     setIsUploading(true);

//     // We will upload files one by one for stability.
//     for (const uploadableFile of files) {
//       // Skip files that are not pending
//       if (uploadableFile.status !== 'pending') continue;
      
//       try {
//         // Update the specific file's status to 'uploading'
//         setFiles(prev => prev.map(f => f.file.name === uploadableFile.file.name ? { ...f, status: 'uploading' } : f));
        
//         const response = await api.post('/files/upload', uploadableFile.file, {
//           headers: {
//             'Content-Type': uploadableFile.file.type,
//             'X-File-Name': encodeURIComponent(uploadableFile.file.name),
//           },
//           onUploadProgress: (progressEvent) => {
//             const { loaded, total } = progressEvent;
//             if (total) {
//               const percentCompleted = Math.round((loaded * 100) / total);
//               // Update progress for the specific file being uploaded
//               setFiles(prev => prev.map(f => 
//                 f.file.name === uploadableFile.file.name 
//                 ? { ...f, progress: percentCompleted } 
//                 : f
//               ));
//             }
//           },
//         });
        
//         const fullUrl = `${window.location.origin}${response.data.downloadLink}`;
        
//         // Update the file's status to 'success' and store its link
//         setFiles(prev => prev.map(f => 
//           f.file.name === uploadableFile.file.name 
//           ? { ...f, status: 'success', link: fullUrl } 
//           : f
//         ));
//         toast.success(`Successfully uploaded: ${uploadableFile.file.name}`);

//       } catch (err: any) {
//         const errorMessage = err.response?.data?.message || 'Upload failed.';
//         // Update the file's status to 'error' and store the error message
//         setFiles(prev => prev.map(f => 
//           f.file.name === uploadableFile.file.name 
//           ? { ...f, status: 'error', error: errorMessage } 
//           : f
//         ));
//         toast.error(`Failed to upload ${uploadableFile.file.name}: ${errorMessage}`);
//       }
//     }
    
//     setIsUploading(false);
//   };

//   const copyLink = (link: string) => {
//     navigator.clipboard.writeText(link);
//     toast.success("Link copied to clipboard!");
//   }

//   return (
//     <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-12 md:p-24 bg-gray-50">
//       <Card className="w-full max-w-lg p-6 sm:p-8">
//         <CardContent className="p-0">
//           <h1 className="text-2xl font-bold text-center mb-4">File Transfer</h1>
//           <div
//             {...getRootProps()}
//             className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
//           >
//             <input {...getInputProps()} />
//             <UploadCloud className="h-12 w-12 text-gray-400 mb-2" />
//             <p className="font-semibold">Drag & drop files here, or click to select</p>
//             <p className="text-sm text-gray-500">Max 15GB per file</p>
//           </div>
          
//           {/* 4. New UI to display the list of files */}
//           {files.length > 0 && (
//             <div className="mt-6 space-y-3">
//               <h2 className="font-semibold">Ready to Upload</h2>
//               {files.map((uploadableFile, index) => (
//                 <div key={index} className="border rounded-md p-3 flex items-center space-x-3">
//                   <FileIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />
//                   <div className="flex-grow overflow-hidden">
//                     <p className="text-sm font-medium truncate" title={uploadableFile.file.name}>
//                       {uploadableFile.file.name}
//                     </p>
//                     <p className="text-xs text-gray-500">{formatBytes(uploadableFile.file.size)}</p>
//                     {uploadableFile.status === 'uploading' && <Progress value={uploadableFile.progress} className="h-1.5 mt-1" />}
//                     {uploadableFile.status === 'success' && <p className="text-xs text-green-600 flex items-center gap-1 mt-1"><CheckCircle size={14}/> Uploaded successfully!</p>}
//                     {uploadableFile.status === 'error' && <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle size={14}/> {uploadableFile.error}</p>}
//                   </div>
//                   {uploadableFile.status === 'success' && uploadableFile.link ? (
//                      <Button size="sm" variant="outline" onClick={() => copyLink(uploadableFile.link!)}>Copy</Button>
//                   ) : (
//                     <Button variant="ghost" size="icon" onClick={() => removeFile(uploadableFile.file.name)} disabled={isUploading}>
//                       <X className="h-4 w-4" />
//                     </Button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}

//           {files.length > 0 && (
//             <Button onClick={handleUpload} className="w-full mt-6" disabled={isUploading}>
//               {isUploading ? 'Uploading...' : `Upload ${files.length} File(s)`}
//             </Button>
//           )}
//         </CardContent>
//       </Card>
//     </main>
//   );
// }

// "use client";

// import { useState } from 'react';
// import { useDropzone } from 'react-dropzone';
// import api from '@/services/api';
// import { Progress } from "@/components/ui/progress";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import { formatBytes } from '@/utils/format';
// import { UploadCloud, File as FileIcon, X, CheckCircle, AlertCircle, Copy } from 'lucide-react';
// import { Card, CardContent } from '@/components/ui/card';
// import { v4 as uuidv4 } from 'uuid'; // Import uuid

// type UploadableFile = {
//   file: File;
//   status: 'pending' | 'uploading' | 'success' | 'error';
//   progress: number;
//   error?: string;
// }

// export default function HomePage() {
//   const [files, setFiles] = useState<UploadableFile[]>([]);
//   const [isUploading, setIsUploading] = useState(false);
//   const [finalLink, setFinalLink] = useState<string | null>(null);

//   const onDrop = (acceptedFiles: File[]) => {
//     const newUploadableFiles = acceptedFiles.map(file => ({
//       file,
//       status: 'pending' as 'pending',
//       progress: 0,
//     }));
//     setFiles(prevFiles => [...prevFiles, ...newUploadableFiles]);
//     setFinalLink(null);
//   };

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

//   const removeFile = (fileName: string) => {
//     setFiles(prevFiles => prevFiles.filter(f => f.file.name !== fileName));
//   }

//   const handleUpload = async () => {
//     const pendingFiles = files.filter(f => f.status === 'pending');
//     if (pendingFiles.length === 0) return;

//     setIsUploading(true);
//     setFinalLink(null);
    
//     // Generate a single groupId for this entire batch
//     const groupId = uuidv4().split('-')[0];
//     const groupTotal = files.length; // Total files in the batch

//     for (const uploadableFile of files) {
//       if (uploadableFile.status !== 'pending') continue;

//       try {
//         setFiles(prev => prev.map(f => f.file.name === uploadableFile.file.name ? { ...f, status: 'uploading' } : f));

//         const headers = {
//           'Content-Type': uploadableFile.file.type,
//           'X-File-Name': encodeURIComponent(uploadableFile.file.name),
//           'X-Group-Id': groupId, // Send the same groupId for all files
//           'X-Group-Total': groupTotal.toString(), // Send the total count
//         };

//         await api.post('/files/upload', uploadableFile.file, {
//           headers,
//           onUploadProgress: (progressEvent) => {
//             const { loaded, total } = progressEvent;
//             if (total) {
//               const percentCompleted = Math.round((loaded * 100) / total);
//               setFiles(prev => prev.map(f =>
//                 f.file.name === uploadableFile.file.name ? { ...f, progress: percentCompleted } : f
//               ));
//             }
//           },
//         });

//         setFiles(prev => prev.map(f =>
//           f.file.name === uploadableFile.file.name ? { ...f, status: 'success' } : f
//         ));
//       } catch (err: any) {
//         const errorMessage = err.response?.data?.message || 'Upload failed.';
//         setFiles(prev => prev.map(f =>
//           f.file.name === uploadableFile.file.name ? { ...f, status: 'error', error: errorMessage } : f
//         ));
//         toast.error(`Failed to upload ${uploadableFile.file.name}: ${errorMessage}`);
//       }
//     }

//     setIsUploading(false);

//     // After all uploads are attempted, generate the link using the groupId
//     const fullUrl = `${window.location.origin}/download/${groupId}`;
//     setFinalLink(fullUrl);
//     toast.success("Upload complete!", {
//       description: "Your shareable link is ready.",
//     });
//   };

//   const copyLink = (link: string) => {
//     navigator.clipboard.writeText(link);
//     toast.success("Link copied to clipboard!");
//   }
  
//   // You may need to install uuid: npm install uuid && npm install @types/uuid -D
//   // If you don't want to add a dependency, use a simpler unique string generator.

//   const allDone = files.length > 0 && files.every(f => f.status === 'success' || f.status === 'error');

//   return (
//     // ... JSX remains the same ...
//     <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-12 md:p-24 bg-gray-50">
//       <Card className="w-full max-w-lg p-6 sm:p-8">
//         <CardContent className="p-0">
//           <h1 className="text-2xl font-bold text-center mb-4">File Transfer</h1>
//           <div
//             {...getRootProps()}
//             className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
//           >
//             <input {...getInputProps()} />
//             <UploadCloud className="h-12 w-12 text-gray-400 mb-2" />
//             <p className="font-semibold">Drag & drop files here, or click to select</p>
//             <p className="text-sm text-gray-500">Upload multiple files to create a single share link</p>
//           </div>

//           {files.length > 0 && (
//             <div className="mt-6 space-y-3">
//               <h2 className="font-semibold">Files to Upload</h2>
//               {files.map((uploadableFile, index) => (
//                 <div key={index} className="border rounded-md p-3 flex items-center space-x-3">
//                   <FileIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />
//                   <div className="flex-grow overflow-hidden">
//                     <p className="text-sm font-medium truncate" title={uploadableFile.file.name}>
//                       {uploadableFile.file.name}
//                     </p>
//                     <p className="text-xs text-gray-500">{formatBytes(uploadableFile.file.size)}</p>
//                     {uploadableFile.status === 'uploading' && <Progress value={uploadableFile.progress} className="h-1.5 mt-1" />}
//                     {uploadableFile.status === 'success' && <p className="text-xs text-green-600 flex items-center gap-1 mt-1"><CheckCircle size={14} /> Uploaded!</p>}
//                     {uploadableFile.status === 'error' && <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle size={14} /> {uploadableFile.error}</p>}
//                   </div>
//                   <Button variant="ghost" size="icon" onClick={() => removeFile(uploadableFile.file.name)} disabled={isUploading || allDone}>
//                     <X className="h-4 w-4" />
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           )}

//           {finalLink ? (
//             <div className="mt-6">
//                 <div className="flex items-center space-x-2">
//                     <input value={finalLink} readOnly className="flex-1 p-2 border rounded-md"/>
//                     <Button onClick={() => copyLink(finalLink)}><Copy className="h-4 w-4 mr-2"/>Copy</Button>
//                 </div>
//             </div>
//           ) : files.length > 0 && (
//             <Button onClick={handleUpload} className="w-full mt-6" disabled={isUploading || allDone}>
//               {isUploading ? 'Uploading...' : `Upload ${files.filter(f => f.status === 'pending').length} File(s)`}
//             </Button>
//           )}
//         </CardContent>
//       </Card>
//     </main>
//   );
// }



// // client/src/app/(website)/page.tsx
// "use client";

// import { useState } from 'react';
// import { useDropzone } from 'react-dropzone';
// import api from '@/services/api';
// import { Progress } from "@/components/ui/progress";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import { formatBytes } from '@/utils/format';
// import { UploadCloud, File as FileIcon, X, CheckCircle, AlertCircle, Copy } from 'lucide-react';
// import { Card, CardContent } from '@/components/ui/card';
// import { v4 as uuidv4 } from 'uuid';

// type UploadableFile = {
//   file: File;
//   status: 'pending' | 'uploading' | 'success' | 'error';
//   progress: number;
//   error?: string;
// }

// export default function HomePage() {
//   const [files, setFiles] = useState<UploadableFile[]>([]);
//   const [isUploading, setIsUploading] = useState(false);
//   const [finalLink, setFinalLink] = useState<string | null>(null);

//   const onDrop = (acceptedFiles: File[]) => {
//     const newUploadableFiles = acceptedFiles.map(file => ({
//       file,
//       // FIX: Use 'as const' on the value, not the type. ESLint prefers this.
//       status: 'pending' as const, 
//       progress: 0,
//     }));
//     setFiles(prevFiles => [...prevFiles, ...newUploadableFiles]);
//     setFinalLink(null);
//   };

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

//   const removeFile = (fileName: string) => {
//     setFiles(prevFiles => prevFiles.filter(f => f.file.name !== fileName));
//   }

//   const handleUpload = async () => {
//     const pendingFiles = files.filter(f => f.status === 'pending');
//     if (pendingFiles.length === 0) return;

//     setIsUploading(true);
//     setFinalLink(null);
//     const groupId = uuidv4().split('-')[0];
//     const groupTotal = files.length;

//     for (const uploadableFile of files) {
//       if (uploadableFile.status !== 'pending') continue;

//       try {
//         setFiles(prev => prev.map(f => f.file.name === uploadableFile.file.name ? { ...f, status: 'uploading' } : f));

//         const headers = {
//           'Content-Type': uploadableFile.file.type,
//           'X-File-Name': encodeURIComponent(uploadableFile.file.name),
//           'X-Group-Id': groupId,
//           'X-Group-Total': groupTotal.toString(),
//         };

//         await api.post('/files/upload', uploadableFile.file, {
//           headers,
//           onUploadProgress: (progressEvent) => {
//             const { loaded, total } = progressEvent;
//             if (total) {
//               const percentCompleted = Math.round((loaded * 100) / total);
//               setFiles(prev => prev.map(f =>
//                 f.file.name === uploadableFile.file.name ? { ...f, progress: percentCompleted } : f
//               ));
//             }
//           },
//         });

//         setFiles(prev => prev.map(f =>
//           f.file.name === uploadableFile.file.name ? { ...f, status: 'success' } : f
//         ));
//       } catch (err) { // FIX: Type the error object properly
//         const error = err as { response?: { data?: { message?: string } } };
//         const errorMessage = error.response?.data?.message || 'Upload failed.';
//         setFiles(prev => prev.map(f =>
//           f.file.name === uploadableFile.file.name
//           ? { ...f, status: 'error', error: errorMessage }
//           : f
//         ));
//         toast.error(`Failed to upload ${uploadableFile.file.name}: ${errorMessage}`);
//       }
//     }

//     setIsUploading(false);
//     const fullUrl = `${window.location.origin}/download/${groupId}`;
//     setFinalLink(fullUrl);
//     toast.success("Upload complete!", {
//       description: "Your shareable link is ready.",
//     });
//   };

//   const copyLink = (link: string) => {
//     navigator.clipboard.writeText(link);
//     toast.success("Link copied to clipboard!");
//   }
  
//   const allDone = files.length > 0 && files.every(f => f.status === 'success' || f.status === 'error');

//   return (
//     // ... JSX remains the same ...
//     <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-12 md:p-24 bg-gray-50">
//       <Card className="w-full max-w-lg p-6 sm:p-8">
//         <CardContent className="p-0">
//           <h1 className="text-2xl font-bold text-center mb-4">File Transfer</h1>
//           <div
//             {...getRootProps()}
//             className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
//           >
//             <input {...getInputProps()} />
//             <UploadCloud className="h-12 w-12 text-gray-400 mb-2" />
//             <p className="font-semibold">Drag & drop files here, or click to select</p>
//             <p className="text-sm text-gray-500">Upload multiple files to create a single share link</p>
//           </div>

//           {files.length > 0 && (
//             <div className="mt-6 space-y-3">
//               <h2 className="font-semibold">Files to Upload</h2>
//               {files.map((uploadableFile, index) => (
//                 <div key={index} className="border rounded-md p-3 flex items-center space-x-3">
//                   <FileIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />
//                   <div className="flex-grow overflow-hidden">
//                     <p className="text-sm font-medium truncate" title={uploadableFile.file.name}>
//                       {uploadableFile.file.name}
//                     </p>
//                     <p className="text-xs text-gray-500">{formatBytes(uploadableFile.file.size)}</p>
//                     {uploadableFile.status === 'uploading' && <Progress value={uploadableFile.progress} className="h-1.5 mt-1" />}
//                     {uploadableFile.status === 'success' && <p className="text-xs text-green-600 flex items-center gap-1 mt-1"><CheckCircle size={14} /> Uploaded!</p>}
//                     {uploadableFile.status === 'error' && <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle size={14} /> {uploadableFile.error}</p>}
//                   </div>
//                   <Button variant="ghost" size="icon" onClick={() => removeFile(uploadableFile.file.name)} disabled={isUploading || allDone}>
//                     <X className="h-4 w-4" />
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           )}

//           {finalLink ? (
//             <div className="mt-6">
//                 <div className="flex items-center space-x-2">
//                     <input value={finalLink} readOnly className="flex-1 p-2 border rounded-md"/>
//                     <Button onClick={() => copyLink(finalLink)}><Copy className="h-4 w-4 mr-2"/>Copy</Button>
//                 </div>
//             </div>
//           ) : files.length > 0 && (
//             <Button onClick={handleUpload} className="w-full mt-6" disabled={isUploading || allDone}>
//               {isUploading ? 'Uploading...' : `Upload ${files.filter(f => f.status === 'pending').length} File(s)`}
//             </Button>
//           )}
//         </CardContent>
//       </Card>
//     </main>
//   );
// }

// // client/src/app/(website)/page.tsx
// "use client";

// import { useState } from 'react';
// import { useDropzone } from 'react-dropzone';
// import api from '@/services/api';
// import { Progress } from "@/components/ui/progress";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import { formatBytes } from '@/utils/format';
// import { UploadCloud, File as FileIcon, X, CheckCircle, AlertCircle, Copy } from 'lucide-react';
// import { Card, CardContent } from '@/components/ui/card';
// import { v4 as uuidv4 } from 'uuid';

// type UploadableFile = {
//   file: File;
//   status: 'pending' | 'uploading' | 'success' | 'error';
//   progress: number;
//   error?: string;
// }

// export default function HomePage() {
//   const [files, setFiles] = useState<UploadableFile[]>([]);
//   const [isUploading, setIsUploading] = useState(false);
//   const [finalLink, setFinalLink] = useState<string | null>(null);

//   const onDrop = (acceptedFiles: File[]) => {
//     const newUploadableFiles = acceptedFiles.map(file => ({
//       file,
//       status: 'pending' as const,
//       progress: 0,
//     }));
//     setFiles(prevFiles => [...prevFiles, ...newUploadableFiles]);
//     setFinalLink(null);
//   };

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

//   const removeFile = (fileName: string) => {
//     setFiles(prevFiles => prevFiles.filter(f => f.file.name !== fileName));
//   }

//   // --- REWRITTEN UPLOAD HANDLER ---
//   const handleUpload = async () => {
//     const pendingFiles = files.filter(f => f.status === 'pending');
//     if (pendingFiles.length === 0) return;

//     setIsUploading(true);
//     setFinalLink(null);
//     const groupId = uuidv4().split('-')[0];
//     const groupTotal = files.length;
//     let allSucceeded = true; // Flag to track overall success

//     for (const uploadableFile of files) {
//       if (uploadableFile.status !== 'pending') continue;

//       try {
//         setFiles(prev => prev.map(f => f.file.name === uploadableFile.file.name ? { ...f, status: 'uploading' } : f));

//         const headers = {
//           'Content-Type': uploadableFile.file.type,
//           'X-File-Name': encodeURIComponent(uploadableFile.file.name),
//           'X-Group-Id': groupId,
//           'X-Group-Total': groupTotal.toString(),
//         };

//         await api.post('/files/upload', uploadableFile.file, {
//           headers,
//           // Set a long timeout on the client-side as well
//           timeout: 120 * 60 * 1000, // 2 hours in milliseconds
//           onUploadProgress: (progressEvent) => {
//             const { loaded, total } = progressEvent;
//             if (total) {
//               const percentCompleted = Math.round((loaded * 100) / total);
//               setFiles(prev => prev.map(f =>
//                 f.file.name === uploadableFile.file.name ? { ...f, progress: percentCompleted } : f
//               ));
//             }
//           },
//         });

//         setFiles(prev => prev.map(f =>
//           f.file.name === uploadableFile.file.name ? { ...f, status: 'success' } : f
//         ));
//       } catch (err) {
//         allSucceeded = false; // Mark the batch as failed
//         const error = err as { response?: { data?: { message?: string } }, message?: string };
//         const errorMessage = error.response?.data?.message || error.message || 'Upload failed.';

//         setFiles(prev => prev.map(f =>
//           f.file.name === uploadableFile.file.name
//           ? { ...f, status: 'error', error: errorMessage }
//           : f
//         ));
//         toast.error(`Failed to upload ${uploadableFile.file.name}: ${errorMessage}`);
//         break; // Stop the upload process immediately on failure
//       }
//     }

//     setIsUploading(false);

//     // Only show success and link if ALL files succeeded
//     if (allSucceeded && files.length > 0) {
//       const fullUrl = `${window.location.origin}/download/${groupId}`;
//       setFinalLink(fullUrl);
//       toast.success("Upload complete!", {
//         description: "Your shareable link is ready.",
//       });
//     } else {
//       toast.error("Upload process finished with errors.", {
//           description: "Not all files were uploaded successfully. Please try again."
//       })
//     }
//   };

//   const copyLink = (link: string) => {
//     navigator.clipboard.writeText(link);
//     toast.success("Link copied to clipboard!");
//   }

//   const allDone = files.length > 0 && files.every(f => f.status === 'success' || f.status === 'error');

//   return (
//     // ... JSX remains the same ...
//     <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-12 md:p-24 bg-gray-50">
//       <Card className="w-full max-w-lg p-6 sm:p-8">
//         <CardContent className="p-0">
//           <h1 className="text-2xl font-bold text-center mb-4">File Transfer</h1>
//           <div
//             {...getRootProps()}
//             className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
//           >
//             <input {...getInputProps()} />
//             <UploadCloud className="h-12 w-12 text-gray-400 mb-2" />
//             <p className="font-semibold">Drag & drop files here, or click to select</p>
//             <p className="text-sm text-gray-500">Upload multiple files to create a single share link</p>
//           </div>

//           {files.length > 0 && (
//             <div className="mt-6 space-y-3">
//               <h2 className="font-semibold">Files to Upload</h2>
//               {files.map((uploadableFile, index) => (
//                 <div key={index} className="border rounded-md p-3 flex items-center space-x-3">
//                   <FileIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />
//                   <div className="flex-grow overflow-hidden">
//                     <p className="text-sm font-medium truncate" title={uploadableFile.file.name}>
//                       {uploadableFile.file.name}
//                     </p>
//                     <p className="text-xs text-gray-500">{formatBytes(uploadableFile.file.size)}</p>
//                     {uploadableFile.status === 'uploading' && <Progress value={uploadableFile.progress} className="h-1.5 mt-1" />}
//                     {uploadableFile.status === 'success' && <p className="text-xs text-green-600 flex items-center gap-1 mt-1"><CheckCircle size={14} /> Uploaded!</p>}
//                     {uploadableFile.status === 'error' && <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle size={14} /> {uploadableFile.error}</p>}
//                   </div>
//                   <Button variant="ghost" size="icon" onClick={() => removeFile(uploadableFile.file.name)} disabled={isUploading || allDone}>
//                     <X className="h-4 w-4" />
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           )}

//           {finalLink ? (
//             <div className="mt-6">
//                 <div className="flex items-center space-x-2">
//                     <input value={finalLink} readOnly className="flex-1 p-2 border rounded-md"/>
//                     <Button onClick={() => copyLink(finalLink)}><Copy className="h-4 w-4 mr-2"/>Copy</Button>
//                 </div>
//             </div>
//           ) : files.length > 0 && (
//             <Button onClick={handleUpload} className="w-full mt-6" disabled={isUploading || allDone}>
//               {isUploading ? 'Uploading...' : `Upload ${files.filter(f => f.status === 'pending').length} File(s)`}
//             </Button>
//           )}
//         </CardContent>
//       </Card>
//     </main>
//   );
// }


// // client/src/app/(website)/page.tsx
// "use client";

// import { useState } from 'react';
// import { useDropzone } from 'react-dropzone';
// import axios from 'axios';
// import api from '@/services/api';
// import { Progress } from "@/components/ui/progress";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import { formatBytes } from '@/utils/format';
// import { UploadCloud, File as FileIcon, X, CheckCircle, AlertCircle, Copy, Loader2, PartyPopper } from 'lucide-react';
// import { Card, CardContent } from '@/components/ui/card';
// import { v4 as uuidv4 } from 'uuid';

// type UploadableFile = {
//   id: string; 
//   file: File;
//   status: 'pending' | 'uploading' | 'success' | 'error';
//   progress: number;
//   error?: string;
// }

// export default function HomePage() {
//   const [files, setFiles] = useState<UploadableFile[]>([]);
//   const [isUploading, setIsUploading] = useState(false);
//   const [finalLink, setFinalLink] = useState<string | null>(null);

//   const onDrop = (acceptedFiles: File[]) => {
//     if (finalLink) handleReset();
//     const newUploadableFiles = acceptedFiles.map(file => ({
//       id: `${file.name}-${file.size}-${file.lastModified}`,
//       file, status: 'pending' as const, progress: 0,
//     }));
//     setFiles(prevFiles => [...prevFiles, ...newUploadableFiles]);
//   };

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

//   const removeFile = (id: string) => {
//     setFiles(prevFiles => prevFiles.filter(f => f.id !== id));
//   };
  
//   const handleUpload = async () => {
//     const pendingFiles = files.filter(f => f.status === 'pending');
//     if (pendingFiles.length === 0) return;

//     setIsUploading(true);
//     const groupId = uuidv4().split('-')[0];
//     const groupTotal = files.length;
//     let uploadSuccess = true;

//     const uploadPromises = pendingFiles.map(uploadableFile => {
//       return (async () => {
//         try {
//           setFiles(prev => prev.map(f => f.id === uploadableFile.id ? { ...f, status: 'uploading', progress: 5 } : f));

//           // STEP 1: Get the direct upload URL from our server.
//           const initiateResponse = await api.post('/files/initiate-upload', {
//             fileName: uploadableFile.file.name,
//             mimeType: uploadableFile.file.type || 'application/octet-stream',
//             fileSize: uploadableFile.file.size,
//           });
//           const { uploadUrl } = initiateResponse.data;
          
//           if (!uploadUrl) {
//             throw new Error("Failed to get a direct upload URL from the server.");
//           }

//           // STEP 2: Upload directly to Google's URL and get the final file ID.
//           const gDriveResponse = await axios.put(uploadUrl, uploadableFile.file, {
//             headers: { 'Content-Type': uploadableFile.file.type || 'application/octet-stream' },
//             onUploadProgress: (progressEvent) => {
//               const { loaded, total } = progressEvent;
//               if (total) {
//                 const percentCompleted = 5 + Math.round((loaded * 95) / total);
//                 setFiles(prev => prev.map(f =>
//                   f.id === uploadableFile.id ? { ...f, progress: percentCompleted } : f
//                 ));
//               }
//             },
//           });
          
//           const gDriveFileId = gDriveResponse.data?.id;
//           if (!gDriveFileId) {
//               throw new Error("Upload to Google succeeded, but did not return a file ID.");
//           }

//           // STEP 3: Confirm the successful upload with our server.
//           await api.post('/files/upload', {
//             originalName: uploadableFile.file.name,
//             size: uploadableFile.file.size,
//             gDriveFileId,
//             groupId,
//             groupTotal,
//           });

//           setFiles(prev => prev.map(f =>
//             f.id === uploadableFile.id ? { ...f, status: 'success' } : f
//           ));

//         } catch (err) {
//           uploadSuccess = false;
//           const error = err as { response?: { data?: { message?: string } }, message?: string };
//           const serverErrorMessage = error.response?.data?.message || error.message;
//           const errorMessage = serverErrorMessage || 'An unknown upload error occurred.';

//           setFiles(prev => prev.map(f =>
//             f.id === uploadableFile.id
//             ? { ...f, status: 'error', error: errorMessage }
//             : f
//           ));
//           toast.error(`Failed to upload ${uploadableFile.file.name}: ${errorMessage}`);
//         }
//       })();
//     });

//     await Promise.all(uploadPromises);
//     setIsUploading(false);

//     if (uploadSuccess) {
//       const fullUrl = `${window.location.origin}/download/${groupId}`;
//       setFinalLink(fullUrl);
//       toast.success("Upload complete!", { description: "Your shareable link is ready." });
//     } else {
//       toast.error("Upload process finished with errors.", { description: "Not all files were uploaded. Please remove failed files and try again." });
//     }
//   };

//   const copyLink = (link: string) => {
//     navigator.clipboard.writeText(link);
//     toast.success("Link copied to clipboard!");
//   };
  
//   const handleReset = () => {
//       setFiles([]);
//       setFinalLink(null);
//       setIsUploading(false);
//   }

//   const allDone = files.length > 0 && files.every(f => f.status === 'success' || f.status === 'error');

//   // The JSX for this component remains exactly the same.
//   return (
//     <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-12 md:p-24 bg-gray-50">
//         <Card className="w-full max-w-lg p-6 sm:p-8">
//             <CardContent className="p-0">
//                 <h1 className="text-2xl font-bold text-center mb-4">File Transfer</h1>
                
//                 {!finalLink && (
//                     <div {...getRootProps()} className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
//                         <input {...getInputProps()} />
//                         <UploadCloud className="h-12 w-12 text-gray-400 mb-2" />
//                         <p className="font-semibold">Drag & drop files here, or click to select</p>
//                         <p className="text-sm text-gray-500">Upload multiple files to create a single share link</p>
//                     </div>
//                 )}

//                 {files.length > 0 && (
//                     <div className="mt-6 space-y-3">
//                         <h2 className="font-semibold">{finalLink ? 'Upload Complete' : 'Files to Upload'}</h2>
//                         {files.map((uploadableFile) => (
//                             <div key={uploadableFile.id} className="border rounded-md p-3 flex items-center space-x-3 bg-white">
//                                 <FileIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />
//                                 <div className="flex-grow overflow-hidden">
//                                     <p className="text-sm font-medium truncate" title={uploadableFile.file.name}>{uploadableFile.file.name}</p>
//                                     <p className="text-xs text-gray-500">{formatBytes(uploadableFile.file.size)}</p>
//                                     {uploadableFile.status === 'uploading' && <Progress value={uploadableFile.progress} className="h-1.5 mt-1" />}
//                                     {uploadableFile.status === 'success' && <p className="text-xs text-green-600 flex items-center gap-1 mt-1"><CheckCircle size={14} /> Uploaded!</p>}
//                                     {uploadableFile.status === 'error' && <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle size={14} /> {uploadableFile.error}</p>}
//                                 </div>
//                                 <Button variant="ghost" size="icon" onClick={() => removeFile(uploadableFile.id)} disabled={isUploading || allDone}>
//                                     <X className="h-4 w-4" />
//                                 </Button>
//                             </div>
//                         ))}
//                     </div>
//                 )}

//                 <div className="mt-6">
//                     {finalLink ? (
//                         <div className="text-center space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
//                             <PartyPopper className="h-12 w-12 text-green-500 mx-auto" />
//                             <h3 className="text-lg font-semibold">Your files are ready!</h3>
//                             <p className="text-sm text-muted-foreground">Copy the link below to share your files.</p>
//                             <div className="flex items-center space-x-2">
//                                 <input value={finalLink} readOnly className="flex-1 p-2 border rounded-md bg-white"/>
//                                 <Button onClick={() => copyLink(finalLink)}><Copy className="h-4 w-4 mr-2"/>Copy</Button>
//                             </div>
//                             <Button onClick={handleReset} variant="outline" className="w-full">Upload More Files</Button>
//                         </div>
//                     ) : files.length > 0 && (
//                         <Button onClick={handleUpload} className="w-full" disabled={isUploading || files.filter(f => f.status === 'pending').length === 0}>
//                             {isUploading ? (
//                                 <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
//                             ) : `Upload ${files.filter(f => f.status === 'pending').length} File(s)`}
//                         </Button>
//                     )}
//                 </div>
//             </CardContent>
//         </Card>
//     </main>
//   );
// }


"use client";

import { useState, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import api from '@/services/api';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatBytes } from '@/utils/format';
// --- FIX: Removed unused 'PartyPopper' import ---
import { UploadCloud, File as FileIcon, X, CheckCircle, AlertCircle, Copy, Loader2, PackageCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { v4 as uuidv4 } from 'uuid';

type UploadableFile = {
  id: string; 
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  uploadedBytes: number;
}

export default function HomePage() {
  const [files, setFiles] = useState<UploadableFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [finalLink, setFinalLink] = useState<string | null>(null);

  const totalSize = useMemo(() => files.reduce((acc, f) => acc + f.file.size, 0), [files]);
  const totalUploadedBytes = useMemo(() => files.reduce((acc, f) => acc + f.uploadedBytes, 0), [files]);
  const overallProgress = useMemo(() => (totalSize > 0 ? (totalUploadedBytes / totalSize) * 100 : 0), [totalUploadedBytes, totalSize]);

  const onDrop = (acceptedFiles: File[]) => {
    if (finalLink) handleReset();
    const newUploadableFiles: UploadableFile[] = acceptedFiles.map(file => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      file, status: 'pending' as const, progress: 0,
      uploadedBytes: 0,
    }));
    setFiles(prevFiles => [...prevFiles, ...newUploadableFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = (id: string) => {
    setFiles(prevFiles => prevFiles.filter(f => f.id !== id));
  };
  
  const handleUpload = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    const groupId = uuidv4().split('-')[0];
    const groupTotal = files.length;
    let uploadSuccess = true;

    const uploadPromises = pendingFiles.map(uploadableFile => {
      return (async () => {
        try {
          setFiles(prev => prev.map(f => f.id === uploadableFile.id ? { ...f, status: 'uploading', progress: 5 } : f));

          const initiateResponse = await api.post('/files/initiate-upload', {
            fileName: uploadableFile.file.name,
            mimeType: uploadableFile.file.type || 'application/octet-stream',
            fileSize: uploadableFile.file.size,
          });
          const { uploadUrl } = initiateResponse.data;
          
          if (!uploadUrl) {
            throw new Error("Failed to get a direct upload URL from the server.");
          }

          const gDriveResponse = await axios.put(uploadUrl, uploadableFile.file, {
            headers: { 'Content-Type': uploadableFile.file.type || 'application/octet-stream' },
            onUploadProgress: (progressEvent) => {
              const { loaded, total } = progressEvent;
              if (total) {
                const percentCompleted = Math.round((loaded * 100) / total);
                setFiles(prev => prev.map(f =>
                  f.id === uploadableFile.id 
                  ? { ...f, progress: percentCompleted, uploadedBytes: loaded } 
                  : f
                ));
              }
            },
          });
          
          const gDriveFileId = gDriveResponse.data?.id;
          if (!gDriveFileId) {
              throw new Error("Upload to Google succeeded, but did not return a file ID.");
          }

          await api.post('/files/upload', {
            originalName: uploadableFile.file.name,
            size: uploadableFile.file.size,
            gDriveFileId,
            groupId,
            groupTotal,
          });

          setFiles(prev => prev.map(f =>
            f.id === uploadableFile.id ? { ...f, status: 'success', progress: 100, uploadedBytes: f.file.size } : f
          ));

        } catch (err) {
          uploadSuccess = false;
          const error = err as { response?: { data?: { message?: string } }, message?: string };
          const serverErrorMessage = error.response?.data?.message || error.message;
          const errorMessage = serverErrorMessage || 'An unknown upload error occurred.';

          setFiles(prev => prev.map(f =>
            f.id === uploadableFile.id
            ? { ...f, status: 'error', error: errorMessage }
            : f
          ));
          toast.error(`Failed to upload ${uploadableFile.file.name}: ${errorMessage}`);
        }
      })();
    });

    await Promise.all(uploadPromises);
    setIsUploading(false);

    if (uploadSuccess) {
      const fullUrl = `${window.location.origin}/download/${groupId}`;
      setFinalLink(fullUrl);
      toast.success("Upload complete!", { description: "Your shareable link is ready." });
    } else {
      toast.error("Upload process finished with errors.", { description: "Not all files were uploaded. Please remove failed files and try again." });
    }
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };
  
  const handleReset = () => {
      setFiles([]);
      setFinalLink(null);
      setIsUploading(false);
  }

  const allDone = files.length > 0 && files.every(f => f.status === 'success' || f.status === 'error');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-12 md:p-24 bg-gray-50">
        <Card className="w-full max-w-lg p-6 sm:p-8">
            <CardContent className="p-0">
                <h1 className="text-2xl font-bold text-center mb-4">File Transfer</h1>
                
                {!finalLink && (
                    <div {...getRootProps()} className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                        <input {...getInputProps()} />
                        <UploadCloud className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="font-semibold">Drag & drop files here, or click to select</p>
                        <p className="text-sm text-gray-500">Upload multiple files to create a single share link</p>
                    </div>
                )}

                {files.length > 0 && (
                    <div className="mt-6 space-y-3">
                        <h2 className="font-semibold">{finalLink ? 'Upload Complete' : 'Files to Upload'}</h2>

                        {isUploading && !allDone && (
                            <div className='p-3 border rounded-lg bg-muted/50 space-y-2'>
                                <div className='flex justify-between items-center text-sm font-medium'>
                                    <p>Overall Progress</p>
                                    <p>{formatBytes(totalUploadedBytes)} / {formatBytes(totalSize)}</p>
                                </div>
                                <Progress value={overallProgress} />
                            </div>
                        )}

                        {files.map((uploadableFile) => (
                            <div key={uploadableFile.id} className="border rounded-md p-3 flex items-center space-x-3 bg-white">
                                <FileIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />
                                <div className="flex-grow overflow-hidden">
                                    <p className="text-sm font-medium truncate" title={uploadableFile.file.name}>{uploadableFile.file.name}</p>
                                    <p className="text-xs text-gray-500">{formatBytes(uploadableFile.file.size)}</p>
                                    {uploadableFile.status === 'uploading' && <Progress value={uploadableFile.progress} className="h-1.5 mt-1" />}
                                    {uploadableFile.status === 'success' && <p className="text-xs text-green-600 flex items-center gap-1 mt-1"><CheckCircle size={14} /> Uploaded!</p>}
                                    {uploadableFile.status === 'error' && <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle size={14} /> {uploadableFile.error}</p>}
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeFile(uploadableFile.id)} disabled={isUploading || allDone}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6">
                    {finalLink ? (
                        <div className="text-center space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                            <PackageCheck className="h-12 w-12 text-green-500 mx-auto" />
                            <h3 className="text-lg font-semibold">Your files are ready!</h3>
                            <p className="text-sm text-muted-foreground">Copy the link below to share your files.</p>
                            <div className="flex items-center space-x-2">
                                <input value={finalLink} readOnly className="flex-1 p-2 border rounded-md bg-white"/>
                                <Button onClick={() => copyLink(finalLink)}><Copy className="h-4 w-4 mr-2"/>Copy</Button>
                            </div>
                            <Button onClick={handleReset} variant="outline" className="w-full">Upload More Files</Button>
                        </div>
                    ) : files.length > 0 && (
                        <Button onClick={handleUpload} className="w-full h-12 text-lg" disabled={isUploading || files.filter(f => f.status === 'pending').length === 0}>
                            {isUploading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                            ) : `Upload ${files.filter(f => f.status === 'pending').length} File(s)`}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    </main>
  );
}