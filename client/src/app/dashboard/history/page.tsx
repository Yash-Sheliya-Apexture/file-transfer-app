// // client/src/app/dashboard/history/page.tsx
// "use client";

// import { useEffect, useState } from 'react';
// import { getMyFiles, IUserFile } from '@/services/file';
// import { formatBytes } from '@/utils/format';
// import { useAuth } from '@/contexts/AuthContext';
// import { useRouter } from 'next/navigation';

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from '@/components/ui/button';
// import { Skeleton } from '@/components/ui/skeleton';
// import { toast } from 'sonner';
// import { Copy, FileWarning } from 'lucide-react';

// export default function HistoryPage() {
//   const [files, setFiles] = useState<IUserFile[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const { isAuthenticated } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     // Redirect to login if the user is not authenticated
//     if (!isAuthenticated) {
//       router.push('/auth/login');
//       return;
//     }

//     const fetchFiles = async () => {
//       try {
//         setIsLoading(true);
//         const userFiles = await getMyFiles();
//         setFiles(userFiles);
//       } catch (err) {
//         setError("Failed to load your files. Please try again later.");
//         console.error(err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchFiles();
//   }, [isAuthenticated, router]);

//   const handleCopyLink = (uniqueId: string) => {
//     const fullUrl = `${window.location.origin}/download/${uniqueId}`;
//     navigator.clipboard.writeText(fullUrl);
//     toast.success("Download link copied to clipboard!");
//   };

//   const renderContent = () => {
//     if (isLoading) {
//       // Show skeleton loaders while data is fetching for better UX
//       return (
//         <div className="space-y-2">
//           <Skeleton className="h-10 w-full" />
//           <Skeleton className="h-10 w-full" />
//           <Skeleton className="h-10 w-full" />
//         </div>
//       );
//     }

//     if (error) {
//       return <p className="text-center text-destructive">{error}</p>;
//     }

//     if (files.length === 0) {
//       return (
//           <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
//             <FileWarning className="w-12 h-12 text-muted-foreground mb-4" />
//             <p className="text-lg font-semibold">No Files Found</p>
//             <p className="text-sm text-muted-foreground">You haven't uploaded any files yet. Go to the home page to start sharing!</p>
//           </div>
//       );
//     }

//     return (
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>File Name</TableHead>
//             <TableHead className="text-center">Size</TableHead>
//             <TableHead className="text-center">Upload Date</TableHead>
//             <TableHead className="text-right">Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {files.map((file) => (
//             <TableRow key={file._id}>
//               <TableCell className="font-medium truncate max-w-xs" title={file.originalName}>{file.originalName}</TableCell>
//               <TableCell className="text-center">{formatBytes(file.size)}</TableCell>
//               <TableCell className="text-center">{new Date(file.createdAt).toLocaleDateString()}</TableCell>
//               <TableCell className="text-right">
//                 <Button variant="outline" size="sm" onClick={() => handleCopyLink(file.uniqueId)}>
//                   <Copy className="h-4 w-4 mr-2" />
//                   Copy Link
//                 </Button>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     );
//   };

//   return (
//     <div className="p-4 sm:p-6 md:p-8">
//       <Card>
//         <CardHeader>
//           <CardTitle>Upload History</CardTitle>
//           <CardDescription>
//             Here is a list of all the files you've uploaded.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {renderContent()}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// "use client";

// import { useEffect, useState } from 'react';
// import { getMyFiles, IUserFile } from '@/services/file';
// import { formatBytes } from '@/utils/format';
// import { useAuth } from '@/contexts/AuthContext';
// import { useRouter } from 'next/navigation';

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from '@/components/ui/button';
// import { Skeleton } from '@/components/ui/skeleton';
// import { toast } from 'sonner';
// import { Copy, FileWarning } from 'lucide-react';

// export default function HistoryPage() {
//   const [files, setFiles] = useState<IUserFile[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const { isAuthenticated } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!isAuthenticated) {
//       router.push('/auth/login');
//       return;
//     }

