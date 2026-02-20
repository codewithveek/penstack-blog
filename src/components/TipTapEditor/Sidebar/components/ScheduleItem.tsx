import { Button, HStack, Icon, List, Text } from "@chakra-ui/react";
import { format } from "date-fns";
import { LuTimer } from "react-icons/lu";

import { PermissionGuard } from "../../../PermissionGuard";
import { CalendarPicker } from "../../CalendarPicker";
import { ScheduleItemProps } from "../types";

export const ScheduleItem = ({
  scheduledAt,
  isOpen,
  onClose,
  onToggle,
}: ScheduleItemProps) => {
  return (
    <PermissionGuard requiredPermission="posts:publish">
      <List.Item>
        <HStack justify="space-between">
          <HStack>
            <Text as="span" color="gray.500">
              <Icon mr={1}><LuTimer /></Icon>
              Schedule:
            </Text>
            <Text as="span" fontWeight="semibold" textTransform="capitalize">
              {scheduledAt ? (
                <Text fontSize="small">
                  {format(new Date(scheduledAt), "MMM d, yyyy hh:mm a")}
                </Text>
              ) : (
                "Off"
              )}
            </Text>
          </HStack>
          <CalendarPicker
            defaultValue={scheduledAt ? new Date(scheduledAt) : undefined}
            open={isOpen}
            onOpenChange={onClose}
            trigger={
              <Button variant="ghost" size="xs" onClick={onToggle}>
                Edit
              </Button>
            }
          />
        </HStack>
      </List.Item>
    </PermissionGuard>
  );
};
