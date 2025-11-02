"use client";
import { TocItem } from "@/lib/toc-generator";
import { useState, useEffect, useRef, useMemo } from "react";
import { LuChevronDown, LuChevronRight } from "react-icons/lu";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { cn } from "@/lib/utils";

const TOCItemComponent = ({
  item,
  depth = 0,
  activeId,
}: {
  item: TocItem;
  depth?: number;
  activeId: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const itemRef = useRef<HTMLDivElement>(null);
  const hasChildren = item.children.length > 0;
  const isActive = activeId === item.id;

  // Check if this item or any of its children are active
  const isActiveOrHasActiveChild = useMemo(() => {
    const checkActive = (item: TocItem): boolean => {
      if (item.id === activeId) return true;
      return item.children.some(checkActive);
    };
    return checkActive(item);
  }, [item, activeId]);

  // Auto-expand and scroll into view when active
  useEffect(() => {
    if (isActiveOrHasActiveChild) {
      setIsExpanded(true);
    }
  }, [isActiveOrHasActiveChild]);

  const handleToggle = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (hasChildren && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div
      ref={itemRef}
      style={{ marginLeft: `${depth * 16}px` }}
      role="treeitem"
      aria-selected={isActive ? "true" : undefined}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-level={depth + 1}
    >
      <div
        className={`flex items-center gap-2 py-1 hover:bg-gray-100 cursor-pointer rounded focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-1 ${
          isActive ? "bg-gray-100 font-medium text-blue-600" : ""
        }`}
      >
        {hasChildren && (
          <button
            className="w-4 text-gray-500 hover:text-blue-600 focus:outline-none focus:text-blue-600 p-1 -m-1 mr-1 rounded"
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            aria-label={`${isExpanded ? "Collapse" : "Expand"} ${item.text} section`}
            tabIndex={0}
          >
            {isExpanded ? <LuChevronDown /> : <LuChevronRight />}
          </button>
        )}
        <a
          href={`#${item.id}`}
          className={`text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 focus:underline flex-1 ${
            isActive ? "text-blue-600" : ""
          }`}
          aria-current={isActive ? "location" : undefined}
          tabIndex={0}
        >
          {item.text}
        </a>
      </div>
      {isExpanded && hasChildren && (
        <div role="group">
          {item.children.map((child) => (
            <TOCItemComponent
              key={child.id}
              item={child}
              depth={depth + 1}
              activeId={activeId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const TOCRenderer = ({
  content,
  initialItemsToShow = 3,
}: {
  content: TocItem[];
  initialItemsToShow?: number;
}) => {
  const tocData = content;
  const [activeId, setActiveId] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -80% 0px" }
    );

    // Observe all headings
    document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((heading) => {
      observer.observe(heading);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleSeeMoreToggle = () => {
    setShowAll(!showAll);
  };

  const handleSeeMoreKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setShowAll(!showAll);
    }
  };

  const visibleItems = showAll ? tocData : tocData.slice(0, initialItemsToShow);
  const hasMoreItems = tocData.length > initialItemsToShow;

  return (
    <nav
      className={cn(
        "w-full border rounded-lg bg-white transition-all duration-200 overflow-hidden",
        isCollapsed ? "h-auto" : "h-[330px]"
      )}
      aria-label="Table of Contents"
    >
      <div
        className={cn(
          "p-4 border-b sticky top-0 bg-white rounded-t-lg",
          isCollapsed ? "border-b-0" : " border-b"
        )}
      >
        <button
          className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          onClick={handleToggleCollapse}
          onKeyDown={handleKeyDown}
          aria-expanded={!isCollapsed}
          aria-controls="toc-content"
          aria-label={`${isCollapsed ? "Expand" : "Collapse"} table of contents`}
        >
          <h2 className="text-lg font-semibold">Table of Contents</h2>
          <span
            className="text-gray-500 hover:text-blue-600 transition-colors"
            aria-hidden="true"
          >
            {isCollapsed ? <LuChevronRight /> : <LuChevronDown />}
          </span>
        </button>
      </div>

      {!isCollapsed && (
        <div id="toc-content">
          <ScrollArea className="h-[270px]">
            <div className="p-4">
              <div
                className="pb-2"
                role="tree"
                aria-label="Table of contents navigation"
              >
                {visibleItems.map((item) => (
                  <TOCItemComponent
                    key={item.id}
                    item={item}
                    activeId={activeId}
                  />
                ))}
              </div>

              {hasMoreItems && (
                <div className="pt-2 border-t border-gray-200 sticky bottom-0 pb-1.5 bg-white overflow-hidden">
                  <button
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm focus:outline-none focus:underline transition-colors"
                    onClick={handleSeeMoreToggle}
                    onKeyDown={handleSeeMoreKeyDown}
                    aria-expanded={showAll}
                    aria-label={`${showAll ? "Show fewer" : "Show more"} table of contents items. ${showAll ? "Currently showing all" : `Currently showing ${initialItemsToShow} of ${tocData.length}`} items`}
                  >
                    {showAll
                      ? "See less"
                      : `See more (${tocData.length - initialItemsToShow} more)`}
                  </button>
                </div>
              )}
            </div>
            <ScrollBar />
          </ScrollArea>
        </div>
      )}
    </nav>
  );
};
