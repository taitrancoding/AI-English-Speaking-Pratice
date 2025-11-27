// import React, { useState } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Download, Upload, Trash2, Search, FileText, Music, Video } from "lucide-react";

// const Resources: React.FC = () => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filterType, setFilterType] = useState<"all" | "pdf" | "audio" | "video">("all");

//   const resources = [
//     {
//       id: 1,
//       name: "English Phonetics Guide",
//       type: "pdf",
//       size: "2.4 MB",
//       uploadDate: "2025-11-01",
//       downloads: 12,
//     },
//     {
//       id: 2,
//       name: "Pronunciation Practice - Week 1",
//       type: "audio",
//       size: "15.3 MB",
//       uploadDate: "2025-10-25",
//       downloads: 28,
//     },
//     {
//       id: 3,
//       name: "Common Mistakes in English",
//       type: "pdf",
//       size: "1.8 MB",
//       uploadDate: "2025-10-20",
//       downloads: 45,
//     },
//     {
//       id: 4,
//       name: "Conversation Practice Video",
//       type: "video",
//       size: "125 MB",
//       uploadDate: "2025-11-10",
//       downloads: 8,
//     },
//     {
//       id: 5,
//       name: "Grammar Rules Summary",
//       type: "pdf",
//       size: "3.1 MB",
//       uploadDate: "2025-11-05",
//       downloads: 23,
//     },
//     {
//       id: 6,
//       name: "Native Speaker Interview",
//       type: "audio",
//       size: "8.7 MB",
//       uploadDate: "2025-11-08",
//       downloads: 15,
//     },
//   ];

//   const getFileIcon = (type: string) => {
//     switch (type) {
//       case "pdf":
//         return <FileText className="w-5 h-5 text-red-500" />;
//       case "audio":
//         return <Music className="w-5 h-5 text-blue-500" />;
//       case "video":
//         return <Video className="w-5 h-5 text-purple-500" />;
//       default:
//         return <FileText className="w-5 h-5" />;
//     }
//   };

//   const getTypeColor = (type: string) => {
//     switch (type) {
//       case "pdf":
//         return "bg-red-100 text-red-800";
//       case "audio":
//         return "bg-blue-100 text-blue-800";
//       case "video":
//         return "bg-purple-100 text-purple-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const filteredResources = resources.filter((resource) => {
//     const matchesSearch =
//       resource.name.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesFilter = filterType === "all" || resource.type === filterType;
//     return matchesSearch && matchesFilter;
//   });

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold tracking-tight">Learning Resources</h1>
//         <p className="text-muted-foreground mt-2">Manage your uploaded resources for learners</p>
//       </div>

//       {/* Upload Section */}
//       <Card className="bg-blue-50 border-blue-200">
//         <CardContent className="pt-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="font-semibold">Upload New Resource</h3>
//               <p className="text-sm text-muted-foreground mt-1">
//                 PDF, Audio, Video files are supported
//               </p>
//             </div>
//             <Button>
//               <Upload className="w-4 h-4 mr-2" />
//               Choose File
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Search and Filter */}
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div className="flex-1 relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
//           <Input
//             placeholder="Search resources..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-10"
//           />
//         </div>

//         <div className="flex gap-2">
//           {["all", "pdf", "audio", "video"].map((type) => (
//             <Button
//               key={type}
//               variant={filterType === type ? "default" : "outline"}
//               onClick={() => setFilterType(type as any)}
//               size="sm"
//             >
//               {type.charAt(0).toUpperCase() + type.slice(1)}
//             </Button>
//           ))}
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-3 gap-4">
//         <Card>
//           <CardContent className="pt-6">
//             <p className="text-2xl font-bold">{resources.length}</p>
//             <p className="text-xs text-muted-foreground mt-1">Total Resources</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6">
//             <p className="text-2xl font-bold">{resources.reduce((acc, r) => acc + r.downloads, 0)}</p>
//             <p className="text-xs text-muted-foreground mt-1">Total Downloads</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6">
//             <p className="text-2xl font-bold">
//               {(resources.reduce((acc, r) => acc + parseFloat(r.size), 0) / 1024).toFixed(1)} GB
//             </p>
//             <p className="text-xs text-muted-foreground mt-1">Storage Used</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Resources List */}
//       <div className="space-y-3">
//         {filteredResources.length > 0 ? (
//           filteredResources.map((resource) => (
//             <Card key={resource.id} className="hover:shadow-md transition-shadow">
//               <CardContent className="pt-6">
//                 <div className="flex items-center gap-4">
//                   {/* File Icon */}
//                   <div className="flex-shrink-0">
//                     {getFileIcon(resource.type)}
//                   </div>

//                   {/* File Info */}
//                   <div className="flex-1">
//                     <h3 className="font-semibold">{resource.name}</h3>
//                     <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
//                       <span>{resource.size}</span>
//                       <span>Uploaded: {resource.uploadDate}</span>
//                       <span>{resource.downloads} downloads</span>
//                     </div>
//                   </div>

//                   {/* Type Badge */}
//                   <Badge className={getTypeColor(resource.type)}>
//                     {resource.type.toUpperCase()}
//                   </Badge>

//                   {/* Actions */}
//                   <div className="flex gap-2">
//                     <Button variant="outline" size="sm">
//                       <Download className="w-4 h-4" />
//                     </Button>
//                     <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
//                       <Trash2 className="w-4 h-4" />
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))
//         ) : (
//           <Card>
//             <CardContent className="pt-6 text-center">
//               <p className="text-muted-foreground">No resources found</p>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Resources;