//     const fetchFiles = async () => {
//       try {
//         setIsLoading(true);
//         const userFiles = await getMyFiles();
//         setFiles(userFiles);
//       } catch (err) {
//         setError("Failed to load your files. Please try again later.");
//         console.error(err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchFiles();
//   }, [isAuthenticated, router]);

//   const handleCopyLink = (groupId: string) => {
//     const fullUrl = `${window.location.origin}/download/${groupId}`;
//     navigator.clipboard.writeText(fullUrl);
//     toast.success("Download link copied to clipboard!");
//   };

//   const renderContent = () => {
//     if (isLoading) {
//       return (
//         <div className="space-y-2">
//           <Skeleton className="h-10 w-full" />
//           <Skeleton className="h-10 w-full" />
//           <Skeleton className="h-10 w-full" />
//         </div>
//       );
//     }

//     if (error) {
//       return <p className="text-center text-destructive">{error}</p>;
//     }

//     if (files.length === 0) {
//       return (
//         <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
//           <FileWarning className="w-12 h-12 text-muted-foreground mb-4" />
//           <p className="text-lg font-semibold">No Files Found</p>
//           <p className="text-sm text-muted-foreground">You haven't uploaded any files yet.</p>
//         </div>
//       );
//     }

//     return (
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>File Name</TableHead>
//             <TableHead className="text-center">Size</TableHead>
//             <TableHead className="text-center">Upload Date</TableHead>
//             <TableHead className="text-right">Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {files.map((file) => (
//             <TableRow key={file._id}>
//               <TableCell className="font-medium truncate max-w-xs" title={file.originalName}>{file.originalName}</TableCell>
//               <TableCell className="text-center">{formatBytes(file.size)}</TableCell>
//               <TableCell className="text-center">{new Date(file.createdAt).toLocaleDateString()}</TableCell>
//               <TableCell className="text-right">
//                 <Button variant="outline" size="sm" onClick={() => handleCopyLink(file.groupId)}>
//                   <Copy className="h-4 w-4 mr-2" />
//                   Copy Link
//                 </Button>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     );
//   };

//   return (
//     <div className="p-4 sm:p-6 md:p-8">
//       <Card>
//         <CardHeader>
//           <CardTitle>Upload History</CardTitle>
//           <CardDescription>
//             Here is a list of all the files you've uploaded.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {renderContent()}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// client/src/app/dashboard/history/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getMyFiles, IUserFile } from "@/services/file";
import { formatBytes } from "@/utils/format";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Copy, FileWarning } from "lucide-react";

export default function HistoryPage() {
  const [files, setFiles] = useState<IUserFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    const fetchFiles = async () => {
      try {
        setIsLoading(true);
        const userFiles = await getMyFiles();
        setFiles(userFiles);
      } catch (err) {
        setError("Failed to load your files. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFiles();
  }, [isAuthenticated, router]);

  const handleCopyLink = (groupId: string) => {
    const fullUrl = `${window.location.origin}/download/${groupId}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Download link copied to clipboard!");
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }
    if (error) {
      return <p className="text-center text-destructive">{error}</p>;
    }
    if (files.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
          <FileWarning className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg font-semibold">No Files Found</p>
          <p className="text-sm text-muted-foreground">
            You haven′t uploaded any files yet. Go to the home page to start
            sharing!
          </p>
        </div>
      );
    }
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File Name</TableHead>
            <TableHead className="text-center">Size</TableHead>
            <TableHead className="text-center">Upload Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file._id}>
              <TableCell
                className="font-medium truncate max-w-xs"
                title={file.originalName}
              >
                {file.originalName}
              </TableCell>
              <TableCell className="text-center">
                {formatBytes(file.size)}
              </TableCell>
              <TableCell className="text-center">
                {new Date(file.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyLink(file.groupId)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload History</CardTitle>
          <CardDescription>
            Here is a list of all the files you′ve uploaded.
          </CardDescription>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </div>
  );
}
