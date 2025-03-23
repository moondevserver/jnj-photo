"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronRight, ChevronDown, Folder, File } from "lucide-react";

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  hasChildren?: boolean;
}

interface DirectoryTreeProps {
  onSelect: (path: string) => void;
  selectedPath: string;
}

interface TreeItemProps {
  node: TreeNode;
  onSelect: (path: string) => void;
  selectedPath: string;
  level: number;
}

const ROOT_PATHS = [
  {
    name: "photo",
    path: "/nas/photo",
  },
  {
    name: "image",
    path: "/nas/image",
  }
];

const fetchDirectoryContents = async (path: string): Promise<TreeNode[]> => {
  try {
    const response = await fetch(`/api/files/tree?path=${encodeURIComponent(path)}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch directory contents");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching directory contents:", error);
    throw error;
  }
};

function TreeItem({ node, onSelect, selectedPath, level }: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [children, setChildren] = useState<TreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (node.type === "directory") {
      if (!isExpanded && node.hasChildren) {
        setIsLoading(true);
        setError(null);
        try {
          const contents = await fetchDirectoryContents(node.path);
          setChildren(contents);
        } catch (error) {
          setError(error instanceof Error ? error.message : "디렉토리를 불러올 수 없습니다");
        } finally {
          setIsLoading(false);
        }
      }
      setIsExpanded(!isExpanded);
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.path);
  };

  const isSelected = node.path === selectedPath;

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 cursor-pointer hover:bg-gray-100 ${
          isSelected ? "bg-blue-100" : ""
        }`}
        style={{ paddingLeft: `${level * 16}px` }}
        onClick={handleSelect}
      >
        {node.type === "directory" && (
          <span className="mr-1" onClick={handleToggle}>
            {isLoading ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            ) : isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>
        )}
        {node.type === "directory" ? (
          <Folder className="w-4 h-4 mr-2 text-blue-500" />
        ) : (
          <File className="w-4 h-4 mr-2 text-gray-500" />
        )}
        <span className="truncate">{node.name}</span>
      </div>
      {error && (
        <div className="text-red-500 text-sm pl-8" style={{ paddingLeft: `${level * 16 + 24}px` }}>
          {error}
        </div>
      )}
      {isExpanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              onSelect={onSelect}
              selectedPath={selectedPath}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DirectoryTree({ onSelect, selectedPath }: DirectoryTreeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 루트 노드들 정적 생성
  const rootNodes: TreeNode[] = ROOT_PATHS.map(root => ({
    name: root.name,
    path: root.path,
    type: "directory",
    hasChildren: true
  }));

  if (error) {
    return (
      <div className="p-4 text-red-500 text-center">
        <p>{error}</p>
        <button
          className="mt-2 px-4 py-2 text-sm text-blue-500 hover:text-blue-600"
          onClick={() => window.location.reload()}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
      {rootNodes.map((node) => (
        <TreeItem
          key={node.path}
          node={node}
          onSelect={onSelect}
          selectedPath={selectedPath}
          level={0}
        />
      ))}
    </div>
  );
} 