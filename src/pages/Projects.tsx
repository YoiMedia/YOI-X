import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, Trash2, FolderKanban, Calendar } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusColors = {
    active: "bg-green-100 text-green-700 border-green-200",
    completed: "bg-blue-100 text-blue-700 border-blue-200",
    delayed: "bg-red-100 text-red-700 border-red-200",
    on_hold: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

export default function Projects() {
    const { projects, isLoading, deleteProject } = useData();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.client.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppLayout title="Projects">
            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search projects..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <Card className="border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">All Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-border">
                            {isLoading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="flex items-center gap-4 py-4">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-1/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))
                            ) : filteredProjects.length === 0 ? (
                                <div className="py-20 text-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
                                    <FolderKanban size={48} className="mx-auto mb-4 opacity-10" />
                                    <p className="text-sm font-medium mb-1">No projects found</p>
                                    <p className="text-xs opacity-60">You haven't started any projects yet.</p>
                                </div>
                            ) : (
                                filteredProjects.map((project) => (
                                    <div key={project.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <FolderKanban size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground truncate">{project.name}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                                <span>{project.client}</span>
                                                <span>•</span>
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    <span>{project.deadline}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={statusColors[project.status as keyof typeof statusColors] || "bg-gray-100"}>
                                            {project.status.replace("_", " ")}
                                        </Badge>
                                        <span className="text-sm font-medium text-foreground w-20 text-right">{project.value}</span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal size={16} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => deleteProject(project.id)}
                                                >
                                                    <Trash2 size={14} className="mr-2" />
                                                    Delete Project
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
