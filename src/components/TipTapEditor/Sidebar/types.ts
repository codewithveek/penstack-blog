export interface ScheduleItemProps {
  scheduledAt: Date;
  open: boolean;
  onOpenChange: () => void;
  onToggle: () => void;
}

export interface CommentsToggleProps {
  allowComments: boolean;
  onChange: () => void;
}

export interface PinnedToggleProps {
  isSticky: boolean;
  onChange: () => void;
}
export interface TocActionsProps {
  generateToc: boolean;
  tocDepth?: number;
  onChange: () => void;
}
